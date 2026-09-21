import { useState } from 'react'
import Header from '../components/Header/Header'
import Navbar from '../components/Navbar/Navbar'
import Button from '../components/Button/Button'
import './SettingsPage.css'

function CategoryEditor({ type, categories, onAddCategory }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = event => {
    event.preventDefault()
    const result = onAddCategory(type, name)
    if (result) {
      setError(result)
      return
    }
    setName('')
    setError('')
  }

  return (
    <section className="card category-editor">
      <div className="category-editor-heading">
        <div>
          <h2>{type} categories</h2>
          <p>Choose this category when recording {type.toLowerCase()}.</p>
        </div>
        <span className="category-count">{categories.length}</span>
      </div>
      <ul className="category-list">
        {categories.map(category => <li key={category}>{category}</li>)}
      </ul>
      <form onSubmit={handleSubmit} className="category-form">
        <label htmlFor={`${type.toLowerCase()}-category`}>New {type.toLowerCase()} category</label>
        <div className="category-form-row">
          <input id={`${type.toLowerCase()}-category`} type="text" value={name} placeholder={`e.g. ${type === 'Income' ? 'Bonus' : 'Subscriptions'}`} onChange={event => setName(event.target.value)} />
          <Button type="submit">Add</Button>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
      </form>
    </section>
  )
}

function BudgetEditor({ categories, budgets, addBudget, updateBudget, deleteBudget }) {
  const currentMonth = new Date().toISOString().slice(0, 7)
  const [category, setCategory] = useState(categories.Expense[0] ?? '')
  const [month, setMonth] = useState(currentMonth)
  const [limit, setLimit] = useState('')
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingLimit, setEditingLimit] = useState('')

  const handleSubmit = event => {
    event.preventDefault()
    const result = addBudget(category, month, Number(limit))
    if (result) { setError(result); return }
    setLimit('')
    setError('')
  }

  const saveEdit = budget => {
    const result = updateBudget(budget.id, { limit: Number(editingLimit) })
    if (result) { setError(result); return }
    setEditingId(null)
    setError('')
  }

  return <section className="card planner-editor">
    <div className="category-editor-heading"><div><h2>Monthly budgets</h2><p>Set a spending limit for an expense category.</p></div><span className="category-count">{budgets.length}</span></div>
    <div className="planner-list">{budgets.map(budget => <div className="planner-row" key={budget.id}><span>{budget.category} · {budget.month}</span>{editingId === budget.id ? <input className="planner-inline-input" type="number" min="0.01" step="0.01" value={editingLimit} onChange={event => setEditingLimit(event.target.value)} aria-label={`New ${budget.category} budget limit`} /> : <strong>{budget.limit.toLocaleString()}</strong>}{editingId === budget.id ? <button type="button" onClick={() => saveEdit(budget)}>Save</button> : <button type="button" onClick={() => { setEditingId(budget.id); setEditingLimit(String(budget.limit)) }} aria-label={`Edit ${budget.category} budget`}>Edit</button>}<button type="button" onClick={() => deleteBudget(budget.id)} aria-label={`Delete ${budget.category} budget`}>Remove</button></div>)}</div>
    <form onSubmit={handleSubmit} className="planner-form">
      <label>Category<select value={category} onChange={event => setCategory(event.target.value)}>{categories.Expense.map(item => <option key={item}>{item}</option>)}</select></label>
      <label>Month<input type="month" value={month} onChange={event => setMonth(event.target.value)} /></label>
      <label>Limit<input type="number" min="0.01" step="0.01" value={limit} onChange={event => setLimit(event.target.value)} placeholder="5000" /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <Button type="submit">Add budget</Button>
    </form>
  </section>
}

