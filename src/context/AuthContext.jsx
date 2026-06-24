import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setOnUnauthorized } from '../services/api'
import {
  clearAuthSession,
  getAuthQid,
  getAuthToken,
  isAuthenticated as checkAuthenticated,
  saveAuthSession,
} from '../utils/authStorage'
import { AuthContext } from './useAuth'

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(() => {
    const token = getAuthToken()
    if (!token) return null
    return { qid: getAuthQid(), token }
  })

  const logout = useCallback(() => {
    clearAuthSession()
    setUser(null)
    navigate('/login', { replace: true })
  }, [navigate])

  const login = useCallback((session) => {
    saveAuthSession(session)
    setUser({ qid: session.qid, token: session.access_token })
    navigate('/create-permission', { replace: true })
  }, [navigate])

  useEffect(() => {
    setOnUnauthorized(() => {
      setUser(null)
      navigate('/login', { replace: true })
    })
  }, [navigate])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (user && !checkAuthenticated()) {
        logout()
      }
    }, 30000)

    return () => window.clearInterval(intervalId)
  }, [user, logout])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user?.token) && checkAuthenticated(),
      login,
      logout,
    }),
    [user, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
