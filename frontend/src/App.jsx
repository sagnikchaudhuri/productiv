import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import Sidebar   from '@/components/Sidebar'
import AuthPage  from '@/pages/AuthPage'
import Dashboard from '@/pages/Dashboard'
import Planner   from '@/pages/Planner'
import Habits    from '@/pages/Habits'
import Analytics from '@/pages/Analytics'

function Layout() {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar/>
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/"          element={<Dashboard/>}/>
          <Route path="/planner"   element={<Planner/>}/>
          <Route path="/habits"    element={<Habits/>}/>
          <Route path="/analytics" element={<Analytics/>}/>
          <Route path="*"          element={<Navigate to="/" replace/>}/>
        </Routes>
      </main>
    </div>
  )
}

function Guard() {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid var(--surface3)', borderTopColor: 'var(--cyan)', animation: 'spin 0.7s linear infinite' }}/>
    </div>
  )
  if (!user) return <Routes><Route path="*" element={<AuthPage/>}/></Routes>
  return <Layout/>
}

export default function App() {
  return <AuthProvider><Guard/></AuthProvider>
}
