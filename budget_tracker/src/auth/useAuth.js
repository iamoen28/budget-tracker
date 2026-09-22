import { useContext } from 'react'
import { AuthContext } from './authContextValue.js'

export const useAuth = () => useContext(AuthContext)
