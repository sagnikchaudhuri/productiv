import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import api from '@/api/client'
import PageShell from '@/components/PageShell'
import { Card, CardTitle, Ring, LineChart, Icon, BtnGhost, GlowDot, Spinner, Empty } from '@/components/UI'

export default function Dashboard() {
  const { user }                      = useAuth()
  const [stats,     setStats]         = useState(null)
  const [tasks,     setTasks]         = useState([])
  const [insight,   setInsight]       = useState('')
  const [iLoad,     setILoad]         = useState(true)
  const [sLoad,     setSLoad]         = useState(true)
  const [messages,  setMessages]      = useState([])
  const [input,     setInput]         = useState('')
  const [chatBusy,  setChatBusy]      = useState(false)
  const bottomRef = useRef(null)
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  useEffect(() => {
    Promise.all([
      api.analytics.dashboard().then(setStats),
      api.tasks.today().then(setTasks),
      api.ai.history().then(h => setMessages(h.slice(-12))),
    ]).finally(() => setSLoad(false))
    api.ai.insight().then(r => setInsight(r.insight)).finally(() => setILoad(false))
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const toggleTask = async t => {
    const next = t.status === 'done' ? 'pending' : 'done'
    await api.tasks.update(t.id, { status: next })
    setTasks(ts => ts.map(x => x.id === t.id ? { ...x, status: next } : x))
  }

  const sendChat = async () => {
    const msg = input.trim(); if (!msg || chatBusy) return
    setInput(''); setMessages(m => [...m, { role: 'user', content: msg }]); setChatBusy(true)
    try { const { reply } = await api.ai.chat(msg); setMessages(m => [...m, { role: 'assistant', content: reply }]) }
    catch { setMessages(m => [...m, { role: 'assistant', content: 'Something went wrong. Try again.' }]) }
    finally { setChatBusy(false) }
  }

  const hours7d = (stats?.daily_hours_7d || []).map(d => d.hours)

  return (
    <PageShell title={`${greeting}, ${user?.name?.split(' ')[0] || ''} 👋`} subtitle="Ready to crush your goals today?">
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 18 }}>
        {[
          { label: 'Consistency', val: `${stats?.consistency_score || 0}%`, sub: '↑ 7-day rate', subColor: 'var(--green)', extra: <div style={{ position: 'relative', width: 56, height: 56, flexShrink: 0 }}><Ring pct={stats?.consistency_score || 0} size={56} stroke={5}/><div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 800, color: 'var(--cyan)' }}>{stats?.consistency_score || 0}%</div></div> },
          { label: 'Day Streak', val: stats?.day_streak || 0, sub: 'days strong', subColor: 'var(--text-muted)', extra: <div style={{ fontSize: 34 }}>🔥</div> },
          { label: 'Today', val: `${stats?.today?.done || 0}/${stats?.today?.total || 0}`, sub: `${stats?.today?.pending || 0} pending`, subColor: 'var(--text-muted)', extra: <div style={{ fontSize: 28, color: 'var(--cyan)' }}>◎</div> },
        ].map(({ label, val, sub, subColor, extra }) => (
          <Card key={label}>
            {sLoad ? <div style={{ display: 'flex', justifyContent: 'center', padding: '18px 0' }}><Spinner/></div> : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {extra}
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>{label}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, lineHeight: 1 }}>{val}</div>
                  <div style={{ fontSize: 11, color: subColor, marginTop: 4 }}>{sub}</div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Plan + Insight */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
        <Card>
          <CardTitle icon="planner">Today's Plan</CardTitle>
          {tasks.length === 0 ? <Empty icon="📋" message="No tasks today. Generate a plan in Planner."/> : tasks.map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 50, flexShrink: 0 }}>{t.start_time || '—'}</span>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: t.status === 'done' ? 'var(--text-muted)' : 'var(--text)', textDecoration: t.status === 'done' ? 'line-through' : 'none' }}>{t.title}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginRight: 6 }}>{t.duration_minutes}m</span>
              <button onClick={() => toggleTask(t)} style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, cursor: 'pointer', background: t.status === 'done' ? 'var(--cyan)' : 'transparent', border: t.status === 'done' ? 'none' : '2px solid var(--border-bright)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {t.status === 'done' && <Icon name="check" size={11} color="var(--bg)"/>}
              </button>
            </div>
          ))}
        </Card>

        <Card style={{ background: 'var(--surface2)' }}>
          <CardTitle right={<GlowDot/>}><span style={{ color: 'var(--cyan)', marginRight: 4 }}>✦</span> AI Insight</CardTitle>
          {iLoad ? <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}><Spinner/></div>
            : <p style={{ fontSize: 13, lineHeight: 1.75, color: 'var(--text-muted)', marginBottom: 20 }}>{insight}</p>}
          <BtnGhost onClick={() => { setILoad(true); api.ai.insight().then(r => setInsight(r.insight)).finally(() => setILoad(false)) }} style={{ width: '100%' }}>
            <Icon name="refresh" size={13}/> Refresh
          </BtnGhost>
        </Card>
      </div>

      {/* Chat + Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <CardTitle icon="bolt">AI Assistant</CardTitle>
          <div style={{ display: 'flex', flexDirection: 'column', height: 290 }}>
            <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 10 }}>
              {messages.length === 0 && <Empty icon="🤖" message="Ask me anything about your productivity…"/>}
              {messages.map((m, i) => (
                <div key={i} style={{ marginBottom: 10, display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-start', gap: 8 }}>
                  {m.role === 'assistant' && <div style={{ width: 24, height: 24, borderRadius: 7, flexShrink: 0, marginTop: 2, background: 'var(--cyan-dim)', border: '1px solid rgba(0,229,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>✦</div>}
                  <div style={{ maxWidth: '76%', padding: '9px 13px', borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px', background: m.role === 'user' ? 'var(--surface3)' : 'var(--surface2)', border: '1px solid var(--border)', fontSize: 13, lineHeight: 1.65, color: m.role === 'user' ? 'var(--text)' : 'var(--text-muted)' }}>{m.content}</div>
                </div>
              ))}
              {chatBusy && <div style={{ display: 'flex', gap: 8, alignItems: 'center', paddingLeft: 32 }}><Spinner size={13}/><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Thinking…</span></div>}
              <div ref={bottomRef}/>
            </div>
            <div style={{ display: 'flex', gap: 8, borderTop: '1px solid var(--border)', paddingTop: 11 }}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} placeholder="Ask about your productivity…"
                style={{ flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 13px', color: 'var(--text)', fontSize: 13, outline: 'none' }}
                onFocus={e => e.target.style.borderColor = 'rgba(0,229,255,0.4)'} onBlur={e => e.target.style.borderColor = 'var(--border)'}/>
              <button onClick={sendChat} style={{ width: 36, height: 36, flexShrink: 0, background: 'var(--cyan)', border: 'none', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 14px var(--cyan-dim)' }}>
                <Icon name="send" size={14} color="var(--bg)"/>
              </button>
            </div>
          </div>
        </Card>

        <Card>
          <CardTitle icon="analytics">Study Hours — Last 7 Days</CardTitle>
          {sLoad ? <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner/></div> : (
            <>
              <LineChart data={hours7d.length ? hours7d : [0, 0]} width={310} height={110}/>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                {(stats?.daily_hours_7d || []).map(d => (
                  <div key={d.date} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>{new Date(d.date + 'T12:00:00').toLocaleDateString('en', { weekday: 'narrow' })}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{d.hours}h</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 18 }}>
                <div style={{ background: 'var(--surface2)', borderRadius: 10, padding: 12 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Habit Consistency</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--cyan)' }}>{stats?.habit_consistency || 0}%</div>
                </div>
                <div style={{ background: 'var(--surface2)', borderRadius: 10, padding: 12 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Total This Week</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800 }}>{hours7d.reduce((a, b) => a + b, 0).toFixed(1)}h</div>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </PageShell>
  )
}
