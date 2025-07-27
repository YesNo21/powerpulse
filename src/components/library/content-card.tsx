'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  PlayIcon, 
  HeartIcon, 
  DownloadIcon, 
  ShareIcon,
  CalendarIcon,
  ClockIcon,
  HeadphonesIcon,
  MoreVerticalIcon
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { api } from '@/lib/trpc/client'
import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { motion } from 'framer-motion'
import type { RouterOutputs } from '@/lib/trpc/types'

type LibraryContent = RouterOutputs['library']['getLibraryContent']['items'][0]

interface ContentCardProps {
  content: LibraryContent
  viewMode: 'grid' | 'list'
  onPlay: () => void
  onToggleFavorite: () => void
}

export function ContentCard({ content, viewMode, onPlay, onToggleFavorite }: ContentCardProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const toggleFavorite = api.library.toggleFavorite.useMutation()

  const handleToggleFavorite = async () => {
    await toggleFavorite.mutateAsync({ contentId: content.id })
    onToggleFavorite()
  }

  const handleDownload = async () => {
    if (!content.audioUrl) return
    
    setIsDownloading(true)
    try {
      const response = await fetch(content.audioUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${content.title || 'session'}-${format(new Date(content.date), 'yyyy-MM-dd')}.mp3`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download failed:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: content.title || 'PowerPulse Session',
      text: `Check out this motivational session: ${content.title}`,
      url: window.location.href,
    }

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.error('Share failed:', error)
      }
    } else {
      // Fallback: Copy to clipboard
      await navigator.clipboard.writeText(window.location.href)
      // You could show a toast notification here
    }
  }

  const stageBadgeVariant = {
    awareness: 'default',
    consideration: 'secondary',
    decision: 'destructive',
    retention: 'outline',
  } as const

  const stageLabel = {
    awareness: 'Foundation',
    consideration: 'Momentum',
    decision: 'Transformation',
    retention: 'Mastery',
  } as const

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="p-4 transition-all hover:shadow-lg">
          <div className="flex items-center gap-4">
            {/* Play Button */}
            <Button
              size="icon"
              variant="ghost"
              className="h-12 w-12 shrink-0"
              onClick={onPlay}
            >
              <PlayIcon className="h-6 w-6" />
            </Button>

            {/* Content Info */}
            <div className="flex-1 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold line-clamp-1">{content.title}</h3>
                <div className="flex items-center gap-1">
                  {content.stage && (
                    <Badge variant={stageBadgeVariant[content.stage] || 'default'}>
                      {stageLabel[content.stage] || content.stage}
                    </Badge>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    className={cn(
                      'h-8 w-8',
                      content.isFavorite && 'text-red-500'
                    )}
                    onClick={handleToggleFavorite}
                    disabled={toggleFavorite.isPending}
                  >
                    <HeartIcon className={cn('h-4 w-4', content.isFavorite && 'fill-current')} />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3" />
                  <span>{format(new Date(content.date), 'MMM d, yyyy')}</span>
                </div>
                {content.duration && (
                  <div className="flex items-center gap-1">
                    <ClockIcon className="h-3 w-3" />
                    <span>{Math.floor(content.duration / 60)}:{String(content.duration % 60).padStart(2, '0')}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <HeadphonesIcon className="h-3 w-3" />
                  <span>{content.playCount} plays</span>
                </div>
                {content.lastPlayedAt && (
                  <span className="text-xs">
                    Last played {formatDistanceToNow(new Date(content.lastPlayedAt))} ago
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <MoreVerticalIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDownload} disabled={isDownloading || !content.audioUrl}>
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShare}>
                  <ShareIcon className="mr-2 h-4 w-4" />
                  Share
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Card>
      </motion.div>
    )
  }

  // Grid view
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
        {/* Thumbnail Background */}
        <div className="relative h-32 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 p-4">
          {content.stage && (
            <Badge 
              variant={stageBadgeVariant[content.stage] || 'default'}
              className="absolute right-2 top-2"
            >
              {stageLabel[content.stage] || content.stage}
            </Badge>
          )}
          
          {/* Play Button Overlay */}
          <div className="flex h-full items-center justify-center">
            <Button
              size="icon"
              variant="secondary"
              className="h-12 w-12 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={onPlay}
            >
              <PlayIcon className="h-6 w-6" />
            </Button>
          </div>

          {/* Favorite Button */}
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              'absolute left-2 top-2 h-8 w-8',
              content.isFavorite && 'text-red-500'
            )}
            onClick={handleToggleFavorite}
            disabled={toggleFavorite.isPending}
          >
            <HeartIcon className={cn('h-4 w-4', content.isFavorite && 'fill-current')} />
          </Button>
        </div>

        {/* Content Info */}
        <div className="space-y-3 p-4">
          <div>
            <h3 className="font-semibold line-clamp-2">{content.title}</h3>
            <p className="text-sm text-muted-foreground">
              {format(new Date(content.date), 'MMMM d, yyyy')}
            </p>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              {content.duration && (
                <div className="flex items-center gap-1">
                  <ClockIcon className="h-3 w-3" />
                  <span>{Math.floor(content.duration / 60)}:{String(content.duration % 60).padStart(2, '0')}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <HeadphonesIcon className="h-3 w-3" />
                <span>{content.playCount}</span>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <MoreVerticalIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDownload} disabled={isDownloading || !content.audioUrl}>
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShare}>
                  <ShareIcon className="mr-2 h-4 w-4" />
                  Share
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {content.lastPlayedAt && (
            <p className="text-xs text-muted-foreground">
              Last played {formatDistanceToNow(new Date(content.lastPlayedAt))} ago
            </p>
          )}
        </div>
      </Card>
    </motion.div>
  )
}