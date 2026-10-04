import { createContext, useContext } from 'react'

export const AuthContext = createContext(null)

// { user, isLoggedIn, login, signup, logout, updateUser }
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

// Only follow "?next=" when it is a path inside tooli (blocks "//evil.com" and "https://...")
export function safeNext(next, fallback = '/dashboard') {
  if (typeof next !== 'string' || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) {
    return fallback
  }
  return next
}
