// src/pages/DashboardPage.tsx
import { useAuthStore } from '../store/authStore'

export default function DashboardPage() {
  const { user, logout } = useAuthStore()

  return (
    <div style={{
      minHeight: '100vh', background: '#0c0a09',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 20,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: 'linear-gradient(135deg, #ea580c, #fb923c)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24, boxShadow: '0 0 24px rgba(234,88,12,0.5)',
      }}>✦</div>

      <h1 style={{
        fontFamily: 'Nunito, sans-serif', fontWeight: 900,
        fontSize: 28, color: '#fff7ed', margin: 0,
      }}>
        Welcome, {user?.full_name?.split(' ')[0]} 👋
      </h1>

      <p style={{
        color: '#a8826a', fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: 16, margin: 0,
      }}>
        Dashboard coming in Part 6 — your chatbot builder.
      </p>

      <button
        onClick={() => { logout(); window.location.href = '/' }}
        style={{
          marginTop: 8,
          background: 'transparent',
          border: '1px solid rgba(234,88,12,0.35)',
          borderRadius: 9999,
          padding: '10px 24px',
          color: '#fb923c',
          fontSize: 14, fontWeight: 600,
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          cursor: 'pointer',
        }}
      >
        Sign out
      </button>
    </div>
  )
}