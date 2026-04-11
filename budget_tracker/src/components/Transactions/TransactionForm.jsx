//this is the component for the form that will be used to add transactions
import { useState } from 'react'



//dropdown component for selecting type, category, and account type
const Dropdown = ({ options, value, onChange }) => (
  <select value={value} onChange={onChange}>
    {options.map((option) => (
      <option key={option} value={option}>
        {option}
      </option>
    ))}
  </select>
)

//create a form component for adding transactions, with dropdowns for type, category, and account type, and input fields for amount and description. It should handle form submission and call the onAdd function passed as a prop with the transaction details.
const TransactionForm = ({ onAdd, categories, accountTypes }) => {


  const [type, setType] = useState('Income') //state for the type of transaction, default is income 
  //category should be based on the type, so if type is income, category should be based on the income categories, and if type is expense, category should be based on the expense categories. This will be implemented in the future when the categories are connected to the database.
  const [category, setCategory] = useState(categories['Income'][0]) //state for the category of the transaction, default is the first category in the list
  const [accountType, setAccountType] = useState(accountTypes[0]) //state for the account type of the transaction, default is the first account type in the list
  const [amount, setAmount] = useState('') //state for the amount of the transaction, default is an empty string
  const [description, setDescription] = useState('') //state for the description of the transaction, default is an empty string

  const handleTypeChange = (e) => {
    const selectedType = e.target.value
    setType(selectedType) //update the type state when the type dropdown value changes
    setCategory(categories[selectedType][0]) //reset the category to the first category in the list when the type changes
  }

  const handleSubmit = (e) => {
      e.preventDefault() //prevent the default form submission behavior
      onAdd(type, category, accountType, parseFloat(amount), description) //call the onAdd function passed as a prop with the transaction details
      setAmount('') //reset the amount field to an empty string
      setDescription('') //reset the description field to an empty string
  }

  return (
      <form onSubmit={handleSubmit}>
          <Dropdown options={['Income', 'Expense', 'Transfer']} value={type} onChange={handleTypeChange} />
          <Dropdown options={categories[type]} value={category} onChange={(e) => setCategory(e.target.value)} />
          <Dropdown options={accountTypes} value={accountType} onChange={(e) => setAccountType(e.target.value)} />
          <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
          />
          <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
          />
          <button type="submit">Add Transaction</button>
      </form>
  )

}

export default TransactionForm