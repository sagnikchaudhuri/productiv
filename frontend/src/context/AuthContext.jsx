import { createContext, useContext, useState, useEffect } from 'react'
import api, { tokenStore } from '@/api/client'

const Ctx = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (tokenStore.get()) {
      api.auth.me().then(setUser).catch(() => tokenStore.clear()).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    await api.auth.login(email, password)
    const me = await api.auth.me()
    setUser(me)
    return me
  }

  const register = async (name, email, password) => {
    await api.auth.register(name, email, password)
    return login(email, password)
  }

  const logout = () => { api.auth.logout(); setUser(null) }

  return <Ctx.Provider value={{ user, loading, login, register, logout }}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
