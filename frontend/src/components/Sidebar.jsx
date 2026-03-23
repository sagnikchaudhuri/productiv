import { NavLink } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Icon } from '@/components/UI'

const NAV = [
  { to: '/',          label: 'Dashboard', icon: 'dashboard' },
  { to: '/planner',   label: 'Planner',   icon: 'planner'   },
  { to: '/habits',    label: 'Habits',    icon: 'habits'    },
  { to: '/analytics', label: 'Analytics', icon: 'analytics' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U'

  return (
    <nav style={{ width: 200, minWidth: 200, background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '22px 14px', gap: 3 }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 10px 22px' }}>
        <svg width="28" height="28" viewBox="0 0 32 32">
          <polygon points="16,2 30,9 30,23 16,30 2,23 2,9" fill="var(--cyan)" style={{ filter: 'drop-shadow(0 0 6px var(--cyan-glow))' }}/>
          <polygon points="16,9 23,13 23,19 16,23 9,19 9,13" fill="var(--bg)"/>
        </svg>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800 }}>Productiv</div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>AI Assistant</div>
        </div>
      </div>

      {/* Nav links */}
      {NAV.map(({ to, label, icon }) => (
        <NavLink key={to} to={to} end={to === '/'} style={({ isActive }) => ({
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', borderRadius: 10, fontSize: 14, fontWeight: 500,
          color: isActive ? 'var(--text)' : 'var(--text-muted)',
          background: isActive ? 'var(--surface3)' : 'transparent',
          border: `1px solid ${isActive ? 'var(--border-bright)' : 'transparent'}`,
          textDecoration: 'none', transition: 'all 0.18s', position: 'relative',
        })}>
          {({ isActive }) => (
            <>
              {isActive && <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 3, height: '60%', background: 'var(--cyan)', borderRadius: '0 2px 2px 0', boxShadow: '0 0 8px var(--cyan-glow)' }}/>}
              <Icon name={icon} size={15} color={isActive ? 'var(--cyan)' : 'currentColor'}/>
              {label}
            </>
          )}
        </NavLink>
      ))}

      {/* User */}
      <div style={{ marginTop: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 11, borderRadius: 10, background: 'var(--surface2)', border: '1px solid var(--border)' }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, var(--cyan), #0055ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--bg)' }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
          </div>
          <button onClick={logout} title="Log out" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2 }}>
            <Icon name="logout" size={14}/>
          </button>
        </div>
      </div>
    </nav>
  )
}
