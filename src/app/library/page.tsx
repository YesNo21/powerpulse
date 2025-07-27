import { ContentLibrary } from '@/components/library/content-library'
import { ArrowLeftIcon } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Content Library | PowerPulse',
  description: 'Access all your personalized PowerPulse audio sessions',
}

export default function LibraryPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Dashboard
          </Link>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Your Content Library</h1>
            <p className="text-muted-foreground">
              Access all your personalized coaching sessions in one place. Download for offline listening or revisit your favorites anytime.
            </p>
          </div>
        </div>

        {/* Content Library Component */}
        <ContentLibrary />
      </div>
    </div>
  )
}