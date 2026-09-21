//this is the component for the form that will be used to add transactions
import { useState } from 'react'
import Button from '../../../Button/Button';



//dropdown component for selecting type, category, and account type
const Dropdown = ({ options, value, onChange }) => (
  <select value={value} onChange={onChange}>
    {options.map((option) => (
      <option key={typeof option === 'string' ? option : option.value} value={typeof option === 'string' ? option : option.value}>
        {typeof option === 'string' ? option : option.label}
      </option>
    ))}
  </select>
)

//create a form component for adding transactions, with dropdowns for type, category, and account type, and input fields for amount and description. It should handle form submission and call the onAdd function passed as a prop with the transaction details.
const TransactionForm = ({ onAdd, categories, accounts, initialTransaction, submitLabel = 'Add Transaction' }) => {
  const [date, setDate] = useState(initialTransaction?.date ?? new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' }))
  const [time, setTime] = useState(initialTransaction?.time ?? new Date().toLocaleTimeString('en-GB', {
      timeZone: 'Asia/Manila',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }))

  const [type, setType] = useState(initialTransaction?.type ?? 'Income')
  const [category, setCategory] = useState(initialTransaction?.category ?? categories.Income[0])
  const [accountId, setAccountId] = useState(initialTransaction?.accountId ?? accounts[0]?.id ?? '')
  const [fromAccountId, setFromAccountId] = useState(initialTransaction?.fromAccountId ?? accounts[0]?.id ?? '')
  const [toAccountId, setToAccountId] = useState(initialTransaction?.toAccountId ?? accounts[1]?.id ?? accounts[0]?.id ?? '')
  const [amount, setAmount] = useState(initialTransaction?.amount?.toString() ?? '')
  const [feeAmount, setFeeAmount] = useState(initialTransaction?.feeAmount?.toString() ?? '')
  const [description, setDescription] = useState(initialTransaction?.description ?? '')
  const [error, setError] = useState('')

  const handleTypeChange = (e) => {
    const selectedType = e.target.value
    setType(selectedType) //update the type state when the type dropdown value changes
    setCategory(categories[selectedType]?.[0] ?? '')
  }

  const handleSubmit = (e) => {
      e.preventDefault()
      const result = onAdd({
        date,
        time,
        type,
        category,
        amount: Number(amount),
        description,
        ...(type === 'Transfer' ? { fromAccountId, toAccountId, feeAmount: Number(feeAmount) || 0 } : { accountId })
      })
      if (result) {
        setError(result)
        return
      }
      setError('')
      if (!initialTransaction) {
        setAmount('')
        setFeeAmount('')
        setDescription('')
      }
  }

  return (
      <form onSubmit={handleSubmit}>
        <label>Date<input aria-label="Transaction date" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
        <label>Time<input aria-label="Transaction time" type="time" value={time} onChange={(e) => setTime(e.target.value)} /></label>
        <label>Type<Dropdown options={['Income', 'Expense', 'Transfer']} value={type} onChange={handleTypeChange} /></label>
        {type !== 'Transfer' && (
          <label>Category<Dropdown options={categories[type]} value={category} onChange={(e) => setCategory(e.target.value)} /></label>
        )}
        {type === 'Transfer' ? (
          <>
            <label>From account<Dropdown options={accounts.map(account => ({ value: account.id, label: account.name }))} value={fromAccountId} onChange={(e) => setFromAccountId(e.target.value)} /></label>
            <label>To account<Dropdown options={accounts.map(account => ({ value: account.id, label: account.name }))} value={toAccountId} onChange={(e) => setToAccountId(e.target.value)} /></label>
            <label>Transfer fee (optional)<input aria-label="Transfer fee" type="number" min="0" step="0.01" placeholder="0.00" value={feeAmount} onChange={(e) => setFeeAmount(e.target.value)} /></label>
          </>
        ) : (
          <label>Account<Dropdown options={accounts.map(account => ({ value: account.id, label: account.name }))} value={accountId} onChange={(e) => setAccountId(e.target.value)} /></label>
        )}
        <label>Amount<input
            aria-label="Amount"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
        /></label>
        <label>Description<input
            aria-label="Description"
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
        /></label>
        {error && <p role="alert">{error}</p>}
        <Button type="submit">{submitLabel}</Button>
      </form>
  )
}

export default TransactionForm