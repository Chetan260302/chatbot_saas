

const FOOTER_LINKS = {
  Product:  ['Features', 'How it works', 'Pricing', 'Changelog'],
  Company:  ['About', 'Blog', 'Careers', 'Press'],
  Developers: ['API Docs', 'SDK', 'Webhooks', 'Status'],
  Legal:    ['Privacy', 'Terms', 'Security', 'GDPR'],
}

export default function Footer({ theme }: { theme: 'dark' | 'light' }) {
  const isDark = theme === 'dark'

  return (
    <footer style={{
      padding: 'clamp(24px, 3vw, 40px) 0 24px',
      background: isDark ? '#080604' : '#1c1917',
      position: 'relative',
    }}>

      {/* Top glow line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: isDark
          ? 'linear-gradient(90deg, transparent, rgba(251,146,60,0.20) 30%, rgba(251,146,60,0.20) 70%, transparent)'
          : 'linear-gradient(90deg, transparent, rgba(251,146,60,0.30) 30%, rgba(251,146,60,0.30) 70%, transparent)',
      }} />

      <div className="container">

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
          gap: 'clamp(32px, 4vw, 56px)',
          marginBottom: 'clamp(48px, 6vw, 72px)',
        }}>

          {/* Brand column */}
          <div style={{ gridColumn: 'span 1' }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9,
                background: 'linear-gradient(135deg, #ea580c 0%, #fb923c 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, boxShadow: '0 0 16px rgba(234,88,12,0.5)',
              }}>✦</div>
              <span style={{
                fontFamily: 'Nunito, sans-serif', fontWeight: 800,
                fontSize: 20, color: '#fff7ed',
              }}>
                Botify
              </span>
            </div>

            <p style={{
              fontSize: 13,
              color: 'rgba(255,247,237,0.45)',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              lineHeight: 1.65,
              maxWidth: 220,
              marginBottom: 20,
            }}>
              AI chatbots trained on your data. For any business, any industry.
            </p>

            {/* Social links */}
            <div style={{ display: 'flex', gap: 12 }}>
              {['𝕏', 'in', '⌥'].map((icon) => (
                <a key={icon} href="#" style={{
                  width: 34, height: 34, borderRadius: 8,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(255,247,237,0.5)',
                  fontSize: 13, textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget
                  el.style.background = 'rgba(234,88,12,0.15)'
                  el.style.borderColor = 'rgba(234,88,12,0.35)'
                  el.style.color = '#fb923c'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget
                  el.style.background = 'rgba(255,255,255,0.05)'
                  el.style.borderColor = 'rgba(255,255,255,0.08)'
                  el.style.color = 'rgba(255,247,237,0.5)'
                }}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 style={{
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 700,
                fontSize: 13,
                color: '#fff7ed',
                marginBottom: 16,
                letterSpacing: '0.04em',
              }}>
                {category}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {links.map((link) => (
                  <a key={link} href="#" style={{
                    fontSize: 13,
                    color: 'rgba(255,247,237,0.45)',
                    textDecoration: 'none',
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                    transition: 'color 0.18s ease',
                    width: 'fit-content',
                  }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.color = '#fb923c' }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.color = 'rgba(255,247,237,0.45)' }}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          ))}

        </div>

        {/* Bottom bar */}
        <div style={{
          paddingTop: 24,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <p style={{
            fontSize: 12,
            color: 'rgba(255,247,237,0.30)',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            margin: 0,
          }}>
            © {new Date().getFullYear()} Botify. All rights reserved.
          </p>
          <p style={{
            fontSize: 12,
            color: 'rgba(255,247,237,0.25)',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            margin: 0,
          }}>
            Made with ✦ for businesses everywhere
          </p>
        </div>

      </div>
    </footer>
  )
}