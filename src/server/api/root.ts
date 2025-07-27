import { createTRPCRouter } from './trpc'
import { userRouter } from './routers/user'
import { contentRouter } from './routers/content'
import { audioRouter } from './routers/audio'
import { libraryRouter } from './routers/library'
import { profileRouter } from './routers/profile'
import { subscriptionRouter } from './routers/subscription'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  content: contentRouter,
  audio: audioRouter,
  library: libraryRouter,
  profile: profileRouter,
  subscription: subscriptionRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.user.getProfile();
 *       ^? User
 */
export const createCaller = appRouter.createCaller