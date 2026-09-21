export const calculateBalances = (accounts, transactions) => accounts.map(account => {
  const balance = transactions.reduce((total, transaction) => {
    if (transaction.type === 'Income' && transaction.accountId === account.id) return total + transaction.amount
    if (transaction.type === 'Expense' && transaction.accountId === account.id) return total - transaction.amount
    if (transaction.type === 'Transfer' && transaction.fromAccountId === account.id) return total - transaction.amount
    if (transaction.type === 'Transfer' && transaction.toAccountId === account.id) return total + transaction.amount
    return total
  }, account.openingBalance)

  return { ...account, balance }
})

export const validateTransaction = (accounts, transactions, transaction, transactionId) => {
  if (!Number.isFinite(transaction.amount) || transaction.amount <= 0) {
    return 'Enter an amount greater than zero.'
  }
  if (transaction.type === 'Transfer' && transaction.fromAccountId === transaction.toAccountId) {
    return 'Transfers must use two different accounts.'
  }

  const candidateTransactions = transactionId
    ? transactions.map(current => current.id === transactionId ? transaction : current)
    : [...transactions, transaction]
  const candidateAccounts = calculateBalances(accounts, candidateTransactions)

  if (candidateAccounts.some(account => account.balance < 0)) {
    return 'This transaction would make an account balance negative.'
  }
  return null
}

export const applyTransaction = (transactions, transaction) => [...transactions, transaction]

export const replaceTransaction = (transactions, transactionId, transaction) => transactions.map(current => (
  current.id === transactionId ? transaction : current
))

export const removeTransaction = (transactions, transactionId) => transactions.filter(
  transaction => transaction.id !== transactionId
)

export const summarizeMonth = (transactions, month) => {
  const summary = transactions.reduce((result, transaction) => {
    if (!transaction.date.startsWith(month)) return result
    if (transaction.type === 'Income') result.income += transaction.amount
    if (transaction.type === 'Expense') result.expenses += transaction.amount
    return result
  }, { income: 0, expenses: 0 })

  return { ...summary, net: summary.income - summary.expenses }
}

export const calculateBudgetSpent = (transactions, budget) => transactions.reduce((total, transaction) => (
  transaction.type === 'Expense' && transaction.category === budget.category && transaction.date.startsWith(budget.month)
    ? total + transaction.amount
    : total
), 0)

export const validateBudget = (categories, budgets, category, month, limit, budgetId) => {
  if (!categories.Expense.includes(category)) return 'Choose a valid expense category.'
  if (!/^\d{4}-\d{2}$/.test(month)) return 'Choose a valid budget month.'
  if (!Number.isFinite(limit) || limit <= 0) return 'Enter a budget greater than zero.'
  if (budgets.some(budget => budget.id !== budgetId && budget.category === category && budget.month === month)) {
    return 'A budget already exists for this category and month.'
  }
  return null
}

export const validateGoal = (goals, name, targetAmount, goalId) => {
  const normalizedName = name.trim()
  if (!normalizedName) return 'Enter a goal name.'
  if (!Number.isFinite(targetAmount) || targetAmount <= 0) return 'Enter a target greater than zero.'
  if (goals.some(goal => goal.id !== goalId && goal.name.toLowerCase() === normalizedName.toLowerCase())) {
    return 'A goal with that name already exists.'
  }
  return null
}

export const applyGoalContribution = (goal, amount) => ({
  ...goal,
  currentAmount: Math.min(goal.targetAmount, goal.currentAmount + amount)
})
