import { useState } from 'react'
import Header from './components/Header/Header.jsx'
import BalanceCard from './components/BalanceCard/BalanceCard.jsx'
import BalanceList from './components/BalanceCard/BalanceList.jsx'
import TransactionCard from './components/Transactions/TransactionCard.jsx'
import TransactionsList from './components/Transactions/TransactionsList.jsx'
import TransactionForm from './components/Transactions/TransactionForm.jsx'
import AssetCard from './components/Header/AssetCard.jsx'


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
  console.log('App component rendered')
  const name = 'Owen'

  const transactiontype = {
    Income: ['Salary', 'Freelance', 'Investments', 'Other'],
    Expense: ['Food', 'Transport', 'Entertainment', 'Other']
  }
  
  const categories = ['Food', 'Transport', 'Entertainment', 'Other'] //soon will be connected to database
  
  //initial account balances, soon will be connected to database
  const [account,setAccounts] = useState([{
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
  }])

  const accountTypes = account.map(account => account.name) //get the account types from the account state, soon will be connected to database

  //dummy transaction data for the past 2 days, soon will be connected to database
  const transactionData = []
  const [transactiondata, setTransactiondata] = useState([])

  //modal
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleAddTransaction = (date, time, type, category, accountType, amount, description) => {
    console.log('New transaction added:', { date, time, type, category, accountType, amount, description })
    setTransactiondata(prev => [...prev, { date, time, type, category, accountType, amount, description }]) //add the new transaction to the transaction data state
    if (type === 'Income') {
      setAccounts(prev => prev.map((account, index) => {
        if (account.name === accountType) {
          return { ...account, balance: account.balance + amount }
        }
        return account
      }))
    } else {
      console.log('Adding expense:', amount)
      setAccounts(prev => prev.map((account, index) => {
        if (account.name === accountType) {
          return { ...account, balance: account.balance - amount }
        }
        return account
      }))
    }
  }


  return (
    <div className="App">  
      <Header />  
      <AssetCard balance={account.reduce((total, account) => total + account.balance, 0)} /> {/*calculate the total balance by summing up the balances of all accounts and pass it as a prop to the AssetCard component*/}
      
      <section className="card" id = "overview">
        <h2>Accounts</h2>
        <BalanceList balances={(account)} />

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <h2>Add Transaction</h2>

          <TransactionForm 
          onAdd={handleAddTransaction}
          categories={transactiontype}
          accountTypes={accountTypes}        
          />  
        </Modal>
        
        <button className="add-transaction-btn" onClick={() => setIsModalOpen(true)}>
        Add Transaction
      </button>
      </section>
      
      <section className="card">
        <h2>Transaction History</h2>
        <p>For the past 2 days</p>

        {/* check if there are transactions in the transaction data state, if there are, render the transaction list component for each transaction, if not, render a message saying there are no transactions yet. */}
        {transactiondata.length > 0 && (
        <TransactionsList transactions={transactiondata} />
        )} 
      </section>

      <section className="card">
        <h2>Budget Insights</h2>
        <p>You have a positive balance. Keep it up!</p>
      </section>
    </div>
  )
}

export default App
