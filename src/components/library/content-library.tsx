'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ContentCard } from './content-card'
import { ContentPlayer } from './content-player'
import { Grid3x3Icon, ListIcon, SearchIcon, FilterIcon } from 'lucide-react'
import { api } from '@/lib/trpc/client'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { RouterOutputs } from '@/lib/trpc/types'

type LibraryContent = RouterOutputs['library']['getLibraryContent']['items'][0]

type SortOption = 'newest' | 'oldest' | 'most_played' | 'favorites'
type ViewMode = 'grid' | 'list'

interface ContentLibraryProps {
  className?: string
}

export function ContentLibrary({ className }: ContentLibraryProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [selectedStage, setSelectedStage] = useState<string>('all')
  const [selectedContent, setSelectedContent] = useState<LibraryContent | null>(null)
  const [page, setPage] = useState(1)
  const pageSize = 12

  const { data, isLoading, refetch } = api.library.getLibraryContent.useQuery({
    page,
    pageSize,
    search: searchQuery,
    sortBy,
    stage: selectedStage === 'all' ? undefined : selectedStage,
  })

  const stages = [
    { value: 'all', label: 'All Stages' },
    { value: 'awareness', label: 'Foundation' },
    { value: 'consideration', label: 'Momentum' },
    { value: 'decision', label: 'Transformation' },
    { value: 'retention', label: 'Mastery' },
  ]

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setPage(1) // Reset to first page on search
  }

  const handleSort = (value: SortOption) => {
    setSortBy(value)
    setPage(1) // Reset to first page on sort change
  }

  const handleStageFilter = (value: string) => {
    setSelectedStage(value)
    setPage(1) // Reset to first page on filter change
  }

  const handlePlayContent = (content: LibraryContent) => {
    setSelectedContent(content)
  }

  const handleToggleFavorite = () => {
    // Refetch data to update favorite status
    refetch()
  }

  const handleClosePlayer = () => {
    setSelectedContent(null)
    refetch() // Refetch to update play counts
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header Controls */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search your content..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-9"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              <Grid3x3Icon className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
              aria-label="List view"
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <Select value={selectedStage} onValueChange={handleStageFilter}>
            <SelectTrigger className="w-[180px]">
              <FilterIcon className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by stage" />
            </SelectTrigger>
            <SelectContent>
              {stages.map((stage) => (
                <SelectItem key={stage.value} value={stage.value}>
                  {stage.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={handleSort}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="most_played">Most Played</SelectItem>
              <SelectItem value="favorites">Favorites</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content Grid/List */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[200px] animate-pulse rounded-lg bg-muted"
            />
          ))}
        </div>
      ) : data?.items.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
          <p className="text-lg text-muted-foreground">
            No content found. Check back tomorrow for your first personalized session!
          </p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className={cn(
              viewMode === 'grid'
                ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
                : 'space-y-4'
            )}
          >
            {data?.items.map((content) => (
              <ContentCard
                key={content.id}
                content={content}
                viewMode={viewMode}
                onPlay={() => handlePlayContent(content)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {data.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Content Player Modal */}
      {selectedContent && (
        <ContentPlayer
          content={selectedContent}
          isOpen={!!selectedContent}
          onClose={handleClosePlayer}
        />
      )}
    </div>
  )
}