function GoalEditor({ goals, addGoal, addGoalContribution, updateGoal, deleteGoal }) {
  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingTarget, setEditingTarget] = useState('')
  const [contributionId, setContributionId] = useState(null)
  const [contributionAmount, setContributionAmount] = useState('')
  const handleSubmit = event => {
    event.preventDefault()
    const result = addGoal(name, Number(targetAmount), targetDate)
    if (result) { setError(result); return }
    setName(''); setTargetAmount(''); setTargetDate(''); setError('')
  }

  const saveGoalEdit = goal => {
    const result = updateGoal(goal.id, { targetAmount: Number(editingTarget) })
    if (result) { setError(result); return }
    setEditingId(null)
    setError('')
  }

  const saveContribution = goal => {
    const result = addGoalContribution(goal.id, Number(contributionAmount))
    if (result) { setError(result); return }
    setContributionId(null)
    setContributionAmount('')
    setError('')
  }
  return <section className="card planner-editor">
    <div className="category-editor-heading"><div><h2>Savings goals</h2><p>Track travel, gifts, or another future purchase.</p></div><span className="category-count">{goals.length}</span></div>
    <div className="planner-list">{goals.map(goal => <div className="planner-row" key={goal.id}><span>{goal.name}{goal.targetDate ? ` · due ${goal.targetDate}` : ''}</span>{editingId === goal.id ? <input className="planner-inline-input" type="number" min="0.01" step="0.01" value={editingTarget} onChange={event => setEditingTarget(event.target.value)} aria-label={`New ${goal.name} target`} /> : <strong>{goal.currentAmount.toLocaleString()} / {goal.targetAmount.toLocaleString()}</strong>}{editingId === goal.id ? <button type="button" onClick={() => saveGoalEdit(goal)}>Save</button> : <button type="button" onClick={() => { setEditingId(goal.id); setEditingTarget(String(goal.targetAmount)) }} aria-label={`Edit ${goal.name} goal`}>Edit</button>}<button type="button" onClick={() => deleteGoal(goal.id)} aria-label={`Delete ${goal.name} goal`}>Remove</button>{contributionId === goal.id ? <><input className="planner-inline-input" type="number" min="0.01" step="0.01" value={contributionAmount} onChange={event => setContributionAmount(event.target.value)} aria-label={`Contribution for ${goal.name}`} /><button type="button" onClick={() => saveContribution(goal)}>Save</button></> : <button type="button" onClick={() => setContributionId(goal.id)}>+ Add</button>}</div>)}</div>
    <form onSubmit={handleSubmit} className="planner-form">
      <label>Goal name<input type="text" value={name} onChange={event => setName(event.target.value)} placeholder="Travel" /></label>
      <label>Target amount<input type="number" min="0.01" step="0.01" value={targetAmount} onChange={event => setTargetAmount(event.target.value)} placeholder="50000" /></label>
      <label>Target date<input type="date" value={targetDate} onChange={event => setTargetDate(event.target.value)} /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <Button type="submit">Add goal</Button>
    </form>
  </section>
}

function SettingsPage({ categories, budgets, goals, addCategory, addBudget, updateBudget, deleteBudget, addGoal, addGoalContribution, updateGoal, deleteGoal, exportExcel, importExcel, resetData, onNavigate }) {
  const [importMessage, setImportMessage] = useState('')
  const [isImporting, setIsImporting] = useState(false)

  const handleExcelImport = async event => {
    const file = event.target.files?.[0]
    setIsImporting(true)
    const error = await importExcel(file)
    setImportMessage(error ?? 'Excel backup imported successfully.')
    setIsImporting(false)
    event.target.value = ''
  }

  return (
    <div className="simple-page-layout">
      <div className="nav-panel"><Navbar onNavigate={onNavigate} /></div>
      <main className="simple-page">
        <Header />
        <div className="simple-page-content settings-content">
          <div className="section-heading">
            <div><h1>Settings</h1><p>Customize the categories used in your transactions.</p></div>
          </div>
          <section className="card backup-panel">
            <div>
              <h2>Backup your budget</h2>
              <p>Export a copy of your accounts, transactions, currency, and categories.</p>
            </div>
            <div className="backup-actions">
              <Button onClick={exportExcel}>Export Excel</Button>
              <label className="import-button">
                {isImporting ? 'Importing...' : 'Import Excel'}
                <input type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={handleExcelImport} disabled={isImporting} />
              </label>
            </div>
            {importMessage && <p className="backup-message" role="status">{importMessage}</p>}
          </section>
          <section className="card danger-panel">
            <div><h2>Reset budget data</h2><p>Restore the starter accounts and remove transactions, budgets, goals, and custom categories.</p></div>
            <Button onClick={() => { if (window.confirm('Reset all budget data? This cannot be undone.')) resetData() }}>Reset data</Button>
          </section>
          <div className="category-grid">
            <CategoryEditor type="Income" categories={categories.Income} onAddCategory={addCategory} />
            <CategoryEditor type="Expense" categories={categories.Expense} onAddCategory={addCategory} />
          </div>
          <div className="category-grid planner-grid">
            <BudgetEditor categories={categories} budgets={budgets} addBudget={addBudget} updateBudget={updateBudget} deleteBudget={deleteBudget} />
            <GoalEditor goals={goals} addGoal={addGoal} addGoalContribution={addGoalContribution} updateGoal={updateGoal} deleteGoal={deleteGoal} />
          </div>
        </div>
      </main>
    </div>
  )
}

export default SettingsPage
