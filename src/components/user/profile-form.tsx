'use client'

import { useState } from 'react'
import { api } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

export function ProfileForm() {
  const router = useRouter()
  const utils = api.useUtils()
  
  // Fetch user profile
  const { data: profileData, isLoading } = api.user.getProfile.useQuery()
  
  // Update profile mutation
  const updateProfile = api.user.updateProfile.useMutation({
    onSuccess: () => {
      // Invalidate and refetch profile data
      utils.user.getProfile.invalidate()
      alert('Profile updated successfully!')
    },
    onError: (error) => {
      alert(`Error updating profile: ${error.message}`)
    },
  })

  const [formData, setFormData] = useState({
    learningStyle: profileData?.profile?.learningStyle || 'gentle',
    currentLevel: profileData?.profile?.currentLevel || 5,
    preferredDeliveryTime: profileData?.profile?.preferredDeliveryTime || '08:00',
    deliveryMethod: profileData?.profile?.deliveryMethod || 'email',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile.mutate(formData)
  }

  if (isLoading) {
    return <div>Loading profile...</div>
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Your Profile</CardTitle>
        <CardDescription>
          Customize your PowerPulse experience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Learning Style
            </label>
            <select
              value={formData.learningStyle}
              onChange={(e) => setFormData({ ...formData, learningStyle: e.target.value as any })}
              className="w-full p-2 border rounded-md"
            >
              <option value="direct">Direct - Get to the point</option>
              <option value="gentle">Gentle - Encouraging and supportive</option>
              <option value="tough">Tough - Push me hard</option>
              <option value="story">Story - Learn through stories</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Current Energy Level (1-10)
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.currentLevel}
              onChange={(e) => setFormData({ ...formData, currentLevel: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="text-center mt-1">{formData.currentLevel}</div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Preferred Delivery Time
            </label>
            <input
              type="time"
              value={formData.preferredDeliveryTime}
              onChange={(e) => setFormData({ ...formData, preferredDeliveryTime: e.target.value })}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Delivery Method
            </label>
            <select
              value={formData.deliveryMethod}
              onChange={(e) => setFormData({ ...formData, deliveryMethod: e.target.value as any })}
              className="w-full p-2 border rounded-md"
            >
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="telegram">Telegram</option>
              <option value="sms">SMS</option>
            </select>
          </div>

          <Button 
            type="submit" 
            disabled={updateProfile.isLoading}
            className="w-full"
          >
            {updateProfile.isLoading ? 'Updating...' : 'Update Profile'}
          </Button>
        </form>

        {profileData?.user && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold mb-2">Account Information</h3>
            <p className="text-sm text-gray-600">Email: {profileData.user.email}</p>
            <p className="text-sm text-gray-600">Name: {profileData.user.name || 'Not set'}</p>
            <p className="text-sm text-gray-600">
              Subscription: {profileData.user.subscriptionStatus || 'Inactive'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}