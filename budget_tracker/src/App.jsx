import { useState } from 'react'
//import balancecard
import BalanceList from './components/BalanceList'

//greeting component
const Greeting = ({ name, timeofday }) => {
  return (
    <div>
      <p>Hello, {name}. Good {timeofday}!</p>
    </div>
  )
}
//transaction component formatting for the history section, takes in type and amount as props and formats them for display
const Transaction = ({ type, amount }) => (
  <li>{type}: ${amount.toFixed(2)}</li>
) 

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
const Form = ({ onAdd, categories, accountTypes }) => {
  const [type, setType] = useState('Income')
  const [category, setCategory] = useState(categories[0])
  const [accountType, setAccountType] = useState(accountTypes[0])
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onAdd(type, category, accountType, parseFloat(amount), description)
    setAmount('')
    setDescription('')
  }

  return (
    <form onSubmit={handleSubmit}>
      <Dropdown options={['Income', 'Expense']} value={type} onChange={(e) => setType(e.target.value)} />
      <Dropdown options={categories} value={category} onChange={(e) => setCategory(e.target.value)} />
      <Dropdown options={accountTypes} value={accountType} onChange={(e) => setAccountType(e.target.value)} />
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
        required
      />
      <input 
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
      />
      <button className='save-transaction-btn' type="submit">Save</button>
    </form>
  )
}


//modal component, takes in isOpen and onClose props to control visibility and handle closing. It renders its children content when isOpen is true and provides an overlay that closes the modal when clicked outside of the modal content.
function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {children}
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
      </div>
    </div>
  );
}


//main app component, manages state for the initial balance and modal visibility. It renders the header, navigation, budget overview with current balance, transaction history, and insights sections. It also includes a button to open the modal for adding new transactions.
const App = () => {
  //variables and state
  const name = 'Owen'
  const categories = ['Food', 'Transport', 'Entertainment', 'Other'] //soon will be connected to database
  const inc_categories = ['Salary', 'Freelance', 'Investments', 'Other'] //soon will be connected to database
  const accountTypes = ['Cash', 'Card', 'Other'] //soon will be connected to database
  const Accounts = [{
    name: 'Cash',
    balance: 500
  }, {
    name: 'Card',
    balance: 500
  }, {
    name: 'Other',
    balance: 0
  },{name: 'Savings',
    balance: 1000
  },{
    name: 'Investments',
    balance: 2000
  }]

  const [initialBalance, setCount] = useState(1000)
  const timeofday = datetime => {
    const hour = datetime.getHours()
    if (hour < 12) return 'Morning'
    if (hour < 18) return 'Afternoon'
    return 'Evening'
  }

  //modal
  const [isModalOpen, setIsModalOpen] = useState(false)

  
  return (
    <div className="App">
      <section className="header">
        <h1>Budget Tracker</h1>
        <p>Track your income and expenses with ease.</p>
      </section>

      <nav className="navbar">
        <a href="#overview">Overview</a>
        <a href="#history">History</a>
        <a href="#insights">Insights</a>
        <a href="#settings">Settings</a>
      </nav>

      <section className="card">
        <h2>Welcome to Budget Tracker</h2>
        <Greeting name={name} timeofday={timeofday(new Date())} />
      </section>

      <section className="card" id = "overview">
        <h2>Budget Overview</h2>
        <BalanceList balances={(Accounts)} />
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2>Add Transaction</h2>
          <Form onAdd={(type, category, accountType, amount, description) => {
            console.log('New transaction added:', { type, category, accountType, amount, description })
            if (type === 'Income') {
              
              setCount(prev => prev + amount)
            } else {
                
              setCount(prev => prev - amount)
            }
          }} categories={categories} accountTypes={accountTypes} />  
        </Modal>
        <button className="add-transaction-btn" onClick={() => setIsModalOpen(true)}>
        Add Transaction
      </button>
      </section>
      
      <section className="card">
        <h2>Transaction History</h2>
        <ul>
          <Transaction type="Income" amount={10} />
          <Transaction type="Expense" amount={5} />
        </ul>
      </section>

      <section className="card">
        <h2>Budget Insights</h2>
        <p>You have a positive balance. Keep it up!</p>
      </section>

      

      
    </div>
  )
}

export default App
