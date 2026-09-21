import { useState } from 'react'
import Header from '../components/Header/Header'
import Navbar from '../components/Navbar/Navbar'
import Modal from '../components/Modal/Modal'
import Button from '../components/Button/Button'
import TransactionForm from '../components/features/transactions/components/TransactionForm'
import TransactionsList from '../components/features/transactions/components/TransactionsList'
import './TransactionPage.css'

function TransactionPage({ accounts, transactions, updateTransaction, deleteTransaction, categories, currency, onNavigate }) {
  const initialAccount = new URLSearchParams(window.location.search).get('account')
  const [typeFilter, setTypeFilter] = useState('All')
  const [accountFilter, setAccountFilter] = useState(initialAccount ?? 'All')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState('')
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [deleteCandidate, setDeleteCandidate] = useState(null)

  const filteredTransactions = transactions.filter(transaction => {
    const matchesType = typeFilter === 'All' || transaction.type === typeFilter
    const matchesAccount = accountFilter === 'All' || transaction.accountId === accountFilter || transaction.fromAccountId === accountFilter || transaction.toAccountId === accountFilter
    const matchesCategory = categoryFilter === 'All' || transaction.category === categoryFilter
    const matchesDate = !dateFilter || transaction.date === dateFilter
    return matchesType && matchesAccount && matchesCategory && matchesDate
  })

  const handleUpdate = transaction => {
    const error = updateTransaction(editingTransaction.id, transaction)
    if (!error) setEditingTransaction(null)
    return error
  }

  return (
    <div className="transaction-page-layout">
      <div className="nav-panel"><Navbar onNavigate={onNavigate} /></div>
      <main className="transaction-page">
        <Header />
        <div className="transaction-content">
          <div className="section-heading">
            <div>
              <h1>Transaction History</h1>
              <p>Review, filter, and update your transactions.</p>
            </div>
            <Button onClick={() => onNavigate('/')}>Dashboard</Button>
          </div>
          <section className="card filters">
            <select aria-label="Filter by type" value={typeFilter} onChange={event => setTypeFilter(event.target.value)}>
              <option>All</option><option>Income</option><option>Expense</option><option>Transfer</option>
            </select>
            <select aria-label="Filter by account" value={accountFilter} onChange={event => setAccountFilter(event.target.value)}>
              <option value="All">All accounts</option>
              {accounts.map(account => <option key={account.id} value={account.id}>{account.name}</option>)}
            </select>
            <select aria-label="Filter by category" value={categoryFilter} onChange={event => setCategoryFilter(event.target.value)}>
              <option>All</option>
              {[...new Set(transactions.map(transaction => transaction.category).filter(Boolean))].map(category => <option key={category}>{category}</option>)}
            </select>
            <input aria-label="Filter by date" type="date" value={dateFilter} onChange={event => setDateFilter(event.target.value)} />
          </section>
          <section className="card transaction-results">
            <h2>{filteredTransactions.length} transaction{filteredTransactions.length === 1 ? '' : 's'}</h2>
            {filteredTransactions.length ? filteredTransactions.map(transaction => (
              <div className="transaction-row" key={transaction.id}>
                <TransactionsList transactions={[transaction]} currency={`${currency} `} accounts={accounts} />
                <div className="transaction-actions">
                  <Button onClick={() => setEditingTransaction(transaction)}>Edit</Button>
                  <button className="delete-button" onClick={() => setDeleteCandidate(transaction)}>Delete</button>
                </div>
              </div>
            )) : <p>No transactions match these filters.</p>}
          </section>
        </div>
        <Modal isOpen={Boolean(editingTransaction)} onClose={() => setEditingTransaction(null)}>
          <h2>Edit Transaction</h2>
          {editingTransaction && <TransactionForm onAdd={handleUpdate} categories={categories} accounts={accounts} initialTransaction={editingTransaction} submitLabel="Save Changes" />}
        </Modal>
        <Modal isOpen={Boolean(deleteCandidate)} onClose={() => setDeleteCandidate(null)}>
          <h2>Delete transaction?</h2>
          <p>This will recalculate the affected account balance.</p>
          <Button onClick={() => { deleteTransaction(deleteCandidate.id); setDeleteCandidate(null) }}>Delete Transaction</Button>
        </Modal>
      </main>
    </div>
  )
}

export default TransactionPage