import { useState } from 'react'
import Header from '../components/Header/Header'
import Navbar from '../components/Navbar/Navbar'
import { calculateBudgetSpent, summarizeMonth } from '../data/budgetLedger.js'
import './InsightsPage.css'

function InsightsPage({ accounts, transactions, budgets, goals, currency, onNavigate }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const currentMonth = summarizeMonth(transactions, selectedMonth)
  const categoryTotals = transactions.reduce((totals, transaction) => {
    if (transaction.type === 'Expense' && transaction.date.startsWith(selectedMonth)) {
      totals[transaction.category] = (totals[transaction.category] ?? 0) + transaction.amount
    }
    return totals
  }, {})
  const topCategory = Object.entries(categoryTotals).sort(([, first], [, second]) => second - first)[0]
  const format = value => `${currency} ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const selectedBudgets = budgets.filter(budget => budget.month === selectedMonth).map(budget => ({
    ...budget,
    spent: calculateBudgetSpent(transactions, budget)
  }))
  const budgetStatus = budget => {
    const ratio = budget.limit ? budget.spent / budget.limit : 0
    if (ratio > 1) return ['Over budget', 'status-over']
    if (ratio >= 0.8) return ['Near limit', 'status-near']
    return ['On track', 'status-ok']
  }
  const goalStatus = goal => {
    if (goal.currentAmount >= goal.targetAmount) return ['Completed', 'status-ok']
    if (goal.targetDate && Math.ceil((new Date(`${goal.targetDate}T23:59:59`) - new Date()) / 86400000) <= 30) return ['Deadline approaching', 'status-near']
    return ['In progress', 'status-progress']
  }

  return (
    <div className="simple-page-layout">
      <div className="nav-panel"><Navbar onNavigate={onNavigate} /></div>
      <main className="simple-page">
        <Header />
        <div className="simple-page-content">
          <div className="section-heading">
            <div><h1>Insights</h1><p>Understand how your money is moving this month.</p></div>
            <label className="month-control">Month<input type="month" value={selectedMonth} onChange={event => setSelectedMonth(event.target.value)} /></label>
          </div>
          <div className="insight-grid">
            <section className="card"><h2>Monthly income</h2><strong>{format(currentMonth.income)}</strong></section>
            <section className="card"><h2>Monthly expenses</h2><strong>{format(currentMonth.expenses)}</strong></section>
            <section className="card"><h2>Monthly net</h2><strong className={currentMonth.net >= 0 ? 'positive' : 'negative'}>{format(currentMonth.net)}</strong></section>
          </div>
          <section className="card insight-summary">
            <h2>Budget insight</h2>
            {topCategory ? <p>Your largest expense category this month is <strong>{topCategory[0]}</strong> at {format(topCategory[1])}.</p> : <p>Add an expense to see category insights.</p>}
            <p>Total tracked accounts: <strong>{accounts.length}</strong></p>
          </section>
          <section className="card progress-section">
            <h2>Budget progress</h2>
            {selectedBudgets.length ? selectedBudgets.map(budget => { const [label, statusClass] = budgetStatus(budget); return <div className="progress-item" key={budget.id}><div><span>{budget.category} <em className={`status-pill ${statusClass}`}>{label}</em></span><strong>{format(budget.spent)} / {format(budget.limit)}</strong></div><progress className={statusClass} value={budget.spent} max={budget.limit} /></div> }) : <p>No budgets for {selectedMonth}. Add one in Settings.</p>}
          </section>
          <section className="card progress-section">
            <h2>Savings goals</h2>
            {goals.length ? goals.map(goal => { const [label, statusClass] = goalStatus(goal); return <div className="progress-item" key={goal.id}><div><span>{goal.name} <em className={`status-pill ${statusClass}`}>{label}</em></span><strong>{format(goal.currentAmount)} / {format(goal.targetAmount)}</strong></div><progress className={statusClass} value={goal.currentAmount} max={goal.targetAmount} /></div> }) : <p>No savings goals yet. Add one in Settings.</p>}
          </section>
        </div>
      </main>
    </div>
  )
}

export default InsightsPage
