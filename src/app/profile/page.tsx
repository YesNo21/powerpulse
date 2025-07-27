import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default async function ProfilePage() {
  const { userId } = await auth()
  const user = await currentUser()
  
  if (!userId || !user) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account and preferences
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* User Info Card */}
          <Card className="p-6 md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Account Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Name
                </label>
                <p className="text-lg">
                  {user.firstName} {user.lastName || ''}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Email
                </label>
                <p className="text-lg">{user.emailAddresses[0]?.emailAddress}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Member Since
                </label>
                <p className="text-lg">
                  {new Date(user.createdAt!).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <Button variant="outline">Edit Profile</Button>
            </div>
          </Card>

          {/* Stats Card */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Your Stats</h2>
            
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-3xl font-bold">7</p>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </div>
              
              <div className="text-center">
                <p className="text-3xl font-bold">42</p>
                <p className="text-sm text-muted-foreground">Total Sessions</p>
              </div>
              
              <div className="text-center">
                <p className="text-3xl font-bold">3.5</p>
                <p className="text-sm text-muted-foreground">Hours Coached</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Preferences Section */}
        <Card className="p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Coaching Preferences</h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Primary Goal
              </label>
              <p className="text-lg">Build better habits</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Coaching Style
              </label>
              <p className="text-lg">Motivational and energetic</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Daily Time
              </label>
              <p className="text-lg">5 minutes</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Notification Time
              </label>
              <p className="text-lg">7:00 AM</p>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t">
            <Button variant="outline">Update Preferences</Button>
          </div>
        </Card>

        {/* Subscription Section */}
        <Card className="p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Subscription</h2>
            <Badge variant="secondary">Free Plan</Badge>
          </div>
          
          <p className="text-muted-foreground mb-4">
            Upgrade to Pro for unlimited coaching sessions and advanced features.
          </p>
          
          <Button>Upgrade to Pro</Button>
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 mt-6 border-destructive/50">
          <h2 className="text-xl font-semibold mb-4">Danger Zone</h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Delete your account and all associated data. This action cannot be undone.
              </p>
              <Button variant="destructive">Delete Account</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}