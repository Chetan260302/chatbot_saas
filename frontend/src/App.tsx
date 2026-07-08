import './styles/globals.css'
import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import FeaturesSection from './components/sections/FeaturesSection'
import HowItWorksSection from './components/sections/HowItWorksSection'
import PricingSection from './components/sections/PricingSection'
import Footer from './components/sections/Footer'
import SectionBot from './components/SectionBot'

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.className = theme
  }, [theme])

  return (
    <div style={{
      minHeight: '100vh',
      background: theme === 'dark' ? '#0c0a09' : '#fffbf5',
      transition: 'background 0.5s ease',
    }}>
      <div className="noise-overlay" />
      <div className="ambient-glow ambient-glow--top" />

      <Navbar theme={theme} toggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} />

      <HeroSection theme={theme} />

      {/* Persistent 3D bot companion — same as HeroSection bot, shows after hero */}
      <SectionBot theme={theme} />

      <div id="features">
        <FeaturesSection theme={theme} />
      </div>

      <div id="how-it-works">
        <HowItWorksSection theme={theme} />
      </div>

      <div id="pricing">
        <PricingSection theme={theme} />
      </div>

      <Footer theme={theme} />
    </div>
  )
}