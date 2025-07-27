"use client"

import { motion } from "framer-motion"
import { Trophy, Clock, Target, Zap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatItem {
  label: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  color: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

interface QuickStatsProps {
  stats?: StatItem[]
}

const defaultStats: StatItem[] = [
  {
    label: "Total Sessions",
    value: "47",
    icon: Zap,
    color: "from-purple-500 to-pink-500",
    trend: { value: 12, isPositive: true }
  },
  {
    label: "Hours Practiced",
    value: "15.5",
    icon: Clock,
    color: "from-blue-500 to-cyan-500",
    trend: { value: 8, isPositive: true }
  },
  {
    label: "Achievements",
    value: "8",
    icon: Trophy,
    color: "from-yellow-500 to-orange-500",
  },
  {
    label: "Goals Met",
    value: "92%",
    icon: Target,
    color: "from-green-500 to-emerald-500",
    trend: { value: 5, isPositive: true }
  }
]

export function QuickStats({ stats = defaultStats }: QuickStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
              {/* Background Gradient */}
              <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br",
                  stat.color
                )} />
              </div>

              <CardContent className="relative p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </p>
                    
                    <motion.p
                      className="text-3xl font-bold"
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      transition={{ 
                        type: "spring", 
                        bounce: 0.5,
                        delay: index * 0.1 + 0.2 
                      }}
                    >
                      {stat.value}
                    </motion.p>

                    {stat.trend && (
                      <motion.div
                        className="flex items-center gap-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.1 + 0.3 }}
                      >
                        <span className={cn(
                          "text-xs font-medium",
                          stat.trend.isPositive ? "text-green-600" : "text-red-600"
                        )}>
                          {stat.trend.isPositive ? "+" : "-"}{stat.trend.value}%
                        </span>
                        <span className="text-xs text-muted-foreground">
                          vs last week
                        </span>
                      </motion.div>
                    )}
                  </div>

                  {/* Icon with Animation */}
                  <motion.div
                    className={cn(
                      "p-3 rounded-lg bg-gradient-to-br",
                      stat.color
                    )}
                    whileHover={{ 
                      scale: 1.1,
                      rotate: [0, -10, 10, -10, 0],
                    }}
                    transition={{ type: "spring", bounce: 0.6 }}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </motion.div>
                </div>

                {/* Progress Bar (optional) */}
                {stat.label === "Goals Met" && (
                  <motion.div
                    className="mt-4 space-y-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.4 }}
                  >
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                        initial={{ width: 0 }}
                        animate={{ width: stat.value }}
                        transition={{ 
                          duration: 1,
                          delay: index * 0.1 + 0.5,
                          ease: "easeOut"
                        }}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Hover Effect - Pulse Animation */}
                <motion.div
                  className={cn(
                    "absolute -inset-10 rounded-full opacity-0 group-hover:opacity-20 bg-gradient-to-r blur-3xl",
                    stat.color
                  )}
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}