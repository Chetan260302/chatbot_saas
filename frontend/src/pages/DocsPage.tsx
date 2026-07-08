// src/pages/DocsPage.tsx
import { ArrowLeft, BookOpen, Code, Terminal } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../components/ui/Card'

export default function DocsPage() {
  const navigate = useNavigate()

  // Calculate dynamic URLs based on current environment
  const backendUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1').replace('/api/v1', '').replace(/\/$/, '')
  const frontendUrl = window.location.origin

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--dash-bg)',
      color: 'var(--color-cream)',
      padding: '60px 24px',
      boxSizing: 'border-box',
    }}>
      <div style={{ maxWidth: 840, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Back Link */}
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--color-muted)', fontSize: 13, fontFamily: 'var(--font-body)',
            padding: 0, alignSelf: 'flex-start',
          }}
        >
          <ArrowLeft size={14} /> Back
        </button>

        {/* Page Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10,
            background: 'rgba(234, 88, 12, 0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BookOpen size={20} color="#fb923c" />
          </div>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 900,
              fontSize: 'var(--text-3xl)', color: 'var(--color-cream)',
              margin: 0,
            }}>
              Integration Guide
            </h1>
            <p style={{ color: 'var(--color-muted)', fontSize: 'var(--text-sm)', margin: '4px 0 0' }}>
              Simple steps to connect your chatbot with any application.
            </p>
          </div>
        </div>

        <div style={{ height: 10 }} />

        {/* Option 1 */}
        <IntegrationOption
          icon={Code}
          title="Option 1: Embed Script Tag (Recommended)"
          description="Paste this script tag right before your closing </body> tag. Ideal for HTML sites, WordPress, Shopify, or Wix."
          code={`<script>
  window.BOTIFY_CONFIG = {
    apiKey: "YOUR_API_KEY",
    chatbotId: "YOUR_CHATBOT_ID",
    apiUrl: "${backendUrl}"
  };
</script>
<script crossorigin src="${frontendUrl}/widget.js"></script>`}
        />

        {/* Option 2 */}
        <IntegrationOption
          icon={Terminal}
          title="Option 2: Public REST API"
          description="Integrate the chatbot into your mobile app or custom interface. Stream completions via our public endpoint."
          code={`curl -X POST ${backendUrl}/api/v1/public/chat/stream \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "Hello, how can I get support?",
    "session_id": "session-unique-id",
    "chatbot_id": "YOUR_CHATBOT_ID"
  }'`}
        />

        {/* Option 3 */}
        <IntegrationOption
          icon={Code}
          title="Option 3: React SDK"
          description="For single-page React applications. Import and mount the chat bubble component directly."
          code={`import { BotifyChat } from '@botify/react'

<BotifyChat
  apiKey="YOUR_API_KEY"
  chatbotId="YOUR_CHATBOT_ID"
/>`}
        />

      </div>
    </div>
  )
}

interface OptionProps {
  icon: any
  title: string
  description: string
  code: string
}

function IntegrationOption({ icon: Icon, title, description, code }: OptionProps) {
  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon size={18} color="#fb923c" />
        <h3 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 16, color: 'var(--color-cream)', margin: 0,
        }}>{title}</h3>
      </div>
      <p style={{
        margin: 0, fontSize: 13, color: 'var(--color-muted)',
        fontFamily: 'var(--font-body)', lineHeight: 1.5,
      }}>{description}</p>
      
      <pre style={{
        background: 'rgba(0,0,0,0.18)',
        border: '1px solid var(--dash-card-border)',
        borderRadius: 10,
        padding: '16px 20px',
        overflow: 'auto',
        fontSize: 12,
        color: '#fb923c',
        fontFamily: 'var(--font-mono)',
        margin: 0,
        lineHeight: 1.6,
      }}>
        {code}
      </pre>
    </Card>
  )
}