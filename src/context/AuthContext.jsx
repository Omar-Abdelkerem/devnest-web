import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { apiFetch } from '../lib/api'

const AuthContext = createContext(null)

async function fetchCurrentUser() {
  try {
    const response = await apiFetch('/api/v1/user/me', { skipCache: true })
    if (response.ok) {
      const data = await response.json()
      return data.user || data.data?.user || data.data || data
    }
    return null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    const actualUser = await fetchCurrentUser()
    setUser(actualUser)
    setIsAuthLoading(false)
    return actualUser
  }, [])

  useEffect(() => {
    let active = true
    fetchCurrentUser().then((actualUser) => {
      if (!active) return
      setUser(actualUser)
      setIsAuthLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  const value = useMemo(
    () => ({ user, setUser, isAuthLoading, refreshUser }),
    [user, isAuthLoading, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
