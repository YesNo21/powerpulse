'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { QuizStepType, QuizResponse } from '@/lib/quiz'

interface QuizStore {
  currentStep: QuizStepType
  responses: Partial<QuizResponse>
  isCompleted: boolean
  
  // Actions
  setCurrentStep: (step: QuizStepType) => void
  updateResponse: <K extends keyof QuizResponse>(step: K, data: QuizResponse[K]) => void
  resetQuiz: () => void
  completeQuiz: () => void
  getProgress: () => number
}

export const useQuiz = create<QuizStore>()(
  persist(
    (set, get) => ({
      currentStep: 'identity',
      responses: {},
      isCompleted: false,

      setCurrentStep: (step) => set({ currentStep: step }),

      updateResponse: (step, data) => set((state) => ({
        responses: {
          ...state.responses,
          [step]: data,
        },
      })),

      resetQuiz: () => set({
        currentStep: 'identity',
        responses: {},
        isCompleted: false,
      }),

      completeQuiz: () => set({ isCompleted: true }),

      getProgress: () => {
        const steps: QuizStepType[] = [
          'identity',
          'goals', 
          'painPoints',
          'currentLevel',
          'idealOutcome',
          'learningStyle',
          'schedule',
          'delivery',
          'complete'
        ]
        
        const currentIndex = steps.indexOf(get().currentStep)
        return Math.round(((currentIndex + 1) / steps.length) * 100)
      },
    }),
    {
      name: 'powerpulse-quiz',
      partialize: (state) => ({
        currentStep: state.currentStep,
        responses: state.responses,
        isCompleted: state.isCompleted,
      }),
    }
  )
)