import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface User {
  id: string
  name: string
  email: string
  phone: string
  farm_name: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  signup: (data: SignupData) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

interface SignupData {
  name: string
  email: string
  password: string
  phone: string
  farm_name: string
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('kisanUser')
    if (stored) {
      try { setUser(JSON.parse(stored)) } catch { /* ignore */ }
    }
  }, [])

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok || !data.success) throw new Error(data.detail || data.message || 'Login failed')
    setUser(data.user)
    localStorage.setItem('kisanUser', JSON.stringify(data.user))
  }

  const signup = async (signupData: SignupData) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signupData),
    })
    const data = await res.json()
    if (!res.ok || !data.success) throw new Error(data.detail || data.message || 'Signup failed')
    setUser(data.user)
    localStorage.setItem('kisanUser', JSON.stringify(data.user))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('kisanUser')
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
