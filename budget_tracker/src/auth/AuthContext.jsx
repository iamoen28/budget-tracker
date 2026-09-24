import { useState } from 'react'

import { AuthContext } from './authContextValue.js'

const API_URL = 'http://localhost:3001/api'

const getStoredSession = () => {
  try {
    const stored = window.localStorage.getItem('budget_tracker_session')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

const saveSession = session => {
  if (session) {
    window.localStorage.setItem(
      'budget_tracker_session',
      JSON.stringify(session)
    )

    if (session.token) {
      window.localStorage.setItem(
        'budget_tracker_token',
        session.token
      )
    }
  } else {
    window.localStorage.removeItem('budget_tracker_session')
    window.localStorage.removeItem('budget_tracker_token')
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredSession())
  const [isLoading, setIsLoading] = useState(false)

  const signIn = async (email, password) => {
    setIsLoading(true)

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password
        })
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        return data.message || 'Login failed.'
      }

      const session = {
        token: data.token,
        user: data.user
      }

      saveSession(session)
      setUser(session)

      return null
    } catch (error) {
      console.error('LOGIN ERROR:', error)
      return 'Could not connect to the server.'
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (email, password) => {
    setIsLoading(true)

    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password
        })
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        return data.message || 'Signup failed.'
      }

      const session = {
        token: data.token,
        user: data.user
      }

      saveSession(session)
      setUser(session)

      return null
    } catch (error) {
      console.error('SIGNUP ERROR:', error)
      return 'Could not connect to the server.'
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = () => {
    saveSession(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signUp,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}