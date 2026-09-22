import { useEffect, useMemo, useState } from 'react'
import { calculateBalances, validateTransaction as validateLedgerTransaction, applyTransaction, summarizeMonth, calculateBudgetSpent, validateBudget, validateGoal, applyGoalContribution } from '../data/budgetLedger.js'
import { loadBudgetData, saveBudgetData } from '../data/budgetStorage.js'
import * as XLSX from 'xlsx'

const createId = () => crypto.randomUUID()
const initialCategories = {
  Income: ['Salary', 'Freelance', 'Investments', 'Other'],
  Expense: ['Food', 'Transport', 'Entertainment', 'Other']
}

const initialAccounts = [
  { id: createId(), name: 'Cash', openingBalance: 500 },
  { id: createId(), name: 'Card', openingBalance: 500 },
  { id: createId(), name: 'Other', openingBalance: 90 },
  { id: createId(), name: 'Savings', openingBalance: 1000 },
  { id: createId(), name: 'Investments', openingBalance: 2000 }
]

const loadStoredData = userId => {
  if (typeof window === 'undefined') return null
  return loadBudgetData(window.localStorage, userId)
}

export default function useBudgetData(userId) {
  const [storedData] = useState(() => loadStoredData(userId))
  const [accounts, setAccounts] = useState(() => storedData?.accounts ?? initialAccounts)
  const [transactions, setTransactions] = useState(() => storedData?.transactions ?? [])
  const [currency, setCurrency] = useState(() => storedData?.currency ?? 'PHP')
  const [categories, setCategories] = useState(() => ({
    Income: Array.isArray(storedData?.categories?.Income) ? storedData.categories.Income : initialCategories.Income,
    Expense: Array.isArray(storedData?.categories?.Expense) ? storedData.categories.Expense : initialCategories.Expense
  }))
  const [budgets, setBudgets] = useState(() => storedData?.budgets ?? [])
  const [goals, setGoals] = useState(() => storedData?.goals ?? [])

  useEffect(() => {
    if (userId) {
      saveBudgetData(window.localStorage, { accounts, transactions, currency, categories, budgets, goals }, userId)
    }
  }, [accounts, transactions, currency, categories, budgets, goals, userId])

  const accountsWithBalances = useMemo(
    () => calculateBalances(accounts, transactions),
    [accounts, transactions]
  )

  const validateTransaction = (transaction, transactionId) => {
    return validateLedgerTransaction(accounts, transactions, transaction, transactionId)
  }

  const addTransaction = transaction => {
    const nextTransaction = { ...transaction, id: createId() }
    const error = validateTransaction(nextTransaction)
    if (error) return error
    if (nextTransaction.type === 'Transfer' && (!Number.isFinite(nextTransaction.feeAmount) || nextTransaction.feeAmount < 0)) {
      return 'Transfer fee must be zero or more.'
    }
    const feeTransaction = nextTransaction.type === 'Transfer' && nextTransaction.feeAmount > 0
      ? { id: createId(), type: 'Expense', accountId: nextTransaction.fromAccountId, category: 'Transfer Fee', amount: nextTransaction.feeAmount, date: nextTransaction.date, time: nextTransaction.time, description: `Fee for ${nextTransaction.description || 'transfer'}`, linkedTransferId: nextTransaction.id }
      : null
    if (feeTransaction) {
      const feeError = validateLedgerTransaction(accounts, [...transactions, nextTransaction], feeTransaction)
      if (feeError) return feeError
    }
    setTransactions(previous => feeTransaction ? [...previous, nextTransaction, feeTransaction] : applyTransaction(previous, nextTransaction))
    return null
  }

  const updateTransaction = (transactionId, transaction) => {
    const nextTransaction = { ...transaction, id: transactionId }
    const linkedFee = transactions.find(current => current.linkedTransferId === transactionId)
    const baseTransactions = transactions.filter(current => current.id !== transactionId && current.id !== linkedFee?.id)
    const error = validateLedgerTransaction(accounts, baseTransactions, nextTransaction)
    if (error) return error
    if (nextTransaction.type === 'Transfer' && (!Number.isFinite(nextTransaction.feeAmount) || nextTransaction.feeAmount < 0)) {
      return 'Transfer fee must be zero or more.'
    }
    const feeTransaction = nextTransaction.type === 'Transfer' && nextTransaction.feeAmount > 0
      ? { id: linkedFee?.id ?? createId(), type: 'Expense', accountId: nextTransaction.fromAccountId, category: 'Transfer Fee', amount: nextTransaction.feeAmount, date: nextTransaction.date, time: nextTransaction.time, description: `Fee for ${nextTransaction.description || 'transfer'}`, linkedTransferId: nextTransaction.id }
      : null
    if (feeTransaction) {
      const feeError = validateLedgerTransaction(accounts, [...baseTransactions, nextTransaction], feeTransaction)
      if (feeError) return feeError
    }
    setTransactions(() => feeTransaction ? [...baseTransactions, nextTransaction, feeTransaction] : [...baseTransactions, nextTransaction])
    return null
  }

  const deleteTransaction = transactionId => {
    setTransactions(previous => previous.filter(transaction => transaction.id !== transactionId && transaction.linkedTransferId !== transactionId))
  }

  const addAccount = (name, openingBalance) => {
    const normalizedName = name.trim()
    if (!normalizedName) return 'Enter an account name.'
    if (!Number.isFinite(openingBalance) || openingBalance < 0) {
      return 'Enter an opening balance of zero or more.'
    }
    if (accounts.some(account => account.name.toLowerCase() === normalizedName.toLowerCase())) {
      return 'An account with that name already exists.'
    }
    setAccounts(previous => [...previous, {
      id: createId(),
      name: normalizedName,
      openingBalance
    }])
    return null
  }

  const renameAccount = (accountId, name) => {
    const normalizedName = name.trim()
    if (!normalizedName) return 'Enter an account name.'
    if (accounts.some(account => account.id !== accountId && account.name.toLowerCase() === normalizedName.toLowerCase())) {
      return 'An account with that name already exists.'
    }
    setAccounts(previous => previous.map(account => account.id === accountId ? { ...account, name: normalizedName } : account))
    return null
  }

  const deleteAccount = accountId => {
    const isReferenced = transactions.some(transaction => (
      transaction.accountId === accountId || transaction.fromAccountId === accountId || transaction.toAccountId === accountId
    ))
    if (isReferenced) return 'This account has transactions and cannot be deleted.'
    if (accounts.length <= 1) return 'Keep at least one account.'
    setAccounts(previous => previous.filter(account => account.id !== accountId))
    return null
  }

  const resetData = () => {
    setAccounts(initialAccounts.map(account => ({ ...account })))
    setTransactions([])
    setCurrency('PHP')
    setCategories({ Income: [...initialCategories.Income], Expense: [...initialCategories.Expense] })
    setBudgets([])
    setGoals([])
  }

  const addCategory = (type, name) => {
    const normalizedName = name.trim()
    if (!normalizedName) return 'Enter a category name.'
    if (!['Income', 'Expense'].includes(type)) return 'Choose Income or Expense.'
    if (categories[type].some(category => category.toLowerCase() === normalizedName.toLowerCase())) {
      return 'That category already exists.'
    }
    setCategories(previous => ({
      ...previous,
      [type]: [...previous[type], normalizedName]
    }))
    return null
  }

  const addBudget = (category, month, limit) => {
    const normalizedCategory = category.trim()
    const error = validateBudget(categories, budgets, normalizedCategory, month, limit)
    if (error) return error
    setBudgets(previous => [...previous, { id: createId(), category: normalizedCategory, month, limit }])
    return null
  }

  const updateBudget = (budgetId, changes) => {
    const existingBudget = budgets.find(budget => budget.id === budgetId)
    if (!existingBudget) return 'Budget not found.'
    const error = validateBudget(categories, budgets, changes.category ?? existingBudget.category, changes.month ?? existingBudget.month, changes.limit, budgetId)
    if (error) return error
    setBudgets(previous => previous.map(budget => budget.id === budgetId ? { ...budget, ...changes } : budget))
    return null
  }

  const deleteBudget = budgetId => setBudgets(previous => previous.filter(budget => budget.id !== budgetId))

  const addGoal = (name, targetAmount, targetDate) => {
    const normalizedName = name.trim()
    const error = validateGoal(goals, normalizedName, targetAmount)
    if (error) return error
    setGoals(previous => [...previous, { id: createId(), name: normalizedName, targetAmount, currentAmount: 0, targetDate }])
    return null
  }

  const addGoalContribution = (goalId, amount) => {
    if (!Number.isFinite(amount) || amount <= 0) return 'Enter a contribution greater than zero.'
    setGoals(previous => previous.map(goal => goal.id === goalId ? applyGoalContribution(goal, amount) : goal))
    return null
  }

  const updateGoal = (goalId, changes) => {
    const existingGoal = goals.find(goal => goal.id === goalId)
    if (!existingGoal) return 'Goal not found.'
    const error = validateGoal(goals, changes.name ?? existingGoal.name, changes.targetAmount, goalId)
    if (error) return error
    setGoals(previous => previous.map(goal => goal.id === goalId ? { ...goal, ...changes } : goal))
    return null
  }

  const deleteGoal = goalId => setGoals(previous => previous.filter(goal => goal.id !== goalId))

  const budgetProgress = budgets.map(budget => ({
    ...budget,
    spent: calculateBudgetSpent(transactions, budget)
  }))

  const validateImportedData = parsedData => {
    if (!Array.isArray(parsedData.accounts) || !Array.isArray(parsedData.transactions)) {
      return 'This file is not a valid budget backup.'
    }
    if (parsedData.accounts.some(account => !account.id || !account.name || !Number.isFinite(account.openingBalance))) {
      return 'The backup contains an invalid account.'
    }
    if (parsedData.transactions.some(transaction => !transaction.id || !transaction.type || !Number.isFinite(transaction.amount))) {
      return 'The backup contains an invalid transaction.'
    }
    return null
  }

  const exportExcel = () => {
    const workbook = XLSX.utils.book_new()
    const categoryRows = [
      ...categories.Income.map(category => ({ Type: 'Income', Category: category })),
      ...categories.Expense.map(category => ({ Type: 'Expense', Category: category }))
    ]
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(accounts), 'Accounts')
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(transactions), 'Transactions')
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(categoryRows), 'Categories')
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(budgets), 'Budgets')
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(goals), 'Goals')
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet([{ Currency: currency }]), 'Settings')
    XLSX.writeFile(workbook, `budget-tracker-backup-${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  const importExcel = async file => {
    if (!file) return 'Choose an Excel backup file.'
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' })
      const importedAccounts = XLSX.utils.sheet_to_json(workbook.Sheets.Accounts ?? {})
      const importedTransactions = XLSX.utils.sheet_to_json(workbook.Sheets.Transactions ?? {})
      const importedCategories = XLSX.utils.sheet_to_json(workbook.Sheets.Categories ?? {})
      const importedBudgets = XLSX.utils.sheet_to_json(workbook.Sheets.Budgets ?? {})
      const importedGoals = XLSX.utils.sheet_to_json(workbook.Sheets.Goals ?? {})
      const importedSettings = XLSX.utils.sheet_to_json(workbook.Sheets.Settings ?? {})
      const parsedData = {
        accounts: importedAccounts,
        transactions: importedTransactions,
        currency: importedSettings[0]?.Currency ?? 'PHP',
        categories: {
          Income: importedCategories.filter(row => row.Type === 'Income').map(row => row.Category).filter(Boolean),
          Expense: importedCategories.filter(row => row.Type === 'Expense').map(row => row.Category).filter(Boolean)
        }
      }
      const error = validateImportedData(parsedData)
      if (error) return error
      if (!parsedData.categories.Income.length || !parsedData.categories.Expense.length) {
        return 'The workbook must contain Income and Expense categories.'
      }
      setAccounts(parsedData.accounts)
      setTransactions(parsedData.transactions)
      setCurrency(parsedData.currency)
      setCategories(parsedData.categories)
      setBudgets(importedBudgets)
      setGoals(importedGoals)
      return null
    } catch {
      return 'Could not read that workbook. Choose a valid Excel backup.'
    }
  }

  return {
    accounts: accountsWithBalances,
    transactions,
    currency,
    setCurrency,
    categories,
    budgets: budgetProgress,
    goals,
    addCategory,
    addBudget,
    updateBudget,
    deleteBudget,
    addGoal,
    addGoalContribution,
    updateGoal,
    deleteGoal,
    exportExcel,
    importExcel,
    currentMonth: summarizeMonth(transactions, new Date().toISOString().slice(0, 7)),
    addAccount,
    renameAccount,
    deleteAccount,
    resetData,
    addTransaction,
    updateTransaction,
    deleteTransaction
  }
}
