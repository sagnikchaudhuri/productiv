// ─── Icons ────────────────────────────────────────────────────
const P = {
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  planner:   <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
  habits:    <><path d="M12 2a10 10 0 1 0 10 10"/><polyline points="12 6 12 12 16 14"/></>,
  analytics: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>,
  bolt:      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>,
  check:     <polyline points="20 6 9 17 4 12"/>,
  send:      <><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>,
  refresh:   <><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></>,
  plus:      <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
  trash:     <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></>,
  logout:    <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
  x:         <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
}

export function Icon({ name, size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      {P[name]}
    </svg>
  )
}

// ─── Ring ─────────────────────────────────────────────────────
export function Ring({ pct = 0, size = 60, stroke = 5, color = 'var(--cyan)' }) {
  const r = (size - stroke) / 2, circ = 2 * Math.PI * r
  const dash = (Math.min(pct, 100) / 100) * circ
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--surface3)" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 5px ${color})` }}/>
    </svg>
  )
}

// ─── Sparkline ────────────────────────────────────────────────
export function Sparkline({ data = [], color = 'var(--cyan)', height = 36 }) {
  const max = Math.max(...data, 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, borderRadius: 2, background: color, height: `${(v/max)*100}%`, opacity: 0.65 }}/>
      ))}
    </div>
  )
}

// ─── LineChart ────────────────────────────────────────────────
export function LineChart({ data = [], color = 'var(--cyan)', width = 260, height = 80 }) {
  if (!data || data.length < 2) return null
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1
  const pts = data.map((v, i) => [(i / (data.length - 1)) * width, height - ((v - min) / range) * (height - 14) - 7])
  const d = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const area = `${d} L${width},${height} L0,${height} Z`
  const uid = 'g' + Math.random().toString(36).slice(2, 7)
  return (
    <svg width={width} height={height} style={{ overflow: 'visible', display: 'block' }}>
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${uid})`}/>
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {(() => { const [x, y] = pts[pts.length - 1]; return <circle cx={x} cy={y} r={4} fill={color} style={{ filter: `drop-shadow(0 0 5px ${color})` }}/> })()}
    </svg>
  )
}

// ─── HeatMap ──────────────────────────────────────────────────
export function HeatMap({ data = [] }) {
  const cells = data.length ? data : Array(28).fill({ level: 0 })
  const bg = l => ['var(--surface3)', 'rgba(0,229,255,0.15)', 'rgba(0,229,255,0.35)', 'rgba(0,229,255,0.6)', 'var(--cyan)'][l] || 'var(--surface3)'
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3 }}>
        {cells.map((c, i) => <div key={i} style={{ aspectRatio: '1', borderRadius: 2, background: bg(c.level ?? 0) }}/>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3, marginTop: 4 }}>
        {['M','T','W','T','F','S','S'].map((d, i) => <div key={i} style={{ fontSize: 9, color: 'var(--text-dim)', textAlign: 'center' }}>{d}</div>)}
      </div>
    </div>
  )
}

// ─── Card ─────────────────────────────────────────────────────
export function Card({ children, style }) {
  return <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, ...style }}>{children}</div>
}

// ─── CardTitle ────────────────────────────────────────────────
export function CardTitle({ icon, children, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, fontSize: 11, fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
      {icon && <Icon name={icon} size={13}/>}
      <span>{children}</span>
      {right && <div style={{ marginLeft: 'auto' }}>{right}</div>}
    </div>
  )
}

// ─── Buttons ──────────────────────────────────────────────────
const BTN = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', border: 'none', padding: '9px 18px' }

export function BtnCyan({ children, onClick, style, disabled, type = 'button' }) {
  return <button type={type} onClick={onClick} disabled={disabled} style={{ ...BTN, background: disabled ? 'var(--surface3)' : 'var(--cyan)', color: disabled ? 'var(--text-muted)' : 'var(--bg)', opacity: disabled ? 0.6 : 1, boxShadow: disabled ? 'none' : '0 0 18px var(--cyan-dim)', ...style }}>{children}</button>
}

export function BtnGhost({ children, onClick, style, disabled }) {
  return <button onClick={onClick} disabled={disabled} style={{ ...BTN, background: 'transparent', border: '1px solid var(--border-bright)', color: 'var(--text)', opacity: disabled ? 0.5 : 1, ...style }}>{children}</button>
}

export function BtnDanger({ children, onClick, style }) {
  return <button onClick={onClick} style={{ ...BTN, background: 'rgba(255,77,106,0.1)', border: '1px solid rgba(255,77,106,0.25)', color: 'var(--red)', ...style }}>{children}</button>
}

// ─── Input / Textarea ─────────────────────────────────────────
const IS = { width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', color: 'var(--text)', fontSize: 14, outline: 'none', transition: 'border-color 0.2s' }
const fo = e => (e.target.style.borderColor = 'rgba(0,229,255,0.45)')
const fb = e => (e.target.style.borderColor = 'var(--border)')

export function Input({ label, containerStyle, ...props }) {
  return (
    <div style={{ marginBottom: 14, ...containerStyle }}>
      {label && <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>}
      <input style={IS} onFocus={fo} onBlur={fb} {...props}/>
    </div>
  )
}

export function Textarea({ label, containerStyle, ...props }) {
  return (
    <div style={{ marginBottom: 14, ...containerStyle }}>
      {label && <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>}
      <textarea style={{ ...IS, resize: 'vertical' }} onFocus={fo} onBlur={fb} {...props}/>
    </div>
  )
}

// ─── Badge ────────────────────────────────────────────────────
const BC = { cyan: ['var(--cyan-dim)', 'var(--cyan)', 'rgba(0,229,255,0.2)'], green: ['rgba(0,255,157,0.1)', 'var(--green)', 'rgba(0,255,157,0.2)'], amber: ['rgba(255,184,0,0.1)', 'var(--amber)', 'rgba(255,184,0,0.2)'], red: ['rgba(255,77,106,0.1)', 'var(--red)', 'rgba(255,77,106,0.2)'] }
export function Badge({ children, variant = 'cyan' }) {
  const [bg, fg, border] = BC[variant] || BC.cyan
  return <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: bg, color: fg, border: `1px solid ${border}` }}>{children}</span>
}

// ─── ProgressBar ──────────────────────────────────────────────
export function ProgressBar({ pct = 0, color = 'var(--cyan)', height = 4 }) {
  return (
    <div style={{ height, background: 'var(--surface3)', borderRadius: height / 2, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: color, borderRadius: height / 2, transition: 'width 0.6s ease' }}/>
    </div>
  )
}

// ─── Spinner ──────────────────────────────────────────────────
export function Spinner({ size = 20 }) {
  return <div style={{ width: size, height: size, borderRadius: '50%', border: '2px solid var(--surface3)', borderTopColor: 'var(--cyan)', animation: 'spin 0.7s linear infinite', flexShrink: 0 }}/>
}

// ─── GlowDot ──────────────────────────────────────────────────
export function GlowDot() {
  return <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--cyan)', boxShadow: '0 0 8px var(--cyan-glow)', animation: 'pulse 2s ease-in-out infinite', flexShrink: 0 }}/>
}

// ─── Modal ────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width = 480 }) {
  if (!open) return null
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--surface)', border: '1px solid var(--border-bright)', borderRadius: 'var(--radius)', padding: 28, width: `min(${width}px, 92vw)`, animation: 'fadeUp 0.2s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Icon name="x" size={17}/></button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────
export function Empty({ icon = '📭', message }) {
  return <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)', fontSize: 13 }}><div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>{message}</div>
}
