'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { api } from '@/trpc/react'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Loading } from '@/components/ui/loading'
import { MultiSelect } from '@/components/ui/multi-select'
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
  User, 
  Calendar, 
  Trophy, 
  Target, 
  AlertCircle, 
  Camera,
  Trash2,
  Save,
  Edit3
} from 'lucide-react'
import { timezones, languages, workoutTimes } from '@/lib/timezones'

// Form schemas
const profileDetailsSchema = z.object({
  name: z.string().min(1, 'Name is required').max(256),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  preferredWorkoutTime: z.string().optional(),
})

const fitnessProfileSchema = z.object({
  painPoints: z.array(z.string()),
  goals: z.array(z.string()),
  learningStyle: z.enum(['direct', 'gentle', 'tough', 'story']).optional(),
})

type ProfileDetailsFormData = z.infer<typeof profileDetailsSchema>
type FitnessProfileFormData = z.infer<typeof fitnessProfileSchema>

// Pain points and goals options from quiz
const painPointOptions = [
  { value: 'motivation', label: 'Lack of motivation' },
  { value: 'time', label: 'Not enough time' },
  { value: 'knowledge', label: "Don't know where to start" },
  { value: 'consistency', label: 'Trouble staying consistent' },
  { value: 'plateau', label: 'Hit a plateau' },
  { value: 'boredom', label: 'Workouts are boring' },
  { value: 'equipment', label: 'Limited equipment access' },
  { value: 'confidence', label: 'Gym intimidation' },
  { value: 'recovery', label: 'Recovery issues' },
  { value: 'nutrition', label: 'Nutrition confusion' },
]

const goalOptions = [
  { value: 'weight-loss', label: 'Lose Weight' },
  { value: 'muscle-gain', label: 'Build Muscle' },
  { value: 'endurance', label: 'Improve Endurance' },
  { value: 'flexibility', label: 'Increase Flexibility' },
  { value: 'general-fitness', label: 'General Fitness' },
  { value: 'sports-performance', label: 'Sports Performance' },
  { value: 'stress-relief', label: 'Reduce stress' },
  { value: 'energy', label: 'Boost energy levels' },
  { value: 'confidence', label: 'Build confidence' },
  { value: 'discipline', label: 'Develop discipline' },
]

const learningStyles = [
  { value: 'direct', label: 'Direct - Tell me what to do' },
  { value: 'gentle', label: 'Gentle - Encourage and support me' },
  { value: 'tough', label: 'Tough - Push me hard' },
  { value: 'story', label: 'Story - Use stories and examples' },
]

