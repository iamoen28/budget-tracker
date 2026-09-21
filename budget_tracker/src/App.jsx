import { useState } from 'react'
import Home from './pages/Home.jsx'
import TransactionPage from './pages/TransactionPage.jsx'
import AccountsPage from './pages/AccountsPage.jsx'
import InsightsPage from './pages/InsightsPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import useBudgetData from './hooks/useBudgetData.js'

const App = () => {
  const [location, setLocation] = useState(`${window.location.pathname}${window.location.search}`)
  const budget = useBudgetData()
  const navigate = nextPath => {
    window.history.pushState({}, '', nextPath)
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

export default App
