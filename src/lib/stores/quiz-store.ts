import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Define the structure for each step's data
interface PersonalInfo {
  name: string
  email: string
  age: string
  gender: string
}

interface FitnessGoals {
  primaryGoal: string
  secondaryGoals: string[]
  timeline: string
}

interface CurrentFitness {
  activityLevel: string
  workoutFrequency: string
  currentChallenges: string[]
  injuries: string
}

interface Preferences {
  workoutDuration: string
  preferredTime: string
  equipment: string[]
  workoutTypes: string[]
}

interface QuizData {
  personalInfo: PersonalInfo
  fitnessGoals: FitnessGoals
  currentFitness: CurrentFitness
  preferences: Preferences
}

interface QuizStore {
  // Current step management
  currentStep: number
  totalSteps: number
  
  // Form data
  quizData: QuizData
  
  // Navigation methods
  nextStep: () => void
  previousStep: () => void
  goToStep: (step: number) => void
  
  // Data update methods
  updatePersonalInfo: (data: Partial<PersonalInfo>) => void
  updateFitnessGoals: (data: Partial<FitnessGoals>) => void
  updateCurrentFitness: (data: Partial<CurrentFitness>) => void
  updatePreferences: (data: Partial<Preferences>) => void
  
  // Utility methods
  resetQuiz: () => void
  isStepComplete: (step: number) => boolean
  getProgress: () => number
  canProceed: () => boolean
}

// Initial state
const initialQuizData: QuizData = {
  personalInfo: {
    name: '',
    email: '',
    age: '',
    gender: ''
  },
  fitnessGoals: {
    primaryGoal: '',
    secondaryGoals: [],
    timeline: ''
  },
  currentFitness: {
    activityLevel: '',
    workoutFrequency: '',
    currentChallenges: [],
    injuries: ''
  },
  preferences: {
    workoutDuration: '',
    preferredTime: '',
    equipment: [],
    workoutTypes: []
  }
}

// Create the store with persistence
const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentStep: 1,
      totalSteps: 4,
      quizData: initialQuizData,
      
      // Navigation methods
      nextStep: () => {
        const { currentStep, totalSteps } = get()
        if (currentStep < totalSteps) {
          set({ currentStep: currentStep + 1 })
        }
      },
      
      previousStep: () => {
        const { currentStep } = get()
        if (currentStep > 1) {
          set({ currentStep: currentStep - 1 })
        }
      },
      
      goToStep: (step: number) => {
        const { totalSteps } = get()
        if (step >= 1 && step <= totalSteps) {
          set({ currentStep: step })
        }
      },
      
      // Data update methods
      updatePersonalInfo: (data: Partial<PersonalInfo>) => {
        set((state) => ({
          quizData: {
            ...state.quizData,
            personalInfo: {
              ...state.quizData.personalInfo,
              ...data
            }
          }
        }))
      },
      
      updateFitnessGoals: (data: Partial<FitnessGoals>) => {
        set((state) => ({
          quizData: {
            ...state.quizData,
            fitnessGoals: {
              ...state.quizData.fitnessGoals,
              ...data
            }
          }
        }))
      },
      
      updateCurrentFitness: (data: Partial<CurrentFitness>) => {
        set((state) => ({
          quizData: {
            ...state.quizData,
            currentFitness: {
              ...state.quizData.currentFitness,
              ...data
            }
          }
        }))
      },
      
      updatePreferences: (data: Partial<Preferences>) => {
        set((state) => ({
          quizData: {
            ...state.quizData,
            preferences: {
              ...state.quizData.preferences,
              ...data
            }
          }
        }))
      },
      
      // Utility methods
      resetQuiz: () => {
        set({
          currentStep: 1,
          quizData: initialQuizData
        })
      },
      
      isStepComplete: (step: number) => {
        const { quizData } = get()
        
        switch (step) {
          case 1: // Personal Info
            const { name, email, age, gender } = quizData.personalInfo
            return !!(name && email && age && gender)
            
          case 2: // Fitness Goals
            const { primaryGoal, timeline } = quizData.fitnessGoals
            return !!(primaryGoal && timeline)
            
          case 3: // Current Fitness
            const { activityLevel, workoutFrequency } = quizData.currentFitness
            return !!(activityLevel && workoutFrequency)
            
          case 4: // Preferences
            const { workoutDuration, preferredTime } = quizData.preferences
            return !!(workoutDuration && preferredTime)
            
          default:
            return false
        }
      },
      
      getProgress: () => {
        const { currentStep, totalSteps } = get()
        return (currentStep / totalSteps) * 100
      },
      
      canProceed: () => {
        const { currentStep, isStepComplete } = get()
        return isStepComplete(currentStep)
      }
    }),
    {
      name: 'quiz-storage', // unique name for localStorage key
      skipHydration: true, // Manual hydration for SSR compatibility
    }
  )
)

// Export types for use in components
export type {
  PersonalInfo,
  FitnessGoals,
  CurrentFitness,
  Preferences,
  QuizData,
  QuizStore
}

export default useQuizStore