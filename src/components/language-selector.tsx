'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Globe, Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Language {
  code: string
  name: string
  nativeName: string
  flag: string
  available: boolean
  voiceCount: number
  region?: string
}

// Languages supported by Google TTS
export const SUPPORTED_LANGUAGES: Language[] = [
  // English variants
  { code: 'en-US', name: 'English', nativeName: 'English', flag: '🇺🇸', available: true, voiceCount: 15, region: 'United States' },
  { code: 'en-GB', name: 'English', nativeName: 'English', flag: '🇬🇧', available: false, voiceCount: 8, region: 'United Kingdom' },
  { code: 'en-AU', name: 'English', nativeName: 'English', flag: '🇦🇺', available: false, voiceCount: 6, region: 'Australia' },
  { code: 'en-IN', name: 'English', nativeName: 'English', flag: '🇮🇳', available: false, voiceCount: 6, region: 'India' },
  
  // Major European languages
  { code: 'es-ES', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', available: false, voiceCount: 8 },
  { code: 'es-MX', name: 'Spanish', nativeName: 'Español', flag: '🇲🇽', available: false, voiceCount: 6, region: 'Mexico' },
  { code: 'fr-FR', name: 'French', nativeName: 'Français', flag: '🇫🇷', available: false, voiceCount: 10 },
  { code: 'de-DE', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', available: false, voiceCount: 8 },
  { code: 'it-IT', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', available: false, voiceCount: 6 },
  { code: 'pt-BR', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', available: false, voiceCount: 6, region: 'Brazil' },
  { code: 'pt-PT', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', available: false, voiceCount: 4, region: 'Portugal' },
  
  // Asian languages
  { code: 'ja-JP', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', available: false, voiceCount: 8 },
  { code: 'ko-KR', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', available: false, voiceCount: 6 },
  { code: 'zh-CN', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', available: false, voiceCount: 8, region: 'Mandarin' },
  { code: 'zh-TW', name: 'Chinese', nativeName: '中文', flag: '🇹🇼', available: false, voiceCount: 6, region: 'Traditional' },
  { code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', available: false, voiceCount: 6 },
  
  // Nordic languages
  { code: 'sv-SE', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪', available: false, voiceCount: 4 },
  { code: 'da-DK', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰', available: false, voiceCount: 4 },
  { code: 'nb-NO', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴', available: false, voiceCount: 4 },
  { code: 'fi-FI', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮', available: false, voiceCount: 4 },
  
  // Other languages
  { code: 'nl-NL', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', available: false, voiceCount: 6 },
  { code: 'pl-PL', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', available: false, voiceCount: 6 },
  { code: 'ru-RU', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', available: false, voiceCount: 6 },
  { code: 'tr-TR', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', available: false, voiceCount: 4 },
  { code: 'ar-XA', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', available: false, voiceCount: 6 },
  { code: 'th-TH', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭', available: false, voiceCount: 4 },
  { code: 'vi-VN', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', available: false, voiceCount: 4 },
]

interface LanguageSelectorProps {
  onSelect?: (language: Language) => void
  selectedLanguage?: string
  showInHeader?: boolean
}

export function LanguageSelector({ 
  onSelect, 
  selectedLanguage = 'en-US',
  showInHeader = false 
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState(
    SUPPORTED_LANGUAGES.find(lang => lang.code === selectedLanguage) || SUPPORTED_LANGUAGES[0]
  )

  useEffect(() => {
    // Store language preference
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-language', selected.code)
      // Update document language
      document.documentElement.lang = selected.code
    }
  }, [selected])

  const handleSelect = (language: Language) => {
    if (language.available) {
      setSelected(language)
      onSelect?.(language)
      setIsOpen(false)
    }
  }

  if (showInHeader) {
    // Compact version for header
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">{selected.flag} {selected.name}</span>
            <span className="sm:hidden">{selected.flag}</span>
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 max-h-96 overflow-y-auto">
          {SUPPORTED_LANGUAGES.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleSelect(language)}
              disabled={!language.available}
              className={cn(
                "cursor-pointer",
                !language.available && "opacity-50 cursor-not-allowed"
              )}
            >
              <span className="mr-2">{language.flag}</span>
              <span className="flex-1">
                {language.name}
                {language.region && ` (${language.region})`}
              </span>
              {selected.code === language.code && (
                <Check className="w-4 h-4 ml-2" />
              )}
              {!language.available && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  Soon
                </Badge>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Full page version for onboarding
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl w-full"
      >
        <Card className="p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Globe className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Choose Your Language</h1>
            <p className="text-lg text-muted-foreground">
              Select your preferred language for your PowerPulse experience
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              More languages coming soon! 🌍
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {SUPPORTED_LANGUAGES.map((language) => (
              <motion.div
                key={language.code}
                whileHover={language.available ? { scale: 1.05 } : {}}
                whileTap={language.available ? { scale: 0.95 } : {}}
              >
                <Card
                  className={cn(
                    "p-4 cursor-pointer transition-all duration-200 relative",
                    language.available && "hover:shadow-lg",
                    selected.code === language.code && language.available
                      ? "ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20"
                      : "",
                    !language.available && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => handleSelect(language)}
                >
                  {!language.available && (
                    <Badge
                      variant="secondary"
                      className="absolute top-2 right-2 text-xs"
                    >
                      Soon
                    </Badge>
                  )}
                  
                  <div className="text-center">
                    <div className="text-3xl mb-2">{language.flag}</div>
                    <h3 className="font-semibold text-sm">{language.name}</h3>
                    {language.region && (
                      <p className="text-xs text-muted-foreground">{language.region}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {language.voiceCount} voices
                    </p>
                  </div>

                  {selected.code === language.code && language.available && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute bottom-2 right-2"
                    >
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>

          <AnimatePresence>
            {selected.available && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  onClick={() => onSelect?.(selected)}
                >
                  Continue in {selected.name}
                  <span className="ml-2">{selected.flag}</span>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6"
        >
          <p className="text-sm text-muted-foreground">
            🌏 PowerPulse is expanding globally! We're working hard to support all languages.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Your content will be professionally translated and voiced by native speakers.
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}