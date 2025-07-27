'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/trpc/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Loading } from '@/components/ui/loading'
import { Badge } from '@/components/ui/badge'
import {
  Bell,
  Mail,
  Smartphone,
  Trophy,
  Flame,
  MessageSquare,
  Megaphone,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  BellOff,
  Loader2,
  Settings,
} from 'lucide-react'

interface NotificationCategory {
  id: string
  title: string
  description: string
  icon: React.ElementType
  enabled: boolean
  channels: {
    push: boolean
    email: boolean
    inApp: boolean
  }
}

export function NotificationSettings() {
  const [testingCategory, setTestingCategory] = useState<string | null>(null)
  
  // Fetch notification preferences
  const { data: preferences, isLoading } = api.user.getNotificationPreferences.useQuery()
  
  // Mutations
  const updatePreferences = api.user.updateNotificationPreferences.useMutation({
    onSuccess: () => {
      toast.success('Notification preferences updated')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update preferences')
    },
  })
  
  const sendTestNotification = api.user.sendTestNotification.useMutation({
    onSuccess: () => {
      toast.success('Test notification sent')
      setTestingCategory(null)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send test notification')
      setTestingCategory(null)
    },
  })

  const requestPushPermission = async () => {
    try {
      if (!('Notification' in window)) {
        toast.error('Push notifications are not supported in your browser')
        return
      }

      if (Notification.permission === 'denied') {
        toast.error('Push notifications have been blocked. Please enable them in your browser settings.')
        return
      }

      const permission = await Notification.requestPermission()
      
      if (permission === 'granted') {
        toast.success('Push notifications enabled')
        // Register service worker and save subscription
        // This would typically involve registering a service worker
        // and sending the subscription to your backend
      } else {
        toast.error('Push notification permission denied')
      }
    } catch (error) {
      toast.error('Failed to enable push notifications')
    }
  }

  if (isLoading) {
    return <Loading />
  }

  const notificationCategories: NotificationCategory[] = [
    {
      id: 'daily_content',
      title: 'Daily Content',
      description: 'Your personalized audio coaching sessions',
      icon: Calendar,
      enabled: preferences?.dailyContent?.enabled ?? true,
      channels: {
        push: preferences?.dailyContent?.push ?? true,
        email: preferences?.dailyContent?.email ?? true,
        inApp: preferences?.dailyContent?.inApp ?? true,
      },
    },
    {
      id: 'achievements',
      title: 'Achievements',
      description: 'Milestones, badges, and personal records',
      icon: Trophy,
      enabled: preferences?.achievements?.enabled ?? true,
      channels: {
        push: preferences?.achievements?.push ?? true,
        email: preferences?.achievements?.email ?? false,
        inApp: preferences?.achievements?.inApp ?? true,
      },
    },
    {
      id: 'streaks',
      title: 'Streak Reminders',
      description: 'Keep your momentum with timely reminders',
      icon: Flame,
      enabled: preferences?.streaks?.enabled ?? true,
      channels: {
        push: preferences?.streaks?.push ?? true,
        email: preferences?.streaks?.email ?? false,
        inApp: preferences?.streaks?.inApp ?? true,
      },
    },
    {
      id: 'community',
      title: 'Community Updates',
      description: 'Success stories and community highlights',
      icon: MessageSquare,
      enabled: preferences?.community?.enabled ?? true,
      channels: {
        push: preferences?.community?.push ?? false,
        email: preferences?.community?.email ?? true,
        inApp: preferences?.community?.inApp ?? true,
      },
    },
    {
      id: 'marketing',
      title: 'Product Updates',
      description: 'New features, tips, and special offers',
      icon: Megaphone,
      enabled: preferences?.marketing?.enabled ?? false,
      channels: {
        push: preferences?.marketing?.push ?? false,
        email: preferences?.marketing?.email ?? true,
        inApp: preferences?.marketing?.inApp ?? false,
      },
    },
  ]

  const handleCategoryToggle = (categoryId: string, enabled: boolean) => {
    updatePreferences.mutate({
      [categoryId]: { ...preferences?.[categoryId], enabled },
    })
  }

  const handleChannelToggle = (categoryId: string, channel: 'push' | 'email' | 'inApp', enabled: boolean) => {
    updatePreferences.mutate({
      [categoryId]: {
        ...preferences?.[categoryId],
        [channel]: enabled,
      },
    })
  }

  const handleTestNotification = (categoryId: string) => {
    setTestingCategory(categoryId)
    sendTestNotification.mutate({
      category: categoryId,
      channels: ['push', 'email', 'inApp'],
    })
  }

  const pushEnabled = 'Notification' in window && Notification.permission === 'granted'

  return (
    <div className="space-y-6">
      {/* Push Notification Status */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Push Notifications</CardTitle>
              <CardDescription>
                Receive notifications directly in your browser
              </CardDescription>
            </div>
            <Badge 
              variant={pushEnabled ? 'success' : 'secondary'}
              className="flex items-center gap-1"
            >
              {pushEnabled ? (
                <>
                  <CheckCircle2 className="h-3 w-3" />
                  Enabled
                </>
              ) : (
                <>
                  <BellOff className="h-3 w-3" />
                  Disabled
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {!pushEnabled && (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-sm text-yellow-500">
                  Enable push notifications to receive timely updates about your daily content and achievements.
                </p>
              </div>
              <Button
                onClick={requestPushPermission}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                <Bell className="mr-2 h-4 w-4" />
                Enable Push Notifications
              </Button>
            </div>
          )}
          
          {pushEnabled && (
            <div className="flex items-center gap-2 text-sm text-white/60">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Push notifications are enabled for this device
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Categories */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Choose what you want to be notified about
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {notificationCategories.map((category) => (
            <div key={category.id} className="space-y-4 pb-6 border-b border-white/10 last:border-0 last:pb-0">
              {/* Category Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/5 rounded-lg">
                    <category.icon className="h-5 w-5 text-white/60" />
                  </div>
                  <div>
                    <Label htmlFor={`${category.id}-enabled`} className="text-base cursor-pointer">
                      {category.title}
                    </Label>
                    <p className="text-sm text-white/60">{category.description}</p>
                  </div>
                </div>
                <Switch
                  id={`${category.id}-enabled`}
                  checked={category.enabled}
                  onCheckedChange={(checked) => handleCategoryToggle(category.id, checked)}
                  disabled={updatePreferences.isLoading}
                />
              </div>

              {/* Channel Options */}
              {category.enabled && (
                <div className="ml-14 space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    {/* Push */}
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`${category.id}-push`}
                        checked={category.channels.push}
                        onCheckedChange={(checked) => handleChannelToggle(category.id, 'push', checked)}
                        disabled={updatePreferences.isLoading || !pushEnabled}
                        className="scale-90"
                      />
                      <Label 
                        htmlFor={`${category.id}-push`} 
                        className={`text-sm cursor-pointer flex items-center gap-1 ${!pushEnabled ? 'opacity-50' : ''}`}
                      >
                        <Smartphone className="h-3 w-3" />
                        Push
                      </Label>
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`${category.id}-email`}
                        checked={category.channels.email}
                        onCheckedChange={(checked) => handleChannelToggle(category.id, 'email', checked)}
                        disabled={updatePreferences.isLoading}
                        className="scale-90"
                      />
                      <Label 
                        htmlFor={`${category.id}-email`} 
                        className="text-sm cursor-pointer flex items-center gap-1"
                      >
                        <Mail className="h-3 w-3" />
                        Email
                      </Label>
                    </div>

                    {/* In-App */}
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`${category.id}-inapp`}
                        checked={category.channels.inApp}
                        onCheckedChange={(checked) => handleChannelToggle(category.id, 'inApp', checked)}
                        disabled={updatePreferences.isLoading}
                        className="scale-90"
                      />
                      <Label 
                        htmlFor={`${category.id}-inapp`} 
                        className="text-sm cursor-pointer flex items-center gap-1"
                      >
                        <Bell className="h-3 w-3" />
                        In-App
                      </Label>
                    </div>
                  </div>

                  {/* Test Button */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTestNotification(category.id)}
                    disabled={testingCategory === category.id || !category.enabled}
                    className="border-white/10 hover:bg-white/5"
                  >
                    {testingCategory === category.id ? (
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    ) : (
                      <Bell className="mr-2 h-3 w-3" />
                    )}
                    Send Test
                  </Button>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle>Quiet Hours</CardTitle>
          <CardDescription>
            Pause notifications during specific times
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/5 rounded-lg">
                <Clock className="h-5 w-5 text-white/60" />
              </div>
              <div>
                <Label htmlFor="quiet-hours" className="text-base">Enable Quiet Hours</Label>
                <p className="text-sm text-white/60">
                  No notifications during your quiet time
                </p>
              </div>
            </div>
            <Switch
              id="quiet-hours"
              checked={preferences?.quietHours?.enabled ?? false}
              onCheckedChange={(checked) => 
                updatePreferences.mutate({ 
                  quietHours: { ...preferences?.quietHours, enabled: checked } 
                })
              }
              disabled={updatePreferences.isLoading}
            />
          </div>

          {preferences?.quietHours?.enabled && (
            <div className="ml-14 grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quiet-start" className="text-sm">Start Time</Label>
                <input
                  id="quiet-start"
                  type="time"
                  value={preferences?.quietHours?.startTime || '22:00'}
                  onChange={(e) => 
                    updatePreferences.mutate({ 
                      quietHours: { ...preferences?.quietHours, startTime: e.target.value } 
                    })
                  }
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quiet-end" className="text-sm">End Time</Label>
                <input
                  id="quiet-end"
                  type="time"
                  value={preferences?.quietHours?.endTime || '08:00'}
                  onChange={(e) => 
                    updatePreferences.mutate({ 
                      quietHours: { ...preferences?.quietHours, endTime: e.target.value } 
                    })
                  }
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Preferences */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle>Email Preferences</CardTitle>
          <CardDescription>
            Additional email communication settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email Format */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="html-emails" className="text-base">HTML Emails</Label>
              <p className="text-sm text-white/60">
                Receive beautifully formatted emails
              </p>
            </div>
            <Switch
              id="html-emails"
              checked={preferences?.emailFormat === 'html'}
              onCheckedChange={(checked) => 
                updatePreferences.mutate({ emailFormat: checked ? 'html' : 'text' })
              }
              disabled={updatePreferences.isLoading}
            />
          </div>

          {/* Weekly Digest */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="weekly-digest" className="text-base">Weekly Progress Digest</Label>
              <p className="text-sm text-white/60">
                Summary of your weekly achievements and insights
              </p>
            </div>
            <Switch
              id="weekly-digest"
              checked={preferences?.weeklyDigest ?? true}
              onCheckedChange={(checked) => 
                updatePreferences.mutate({ weeklyDigest: checked })
              }
              disabled={updatePreferences.isLoading}
            />
          </div>

          {/* Unsubscribe from All */}
          <div className="pt-4 border-t border-white/10">
            <Button
              variant="outline"
              className="w-full border-red-500/20 hover:bg-red-500/10 text-red-500"
              onClick={() => {
                if (confirm('Are you sure you want to unsubscribe from all email notifications?')) {
                  updatePreferences.mutate({ unsubscribeAll: true })
                }
              }}
            >
              <Mail className="mr-2 h-4 w-4" />
              Unsubscribe from All Emails
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings Info */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm text-white/80">
                <strong>Note:</strong> You'll always receive important account-related emails 
                regardless of your preferences (e.g., payment confirmations, security alerts).
              </p>
              <p className="text-sm text-white/60">
                Need help? Visit our{' '}
                <button className="text-emerald-500 hover:underline">
                  notification guide
                </button>{' '}
                or contact support.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}