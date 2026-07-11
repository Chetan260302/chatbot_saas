import './styles/globals.css'
import { useEffect } from 'react'

//Landing
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import FeaturesSection from './components/sections/FeaturesSection'
import HowItWorksSection from './components/sections/HowItWorksSection'
import PricingSection from './components/sections/PricingSection'
import Footer from './components/sections/Footer'


//Auth
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"

// Dashboard
import OverviewPage       from './pages/dashboard/OverviewPage'
import ChatbotsListPage   from './pages/dashboard/ChatbotsListPage'
import CreateChatbotPage  from './pages/dashboard/CreateChatbotPage'
import ChatbotDetailPage  from './pages/dashboard/ChatbotDetailPage'
import AnalyticsPage      from './pages/dashboard/AnalyticsPage'
import SettingsPage       from './pages/dashboard/SettingsPage'
import AdminTenantsPage   from './pages/dashboard/AdminTenantsPage'
import AdminUsersPage     from './pages/dashboard/AdminUsersPage'

import DocsPage from './pages/DocsPage'
import ContactPage from './pages/ContactPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import Protected from './components/ProtectedRoute'
import { useThemeStore } from './store/themeStore'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'


// ── Landing page ─────────────────────────────────────────────
function LandingPage({ theme, setTheme }: { theme: 'dark' | 'light', setTheme: (t: 'dark'|'light') => void }) {
  return (
    <div style={{ minHeight: '100vh', background: theme === 'dark' ? '#0c0a09' : '#fffbf5', transition: 'background 0.5s ease' }}>
      <div className="noise-overlay" />
      <div className="ambient-glow ambient-glow--top" />
      <Navbar theme={theme} toggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
      <div className="snap-section"><HeroSection theme={theme} /></div>

      <div id="features" className="snap-section"><FeaturesSection theme={theme} /></div>
      <div id="how-it-works" className="snap-section"><HowItWorksSection theme={theme} /></div>
      <div id="pricing" className="snap-section"><PricingSection theme={theme} /></div>
      <div className="snap-section snap-section--footer"><Footer theme={theme} /></div>
    </div>
  )
}

export default function App() {
  const { theme, setTheme } = useThemeStore()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.className = theme
  }, [theme])

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        <Route path="/"         element={<LandingPage theme={theme} setTheme={setTheme} />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/dashboard" element={
          <Protected><OverviewPage /></Protected>
        } />
        <Route path="/dashboard/chatbots" element={
          <Protected><ChatbotsListPage /></Protected>
        } />
        <Route path="/dashboard/chatbots/new" element={
          <Protected><CreateChatbotPage /></Protected>
        } />
        <Route path="/dashboard/chatbots/:slug" element={
          <Protected><ChatbotDetailPage /></Protected>
        } />
        <Route path="/dashboard/analytics" element={
          <Protected><AnalyticsPage /></Protected>
        } />
        <Route path="/dashboard/settings" element={
          <Protected><SettingsPage /></Protected>
        } />
        <Route path="/dashboard/admin/tenants" element={
          <Protected><AdminTenantsPage /></Protected>
        } />
        <Route path="/dashboard/admin/users" element={
          <Protected><AdminUsersPage /></Protected>
        } />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}