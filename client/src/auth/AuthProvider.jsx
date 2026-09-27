// Who is logged in, for the whole app.
//
// FAKE FOR NOW: login/signup only build a user object and remember it in localStorage,
// so the landing → sign up → dashboard flow can be tested without a backend.
// Passwords are never stored or kept anywhere in the frontend.
//
// TODO(backend): replace the fake parts with real calls through src/api/client.js:
//   login   → api.post('/auth/login',  { email, password })                       → returns the user
//   signup  → api.post('/auth/signup', { firstName, lastName, email, password })  → returns the user
//   logout  → api.post('/auth/logout')
//   on load → api.get('/auth/me') to restore the session (httpOnly cookie), instead of localStorage
// Once that is done, delete SESSION_KEY / PROFILES_KEY and the read/write helpers below.

import { useCallback, useMemo, useState } from 'react'
import { AuthContext } from './authContext.js'

const SESSION_KEY = 'tooli-demo-user'
// Remembers the names typed at sign up (per email, NO password) so a later fake login shows the right name
const PROFILES_KEY = 'tooli-demo-profiles'

function read(key) {
  try {
    return JSON.parse(localStorage.getItem(key))
  } catch {
    return null
  }
}

function write(key, value) {
  try {
    if (value == null) localStorage.removeItem(key)
    else localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage blocked (private mode): the session just won't survive a reload
  }
}

// Stand-in for network latency, so loading states can be seen
const fakeDelay = () => new Promise((resolve) => setTimeout(resolve, 400))

function nameFromEmail(email) {
  const part = email.split('@')[0].split(/[._-]/)[0] || 'friend'
  return part[0].toUpperCase() + part.slice(1)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => read(SESSION_KEY))

  const startSession = useCallback((nextUser) => {
    write(SESSION_KEY, nextUser)
    setUser(nextUser)
    return nextUser
  }, [])

  const login = useCallback(
    async ({ email }) => {
      // TODO(backend): const user = await api.post('/auth/login', { email, password })
      await fakeDelay()
      const key = email.trim().toLowerCase()
      const known = read(PROFILES_KEY)?.[key]
      return startSession(known ?? { firstName: nameFromEmail(key), lastName: '', email: key })
    },
    [startSession],
  )

  const signup = useCallback(
    async ({ firstName, lastName, email }) => {
      // TODO(backend): const user = await api.post('/auth/signup', { firstName, lastName, email, password })
      await fakeDelay()
      const key = email.trim().toLowerCase()
      const newUser = { firstName: firstName.trim(), lastName: lastName.trim(), email: key }
      write(PROFILES_KEY, { ...read(PROFILES_KEY), [key]: newUser })
      return startSession(newUser)
    },
    [startSession],
  )

  const logout = useCallback(() => {
    // TODO(backend): await api.post('/auth/logout')
    write(SESSION_KEY, null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, isLoggedIn: Boolean(user), login, signup, logout }),
    [user, login, signup, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
