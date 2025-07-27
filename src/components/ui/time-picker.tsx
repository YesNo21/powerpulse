'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

interface TimePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  value?: string
  onChange?: (time: string) => void
}

export function TimePicker({
  value,
  onChange,
  className,
  ...props
}: TimePickerProps) {
  return (
    <Input
      type="time"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className={cn(
        'w-[150px] bg-white/5 border-white/10 text-white placeholder:text-white/40',
        '[&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert',
        className
      )}
      {...props}
    />
  )
}