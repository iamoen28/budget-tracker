//This will be the home page for the budget tracker application
import React from 'react'
import { useState } from 'react'
import BalanceCard from '../components/BalanceCard/BalanceCard';
import BalanceList from '../components/BalanceCard/BalanceList';
import AssetCard from '../components/Header/AssetCard';
import TransactionCard from '../components/features/transactions/components/TransactionCard';
import TransactionsList from '../components/features/transactions/components/TransactionsList';
import TransactionForm from '../components/features/transactions/components/TransactionForm';
import Header from '../components/Header/Header';
import Button from '../components/Button/Button';
import Modal from '../components/Modal/Modal';



function Home() {
  //variables and state
  console.log('Home component rendered')
  const name = 'Owen'
  const currency = 'P'
  const transactiontype = {
    Income: ['Salary', 'Freelance', 'Investments', 'Other'],
    Expense: ['Food', 'Transport', 'Entertainment', 'Other']
  }

  const [account,setAccounts] = useState([{
      name: 'Cash',
      balance: 500
    }, {
      name: 'Card',
      balance: 500
    }, {
      name: 'Other',
      balance: 90
    },{name: 'Savings',
      balance: 1000
    },{
      name: 'Investments',
      balance: 2000
    }])

  const accountTypes = account.map(account => account.name) //get the account types from the account state, soon will be connected to database
  const [transactiondata, setTransactiondata] = useState([]) //state for the transaction data, default is an empty array
  const [isModalOpen, setIsModalOpen] = useState(false) //state for the modal visibility, default is false
  const [isaddaccountmodalopen, setIsAddAccountModalOpen] = useState(false) //state for the add account modal visibility, default is false

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

  const handleTransactionClick = (transaction) => {
    console.log('Transaction clicked:', transaction)
  }

  //When the transaction card is clicked, it will pop a modal that shows the details of the transaction, and gives the option to edit or delete the transaction. This will be implemented in the future when the transaction history page is implemented.
  const handleViewTransactionHistory = () => {
    console.log('View Transaction History button clicked')
  }





  return (
    <div className="Home">  
      <Header />  

      <section className="card">
        <AssetCard currency={currency} balance={account.reduce((total, account) => total + account.balance, 0)} /> {/*calculate the total balance by summing up the balances of all accounts and pass it as a prop to the AssetCard component*/} 
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <h2>Add Transaction</h2>
          <TransactionForm onAdd={handleAddTransaction} categories={transactiontype} accountTypes={accountTypes} />
           
        </Modal>
        
        <Button onClick={() => setIsModalOpen(true)}>
          Add Transaction
        </Button>
      </section>
      
      <section className="card" id = "overview">
        <h2>Accounts</h2>
        <BalanceList currency={currency} balances={(account)} />
        <Modal isOpen={isaddaccountmodalopen} onClose={() => setIsAddAccountModalOpen(false)}>
          <h2>Add Account</h2>
          
          <input type="text" placeholder="Account Name" />
          <input type="number" placeholder="Initial Balance" />
          <Button onClick={() => 
            //add account to the account state, get the values from the input fields, and close the modal
              {
                const accountName = document.querySelector('.modal input[type="text"]').value
                const initialBalance = parseFloat(document.querySelector('.modal input[type="number"]').value)
                setAccounts(prev => [...prev, { name: accountName, balance: initialBalance }])
                setIsAddAccountModalOpen(false)
              }
            }>Add Account
            
            </Button> 
           
        </Modal>
        
        <Button onClick={() => setIsAddAccountModalOpen(true)}>
          Add Account
        </Button>
        
      </section>
      
      <section className="card">
        <h2>Recent Transactions</h2>
        <button onClick={() => console.log('View Transaction History button clicked')}>
          View Transaction History
        </button>


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

export default Home;