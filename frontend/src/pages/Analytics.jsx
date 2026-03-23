import { useState, useEffect } from 'react'
import api from '@/api/client'
import PageShell from '@/components/PageShell'
import { Card, CardTitle, LineChart, HeatMap, ProgressBar, Badge, Spinner, Empty } from '@/components/UI'

export default function Analytics() {
  const [dash,    setDash]    = useState(null)
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.analytics.dashboard().then(setDash), api.analytics.summary().then(setSummary)])
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageShell title="Analytics" subtitle="Your performance insights"><div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner/></div></PageShell>

  const trend   = summary?.consistency_trend?.map(d => d.pct) || []
  const hours7d = dash?.daily_hours_7d?.map(d => d.hours) || []
  const days    = (dash?.daily_hours_7d || []).map(d => new Date(d.date + 'T12:00:00').toLocaleDateString('en', { weekday: 'narrow' }))

  return (
    <PageShell title="Analytics" subtitle="Your performance insights">
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 18 }}>
        {[
          { label: 'Study Hours (month)',    val: `${summary?.total_study_hours_month || 0}h`, color: 'var(--cyan)'  },
          { label: 'Tasks Completed (week)', val: summary?.tasks_completed_week || 0,           color: 'var(--green)' },
          { label: 'Consistency Score',      val: `${dash?.consistency_score || 0}%`,           color: 'var(--amber)' },
        ].map(({ label, val, color }) => (
          <Card key={label}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>{label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, color, lineHeight: 1 }}>{val}</div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
        <Card>
          <CardTitle>Study Hours — Last 7 Days</CardTitle>
          {hours7d.length >= 2 ? <>
            <LineChart data={hours7d} width={310} height={90}/>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              {days.map((d, i) => <span key={i} style={{ fontSize: 10, color: 'var(--text-muted)' }}>{d}</span>)}
            </div>
          </> : <Empty icon="📊" message="Complete some tasks to see data."/>}
        </Card>
        <Card>
          <CardTitle>Consistency Trend — 12 Days</CardTitle>
          {trend.length >= 2 ? <>
            <LineChart data={trend} color="var(--green)" width={310} height={90}/>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              {['12d','','','','','','6d','','','','','Today'].map((l, i) => <span key={i} style={{ fontSize: 9, color: 'var(--text-dim)' }}>{l}</span>)}
            </div>
          </> : <Empty icon="📈" message="More data needed for trend."/>}
        </Card>
      </div>

      {/* Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
        <Card>
          <CardTitle>Subject Breakdown</CardTitle>
          {!(summary?.subject_breakdown?.length) ? <Empty icon="📚" message="Complete tasks to see subject breakdown."/> :
            summary.subject_breakdown.map(({ subject, hours }) => {
              const max = summary.subject_breakdown[0].hours || 1
              return <div key={subject} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{subject}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{hours}h</span>
                </div>
                <ProgressBar pct={Math.round((hours / max) * 100)}/>
              </div>
            })
          }
        </Card>
        <Card>
          <CardTitle>Habit Performance</CardTitle>
          {!(summary?.habit_stats?.length) ? <Empty icon="✅" message="Add habits to see stats."/> :
            summary.habit_stats.map(h => {
              const color = h.color === 'green' ? 'var(--green)' : h.color === 'amber' ? 'var(--amber)' : 'var(--cyan)'
              return <div key={h.id} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{h.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{h.streak}d 🔥</span>
                    <Badge variant={h.color || 'cyan'}>{h.consistency_30d}%</Badge>
                  </div>
                </div>
                <ProgressBar pct={h.consistency_30d} color={color}/>
              </div>
            })
          }
        </Card>
      </div>

      <Card><CardTitle>Activity Heatmap — Last 28 Days</CardTitle><HeatMap data={summary?.heatmap || []}/></Card>
    </PageShell>
  )
}
