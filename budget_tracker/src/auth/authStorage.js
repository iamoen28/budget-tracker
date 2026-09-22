const USERS_KEY = 'budget-tracker-auth-users'
const SESSION_KEY = 'budget-tracker-auth-session'

const read = (storage, key, fallback) => {
  try {
    const value = storage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

const write = (storage, key, value) => storage.setItem(key, JSON.stringify(value))

const hashPassword = async password => {
  const data = new TextEncoder().encode(password)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, '0')).join('')
}

export const getSession = storage => read(storage, SESSION_KEY, null)

export const signUp = async (storage, email, password) => {
  const normalizedEmail = email.trim().toLowerCase()
  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) return { error: 'Enter a valid email address.' }
  if (password.length < 8) return { error: 'Password must be at least 8 characters.' }
  const users = read(storage, USERS_KEY, [])
  if (users.some(user => user.email === normalizedEmail)) return { error: 'An account with that email already exists.' }
  const user = { id: crypto.randomUUID(), email: normalizedEmail, passwordHash: await hashPassword(password) }
  write(storage, USERS_KEY, [...users, user])
  const session = { id: user.id, email: user.email }
  write(storage, SESSION_KEY, session)
  return { session }
}

export const signIn = async (storage, email, password) => {
  const normalizedEmail = email.trim().toLowerCase()
  const users = read(storage, USERS_KEY, [])
  const passwordHash = await hashPassword(password)
  const user = users.find(candidate => candidate.email === normalizedEmail && candidate.passwordHash === passwordHash)
  if (!user) return { error: 'Email or password is incorrect.' }
  const session = { id: user.id, email: user.email }
  write(storage, SESSION_KEY, session)
  return { session }
}

export const signOut = storage => storage.removeItem(SESSION_KEY)
