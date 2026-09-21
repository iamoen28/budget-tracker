import { useState } from 'react'
import Header from '../components/Header/Header'
import Button from '../components/Button/Button'
import Navbar from '../components/Navbar/Navbar'
import BalanceList from '../components/BalanceCard/BalanceList'
import './AccountsPage.css'

function AccountsPage({ accounts, currency, setCurrency, renameAccount, deleteAccount, onNavigate }) {
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [message, setMessage] = useState('')

  const saveRename = account => {
    const error = renameAccount(account.id, editingName)
    if (error) { setMessage(error); return }
    setEditingId(null)
    setMessage('')
  }

  const handleDelete = account => {
    const error = deleteAccount(account.id)
    setMessage(error ?? `${account.name} removed.`)
  }
  return (
    <div className="simple-page-layout">
      <div className="nav-panel"><Navbar onNavigate={onNavigate} /></div>
      <main className="simple-page">
        <Header />
        <div className="simple-page-content">
          <div className="section-heading">
            <div><h1>Accounts</h1><p>Manage the places where your money lives.</p></div>
            <label className="currency-control">Currency
              <select value={currency} onChange={event => setCurrency(event.target.value)} aria-label="Currency">
                <option value="PHP">PHP</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </label>
          </div>
          <section className="card account-page-card">
            <h2>Your accounts</h2>
            <BalanceList currency={`${currency} `} balances={accounts} onAccountClick={account => onNavigate(`/transactions?account=${encodeURIComponent(account.id)}`)} />
            {message && <p className="account-message" role="status">{message}</p>}
            <div className="account-management">
              {accounts.map(account => <div className="account-management-row" key={account.id}>
                {editingId === account.id ? <input aria-label={`New name for ${account.name}`} value={editingName} onChange={event => setEditingName(event.target.value)} /> : <strong>{account.name}</strong>}
                <span>{currency} {account.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                {editingId === account.id ? <Button onClick={() => saveRename(account)}>Save</Button> : <Button onClick={() => { setEditingId(account.id); setEditingName(account.name) }}>Rename</Button>}
                <button type="button" className="delete-account-button" onClick={() => handleDelete(account)}>Delete</button>
              </div>)}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default AccountsPage
