export const STORAGE_KEY = 'budget-tracker-data'

const keyForUser = userId => userId ? `${STORAGE_KEY}:${userId}` : STORAGE_KEY

export const loadBudgetData = (storage, userId) => {
  try {
    const storedData = storage?.getItem(keyForUser(userId))
    if (!storedData) return null
    const parsedData = JSON.parse(storedData)
    if (!Array.isArray(parsedData.accounts) || !Array.isArray(parsedData.transactions)) return null
    return parsedData
  } catch {
    return null
  }
}

export const saveBudgetData = (storage, data, userId) => {
  try {
    storage?.setItem(keyForUser(userId), JSON.stringify(data))
    return true
  } catch {
    return false
  }
}
