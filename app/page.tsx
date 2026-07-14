import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/home/hero'
import { Features } from '@/components/home/features'
import { HowItWorks } from '@/components/home/how-it-works'
import { Showcase } from '@/components/home/showcase'
import { SiteFooter } from '@/components/site-footer'

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />
      <Hero />
      <Features />
      <Showcase />
      <HowItWorks />
      <SiteFooter />
    </main>
  )
}
