import { useState, useEffect } from 'react'
import api from '@/api/client'
import PageShell from '@/components/PageShell'
import { Card, CardTitle, Ring, HeatMap, LineChart, Sparkline, ProgressBar, BtnCyan, BtnGhost, Input, Textarea, Icon, Spinner, Badge, Empty, Modal } from '@/components/UI'

const ACCENT = { cyan: 'var(--cyan)', green: 'var(--green)', amber: 'var(--amber)' }

export default function Habits() {
  const [data,    setData]    = useState([])
  const [heatmap, setHeatmap] = useState([])
  const [trend,   setTrend]   = useState([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [newH,    setNewH]    = useState({ name: '', description: '', target_days_per_week: 7, color: 'cyan' })
  const [saving,  setSaving]  = useState(false)
  const [logBusy, setLogBusy] = useState({})

  const load = async () => {
    const [habits, summary] = await Promise.all([api.habits.list(), api.analytics.summary()])
    setData(habits); setHeatmap(summary.heatmap || []); setTrend(summary.consistency_trend?.map(d => d.pct) || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const logToday = async (id, done) => {
    setLogBusy(b => ({ ...b, [id]: true }))
    await api.habits.logToday(id, done); await load()
    setLogBusy(b => ({ ...b, [id]: false }))
  }

  const createHabit = async () => {
    setSaving(true); await api.habits.create(newH)
    setAddOpen(false); setNewH({ name: '', description: '', target_days_per_week: 7, color: 'cyan' })
    await load(); setSaving(false)
  }

  const deleteHabit = async id => {
    if (!confirm('Delete this habit?')) return
    await api.habits.delete(id); setData(d => d.filter(x => x.habit.id !== id))
  }

  const overall     = data.length ? Math.round(data.reduce((s, h) => s + h.consistency_30d, 0) / data.length) : 0
  const bestStreak  = data.length ? Math.max(...data.map(h => h.streak)) : 0

  return (
    <PageShell title="Habit Tracker" subtitle="Build routines that stick"
      actions={<BtnCyan onClick={() => setAddOpen(true)}><Icon name="plus" size={14} color="var(--bg)"/> Add Habit</BtnCyan>}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 18 }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ position: 'relative', width: 56, height: 56, flexShrink: 0 }}>
              <Ring pct={overall} size={56} stroke={5}/>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: 'var(--cyan)', fontFamily: 'var(--font-display)' }}>{overall}%</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>Overall Consistency</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800 }}>{overall}%</div>
              <div style={{ fontSize: 11, color: 'var(--green)', marginTop: 3 }}>30-day average</div>
            </div>
          </div>
        </Card>
        <Card>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Best Streak</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--cyan)' }}>{bestStreak} <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 400 }}>days</span></div>
          <Sparkline data={trend.length ? trend.slice(-10) : [30,40,50,60,70,65,75,80,85,90]} height={28}/>
        </Card>
        <Card>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Active Habits</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800 }}>{data.length}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>tracking this week</div>
          <div style={{ display: 'flex', gap: 4, marginTop: 10 }}>
            {data.slice(0, 5).map(({ habit }) => <div key={habit.id} style={{ flex: 1, height: 6, borderRadius: 3, background: ACCENT[habit.color] || 'var(--cyan)', opacity: 0.7 }}/>)}
          </div>
        </Card>
      </div>

      {/* Habit list */}
      <Card style={{ marginBottom: 18 }}>
        <CardTitle icon="habits">Your Habits</CardTitle>
        {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><Spinner/></div>}
        {!loading && data.length === 0 && <Empty icon="✅" message="No habits yet. Add your first one!"/>}
        {data.map(({ habit, streak, consistency_30d }) => (
          <div key={habit.id} style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: ACCENT[habit.color] || 'var(--cyan)' }}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{habit.name}</div>
                {habit.description && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{habit.description}</div>}
              </div>
              <Badge variant={habit.color || 'cyan'}>{consistency_30d}%</Badge>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{streak}d 🔥</span>
              <button onClick={() => logToday(habit.id, true)} disabled={logBusy[habit.id]}
                style={{ padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: 'var(--cyan)', border: 'none', color: 'var(--bg)', opacity: logBusy[habit.id] ? 0.5 : 1 }}>
                {logBusy[habit.id] ? '…' : '✓ Done'}
              </button>
              <button onClick={() => deleteHabit(habit.id)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 4 }}>
                <Icon name="trash" size={13}/>
              </button>
            </div>
            <ProgressBar pct={consistency_30d} color={ACCENT[habit.color] || 'var(--cyan)'}/>
          </div>
        ))}
      </Card>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card><CardTitle>Activity Heatmap</CardTitle><HeatMap data={heatmap}/></Card>
        <Card>
          <CardTitle>Consistency Trend — 12 Days</CardTitle>
          <LineChart data={trend.length >= 2 ? trend : [0, 0]} color="var(--green)" width={300} height={80}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            {['12d','','','','','','6d','','','','','Today'].map((l, i) => <span key={i} style={{ fontSize: 9, color: 'var(--text-dim)' }}>{l}</span>)}
          </div>
        </Card>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="New Habit">
        <Input label="Name" placeholder="Morning Workout" value={newH.name} onChange={e => setNewH(h => ({ ...h, name: e.target.value }))}/>
        <Textarea label="Description (optional)" placeholder="30 min cardio or weights" value={newH.description} onChange={e => setNewH(h => ({ ...h, description: e.target.value }))} rows={2}/>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>Color</div>
          <div style={{ display: 'flex', gap: 10 }}>
            {['cyan','green','amber'].map(c => (
              <button key={c} onClick={() => setNewH(h => ({ ...h, color: c }))} style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: 'pointer', background: ACCENT[c], boxShadow: newH.color === c ? `0 0 10px ${ACCENT[c]}` : 'none', outline: newH.color === c ? `2px solid ${ACCENT[c]}` : 'none', outlineOffset: 2 }}/>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>Target days/week</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="range" min={1} max={7} value={newH.target_days_per_week} onChange={e => setNewH(h => ({ ...h, target_days_per_week: Number(e.target.value) }))} style={{ flex: 1, accentColor: 'var(--cyan)' }}/>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--cyan)', width: 20 }}>{newH.target_days_per_week}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <BtnGhost onClick={() => setAddOpen(false)}>Cancel</BtnGhost>
          <BtnCyan onClick={createHabit} disabled={!newH.name || saving}>{saving ? <Spinner size={14}/> : 'Create Habit'}</BtnCyan>
        </div>
      </Modal>
    </PageShell>
  )
}
