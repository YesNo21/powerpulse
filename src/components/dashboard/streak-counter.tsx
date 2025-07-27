"use client"

import { motion } from "framer-motion"
import { Flame } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StreakCounterProps {
  currentStreak: number
  longestStreak: number
  isActive?: boolean
}

export function StreakCounter({ currentStreak, longestStreak, isActive = true }: StreakCounterProps) {
  const fireColors = [
    "from-orange-600 to-red-600",
    "from-yellow-500 to-orange-600",
    "from-red-500 to-pink-600"
  ]

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10" />
      
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Daily Streak
        </CardTitle>
      </CardHeader>
      
      <CardContent className="relative">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <motion.span
                className="text-4xl font-bold"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
              >
                {currentStreak}
              </motion.span>
              <span className="text-lg text-muted-foreground">days</span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Longest: {longestStreak} days
            </p>
          </div>

          {/* Animated Fire */}
          <div className="relative h-20 w-20">
            {isActive && currentStreak > 0 && (
              <>
                {fireColors.map((colors, index) => (
                  <motion.div
                    key={index}
                    className={cn(
                      "absolute inset-0 rounded-full bg-gradient-to-t blur-xl",
                      colors
                    )}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 2 + index * 0.5,
                      repeat: Infinity,
                      delay: index * 0.2,
                    }}
                  />
                ))}
                
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Flame 
                    className={cn(
                      "h-12 w-12 z-10",
                      currentStreak > 7 ? "text-orange-500" : "text-orange-400",
                      currentStreak > 30 && "text-red-500"
                    )}
                    fill="currentColor"
                  />
                </motion.div>
              </>
            )}
            
            {(!isActive || currentStreak === 0) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Flame className="h-12 w-12 text-muted-foreground/30" />
              </div>
            )}
          </div>
        </div>

        {/* Motivational Message */}
        <motion.div
          className="mt-4 p-3 rounded-md bg-orange-500/10 border border-orange-500/20"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-sm font-medium">
            {currentStreak === 0 && "Start your journey today!"}
            {currentStreak > 0 && currentStreak < 7 && "Great start! Keep it up!"}
            {currentStreak >= 7 && currentStreak < 30 && "You're on fire! One week strong!"}
            {currentStreak >= 30 && "Incredible dedication! You're unstoppable!"}
          </p>
        </motion.div>
      </CardContent>
    </Card>
  )
}