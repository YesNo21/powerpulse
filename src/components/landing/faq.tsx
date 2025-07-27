'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Plus, Minus, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const faqs = [
  {
    question: "How is PowerPulse different from other motivation apps?",
    answer: "PowerPulse uses advanced AI to create truly personalized audio content based on your specific pain points, goals, and progress. Unlike generic motivation apps, every single audio is uniquely crafted for you, adapting daily based on your journey stage and engagement patterns."
  },
  {
    question: "What if I miss a day? Will I lose my progress?",
    answer: "Life happens! We understand that. Missing a day doesn't mean failure. Your journey continues, and we even provide 'Life Happens' passes (2 per month) to protect your streak. Plus, we focus on total active days, not just streaks, celebrating your overall commitment."
  },
  {
    question: "How does the 30-day money-back guarantee work?",
    answer: "Simple! If you're not completely satisfied within your first 30 days, just click the refund button in your dashboard. No questions asked, no hassle. We'll process your full refund within 3-5 business days. We're confident you'll love PowerPulse, but we want you to feel secure trying it."
  },
  {
    question: "Can I change my delivery time or method?",
    answer: "Absolutely! You can update your preferences anytime in your dashboard. Change your delivery time, switch between email, WhatsApp, Telegram, or SMS - whatever works best for your lifestyle. Changes take effect the next day."
  },
  {
    question: "What kind of results can I expect?",
    answer: "Our members typically report feeling more motivated and focused within the first week. By day 21, most have formed a solid habit. After 90 days, 92% of active members report achieving significant progress toward their goals. Remember, consistency is key - just 5 minutes a day!"
  },
  {
    question: "Is my personal information and quiz data secure?",
    answer: "Your privacy is our priority. We use bank-level encryption to protect your data, never share your personal information with third parties, and you can delete your account and all associated data at any time. We're also GDPR compliant."
  },
  {
    question: "Can I use PowerPulse for my team or family?",
    answer: "Yes! While each subscription is individual (for personalization), we offer team packages and family plans. Many of our power users have brought their entire teams on board. Contact us for special group pricing."
  },
  {
    question: "What if I need to pause my subscription?",
    answer: "We offer subscription pausing instead of canceling. Going on vacation or need a break? Pause for up to 30 days and pick up right where you left off. Your progress and personalization settings will be waiting for you."
  }
]

interface FAQItemProps {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}

function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
  return (
    <Card 
      className={cn(
        "transition-all duration-300 cursor-pointer",
        isOpen && "border-primary/50 shadow-lg shadow-primary/10"
      )}
      onClick={onToggle}
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold pr-4">{question}</h3>
          <div className="flex-shrink-0">
            <motion.div
              animate={{ rotate: isOpen ? 45 : 0 }}
              transition={{ duration: 0.2 }}
              className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center"
            >
              {isOpen ? (
                <Minus className="w-4 h-4 text-primary" />
              ) : (
                <Plus className="w-4 h-4 text-primary" />
              )}
            </motion.div>
          </div>
        </div>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <p className="mt-4 text-muted-foreground leading-relaxed">
                {answer}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  )
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="py-24 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5 text-brand-primary" />
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Frequently Asked Questions
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Got Questions?
            <span className="text-gradient"> We've Got Answers</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to know about PowerPulse and your transformation journey
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, staggerChildren: 0.1 }}
          className="space-y-4"
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <FAQItem
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === index}
                onToggle={() => setOpenIndex(openIndex === index ? null : index)}
              />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-muted-foreground">
            Still have questions? Our support team is here to help!{' '}
            <a href="mailto:support@powerpulse.app" className="text-primary hover:underline">
              support@powerpulse.app
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  )
}