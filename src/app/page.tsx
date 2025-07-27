import { Hero } from '@/components/landing/hero'
import { BenefitsGrid } from '@/components/landing/benefits-grid'
import { SocialProof } from '@/components/landing/social-proof'
import { Testimonials } from '@/components/landing/testimonials'
import { Pricing } from '@/components/landing/pricing'
import { FAQ } from '@/components/landing/faq'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <BenefitsGrid />
      <SocialProof />
      <Testimonials />
      <Pricing />
      <FAQ />
    </main>
  )
}