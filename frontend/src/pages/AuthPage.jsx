import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Input, BtnCyan, Spinner } from '@/components/UI'

export default function AuthPage() {
  const [mode,    setMode]    = useState('login')
  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [pass,    setPass]    = useState('')
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register }   = useAuth()
  const navigate              = useNavigate()

  const submit = async e => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      mode === 'login' ? await login(email, pass) : await register(name, email, pass)
      navigate('/')
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', backgroundImage: 'radial-gradient(ellipse 70% 50% at 50% -10%, rgba(0,229,255,0.08) 0%, transparent 70%)' }}>
      <div style={{ width: 'min(420px, 92vw)', background: 'var(--surface)', border: '1px solid var(--border-bright)', borderRadius: 20, padding: 36, animation: 'fadeUp 0.3s ease' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 30 }}>
          <svg width="34" height="34" viewBox="0 0 32 32">
            <polygon points="16,2 30,9 30,23 16,30 2,23 2,9" fill="var(--cyan)" style={{ filter: 'drop-shadow(0 0 8px var(--cyan-glow))' }}/>
            <polygon points="16,9 23,13 23,19 16,23 9,19 9,13" fill="var(--bg)"/>
          </svg>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800 }}>Productiv</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>AI productivity assistant</div>
          </div>
        </div>

        <div style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 700, marginBottom: 22 }}>
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </div>

        <form onSubmit={submit}>
          {mode === 'register' && <Input label="Name" type="text" placeholder="Alex Raj" value={name} onChange={e => setName(e.target.value)} required/>}
          <Input label="Email" type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} required/>
          <Input label="Password" type="password" placeholder="••••••••" value={pass} onChange={e => setPass(e.target.value)} required/>
          {error && <div style={{ background: 'rgba(255,77,106,0.08)', border: '1px solid rgba(255,77,106,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: 'var(--red)', marginBottom: 14 }}>{error}</div>}
          <BtnCyan type="submit" disabled={loading} style={{ width: '100%', marginTop: 4 }}>
            {loading ? <Spinner size={15}/> : mode === 'login' ? 'Sign in' : 'Create account'}
          </BtnCyan>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError('') }}
            style={{ background: 'none', border: 'none', color: 'var(--cyan)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
