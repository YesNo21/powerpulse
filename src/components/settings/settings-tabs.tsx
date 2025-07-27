'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileSettings } from './profile-settings'
import { DeliverySettings } from './delivery-settings'
import { VoiceSettings } from './voice-settings'
import { SubscriptionSettings } from './subscription-settings'
import { NotificationSettings } from './notification-settings'
import { PrivacySettings } from './privacy-settings'
import { User, Truck, Mic, CreditCard, Bell, Shield } from 'lucide-react'

export function SettingsTabs() {
  const [activeTab, setActiveTab] = useState('profile')

  const tabs = [
    { value: 'profile', label: 'Profile', icon: User },
    { value: 'delivery', label: 'Delivery', icon: Truck },
    { value: 'voice', label: 'Voice', icon: Mic },
    { value: 'subscription', label: 'Subscription', icon: CreditCard },
    { value: 'notifications', label: 'Notifications', icon: Bell },
    { value: 'privacy', label: 'Privacy', icon: Shield },
  ]

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          )
        })}
      </TabsList>
      
      <TabsContent value="profile" className="space-y-4">
        <ProfileSettings />
      </TabsContent>
      
      <TabsContent value="delivery" className="space-y-4">
        <DeliverySettings />
      </TabsContent>
      
      <TabsContent value="voice" className="space-y-4">
        <VoiceSettings />
      </TabsContent>
      
      <TabsContent value="subscription" className="space-y-4">
        <SubscriptionSettings />
      </TabsContent>
      
      <TabsContent value="notifications" className="space-y-4">
        <NotificationSettings />
      </TabsContent>
      
      <TabsContent value="privacy" className="space-y-4">
        <PrivacySettings />
      </TabsContent>
    </Tabs>
  )
}