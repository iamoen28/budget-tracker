import { useState } from 'react'
import { getSession, signIn as signInLocal, signOut as signOutLocal, signUp as signUpLocal } from './authStorage.js'
import { AuthContext } from './authContextValue.js'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getSession(window.localStorage))
  const [isLoading, setIsLoading] = useState(false)

  const signIn = async (email, password) => {
    setIsLoading(true)
    const result = await signInLocal(window.localStorage, email, password)
    if (result.session) setUser(result.session)
    setIsLoading(false)
    return result.error ?? null
  }

  const signUp = async (email, password) => {
    setIsLoading(true)
    const result = await signUpLocal(window.localStorage, email, password)
    if (result.session) setUser(result.session)
    setIsLoading(false)
    return result.error ?? null
  }

  const signOut = () => {
    signOutLocal(window.localStorage)
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>{children}</AuthContext.Provider>
}

