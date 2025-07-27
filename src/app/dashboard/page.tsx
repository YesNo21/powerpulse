import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back! Track your progress and access your daily coaching.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Daily Coaching Card */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Today's Coaching</h3>
            <p className="text-muted-foreground mb-4">
              Your personalized 5-minute audio session is ready.
            </p>
            <Button className="w-full">Start Session</Button>
          </Card>

          {/* Progress Card */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Your Progress</h3>
            <p className="text-muted-foreground mb-4">
              7 day streak! Keep up the great work.
            </p>
            <Button variant="outline" className="w-full">View Details</Button>
          </Card>

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
            </div>
          </Card>
        </div>

        {/* Recent Sessions */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Recent Sessions</h2>
          <Card className="p-6">
            <p className="text-muted-foreground">
              Your recent coaching sessions will appear here.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}