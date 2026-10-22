import { useEffect } from 'react'
import { Navbar } from '@/components/landing/Navbar'
import { HeroSection } from '@/components/landing/HeroSection'
import { LogoMarquee } from '@/components/landing/LogoMarquee'
import { FeatureBentoGrid } from '@/components/landing/FeatureBentoGrid'
import { AnalyticsShowcase } from '@/components/landing/AnalyticsShowcase'
import { MetricsStrip } from '@/components/landing/MetricsStrip'
import { PricingSection } from '@/components/landing/PricingSection'
import { Footer } from '@/components/landing/Footer'

export default function LandingPage() {
  useEffect(() => {
    document.title = 'Quantyx | Precision Trade Journaling and Institutional Analytics'
  }, [])

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FAFAFA] selection:bg-emerald-500/20 selection:text-emerald-300 overflow-x-hidden font-sans">
      {/* Floating Glass Navbar */}
      <Navbar />

      {/* Main Content Sections */}
      <main>
        {/* Hero Section with Spotlight and 3D Container Scroll */}
        <HeroSection />

        {/* Broker & Prop Firm Compatibility Infinite Marquee */}
        <LogoMarquee />

        {/* 12-Column Aceternity Bento Grid */}
        <FeatureBentoGrid />

        {/* Interactive Analytics Deep Dive */}
        <AnalyticsShowcase />

        {/* Quantyx by the Numbers Strip */}
        <MetricsStrip />

        {/* Transparent Pricing Section with BorderBeam */}
        <PricingSection />
      </main>

      {/* Final Callout Card & Minimalist Footer */}
      <Footer />
    </div>
  )
}
