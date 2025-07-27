'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useUser } from '@clerk/nextjs'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { DashboardLayout } from './dashboard-layout'
import {
  Play,
  Target,
  Flame,
  Calendar,
  TrendingUp,
  Clock,
  ChevronRight,
  Sparkles,
  Award,
  BarChart3,
} from 'lucide-react'
import { api } from '@/trpc/react'

export function DashboardHome() {
  const { user } = useUser()
  const [currentTime, setCurrentTime] = useState(new Date())

  // Fetch user profile and progress
  const { data: profile } = api.profile.getProfile.useQuery()
  
  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // Mock data - replace with real API data
  const dashboardData = {
    todayContent: {
      title: "Break Through Your Comfort Zone",
      duration: "5:12",
      status: "ready", // ready, played, locked
    },
    streak: {
      current: 7,
      longest: 14,
      protectionUsed: 0,
    },
    progress: {
      stage: "Foundation",
      daysInStage: 7,
      totalDays: 7,
      nextMilestone: 14,
    },
    stats: {
      totalSessions: 7,
      totalMinutes: 35,
      favoriteTime: "7:00 AM",
      completionRate: 100,
    },
    achievements: [
      { id: 1, name: "First Step", icon: "👣", unlockedAt: "2 days ago" },
      { id: 2, name: "Week Warrior", icon: "⚔️", unlockedAt: "Today" },
    ],
    upcomingMilestones: [
      { days: 14, title: "Two Week Champion", reward: "Special celebration audio" },
      { days: 30, title: "Monthly Master", reward: "Exclusive progress review" },
    ],
  }

  const greeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold">
              {greeting()}, {user?.firstName || 'Champion'}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Ready to make today count? Your journey continues.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="px-3 py-1">
              {dashboardData.progress.stage} Stage
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              Day {dashboardData.progress.totalDays}
            </Badge>
          </div>
        </motion.div>

        {/* Today's Content Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-teal-500/10" />
            <div className="relative p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">Today's PowerPulse</h2>
                      <p className="text-sm text-muted-foreground">
                        {dashboardData.todayContent.duration} of personalized coaching
                      </p>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mt-4 mb-2">
                    {dashboardData.todayContent.title}
                  </h3>
                  <p className="text-muted-foreground">
                    Your daily dose of motivation and guidance, tailored just for you.
                  </p>
                </div>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-teal-500 hover:from-purple-600 hover:to-teal-600"
                  disabled={dashboardData.todayContent.status === 'locked'}
                >
                  <Play className="w-4 h-4 mr-2" />
                  {dashboardData.todayContent.status === 'played' ? 'Play Again' : 'Play Now'}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Streak</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-3xl font-bold">{dashboardData.streak.current}</p>
                    <span className="text-sm text-muted-foreground">days</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <Progress value={(dashboardData.streak.current / dashboardData.progress.nextMilestone) * 100} className="mt-3" />
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Sessions</p>
                  <p className="text-3xl font-bold mt-1">{dashboardData.stats.totalSessions}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Minutes</p>
                  <p className="text-3xl font-bold mt-1">{dashboardData.stats.totalMinutes}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                  <p className="text-3xl font-bold mt-1">{dashboardData.stats.completionRate}%</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Achievements */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Recent Achievements</h3>
                  <Button variant="ghost" size="sm">
                    View All
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {dashboardData.achievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <p className="font-medium">{achievement.name}</p>
                        <p className="text-sm text-muted-foreground">{achievement.unlockedAt}</p>
                      </div>
                      <Award className="w-5 h-5 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Upcoming Milestones */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Upcoming Milestones</h3>
                  <TrendingUp className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="space-y-4">
                  {dashboardData.upcomingMilestones.map((milestone, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold">{milestone.days}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{milestone.title}</p>
                        <p className="text-sm text-muted-foreground">{milestone.reward}</p>
                        <Progress 
                          value={(dashboardData.progress.totalDays / milestone.days) * 100} 
                          className="mt-2 h-2" 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Journey Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold">Your Journey Progress</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {dashboardData.progress.stage} Stage • Day {dashboardData.progress.daysInStage} of 14
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Stage Progress</span>
                    <span>{Math.round((dashboardData.progress.daysInStage / 14) * 100)}%</span>
                  </div>
                  <Progress value={(dashboardData.progress.daysInStage / 14) * 100} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Overall Journey</span>
                    <span>{Math.round((dashboardData.progress.totalDays / 90) * 100)}%</span>
                  </div>
                  <Progress value={(dashboardData.progress.totalDays / 90) * 100} variant="secondary" />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}