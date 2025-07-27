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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Shield,
  Download,
  Eye,
  EyeOff,
  Trash2,
  AlertTriangle,
  Lock,
  Unlock,
  Database,
  BarChart3,
  Users,
  FileText,
  CheckCircle2,
  Loader2,
  Info,
  ExternalLink,
  Clock,
} from 'lucide-react'

export function PrivacySettings() {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [exportInProgress, setExportInProgress] = useState(false)
  
  // Fetch privacy preferences
  const { data: privacyData, isLoading } = api.user.getPrivacyPreferences.useQuery()
  
  // Mutations
  const updatePrivacy = api.user.updatePrivacyPreferences.useMutation({
    onSuccess: () => {
      toast.success('Privacy preferences updated')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update preferences')
    },
  })
  
  const exportData = api.user.exportUserData.useMutation({
    onSuccess: (data) => {
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank')
        toast.success('Data export ready for download')
      } else {
        toast.success('Data export request received. You\'ll receive an email when it\'s ready.')
      }
      setExportInProgress(false)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to export data')
      setExportInProgress(false)
    },
  })
  
  const deleteAccount = api.user.deleteAccount.useMutation({
    onSuccess: () => {
      toast.success('Account deletion request received')
      // Redirect to goodbye page or sign out
      window.location.href = '/goodbye'
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete account')
    },
  })

  if (isLoading) {
    return <Loading />
  }

  const preferences = privacyData?.preferences
  const lastExport = privacyData?.lastDataExport

  const handleAnalyticsToggle = (enabled: boolean) => {
    updatePrivacy.mutate({ analyticsEnabled: enabled })
  }

  const handleDataSharingToggle = (enabled: boolean) => {
    updatePrivacy.mutate({ dataSharing: enabled })
  }

  const handleProfileVisibilityChange = (visibility: string) => {
    updatePrivacy.mutate({ profileVisibility: visibility as 'public' | 'private' | 'friends' })
  }

  const handleExportData = () => {
    setExportInProgress(true)
    exportData.mutate({ format: 'json' })
  }

  const handleDeleteAccount = () => {
    if (deleteConfirmation === 'DELETE') {
      deleteAccount.mutate()
    }
  }

  const integrations = [
    {
      id: 'google',
      name: 'Google Analytics',
      description: 'Website usage and performance tracking',
      enabled: preferences?.integrations?.googleAnalytics ?? true,
      icon: BarChart3,
    },
    {
      id: 'mixpanel',
      name: 'Mixpanel',
      description: 'Product analytics and user behavior',
      enabled: preferences?.integrations?.mixpanel ?? true,
      icon: BarChart3,
    },
    {
      id: 'sentry',
      name: 'Sentry',
      description: 'Error tracking and performance monitoring',
      enabled: preferences?.integrations?.sentry ?? true,
      icon: AlertTriangle,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Data Privacy Overview */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Shield className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <CardTitle>Privacy Overview</CardTitle>
              <CardDescription>
                Your privacy is important to us
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-sm">Your data is encrypted at rest and in transit</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-sm">We never sell your personal information</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-sm">You can export or delete your data anytime</span>
            </div>
            <Button
              variant="link"
              className="p-0 h-auto text-emerald-500 hover:text-emerald-400"
              onClick={() => window.open('/privacy-policy', '_blank')}
            >
              Read our Privacy Policy
              <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle>Export Your Data</CardTitle>
          <CardDescription>
            Download a copy of all your PowerPulse data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-white/5 rounded-lg">
            <p className="text-sm text-white/80 mb-3">
              Your export will include:
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <Database className="h-3 w-3" />
                <span>Profile information</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-3 w-3" />
                <span>Quiz responses</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-3 w-3" />
                <span>Progress data</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-3 w-3" />
                <span>Achievements</span>
              </div>
            </div>
          </div>

          {lastExport && (
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Clock className="h-4 w-4" />
              <span>
                Last export: {formatDistanceToNow(new Date(lastExport), { addSuffix: true })}
              </span>
            </div>
          )}

          <Button
            onClick={handleExportData}
            disabled={exportInProgress || exportData.isLoading}
            className="w-full bg-emerald-500 hover:bg-emerald-600"
          >
            {exportInProgress || exportData.isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Export My Data
          </Button>

          <p className="text-xs text-white/60 text-center">
            Large exports may take a few minutes. We'll email you when it's ready.
          </p>
        </CardContent>
      </Card>

      {/* Analytics & Tracking */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle>Analytics & Tracking</CardTitle>
          <CardDescription>
            Control how we collect and use your data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Usage Analytics */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/5 rounded-lg">
                <BarChart3 className="h-5 w-5 text-white/60" />
              </div>
              <div>
                <Label htmlFor="analytics" className="text-base">Usage Analytics</Label>
                <p className="text-sm text-white/60">
                  Help us improve PowerPulse by sharing usage data
                </p>
              </div>
            </div>
            <Switch
              id="analytics"
              checked={preferences?.analyticsEnabled ?? true}
              onCheckedChange={handleAnalyticsToggle}
              disabled={updatePrivacy.isLoading}
            />
          </div>

          {/* Performance Monitoring */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/5 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-white/60" />
              </div>
              <div>
                <Label htmlFor="performance" className="text-base">Performance Monitoring</Label>
                <p className="text-sm text-white/60">
                  Allow error and performance tracking
                </p>
              </div>
            </div>
            <Switch
              id="performance"
              checked={preferences?.performanceTracking ?? true}
              onCheckedChange={(checked) => 
                updatePrivacy.mutate({ performanceTracking: checked })
              }
              disabled={updatePrivacy.isLoading}
            />
          </div>

          {/* Data Sharing */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/5 rounded-lg">
                <Users className="h-5 w-5 text-white/60" />
              </div>
              <div>
                <Label htmlFor="sharing" className="text-base">Anonymous Data Sharing</Label>
                <p className="text-sm text-white/60">
                  Share anonymized data for research purposes
                </p>
              </div>
            </div>
            <Switch
              id="sharing"
              checked={preferences?.dataSharing ?? false}
              onCheckedChange={handleDataSharingToggle}
              disabled={updatePrivacy.isLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Third-Party Integrations */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle>Third-Party Services</CardTitle>
          <CardDescription>
            Manage connections to external services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {integrations.map((integration) => (
            <div key={integration.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-lg">
                  <integration.icon className="h-5 w-5 text-white/60" />
                </div>
                <div>
                  <Label htmlFor={integration.id} className="text-base">{integration.name}</Label>
                  <p className="text-sm text-white/60">{integration.description}</p>
                </div>
              </div>
              <Switch
                id={integration.id}
                checked={integration.enabled}
                onCheckedChange={(checked) => 
                  updatePrivacy.mutate({ 
                    integrations: { 
                      ...preferences?.integrations, 
                      [integration.id]: checked 
                    } 
                  })
                }
                disabled={updatePrivacy.isLoading}
              />
            </div>
          ))}

          <div className="pt-4 border-t border-white/10">
            <div className="flex items-start gap-3">
              <Info className="h-4 w-4 text-blue-500 mt-0.5" />
              <p className="text-xs text-white/60">
                These services help us provide better features and fix issues quickly. 
                No personal information is shared with third parties.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Visibility */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle>Profile Visibility</CardTitle>
          <CardDescription>
            Control who can see your achievements and progress
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="private"
                checked={preferences?.profileVisibility === 'private'}
                onChange={(e) => handleProfileVisibilityChange(e.target.value)}
                className="w-4 h-4 text-emerald-500 bg-white/5 border-white/20 focus:ring-emerald-500"
              />
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-white/60" />
                <div>
                  <p className="font-medium">Private</p>
                  <p className="text-sm text-white/60">Only you can see your profile</p>
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="friends"
                checked={preferences?.profileVisibility === 'friends'}
                onChange={(e) => handleProfileVisibilityChange(e.target.value)}
                className="w-4 h-4 text-emerald-500 bg-white/5 border-white/20 focus:ring-emerald-500"
              />
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-white/60" />
                <div>
                  <p className="font-medium">Friends Only</p>
                  <p className="text-sm text-white/60">Only accountability partners can see</p>
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="public"
                checked={preferences?.profileVisibility === 'public'}
                onChange={(e) => handleProfileVisibilityChange(e.target.value)}
                className="w-4 h-4 text-emerald-500 bg-white/5 border-white/20 focus:ring-emerald-500"
              />
              <div className="flex items-center gap-2">
                <Unlock className="h-4 w-4 text-white/60" />
                <div>
                  <p className="font-medium">Public</p>
                  <p className="text-sm text-white/60">Anyone can see your achievements</p>
                </div>
              </div>
            </label>
          </div>

          {/* Show/Hide Specific Elements */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <p className="text-sm font-medium text-white/80">Show on profile:</p>
            
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences?.showStreak ?? true}
                  onChange={(e) => updatePrivacy.mutate({ showStreak: e.target.checked })}
                  className="w-4 h-4 text-emerald-500 bg-white/5 border-white/20 rounded focus:ring-emerald-500"
                />
                <span className="text-sm">Current streak</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences?.showAchievements ?? true}
                  onChange={(e) => updatePrivacy.mutate({ showAchievements: e.target.checked })}
                  className="w-4 h-4 text-emerald-500 bg-white/5 border-white/20 rounded focus:ring-emerald-500"
                />
                <span className="text-sm">Achievements & badges</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences?.showProgress ?? false}
                  onChange={(e) => updatePrivacy.mutate({ showProgress: e.target.checked })}
                  className="w-4 h-4 text-emerald-500 bg-white/5 border-white/20 rounded focus:ring-emerald-500"
                />
                <span className="text-sm">Journey progress</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="bg-white/5 border-white/10 border-red-500/20">
        <CardHeader>
          <CardTitle className="text-red-500">Delete Account</CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm text-red-500 font-medium">
                    This action cannot be undone
                  </p>
                  <p className="text-sm text-white/60">
                    Deleting your account will permanently remove all your data, including 
                    your profile, progress, achievements, and any remaining subscription time.
                  </p>
                </div>
              </div>
            </div>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full border-red-500/20 hover:bg-red-500/10 text-red-500"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete My Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-black border-white/10">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-red-500">
                    Delete Your Account?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your account and all associated data. 
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-4 py-4">
                  <p className="text-sm text-white/80">
                    Type <span className="font-mono font-bold">DELETE</span> to confirm:
                  </p>
                  <input
                    type="text"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="Type DELETE to confirm"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel 
                    onClick={() => setDeleteConfirmation('')}
                    className="border-white/10 hover:bg-white/5"
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmation !== 'DELETE' || deleteAccount.isLoading}
                    className="bg-red-500 hover:bg-red-600 disabled:opacity-50"
                  >
                    {deleteAccount.isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function formatDistanceToNow(date: Date, options?: { addSuffix?: boolean }) {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) {
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    if (diffInHours === 0) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
      return `${diffInMinutes} minutes${options?.addSuffix ? ' ago' : ''}`
    }
    return `${diffInHours} hours${options?.addSuffix ? ' ago' : ''}`
  } else if (diffInDays === 1) {
    return `1 day${options?.addSuffix ? ' ago' : ''}`
  } else if (diffInDays < 7) {
    return `${diffInDays} days${options?.addSuffix ? ' ago' : ''}`
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7)
    return `${weeks} week${weeks > 1 ? 's' : ''}${options?.addSuffix ? ' ago' : ''}`
  } else {
    const months = Math.floor(diffInDays / 30)
    return `${months} month${months > 1 ? 's' : ''}${options?.addSuffix ? ' ago' : ''}`
  }
}