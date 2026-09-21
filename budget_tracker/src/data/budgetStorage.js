export const STORAGE_KEY = 'budget-tracker-data'

export const loadBudgetData = (storage) => {
  try {
    const storedData = storage?.getItem(STORAGE_KEY)
    if (!storedData) return null
    const parsedData = JSON.parse(storedData)
    if (!Array.isArray(parsedData.accounts) || !Array.isArray(parsedData.transactions)) return null
    return parsedData
  } catch {
    return null
  }
}

export const saveBudgetData = (storage, data) => {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(data))
    return true
  } catch {
    return false
  }
}