export function ProfileSettings() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const [isEditingAvatar, setIsEditingAvatar] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  // API queries
  const { data: profile, isLoading: isProfileLoading } = api.user.getProfile.useQuery()
  const { data: stats, isLoading: isStatsLoading } = api.user.getUserStats.useQuery()

  // API mutations
  const updateUserDetails = api.user.updateUserDetails.useMutation({
    onSuccess: () => {
      toast.success('Profile updated successfully')
    },
    onError: () => {
      toast.error('Failed to update profile')
    },
  })

  const updateProfile = api.user.updateProfile.useMutation({
    onSuccess: () => {
      toast.success('Fitness profile updated successfully')
    },
    onError: () => {
      toast.error('Failed to update fitness profile')
    },
  })

  // Profile details form
  const detailsForm = useForm<ProfileDetailsFormData>({
    resolver: zodResolver(profileDetailsSchema),
    values: {
      name: profile?.user.name || '',
      bio: profile?.profile?.bio || '',
      timezone: profile?.profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: profile?.profile?.language || 'en',
      preferredWorkoutTime: profile?.profile?.preferredWorkoutTime || '07:00',
    },
  })

  // Fitness profile form
  const fitnessForm = useForm<FitnessProfileFormData>({
    resolver: zodResolver(fitnessProfileSchema),
    values: {
      painPoints: profile?.profile?.painPoints || [],
      goals: profile?.profile?.goals || [],
      learningStyle: profile?.profile?.learningStyle || undefined,
    },
  })

  // Handle avatar upload through Clerk
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    try {
      setIsEditingAvatar(true)
      const imageUrl = URL.createObjectURL(file)
      setAvatarUrl(imageUrl)
      
      // In a real implementation, you would upload to Clerk here
      // await user.setProfileImage({ file })
      
      toast.success('Avatar updated successfully')
    } catch (error) {
      toast.error('Failed to update avatar')
    } finally {
      setIsEditingAvatar(false)
    }
  }

  const onDetailsSubmit = async (data: ProfileDetailsFormData) => {
    await updateUserDetails.mutateAsync(data)
  }

  const onFitnessSubmit = async (data: FitnessProfileFormData) => {
    await updateProfile.mutateAsync(data)
  }

  const handleDeleteAccount = async () => {
    // In a real implementation, this would delete the user account
    toast.error('Account deletion is not implemented in this demo')
  }

  if (!isLoaded || isProfileLoading || isStatsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* User Avatar and Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>Update your profile picture and display name</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarUrl || user?.imageUrl} />
                <AvatarFallback>
                  {user?.firstName?.[0] || user?.emailAddresses[0].emailAddress[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 rounded-full bg-black/80 p-2 cursor-pointer hover:bg-black/90 transition-colors"
              >
                <Camera className="h-4 w-4" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={isEditingAvatar}
                />
              </label>
            </div>
            <div className="flex-1">
              <p className="text-sm text-white/60">Profile picture</p>
              <p className="text-xs text-white/40 mt-1">
                JPG, GIF or PNG. Max size 5MB.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Details Form */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...detailsForm}>
            <form onSubmit={detailsForm.handleSubmit(onDetailsSubmit)} className="space-y-4">
              <FormField
                control={detailsForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={detailsForm.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about yourself..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Brief description for your profile (max 500 characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={detailsForm.control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time Zone</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your timezone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timezones.map((tz) => (
                            <SelectItem key={tz.value} value={tz.value}>
                              {tz.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={detailsForm.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Language</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {languages.map((lang) => (
                            <SelectItem key={lang.value} value={lang.value}>
                              {lang.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={detailsForm.control}
                  name="preferredWorkoutTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Workout Time</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {workoutTimes.map((time) => (
                            <SelectItem key={time.value} value={time.value}>
                              {time.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                disabled={updateUserDetails.isLoading}
                className="w-full md:w-auto"
              >
                {updateUserDetails.isLoading ? (
                  <Loading className="h-4 w-4" />
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Fitness Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Fitness Profile</CardTitle>
          <CardDescription>Update your fitness goals and preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...fitnessForm}>
            <form onSubmit={fitnessForm.handleSubmit(onFitnessSubmit)} className="space-y-4">
              <FormField
                control={fitnessForm.control}
                name="painPoints"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Challenges</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={painPointOptions}
                        selected={field.value}
                        onChange={field.onChange}
                        placeholder="Select your current challenges..."
                      />
                    </FormControl>
                    <FormDescription>
                      What challenges are you currently facing?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={fitnessForm.control}
                name="goals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fitness Goals</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={goalOptions}
                        selected={field.value}
                        onChange={field.onChange}
                        placeholder="Select your fitness goals..."
                      />
                    </FormControl>
                    <FormDescription>
                      What are you hoping to achieve?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={fitnessForm.control}
                name="learningStyle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coaching Style</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your preferred coaching style" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {learningStyles.map((style) => (
                          <SelectItem key={style.value} value={style.value}>
                            {style.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How would you like to receive coaching?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={updateProfile.isLoading}
                className="w-full md:w-auto"
              >
                {updateProfile.isLoading ? (
                  <Loading className="h-4 w-4" />
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Fitness Profile
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Account Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Account Statistics</CardTitle>
          <CardDescription>Your PowerPulse journey at a glance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white/60">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Member Since</span>
              </div>
              <p className="text-xl font-semibold">
                {stats?.accountCreatedAt 
                  ? format(new Date(stats.accountCreatedAt), 'MMM d, yyyy')
                  : 'N/A'}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white/60">
                <Trophy className="h-4 w-4" />
                <span className="text-sm">Current Streak</span>
              </div>
              <p className="text-xl font-semibold">{stats?.currentStreak || 0} days</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white/60">
                <Target className="h-4 w-4" />
                <span className="text-sm">Total Active Days</span>
              </div>
              <p className="text-xl font-semibold">{stats?.totalDaysActive || 0} days</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white/60">
                <User className="h-4 w-4" />
                <span className="text-sm">Subscription</span>
              </div>
              <Badge variant={stats?.subscriptionStatus === 'active' ? 'default' : 'secondary'}>
                {stats?.subscriptionStatus || 'Inactive'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-500/20">
        <CardHeader>
          <CardTitle className="text-red-500">Danger Zone</CardTitle>
          <CardDescription>Irreversible and destructive actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Delete Account</p>
                <p className="text-sm text-white/60">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="border-red-500/50 text-red-500 hover:bg-red-500/10">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account
                      and remove all your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Yes, delete my account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}