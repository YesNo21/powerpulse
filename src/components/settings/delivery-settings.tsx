'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { api } from '@/lib/trpc/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { TimePicker } from '@/components/ui/time-picker'
import { Loading } from '@/components/ui/loading'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Mail,
  Phone,
  MessageSquare,
  Send,
  Calendar,
  Clock,
  Pause,
  Play,
  CheckCircle2,
  AlertCircle,
  Loader2,
  TestTube,
  Globe,
} from 'lucide-react'

type DeliveryChannel = 'email' | 'whatsapp' | 'telegram' | 'sms'
type DeliveryFrequency = 'daily' | 'weekdays' | 'custom'

interface ChannelConfig {
  email: {
    primaryEmail?: string
    backupEmail?: string
  }
  whatsapp: {
    phoneNumber?: string
    isVerified?: boolean
  }
  telegram: {
    username?: string
    chatId?: string
    isConnected?: boolean
  }
  sms: {
    phoneNumber?: string
    isVerified?: boolean
  }
}

export function DeliverySettings() {
  const router = useRouter()
  const [testingChannel, setTestingChannel] = useState<DeliveryChannel | null>(null)
  
  // Fetch delivery preferences
  const { data: deliveryData, isLoading } = api.delivery.getDeliveryPreferences.useQuery()
  
  // Mutations
  const updatePreferences = api.delivery.updateDeliveryPreferences.useMutation({
    onSuccess: () => {
      toast.success('Delivery preferences updated')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update preferences')
    },
  })
  
  const sendTestNotification = api.delivery.sendTestNotification.useMutation({
    onSuccess: () => {
      toast.success('Test notification sent successfully')
      setTestingChannel(null)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send test notification')
      setTestingChannel(null)
    },
  })
  
  const pauseDelivery = api.delivery.pauseDelivery.useMutation({
    onSuccess: () => {
      toast.success('Delivery paused')
      router.refresh()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to pause delivery')
    },
  })
  
  const resumeDelivery = api.delivery.resumeDelivery.useMutation({
    onSuccess: () => {
      toast.success('Delivery resumed')
      router.refresh()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to resume delivery')
    },
  })

  if (isLoading) {
    return <Loading />
  }

  const preferences = deliveryData?.preferences
  const schedule = deliveryData?.schedule
  const isPaused = schedule?.isActive === false

  const handleChannelToggle = (channel: DeliveryChannel, enabled: boolean) => {
    updatePreferences.mutate({
      [`${channel}Enabled`]: enabled,
    })
  }

  const handleTimeChange = (time: string) => {
    updatePreferences.mutate({
      preferredDeliveryTime: time,
    })
  }

  const handleFrequencyChange = (frequency: string) => {
    updatePreferences.mutate({
      emailFrequency: frequency as 'daily' | 'weekly' | 'monthly',
    })
  }

  const handleTestDelivery = (channel: DeliveryChannel) => {
    setTestingChannel(channel)
    sendTestNotification.mutate({
      channel,
      type: 'test',
    })
  }

  const handleTimezoneChange = (timezone: string) => {
    updatePreferences.mutate({ timezone })
  }

  return (
    <div className="space-y-6">
      {/* Delivery Status Card */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Delivery Status</CardTitle>
              <CardDescription>
                Manage your daily audio delivery
              </CardDescription>
            </div>
            {isPaused ? (
              <Badge variant="destructive" className="flex items-center gap-1">
                <Pause className="h-3 w-3" />
                Paused
              </Badge>
            ) : (
              <Badge variant="success" className="flex items-center gap-1">
                <Play className="h-3 w-3" />
                Active
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {isPaused ? (
              <Button
                onClick={() => resumeDelivery.mutate()}
                disabled={resumeDelivery.isLoading}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                {resumeDelivery.isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Resume Delivery
              </Button>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="border-white/10 hover:bg-white/5">
                    Pause Delivery
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-black border-white/10">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Pause Delivery?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will pause all daily audio deliveries. You can resume anytime.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-white/10 hover:bg-white/5">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => pauseDelivery.mutate()}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Pause Delivery
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delivery Channels */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle>Delivery Channels</CardTitle>
          <CardDescription>
            Choose how you want to receive your daily audio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Channel */}
          <div className="space-y-4 pb-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Mail className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <Label htmlFor="email-enabled" className="text-base">Email</Label>
                  <p className="text-sm text-white/60">Receive audio links via email</p>
                </div>
              </div>
              <Switch
                id="email-enabled"
                checked={preferences?.emailEnabled ?? true}
                onCheckedChange={(checked) => handleChannelToggle('email', checked)}
                disabled={updatePreferences.isLoading || isPaused}
              />
            </div>
            
            {preferences?.emailEnabled && (
              <div className="ml-11 space-y-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleTestDelivery('email')}
                  disabled={testingChannel === 'email' || isPaused}
                  className="border-white/10 hover:bg-white/5"
                >
                  {testingChannel === 'email' ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <TestTube className="mr-2 h-4 w-4" />
                  )}
                  Send Test Email
                </Button>
              </div>
            )}
          </div>

          {/* WhatsApp Channel */}
          <div className="space-y-4 pb-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <Label htmlFor="whatsapp-enabled" className="text-base">WhatsApp</Label>
                  <p className="text-sm text-white/60">Get audio via WhatsApp messages</p>
                </div>
              </div>
              <Switch
                id="whatsapp-enabled"
                checked={preferences?.whatsappEnabled ?? false}
                onCheckedChange={(checked) => handleChannelToggle('whatsapp', checked)}
                disabled={updatePreferences.isLoading || isPaused}
              />
            </div>
            
            {preferences?.whatsappEnabled && (
              <div className="ml-11 space-y-3">
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-sm text-yellow-500">
                    WhatsApp integration coming soon! We'll notify you when it's ready.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Telegram Channel */}
          <div className="space-y-4 pb-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-400/10 rounded-lg">
                  <Send className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <Label htmlFor="telegram-enabled" className="text-base">Telegram</Label>
                  <p className="text-sm text-white/60">Receive audio in Telegram</p>
                </div>
              </div>
              <Switch
                id="telegram-enabled"
                checked={preferences?.telegramEnabled ?? false}
                onCheckedChange={(checked) => handleChannelToggle('telegram', checked)}
                disabled={updatePreferences.isLoading || isPaused}
              />
            </div>
            
            {preferences?.telegramEnabled && (
              <div className="ml-11 space-y-3">
                {preferences?.telegramChatId ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-white/60">Connected</span>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open('https://t.me/PowerPulseBot', '_blank')}
                    className="border-white/10 hover:bg-white/5"
                  >
                    Connect Telegram
                  </Button>
                )}
                
                {preferences?.telegramChatId && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTestDelivery('telegram')}
                    disabled={testingChannel === 'telegram' || isPaused}
                    className="border-white/10 hover:bg-white/5"
                  >
                    {testingChannel === 'telegram' ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <TestTube className="mr-2 h-4 w-4" />
                    )}
                    Send Test Message
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* SMS Channel */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Phone className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <Label htmlFor="sms-enabled" className="text-base">SMS</Label>
                  <p className="text-sm text-white/60">Get audio links via text message</p>
                </div>
              </div>
              <Switch
                id="sms-enabled"
                checked={preferences?.smsEnabled ?? false}
                onCheckedChange={(checked) => handleChannelToggle('sms', checked)}
                disabled={updatePreferences.isLoading || isPaused}
              />
            </div>
            
            {preferences?.smsEnabled && (
              <div className="ml-11 space-y-3">
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-sm text-yellow-500">
                    SMS integration coming soon! We'll notify you when it's ready.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delivery Timing */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle>Delivery Timing</CardTitle>
          <CardDescription>
            Set when you want to receive your daily audio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Preferred Time */}
          <div className="space-y-2">
            <Label htmlFor="delivery-time" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Preferred Delivery Time
            </Label>
            <TimePicker
              id="delivery-time"
              value={preferences?.preferredDeliveryTime ?? '08:00'}
              onChange={handleTimeChange}
              disabled={updatePreferences.isLoading || isPaused}
            />
            <p className="text-sm text-white/60">
              Audio will be delivered at this time in your timezone
            </p>
          </div>

          {/* Timezone */}
          <div className="space-y-2">
            <Label htmlFor="timezone" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Timezone
            </Label>
            <Select
              value={preferences?.timezone ?? 'America/New_York'}
              onValueChange={handleTimezoneChange}
              disabled={updatePreferences.isLoading || isPaused}
            >
              <SelectTrigger id="timezone" className="bg-white/5 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black border-white/10">
                <SelectItem value="America/New_York">Eastern Time (US)</SelectItem>
                <SelectItem value="America/Chicago">Central Time (US)</SelectItem>
                <SelectItem value="America/Denver">Mountain Time (US)</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time (US)</SelectItem>
                <SelectItem value="Europe/London">London</SelectItem>
                <SelectItem value="Europe/Paris">Paris</SelectItem>
                <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                <SelectItem value="Australia/Sydney">Sydney</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quiet Hours */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="quiet-hours" className="text-base">Quiet Hours</Label>
                <p className="text-sm text-white/60">
                  Pause notifications during specific hours
                </p>
              </div>
              <Switch
                id="quiet-hours"
                checked={preferences?.quietHoursEnabled ?? false}
                onCheckedChange={(checked) => 
                  updatePreferences.mutate({ quietHoursEnabled: checked })
                }
                disabled={updatePreferences.isLoading || isPaused}
              />
            </div>
            
            {preferences?.quietHoursEnabled && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quiet-start">Start Time</Label>
                  <TimePicker
                    id="quiet-start"
                    value={preferences?.quietHoursStart ?? '22:00'}
                    onChange={(time) => 
                      updatePreferences.mutate({ quietHoursStart: time })
                    }
                    disabled={updatePreferences.isLoading || isPaused}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quiet-end">End Time</Label>
                  <TimePicker
                    id="quiet-end"
                    value={preferences?.quietHoursEnd ?? '08:00'}
                    onChange={(time) => 
                      updatePreferences.mutate({ quietHoursEnd: time })
                    }
                    disabled={updatePreferences.isLoading || isPaused}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delivery Frequency */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle>Delivery Frequency</CardTitle>
          <CardDescription>
            How often do you want to receive content?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Select
              value={preferences?.emailFrequency ?? 'daily'}
              onValueChange={handleFrequencyChange}
              disabled={updatePreferences.isLoading || isPaused}
            >
              <SelectTrigger className="bg-white/5 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black border-white/10">
                <SelectItem value="daily">Daily (Every Day)</SelectItem>
                <SelectItem value="weekly">Weekly (Once a Week)</SelectItem>
                <SelectItem value="monthly">Monthly (Once a Month)</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Weekend Preferences */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="weekend-delivery" className="text-base">Weekend Delivery</Label>
                <p className="text-sm text-white/60">
                  Include weekends in daily delivery
                </p>
              </div>
              <Switch
                id="weekend-delivery"
                checked={true} // This would come from preferences
                disabled={
                  updatePreferences.isLoading || 
                  isPaused || 
                  preferences?.emailFrequency !== 'daily'
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}