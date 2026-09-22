import { useState } from 'react'
import { useAuth } from '../auth/useAuth.js'
import './AuthPage.css'

function AuthPage() {
  const { signIn, signUp, isLoading } = useAuth()
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const isSignUp = mode === 'signup'

  const handleSubmit = async event => {
    event.preventDefault()
    const result = isSignUp ? await signUp(email, password) : await signIn(email, password)
    setError(result ?? '')
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <p className="auth-eyebrow">Personal finance</p>
        <h1>Budget Tracker</h1>
        <p className="auth-subtitle">Keep your accounts, plans, and spending in one place.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>Email<input type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} required /></label>
          <label>Password<input type="password" autoComplete={isSignUp ? 'new-password' : 'current-password'} value={password} onChange={event => setPassword(event.target.value)} minLength="8" required /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button type="submit" disabled={isLoading}>{isLoading ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in'}</button>
        </form>
        <button className="auth-switch" type="button" onClick={() => { setMode(isSignUp ? 'signin' : 'signup'); setError('') }}>
          {isSignUp ? 'Already have an account? Sign in' : 'New here? Create an account'}
        </button>
        <small className="auth-note">Development authentication is local until Supabase is connected.</small>
      </section>
    </main>
  )
}

export default AuthPage
