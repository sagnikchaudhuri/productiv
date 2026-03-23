const BASE = import.meta.env.VITE_API_URL || '/api'

export const tokenStore = {
  get:   () => localStorage.getItem('productiv_token'),
  set:   t  => localStorage.setItem('productiv_token', t),
  clear: () => localStorage.removeItem('productiv_token'),
}

async function req(method, path, body = null) {
  const token = tokenStore.get()
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${BASE}${path}`, {
    method, headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const e = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(e.detail || 'Request failed')
  }
  if (res.status === 204) return null
  return res.json()
}

const get   = p     => req('GET',    p)
const post  = (p,b) => req('POST',   p, b)
const patch = (p,b) => req('PATCH',  p, b)
const del   = p     => req('DELETE', p)
const today = ()    => new Date().toISOString().slice(0, 10)

const api = {
  auth: {
    register: (name, email, password) => post('/auth/register', { name, email, password }),
    login: async (email, password) => {
      const res = await fetch(`${BASE}/auth/login`, {
        method: 'POST',
        body: new URLSearchParams({ username: email, password }),
      })
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.detail || 'Login failed') }
      const data = await res.json()
      tokenStore.set(data.access_token)
      return data
    },
    me:     () => get('/auth/me'),
    logout: () => tokenStore.clear(),
  },

  tasks: {
    list: (params = {}) => {
      const qs = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
      ).toString()
      return get('/tasks' + (qs ? '?' + qs : ''))
    },
    today:  ()         => api.tasks.list({ scheduled_date: today() }),
    create: d          => post('/tasks', d),
    update: (id, d)    => patch('/tasks/' + id, d),
    delete: id         => del('/tasks/' + id),
  },

  habits: {
    list:     ()              => get('/habits'),
    create:   d               => post('/habits', d),
    update:   (id, d)         => patch('/habits/' + id, d),
    delete:   id              => del('/habits/' + id),
    logToday: (id, done=true) => post('/habits/' + id + '/log', { log_date: today(), completed: done }),
  },

  ai: {
    chat:         msg      => post('/ai/chat', { message: msg }),
    history:      ()       => get('/ai/chat/history'),
    clearHistory: ()       => del('/ai/chat/history'),
    insight:      ()       => get('/ai/insight'),
    generatePlan: (subjects, notes='', goals='', available_hours=8, save=true) =>
      post('/ai/plan', { subjects, notes, goals, available_hours, save_to_tasks: save }),
  },

  analytics: {
    dashboard: () => get('/analytics/dashboard'),
    summary:   () => get('/analytics/summary'),
  },
}

export default api
