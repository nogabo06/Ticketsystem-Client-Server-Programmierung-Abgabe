import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { login as apiLogin, register as apiRegister, logout as apiLogout, getMe, setToken, getToken } from '../api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // "loading" covers the initial session-restore so the app doesn't flash the
  // login screen before we know whether the stored token is still valid.
  const [loading, setLoading] = useState(!!getToken())

  // Restore the session from a stored token on first load.
  useEffect(() => {
    let cancelled = false
    if (!getToken()) return
    getMe()
      .then((u) => { if (!cancelled) setUser(u) })
      .catch(() => { if (!cancelled) setToken(null) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  // A 401 from any request clears the token; reflect that in the UI.
  useEffect(() => {
    const onLogout = () => setUser(null)
    window.addEventListener('auth:logout', onLogout)
    return () => window.removeEventListener('auth:logout', onLogout)
  }, [])

  const login = useCallback(async (credentials) => {
    const { token, user: loggedIn } = await apiLogin(credentials)
    setToken(token)
    setUser(loggedIn)
    return loggedIn
  }, [])

  // Registration returns a token+user just like login, so the new account is
  // signed in immediately.
  const register = useCallback(async (data) => {
    const { token, user: created } = await apiRegister(data)
    setToken(token)
    setUser(created)
    return created
  }, [])

  const logout = useCallback(async () => {
    try { await apiLogout() } catch { /* ignore network errors on logout */ }
    setToken(null)
    setUser(null)
  }, [])

  const isAdmin = user?.role?.roleName === 'Admin'

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- the hook lives with its provider by convention
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
