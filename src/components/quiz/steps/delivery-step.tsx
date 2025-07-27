'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { DeliverySchema, QUIZ_OPTIONS } from '@/lib/quiz'
import { useQuiz } from '@/hooks/use-quiz'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { z } from 'zod'

type DeliveryData = z.infer<typeof DeliverySchema>

interface DeliveryStepProps {
  onValidationChange: (isValid: boolean) => void
}

export function DeliveryStep({ onValidationChange }: DeliveryStepProps) {
  const { responses, updateResponse } = useQuiz()
  const [selectedMethod, setSelectedMethod] = useState<string>(
    responses.delivery?.method || ''
  )
  const [contact, setContact] = useState(responses.delivery?.contact || '')

  const form = useForm<DeliveryData>({
    resolver: zodResolver(DeliverySchema),
    defaultValues: responses.delivery || {
      method: 'email',
      contact: '',
    },
  })

  useEffect(() => {
    const isValid = selectedMethod && contact.length > 0
    onValidationChange(isValid)
    
    if (isValid) {
      updateResponse('delivery', {
        method: selectedMethod as any,
        contact,
      })
    }
  }, [selectedMethod, contact, onValidationChange, updateResponse])

  const getContactPlaceholder = () => {
    switch (selectedMethod) {
      case 'email':
        return 'Enter your email address'
      case 'whatsapp':
        return 'Enter your WhatsApp number (+1234567890)'
      case 'telegram':
        return 'Enter your Telegram username (@username)'
      default:
        return 'Enter contact information'
    }
  }

  const getContactValidation = (value: string) => {
    if (!value) return false
    
    switch (selectedMethod) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      case 'whatsapp':
      case 'telegram':
        return value.startsWith('@') && value.length > 1
      default:
        return true
    }
  }

  const isContactValid = getContactValidation(contact)

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📱</span>
        </div>
        <h2 className="text-xl font-semibold mb-2">How should we reach you?</h2>
        <p className="text-muted-foreground">
          Choose the best way to receive your daily PowerPulse sessions.
        </p>
      </div>

      {/* Delivery Method Selection */}
      <div>
        <h3 className="text-lg font-medium mb-4 text-center">Delivery Method</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {Object.entries(QUIZ_OPTIONS.deliveryMethods).map(([key, method]) => {
            const isAvailable = method.available !== false
            return (
              <Card
                key={key}
                className={cn(
                  "p-6 transition-all duration-200 relative",
                  isAvailable && "cursor-pointer hover:shadow-lg",
                  selectedMethod === key && isAvailable
                    ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                    : isAvailable ? "hover:shadow-md" : "opacity-50 cursor-not-allowed"
                )}
                onClick={() => isAvailable && setSelectedMethod(key)}
              >
                <div className="text-center">
                  <div className="text-3xl mb-3">{method.icon}</div>
                  <h4 className="font-semibold mb-2">{method.title}</h4>
                  <p className="text-xs text-muted-foreground">{method.description}</p>
                  {!isAvailable && (
                    <span className="absolute top-2 right-2 text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                      Coming Soon
                    </span>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Contact Information */}
      {selectedMethod && (
        <div className="max-w-md mx-auto">
          <Card className="p-6">
            <div className="space-y-4">
              <Label htmlFor="contact" className="text-base font-medium">
                {selectedMethod === 'email' && 'Email Address'}
                {selectedMethod === 'whatsapp' && 'WhatsApp Number'}
                {selectedMethod === 'telegram' && 'Telegram Username'}
              </Label>
              <Input
                id="contact"
                type={selectedMethod === 'email' ? 'email' : 'text'}
                placeholder={getContactPlaceholder()}
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="text-lg"
              />
              {contact && !isContactValid && (
                <p className="text-sm text-red-500">
                  Please enter a valid {selectedMethod === 'email' ? 'email address' : 
                    selectedMethod === 'telegram' ? 'Telegram username (starting with @)' : 
                    'phone number'}
                </p>
              )}
              {contact && isContactValid && (
                <p className="text-sm text-green-500">✓ Looks good!</p>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Method Info */}
      {selectedMethod && (
        <div className="max-w-md mx-auto">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <h3 className="font-semibold mb-3 text-center">What to Expect</h3>
            <div className="text-sm text-muted-foreground space-y-2">
              {selectedMethod === 'email' && (
                <div>
                  <p>• Daily audio delivered to your inbox</p>
                  <p>• Easy to access on any device</p>
                  <p>• Won't be caught in spam filters</p>
                </div>
              )}
              {selectedMethod === 'whatsapp' && (
                <div>
                  <p>• Personal messages with audio links</p>
                  <p>• Instant notifications on your phone</p>
                  <p>• Play directly in WhatsApp</p>
                </div>
              )}
              {selectedMethod === 'telegram' && (
                <div>
                  <p>• Private bot delivers your content</p>
                  <p>• Secure and private messaging</p>
                  <p>• Built-in audio player</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="max-w-md mx-auto text-center">
        <p className="text-xs text-muted-foreground">
          🔒 Your contact information is secure and will only be used to deliver your PowerPulse content. 
          You can update or change your delivery method anytime.
        </p>
      </div>
    </div>
  )
}