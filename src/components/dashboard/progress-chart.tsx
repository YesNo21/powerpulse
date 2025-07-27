"use client"

import { motion } from "framer-motion"
import { TrendingUp, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ProgressData {
  date: string
  value: number
  label?: string
}

interface ProgressChartProps {
  data: ProgressData[]
  title?: string
  metric?: string
}

export function ProgressChart({ 
  data, 
  title = "Weekly Progress",
  metric = "Sessions"
}: ProgressChartProps) {
  const maxValue = Math.max(...data.map(d => d.value))
  const currentWeekTotal = data.reduce((sum, d) => sum + d.value, 0)
  const avgValue = currentWeekTotal / data.length

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
      
      <CardHeader className="relative">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            {title}
          </span>
          <span className="text-sm font-normal text-muted-foreground">
            {currentWeekTotal} {metric.toLowerCase()} this week
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {/* Chart */}
        <div className="h-48 flex items-end justify-between gap-2">
          {data.map((item, index) => {
            const heightPercentage = (item.value / maxValue) * 100 || 0
            const isToday = index === data.length - 1
            
            return (
              <motion.div
                key={item.date}
                className="flex-1 flex flex-col items-center gap-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Bar */}
                <div className="relative w-full h-40 flex items-end">
                  <motion.div
                    className={cn(
                      "w-full rounded-t-lg relative overflow-hidden",
                      isToday 
                        ? "bg-gradient-to-t from-purple-600 to-pink-600" 
                        : "bg-gradient-to-t from-blue-500 to-cyan-500"
                    )}
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPercentage}%` }}
                    transition={{ 
                      type: "spring", 
                      bounce: 0.4, 
                      delay: index * 0.1 + 0.2 
                    }}
                  >
                    {/* Animated Shine Effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent"
                      animate={{
                        y: ["-100%", "200%"],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: index * 0.2,
                        ease: "easeInOut",
                      }}
                    />
                    
                    {/* Value Label */}
                    {item.value > 0 && (
                      <motion.div
                        className="absolute -top-8 left-1/2 -translate-x-1/2 text-sm font-semibold"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.4 }}
                      >
                        {item.value}
                      </motion.div>
                    )}
                  </motion.div>
                </div>
                
                {/* Day Label */}
                <span className={cn(
                  "text-xs font-medium",
                  isToday ? "text-purple-600" : "text-muted-foreground"
                )}>
                  {item.label || item.date}
                </span>
              </motion.div>
            )
          })}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <motion.div
            className="space-y-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-sm text-muted-foreground">Daily Average</p>
            <p className="text-2xl font-bold">{avgValue.toFixed(1)}</p>
          </motion.div>
          
          <motion.div
            className="space-y-1 text-right"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-sm text-muted-foreground">Best Day</p>
            <p className="text-2xl font-bold">{maxValue}</p>
          </motion.div>
        </div>

        {/* Trend Indicator */}
        <motion.div
          className="flex items-center justify-center gap-2 p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <TrendingUp className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-600">
            {currentWeekTotal > avgValue * 7 ? "Above" : "Below"} average this week
          </span>
        </motion.div>
      </CardContent>
    </Card>
  )
}