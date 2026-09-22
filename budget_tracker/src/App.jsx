import { useState } from 'react'
import Home from './pages/Home.jsx'
import TransactionPage from './pages/TransactionPage.jsx'
import AccountsPage from './pages/AccountsPage.jsx'
import InsightsPage from './pages/InsightsPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import useBudgetData from './hooks/useBudgetData.js'
import AuthPage from './pages/AuthPage.jsx'
import { useAuth } from './auth/useAuth.js'

function AuthenticatedApp({ user }) {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '')
  const routeFromPath = pathname => pathname.startsWith(basePath) ? pathname.slice(basePath.length) || '/' : pathname
  const [location, setLocation] = useState(`${routeFromPath(window.location.pathname)}${window.location.search}`)
  const budget = useBudgetData(user.id)
  const navigate = nextPath => {
    window.history.pushState({}, '', `${basePath}${nextPath}`)
    setLocation(nextPath)
  }

  const path = location.split('?')[0]

  return (
    <div className="App">
      {path === '/transactions' ? (
        <TransactionPage {...budget} onNavigate={navigate} />
      ) : path === '/accounts' ? (
        <AccountsPage {...budget} onNavigate={navigate} />
      ) : path === '/insights' ? (
        <InsightsPage {...budget} onNavigate={navigate} />
      ) : path === '/settings' ? (
        <SettingsPage {...budget} onNavigate={navigate} />
      ) : (
        <Home {...budget} onNavigate={navigate} />
      )}
    </div>
  )
}

const App = () => {
  const { user } = useAuth()
  return user ? <AuthenticatedApp key={user.id} user={user} /> : <AuthPage />
}

export default App
