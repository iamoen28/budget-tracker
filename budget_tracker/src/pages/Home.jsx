import { useState } from 'react'
import BalanceList from '../components/BalanceCard/BalanceList'
import AssetCard from '../components/Header/AssetCard'
import TransactionsList from '../components/features/transactions/components/TransactionsList'
import TransactionForm from '../components/features/transactions/components/TransactionForm'
import Header from '../components/Header/Header'
import Button from '../components/Button/Button'
import Modal from '../components/Modal/Modal'
import { calculateBudgetSpent } from '../data/budgetLedger.js'
import './Home.css'
import Navbar from '../components/Navbar/Navbar'

function Home({ accounts, transactions, addAccount, addTransaction, categories, currency, currentMonth, budgets, goals, onNavigate }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isBalanceVisible, setIsBalanceVisible] = useState(() => {
    try {
      return window.localStorage.getItem('budget-tracker-balance-visible') !== 'false'
    } catch {
      return true
    }
  })
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false)
  const [newAccountName, setNewAccountName] = useState('')
  const [newAccountBalance, setNewAccountBalance] = useState('')
  const [accountError, setAccountError] = useState('')

  const handleAddAccount = event => {
    event.preventDefault()
    const error = addAccount(newAccountName, Number(newAccountBalance))
    if (error) {
      setAccountError(error)
      return
    }
    setNewAccountName('')
    setNewAccountBalance('')
    setAccountError('')
    setIsAddAccountModalOpen(false)
  }

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible(previous => {
      const nextValue = !previous
      try {
        window.localStorage.setItem('budget-tracker-balance-visible', String(nextValue))
      } catch {
        // The preference can remain in memory when storage is unavailable.
      }
      return nextValue
    })
  }

  const totalBalance = accounts.reduce((total, account) => total + account.balance, 0)
  const currentMonthKey = new Date().toISOString().slice(0, 7)
  const activeBudgets = budgets.filter(budget => budget.month === currentMonthKey).slice(0, 3).map(budget => ({
    ...budget,
    spent: calculateBudgetSpent(transactions, budget)
  }))
  const formatAmount = value => `${currency} ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div className="Home">
      <div className="nav-panel"><Navbar onNavigate={onNavigate} /></div>
      <main className="home-main">
        <Header />
        <div className="dashboard-content">

      <div className="asset-panel">
        <section className="card">
          <AssetCard currency={`${currency} `} balance={totalBalance} isVisible={isBalanceVisible} onToggleVisibility={toggleBalanceVisibility}>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
              <h2>Add Transaction</h2>
              <TransactionForm onAdd={addTransaction} categories={categories} accounts={accounts} />
            </Modal>
            <Button ariaLabel="Add transaction" onClick={() => setIsModalOpen(true)}>+</Button>
          </AssetCard>
        </section>
      </div>

      <section className="quick-stats" aria-label="Monthly summary">
        <div className="quick-stat"><span>Monthly income</span><strong className="stat-positive">{formatAmount(currentMonth.income)}</strong><small>This month</small></div>
        <div className="quick-stat"><span>Monthly expenses</span><strong className="stat-negative">{formatAmount(currentMonth.expenses)}</strong><small>This month</small></div>
        <div className="quick-stat"><span>Monthly net</span><strong className={currentMonth.net >= 0 ? 'stat-positive' : 'stat-negative'}>{formatAmount(currentMonth.net)}</strong><small>{transactions.length} total transaction{transactions.length === 1 ? '' : 's'}</small></div>
      </section>

      <div className="account-panel">
        <section className="card" id="overview">
          <div className="account-section-heading">
            <div>
              <h2>Accounts</h2>
              <p>{accounts.length} account{accounts.length === 1 ? '' : 's'}</p>
            </div>
            <button type="button" className="section-link" onClick={() => onNavigate('/accounts')}>View all</button>
          </div>
          <BalanceList currency={`${currency} `} balances={accounts} onAccountClick={account => onNavigate(`/transactions?account=${encodeURIComponent(account.id)}`)}>
            <Modal isOpen={isAddAccountModalOpen} onClose={() => setIsAddAccountModalOpen(false)}>
              <h2>Add Account</h2>
              <form onSubmit={handleAddAccount}>
                <input type="text" placeholder="Account Name" value={newAccountName} onChange={event => setNewAccountName(event.target.value)} />
                <input type="number" min="0" step="0.01" placeholder="Initial Balance" value={newAccountBalance} onChange={event => setNewAccountBalance(event.target.value)} />
                {accountError && <p role="alert">{accountError}</p>}
                <Button type="submit">Add Account</Button>
              </form>
            </Modal>
            <button id="new-account" className="balance-card" type="button" aria-label="Add a new account" onClick={() => setIsAddAccountModalOpen(true)}>
              <span className="account-card-mark" aria-hidden="true">+</span>
              <p className="name">Add new</p>
              <p className="bal">Account</p>
            </button>
          </BalanceList>
        </section>
      </div>

      <div className="insights-panel">
        <section className="card">
          <h2>Budget Insights</h2>
          <div className="home-summary-grid">
            <p><span>Income</span><strong>{currency} {currentMonth.income.toFixed(2)}</strong></p>
            <p><span>Expenses</span><strong>{currency} {currentMonth.expenses.toFixed(2)}</strong></p>
            <p><span>Net</span><strong>{currency} {currentMonth.net.toFixed(2)}</strong></p>
          </div>
          <p>{transactions.length ? `${transactions.length} transaction${transactions.length === 1 ? '' : 's'} recorded.` : 'No transactions recorded yet.'}</p>
        </section>
      </div>

      <section className="planning-panel card">
        <div className="section-heading">
          <div><h2>Plan at a glance</h2><p>Current budgets and savings goals.</p></div>
          <button type="button" onClick={() => onNavigate('/insights')}>View insights</button>
        </div>
        <div className="planning-grid">
          <div className="planning-column"><h3>Budgets</h3>{activeBudgets.length ? activeBudgets.map(budget => <div className="planning-item" key={budget.id}><span>{budget.category}</span><strong>{formatAmount(budget.spent)} / {formatAmount(budget.limit)}</strong><progress value={budget.spent} max={budget.limit} /></div>) : <p>No budgets for this month.</p>}</div>
          <div className="planning-column"><h3>Savings goals</h3>{goals.length ? goals.slice(0, 3).map(goal => <div className="planning-item" key={goal.id}><span>{goal.name}</span><strong>{formatAmount(goal.currentAmount)} / {formatAmount(goal.targetAmount)}</strong><progress value={goal.currentAmount} max={goal.targetAmount} /></div>) : <p>No savings goals yet.</p>}</div>
        </div>
      </section>

      <div className="transaction-history">
        <section className="card">
          <div className="section-heading">
            <h2>Recent Transactions</h2>
            <button type="button" onClick={() => onNavigate('/transactions')}>View all</button>
          </div>
          {transactions.length === 0 ? <p>No transactions yet. Start adding some!</p> : <TransactionsList transactions={transactions.slice(-5).reverse()} currency={`${currency} `} accounts={accounts} />}
        </section>
      </div>
        </div>
      </main>
    </div>
  )
}

export default Home
