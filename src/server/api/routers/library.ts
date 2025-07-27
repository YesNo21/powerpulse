import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'
import { dailyContent, userFavorites } from '@/db/schema'
import { eq, and, desc, asc, like, inArray, sql } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'

export const libraryRouter = createTRPCRouter({
  getLibraryContent: protectedProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(50).default(12),
      search: z.string().optional(),
      sortBy: z.enum(['newest', 'oldest', 'most_played', 'favorites']).default('newest'),
      stage: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search, sortBy, stage } = input
      const offset = (page - 1) * pageSize

      // Build where conditions
      const whereConditions = [
        eq(dailyContent.userId, ctx.userId),
        eq(dailyContent.delivered, true), // Only show delivered content
      ]

      if (search) {
        whereConditions.push(
          like(dailyContent.title, `%${search}%`)
        )
      }

      if (stage) {
        whereConditions.push(eq(dailyContent.stage, stage))
      }

      // Build order by
      let orderBy
      switch (sortBy) {
        case 'oldest':
          orderBy = asc(dailyContent.date)
          break
        case 'most_played':
          orderBy = desc(dailyContent.playCount)
          break
        case 'favorites':
          // This will be handled by joining with favorites
          orderBy = desc(dailyContent.date)
          break
        case 'newest':
        default:
          orderBy = desc(dailyContent.date)
      }

      // Get user's favorite content IDs
      const favorites = await ctx.db
        .select({ contentId: userFavorites.contentId })
        .from(userFavorites)
        .where(eq(userFavorites.userId, ctx.userId))

      const favoriteIds = favorites.map(f => f.contentId)

      // Apply favorites filter if needed
      if (sortBy === 'favorites' && favoriteIds.length > 0) {
        whereConditions.push(inArray(dailyContent.id, favoriteIds))
      }

      // Get total count
      const totalCountResult = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(dailyContent)
        .where(and(...whereConditions))

      const totalCount = Number(totalCountResult[0]?.count || 0)
      const totalPages = Math.ceil(totalCount / pageSize)

      // Get paginated content
      const items = await ctx.db
        .select()
        .from(dailyContent)
        .where(and(...whereConditions))
        .orderBy(orderBy)
        .limit(pageSize)
        .offset(offset)

      // Add favorite status to each item
      const itemsWithFavorites = items.map(item => ({
        ...item,
        isFavorite: favoriteIds.includes(item.id),
      }))

      return {
        items: itemsWithFavorites,
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages,
        },
      }
    }),

  toggleFavorite: protectedProcedure
    .input(z.object({
      contentId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { contentId } = input

      // Check if content belongs to user
      const content = await ctx.db
        .select()
        .from(dailyContent)
        .where(and(
          eq(dailyContent.id, contentId),
          eq(dailyContent.userId, ctx.userId)
        ))
        .limit(1)

      if (!content.length) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Content not found',
        })
      }

      // Check if already favorited
      const existingFavorite = await ctx.db
        .select()
        .from(userFavorites)
        .where(and(
          eq(userFavorites.userId, ctx.userId),
          eq(userFavorites.contentId, contentId)
        ))
        .limit(1)

      if (existingFavorite.length > 0) {
        // Remove favorite
        await ctx.db
          .delete(userFavorites)
          .where(and(
            eq(userFavorites.userId, ctx.userId),
            eq(userFavorites.contentId, contentId)
          ))
        
        return { favorited: false }
      } else {
        // Add favorite
        await ctx.db
          .insert(userFavorites)
          .values({
            userId: ctx.userId,
            contentId,
          })
        
        return { favorited: true }
      }
    }),

  incrementPlayCount: protectedProcedure
    .input(z.object({
      contentId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { contentId } = input

      // Update play count and last played timestamp
      await ctx.db
        .update(dailyContent)
        .set({
          playCount: sql`${dailyContent.playCount} + 1`,
          lastPlayedAt: new Date(),
          listened: true,
          listenedAt: new Date(),
        })
        .where(and(
          eq(dailyContent.id, contentId),
          eq(dailyContent.userId, ctx.userId)
        ))

      return { success: true }
    }),

  getTranscript: protectedProcedure
    .input(z.object({
      contentId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const { contentId } = input

      const content = await ctx.db
        .select({ script: dailyContent.script })
        .from(dailyContent)
        .where(and(
          eq(dailyContent.id, contentId),
          eq(dailyContent.userId, ctx.userId)
        ))
        .limit(1)

      if (!content.length) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Content not found',
        })
      }

      return content[0].script
    }),

  getRelatedContent: protectedProcedure
    .input(z.object({
      contentId: z.number(),
      limit: z.number().min(1).max(10).default(5),
    }))
    .query(async ({ ctx, input }) => {
      const { contentId, limit } = input

      // Get the current content to find related by stage or tone
      const currentContent = await ctx.db
        .select({
          stage: dailyContent.stage,
          tone: dailyContent.tone,
          date: dailyContent.date,
        })
        .from(dailyContent)
        .where(and(
          eq(dailyContent.id, contentId),
          eq(dailyContent.userId, ctx.userId)
        ))
        .limit(1)

      if (!currentContent.length) {
        return []
      }

      const { stage, tone } = currentContent[0]

      // Find related content by stage or tone
      const related = await ctx.db
        .select({
          id: dailyContent.id,
          title: dailyContent.title,
          date: dailyContent.date,
          stage: dailyContent.stage,
          tone: dailyContent.tone,
          duration: dailyContent.duration,
        })
        .from(dailyContent)
        .where(and(
          eq(dailyContent.userId, ctx.userId),
          eq(dailyContent.delivered, true),
          sql`${dailyContent.id} != ${contentId}`,
          sql`(${dailyContent.stage} = ${stage} OR ${dailyContent.tone} = ${tone})`
        ))
        .orderBy(desc(dailyContent.date))
        .limit(limit)

      return related
    }),
})