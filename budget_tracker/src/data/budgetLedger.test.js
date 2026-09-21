import { describe, expect, it } from 'vitest'
import {
  applyTransaction,
  calculateBalances,
  calculateBudgetSpent,
  applyGoalContribution,
  removeTransaction,
  replaceTransaction,
  summarizeMonth,
  validateBudget,
  validateGoal,
  validateTransaction
} from './budgetLedger.js'
import { loadBudgetData, saveBudgetData, STORAGE_KEY } from './budgetStorage.js'

const accounts = [
  { id: 'cash', name: 'Cash', openingBalance: 100 },
  { id: 'savings', name: 'Savings', openingBalance: 50 }
]

const balanceFor = (transactions, id) => calculateBalances(accounts, transactions).find(account => account.id === id).balance

describe('budget ledger', () => {
  it('applies income and expenses to the selected account', () => {
    const transactions = [
      { id: 'income', type: 'Income', accountId: 'cash', amount: 25, date: '2026-09-10' },
      { id: 'expense', type: 'Expense', accountId: 'cash', amount: 10, date: '2026-09-11' }
    ]
    expect(balanceFor(transactions, 'cash')).toBe(115)
  })

  it('moves transfer value between source and destination accounts', () => {
    const transactions = [{ id: 'transfer', type: 'Transfer', fromAccountId: 'cash', toAccountId: 'savings', amount: 40, date: '2026-09-12' }]
    expect(balanceFor(transactions, 'cash')).toBe(60)
    expect(balanceFor(transactions, 'savings')).toBe(90)
  })

  it('charges a transfer fee as a separate expense on the source account', () => {
    const transactions = [
      { id: 'transfer', type: 'Transfer', fromAccountId: 'cash', toAccountId: 'savings', amount: 40, date: '2026-09-12' },
      { id: 'fee', type: 'Expense', accountId: 'cash', category: 'Transfer Fee', amount: 5, date: '2026-09-12', linkedTransferId: 'transfer' }
    ]
    expect(balanceFor(transactions, 'cash')).toBe(55)
    expect(balanceFor(transactions, 'savings')).toBe(90)
  })

  it('rejects invalid amounts, same-account transfers, and negative balances', () => {
    const base = []
    expect(validateTransaction(accounts, base, { type: 'Expense', accountId: 'cash', amount: 0 })).toContain('greater than zero')
    expect(validateTransaction(accounts, base, { type: 'Transfer', fromAccountId: 'cash', toAccountId: 'cash', amount: 1 })).toContain('different accounts')
    expect(validateTransaction(accounts, base, { type: 'Expense', accountId: 'cash', amount: 101 })).toContain('negative')
  })

  it('supports editing and deleting transactions', () => {
    const original = { id: 'expense', type: 'Expense', accountId: 'cash', amount: 10, date: '2026-09-10' }
    const edited = { ...original, amount: 25 }
    const afterEdit = replaceTransaction(applyTransaction([], original), original.id, edited)
    expect(balanceFor(afterEdit, 'cash')).toBe(75)
    expect(removeTransaction(afterEdit, original.id)).toEqual([])
  })

  it('summarizes income, expenses, and net for a month', () => {
    const summary = summarizeMonth([
      { type: 'Income', amount: 200, date: '2026-09-01' },
      { type: 'Expense', amount: 75, date: '2026-09-02' },
      { type: 'Expense', amount: 20, date: '2026-08-02' }
    ], '2026-09')
    expect(summary).toEqual({ income: 200, expenses: 75, net: 125 })
  })
})

describe('budget persistence', () => {
  it('saves and reloads accounts, transactions, and currency', () => {
    const values = new Map()
    const storage = {
      getItem: key => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value)
    }
    const data = { accounts, transactions: [{ id: 'income', amount: 25 }], currency: 'USD' }
    expect(saveBudgetData(storage, data)).toBe(true)
    expect(storage.getItem(STORAGE_KEY)).toBeTruthy()
    expect(loadBudgetData(storage)).toEqual(data)
  })

  it('falls back when saved data is malformed', () => {
    const storage = { getItem: () => '{bad json' }
    expect(loadBudgetData(storage)).toBeNull()
  })
})

describe('budgets and savings goals', () => {
  const categories = { Income: ['Salary'], Expense: ['Food', 'Travel'] }

  it('calculates actual spending for a category and month', () => {
    const budget = { category: 'Food', month: '2026-09' }
    const transactions = [
      { type: 'Expense', category: 'Food', amount: 40, date: '2026-09-04' },
      { type: 'Expense', category: 'Food', amount: 25, date: '2026-08-04' },
      { type: 'Expense', category: 'Travel', amount: 100, date: '2026-09-04' }
    ]
    expect(calculateBudgetSpent(transactions, budget)).toBe(40)
  })

  it('validates budgets and prevents duplicate category-month limits', () => {
    const existing = [{ id: 'food-september', category: 'Food', month: '2026-09', limit: 5000 }]
    expect(validateBudget(categories, existing, 'Food', '2026-09', 6000)).toContain('already exists')
    expect(validateBudget(categories, existing, 'Travel', 'bad-month', 100)).toContain('valid budget month')
    expect(validateBudget(categories, existing, 'Food', '2026-09', 0)).toContain('greater than zero')
    expect(validateBudget(categories, existing, 'Food', '2026-09', 6000, 'food-september')).toBeNull()
  })

  it('validates unique savings goals and caps contributions at the target', () => {
    const goals = [{ id: 'travel', name: 'Travel', targetAmount: 1000, currentAmount: 900 }]
    expect(validateGoal(goals, 'travel', 2000)).toContain('already exists')
    expect(validateGoal(goals, 'Gift', 0)).toContain('greater than zero')
    expect(validateGoal(goals, 'Travel', 2000, 'travel')).toBeNull()
    expect(applyGoalContribution(goals[0], 250).currentAmount).toBe(1000)
  })
})
