import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { StreakCounter, TodayAudio, ProgressChart, QuickStats } from '@/components/dashboard'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  // Sample data - in a real app, this would come from your database
  const progressData = [
    { date: 'Mon', value: 5, label: 'Mon' },
    { date: 'Tue', value: 7, label: 'Tue' },
    { date: 'Wed', value: 4, label: 'Wed' },
    { date: 'Thu', value: 8, label: 'Thu' },
    { date: 'Fri', value: 6, label: 'Fri' },
    { date: 'Sat', value: 9, label: 'Sat' },
    { date: 'Sun', value: 7, label: 'Today' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back! Track your progress and access your daily coaching.
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="mb-8">
          <QuickStats />
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Streak Counter */}
          <StreakCounter 
            currentStreak={7} 
            longestStreak={15}
            isActive={true}
          />

          {/* Today's Audio Session */}
          <div className="lg:col-span-2">
            <TodayAudio
              audioTitle="Building Unstoppable Confidence"
              audioDescription="Transform your mindset and unlock your potential with today's powerful 5-minute coaching session."
              duration={300} // 5 minutes
            />
          </div>

          {/* Progress Chart */}
          <div className="md:col-span-2 lg:col-span-2">
            <ProgressChart 
              data={progressData}
              title="Weekly Sessions"
              metric="Sessions"
            />
          </div>

          {/* Quick Actions Card */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full" size="sm">
                Update Goals
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                Take Quiz
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                View Achievements
              </Button>
            </div>
          </Card>
        </div>

        {/* Recent Sessions */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Recent Sessions</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Sample recent session cards */}
            <Card className="p-6">
              <h4 className="font-semibold mb-2">Morning Motivation</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Completed yesterday at 7:30 AM
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">5 min</span>
                <Button variant="ghost" size="sm">Replay</Button>
              </div>
            </Card>
            
            <Card className="p-6">
              <h4 className="font-semibold mb-2">Overcoming Obstacles</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Completed 2 days ago
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">5 min</span>
                <Button variant="ghost" size="sm">Replay</Button>
              </div>
            </Card>
            
            <Card className="p-6">
              <h4 className="font-semibold mb-2">Goal Setting Mastery</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Completed 3 days ago
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">5 min</span>
                <Button variant="ghost" size="sm">Replay</Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}