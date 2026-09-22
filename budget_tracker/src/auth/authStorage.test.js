import { describe, expect, it } from 'vitest'
import { getSession, signIn, signOut, signUp } from './authStorage.js'

const createStorage = () => {
  const values = new Map()
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key)
  }
}

describe('local auth adapter', () => {
  it('creates a session and signs in with the same credentials', async () => {
    const storage = createStorage()
    expect(await signUp(storage, 'Person@example.com', 'password123')).toEqual({ session: expect.objectContaining({ email: 'person@example.com' }) })
    expect((await signIn(storage, 'person@example.com', 'password123')).session.email).toBe('person@example.com')
    expect(getSession(storage).email).toBe('person@example.com')
  })

  it('rejects weak or duplicate accounts and wrong passwords', async () => {
    const storage = createStorage()
    expect((await signUp(storage, 'person@example.com', 'short')).error).toContain('8 characters')
    await signUp(storage, 'person@example.com', 'password123')
    expect((await signUp(storage, 'person@example.com', 'password123')).error).toContain('already exists')
    expect((await signIn(storage, 'person@example.com', 'wrongpass')).error).toContain('incorrect')
  })

  it('clears the active session on sign out', async () => {
    const storage = createStorage()
    await signUp(storage, 'person@example.com', 'password123')
    signOut(storage)
    expect(getSession(storage)).toBeNull()
  })
})
