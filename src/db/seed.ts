import { db } from './index'
import { achievements } from './schema'

async function seed() {
  console.log('🌱 Seeding database...')

  // Insert default achievements
  const defaultAchievements = [
    {
      code: 'first-day',
      name: 'First Step',
      description: 'Complete your first PowerPulse',
      icon: 'trophy',
      category: 'engagement',
      requirement: { type: 'first_audio_completed' },
      points: 10,
    },
    {
      code: 'week-warrior',
      name: 'Week Warrior',
      description: 'Complete 7 days in a row',
      icon: 'fire',
      category: 'streak',
      requirement: { type: 'streak', days: 7 },
      points: 50,
    },
    {
      code: 'habit-formed',
      name: 'Habit Formed',
      description: 'Reach a 21-day streak',
      icon: 'star',
      category: 'streak',
      requirement: { type: 'streak', days: 21 },
      points: 100,
    },
    {
      code: 'foundation-complete',
      name: 'Foundation Complete',
      description: 'Complete your first 14 days',
      icon: 'medal',
      category: 'progress',
      requirement: { type: 'total_days', days: 14 },
      points: 75,
    },
    {
      code: 'momentum-master',
      name: 'Momentum Master',
      description: 'Reach the Momentum stage',
      icon: 'rocket',
      category: 'progress',
      requirement: { type: 'stage', stage: 'momentum' },
      points: 150,
    },
    {
      code: 'transformation-hero',
      name: 'Transformation Hero',
      description: 'Reach the Transformation stage',
      icon: 'crown',
      category: 'progress',
      requirement: { type: 'stage', stage: 'transformation' },
      points: 300,
    },
    {
      code: 'master-achiever',
      name: 'Master Achiever',
      description: 'Reach the Mastery stage',
      icon: 'diamond',
      category: 'progress',
      requirement: { type: 'stage', stage: 'mastery' },
      points: 500,
    },
    {
      code: 'comeback-champion',
      name: 'Comeback Champion',
      description: 'Return after missing days',
      icon: 'heart',
      category: 'engagement',
      requirement: { type: 'comeback' },
      points: 25,
    },
    {
      code: 'referral-rookie',
      name: 'Referral Rookie',
      description: 'Refer your first friend',
      icon: 'users',
      category: 'referral',
      requirement: { type: 'referrals', count: 1 },
      points: 50,
    },
    {
      code: 'referral-champion',
      name: 'Referral Champion',
      description: 'Refer 5 friends',
      icon: 'users-plus',
      category: 'referral',
      requirement: { type: 'referrals', count: 5 },
      points: 200,
    },
  ]

  try {
    await db.insert(achievements).values(defaultAchievements)
    console.log('✅ Achievements seeded successfully')
  } catch (error) {
    console.error('❌ Error seeding achievements:', error)
  }

  console.log('🌱 Seeding complete!')
}

// Run the seed function
seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })