import { useState, useEffect } from 'react'
import api from '@/api/client'
import PageShell from '@/components/PageShell'
import { Card, CardTitle, BtnCyan, BtnGhost, Input, Textarea, Icon, Spinner, Badge, Empty, Modal } from '@/components/UI'

const PRIORITY_COLOR = { 3: 'var(--red)', 2: 'var(--cyan)', 1: 'var(--green)' }

export default function Planner() {
  const [tasks,    setTasks]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [genBusy,  setGenBusy]  = useState(false)
  const [subjects, setSubjects] = useState(['Data Structures', 'System Design'])
  const [tagInput, setTagInput] = useState('')
  const [notes,    setNotes]    = useState('')
  const [goals,    setGoals]    = useState('')
  const [hours,    setHours]    = useState(8)
  const [addOpen,  setAddOpen]  = useState(false)
  const [newTask,  setNewTask]  = useState({ title: '', subject: '', start_time: '', duration_minutes: 60, notes: '' })

  useEffect(() => { api.tasks.today().then(setTasks).finally(() => setLoading(false)) }, [])

  const generatePlan = async () => {
    if (!subjects.length) return
    setGenBusy(true)
    try { await api.ai.generatePlan(subjects, notes, goals, hours, true); setTasks(await api.tasks.today()) }
    catch (e) { alert('Plan generation failed: ' + e.message) }
    finally { setGenBusy(false) }
  }

  const addTag = () => { const v = tagInput.trim(); if (v && !subjects.includes(v)) setSubjects(s => [...s, v]); setTagInput('') }

  const createTask = async () => {
    if (!newTask.title) return
    await api.tasks.create({ ...newTask, scheduled_date: new Date().toISOString().slice(0, 10), duration_minutes: Number(newTask.duration_minutes) })
    setTasks(await api.tasks.today()); setAddOpen(false)
    setNewTask({ title: '', subject: '', start_time: '', duration_minutes: 60, notes: '' })
  }

  const toggleTask = async t => {
    const next = t.status === 'done' ? 'pending' : 'done'
    await api.tasks.update(t.id, { status: next })
    setTasks(ts => ts.map(x => x.id === t.id ? { ...x, status: next } : x))
  }

  const deleteTask = async id => { await api.tasks.delete(id); setTasks(ts => ts.filter(t => t.id !== id)) }

  const sorted = [...tasks].sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''))

  return (
    <PageShell title="AI Study Planner" subtitle="Tell the AI your day — it builds your optimal schedule"
      actions={<BtnCyan onClick={generatePlan} disabled={genBusy || !subjects.length}>{genBusy ? <Spinner size={14}/> : <Icon name="refresh" size={14} color="var(--bg)"/>} Generate Plan</BtnCyan>}>
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 18 }}>
        {/* Input panel */}
        <Card>
          <CardTitle icon="bolt">Tell me about your day</CardTitle>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>Subjects</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {subjects.map(s => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--surface2)', border: '1px solid var(--border-bright)', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500 }}>
                  {s}
                  <button onClick={() => setSubjects(ss => ss.filter(x => x !== s))} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
                </div>
              ))}
              <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => (e.key === 'Enter' || e.key === ',') && addTag()} placeholder="Add subject…"
                style={{ background: 'transparent', border: '1px dashed var(--border-bright)', borderRadius: 20, padding: '4px 10px', color: 'var(--text)', fontSize: 12, outline: 'none', width: 100 }}/>
            </div>
          </div>
          <Textarea label="Notes" placeholder="Finish DS HW, review chapter 3…" value={notes} onChange={e => setNotes(e.target.value)} rows={2}/>
          <Textarea label="Goals" placeholder="Study 6hrs, gym after 6pm…" value={goals} onChange={e => setGoals(e.target.value)} rows={2}/>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>Available Hours</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="range" min={2} max={14} value={hours} onChange={e => setHours(Number(e.target.value))} style={{ flex: 1, accentColor: 'var(--cyan)' }}/>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--cyan)', width: 24 }}>{hours}h</span>
            </div>
          </div>
        </Card>

        {/* Schedule */}
        <Card>
          <CardTitle icon="planner" right={<BtnGhost onClick={() => setAddOpen(true)} style={{ padding: '5px 12px', fontSize: 12 }}><Icon name="plus" size={13}/> Add Task</BtnGhost>}>
            Today's Schedule
          </CardTitle>
          {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner/></div>}
          {!loading && sorted.length === 0 && <Empty icon="🗓️" message="No tasks yet. Generate an AI plan or add manually."/>}
          {sorted.map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 10, background: 'var(--surface2)', marginBottom: 8, border: '1px solid var(--border)', opacity: t.status === 'done' ? 0.55 : 1 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: PRIORITY_COLOR[t.priority] || 'var(--cyan)' }}/>
              <div style={{ width: 90, flexShrink: 0, fontSize: 11, color: 'var(--text-muted)' }}>{t.start_time || '—'} · {t.duration_minutes}m</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, textDecoration: t.status === 'done' ? 'line-through' : 'none' }}>{t.title}</div>
                {t.subject && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{t.subject}</div>}
              </div>
              {t.ai_generated && <Badge variant="cyan">AI</Badge>}
              <button onClick={() => toggleTask(t)} style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, cursor: 'pointer', background: t.status === 'done' ? 'var(--cyan)' : 'transparent', border: t.status === 'done' ? 'none' : '2px solid var(--border-bright)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {t.status === 'done' && <Icon name="check" size={12} color="var(--bg)"/>}
              </button>
              <button onClick={() => deleteTask(t.id)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 4 }}>
                <Icon name="trash" size={13}/>
              </button>
            </div>
          ))}
        </Card>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Task">
        <Input label="Title" placeholder="Study Algorithms" value={newTask.title} onChange={e => setNewTask(n => ({ ...n, title: e.target.value }))}/>
        <Input label="Subject" placeholder="Data Structures" value={newTask.subject} onChange={e => setNewTask(n => ({ ...n, subject: e.target.value }))}/>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Input label="Start time" type="time" value={newTask.start_time} onChange={e => setNewTask(n => ({ ...n, start_time: e.target.value }))}/>
          <Input label="Duration (min)" type="number" value={newTask.duration_minutes} onChange={e => setNewTask(n => ({ ...n, duration_minutes: e.target.value }))}/>
        </div>
        <Textarea label="Notes" placeholder="Focus areas…" value={newTask.notes} onChange={e => setNewTask(n => ({ ...n, notes: e.target.value }))} rows={2}/>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
          <BtnGhost onClick={() => setAddOpen(false)}>Cancel</BtnGhost>
          <BtnCyan onClick={createTask} disabled={!newTask.title}>Add Task</BtnCyan>
        </div>
      </Modal>
    </PageShell>
  )
}
