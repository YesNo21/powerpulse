'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileSettings } from './profile-settings'
import { DeliverySettings } from './delivery-settings'
import { NotificationSettings } from './notification-settings'
import { SubscriptionSettings } from './subscription-settings'
import { PrivacySettings } from './privacy-settings'
import { VoiceSettings } from './voice-settings'
import { User, Bell, CreditCard, Shield, Volume2, MessageCircle } from 'lucide-react'

export function SettingsContainer() {
  const [activeTab, setActiveTab] = useState('profile')

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User, component: ProfileSettings },
    { id: 'delivery', label: 'Delivery', icon: MessageCircle, component: DeliverySettings },
    { id: 'notifications', label: 'Notifications', icon: Bell, component: NotificationSettings },
    { id: 'voice', label: 'Voice & Audio', icon: Volume2, component: VoiceSettings },
    { id: 'subscription', label: 'Subscription', icon: CreditCard, component: SubscriptionSettings },
    { id: 'privacy', label: 'Privacy', icon: Shield, component: PrivacySettings },
  ]

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 h-auto p-1">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex flex-col items-center gap-2 p-3 data-[state=active]:bg-primary/10"
              >
                <tab.icon className="w-5 h-5" />
                <span className="text-sm">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="mt-6">
              <Card className="p-6">
                <tab.component />
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  )
}