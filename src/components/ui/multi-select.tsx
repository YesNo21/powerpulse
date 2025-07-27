'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface MultiSelectProps {
  options: Array<{ value: string; label: string }>
  selected: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  className?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Select items...',
  className,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase())
  )

  const toggleOption = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value]
    onChange(newSelected)
  }

  const removeOption = (value: string) => {
    onChange(selected.filter((v) => v !== value))
  }

  return (
    <div className={cn('relative', className)}>
      <div
        className="flex min-h-[40px] w-full flex-wrap gap-1 rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-white/20 focus-within:ring-offset-2"
        onClick={() => setIsOpen(true)}
      >
        {selected.length > 0 ? (
          selected.map((value) => {
            const option = options.find((opt) => opt.value === value)
            return (
              <Badge
                key={value}
                variant="secondary"
                className="bg-white/10 hover:bg-white/20"
              >
                {option?.label || value}
                <button
                  type="button"
                  className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeOption(value)
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )
          })
        ) : (
          <span className="text-white/40">{placeholder}</span>
        )}
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setIsOpen(false)
              setSearch('')
            }}
          />
          <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-white/20 bg-black/90 backdrop-blur-xl p-1">
            <input
              type="text"
              className="mb-1 w-full rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            {filteredOptions.map((option) => (
              <div
                key={option.value}
                className={cn(
                  'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-white/10',
                  selected.includes(option.value) && 'bg-white/10'
                )}
                onClick={() => toggleOption(option.value)}
              >
                <span
                  className={cn(
                    'absolute left-2 flex h-3.5 w-3.5 items-center justify-center'
                  )}
                >
                  {selected.includes(option.value) && (
                    <span className="h-2 w-2 rounded-sm bg-white" />
                  )}
                </span>
                <span className="ml-6">{option.label}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}