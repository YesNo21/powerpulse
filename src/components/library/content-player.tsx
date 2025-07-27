'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  PlayIcon, 
  PauseIcon, 
  HeartIcon, 
  DownloadIcon, 
  ShareIcon,
  XIcon,
  FileTextIcon,
  ListIcon,
  SparklesIcon,
  VolumeIcon,
  Volume2Icon,
  SkipBackIcon,
  SkipForwardIcon
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { api } from '@/lib/trpc/client'
import { motion, AnimatePresence } from 'framer-motion'
import type { RouterOutputs } from '@/lib/trpc/types'
import { AudioPlayer } from '@/components/audio/audio-player'

type LibraryContent = RouterOutputs['library']['getLibraryContent']['items'][0]
type RelatedContent = RouterOutputs['library']['getRelatedContent'][0]

interface ContentPlayerProps {
  content: LibraryContent
  isOpen: boolean
  onClose: () => void
}

export function ContentPlayer({ content, isOpen, onClose }: ContentPlayerProps) {
  const [activeTab, setActiveTab] = useState('player')
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  
  const incrementPlayCount = api.library.incrementPlayCount.useMutation()
  const toggleFavorite = api.library.toggleFavorite.useMutation()
  const { data: transcript } = api.library.getTranscript.useQuery(
    { contentId: content.id },
    { enabled: isOpen }
  )
  const { data: relatedContent } = api.library.getRelatedContent.useQuery(
    { contentId: content.id },
    { enabled: isOpen }
  )

  useEffect(() => {
    if (isOpen && content.id) {
      // Increment play count when player opens
      incrementPlayCount.mutate({ contentId: content.id })
    }
  }, [isOpen, content.id])

  const handleToggleFavorite = async () => {
    await toggleFavorite.mutateAsync({ contentId: content.id })
  }

  const handleDownload = async () => {
    if (!content.audioUrl) return
    
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
      await navigator.clipboard.writeText(window.location.href)
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <DialogTitle className="text-2xl">{content.title}</DialogTitle>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{format(new Date(content.date), 'MMMM d, yyyy')}</span>
                  {content.duration && (
                    <>
                      <span>•</span>
                      <span>{Math.floor(content.duration / 60)} minutes</span>
                    </>
                  )}
                  {content.stage && (
                    <>
                      <span>•</span>
                      <Badge variant={stageBadgeVariant[content.stage] || 'default'}>
                        {stageLabel[content.stage] || content.stage}
                      </Badge>
                    </>
                  )}
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={onClose}
                className="h-8 w-8"
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="mx-6 grid w-fit grid-cols-3">
              <TabsTrigger value="player">Player</TabsTrigger>
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
              <TabsTrigger value="related">Related</TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1">
              <TabsContent value="player" className="p-6 space-y-6">
                {/* Audio Player */}
                {content.audioUrl ? (
                  <div className="space-y-6">
                    <AudioPlayer
                      src={content.audioUrl}
                      title={content.title || 'PowerPulse Session'}
                      onPlayPause={setIsPlaying}
                    />

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={content.isFavorite ? 'destructive' : 'outline'}
                        onClick={handleToggleFavorite}
                        disabled={toggleFavorite.isPending}
                      >
                        <HeartIcon className={cn('mr-2 h-4 w-4', content.isFavorite && 'fill-current')} />
                        {content.isFavorite ? 'Favorited' : 'Add to Favorites'}
                      </Button>
                      <Button variant="outline" onClick={handleDownload}>
                        <DownloadIcon className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                      <Button variant="outline" onClick={handleShare}>
                        <ShareIcon className="mr-2 h-4 w-4" />
                        Share
                      </Button>
                    </div>

                    {/* Key Points */}
                    {content.keyPoints && content.keyPoints.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="font-semibold flex items-center gap-2">
                          <SparklesIcon className="h-4 w-4" />
                          Key Points
                        </h3>
                        <ul className="space-y-2">
                          {content.keyPoints.map((point, index) => (
                            <motion.li
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-start gap-2"
                            >
                              <span className="text-brand-primary mt-1">•</span>
                              <span className="text-sm">{point}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-muted-foreground">
                      Audio is being generated. Check back soon!
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="transcript" className="p-6">
                {transcript ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <h3 className="flex items-center gap-2">
                      <FileTextIcon className="h-4 w-4" />
                      Full Transcript
                    </h3>
                    <div className="whitespace-pre-wrap font-serif text-sm leading-relaxed">
                      {transcript}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileTextIcon className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Transcript not available yet
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="related" className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <ListIcon className="h-4 w-4" />
                  Related Sessions
                </h3>
                {relatedContent && relatedContent.length > 0 ? (
                  <div className="space-y-3">
                    {relatedContent.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer"
                        onClick={() => {
                          // In a real app, you'd handle switching to this content
                          console.log('Switch to content:', item.id)
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium">{item.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(item.date), 'MMM d, yyyy')}
                            </p>
                          </div>
                          {item.stage && (
                            <Badge variant={stageBadgeVariant[item.stage] || 'default'}>
                              {stageLabel[item.stage] || item.stage}
                            </Badge>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-muted-foreground">
                      No related content found
                    </p>
                  </div>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}