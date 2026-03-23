export default function PageShell({ title, subtitle, actions, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '28px 28px 0', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, lineHeight: 1.2 }}>{title}</h1>
          {subtitle && <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 5 }}>{subtitle}</p>}
        </div>
        {actions && <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>{actions}</div>}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px 28px' }}>
        {children}
      </div>
    </div>
  )
}
