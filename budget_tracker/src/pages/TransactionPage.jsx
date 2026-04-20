//transactionhistory page
import React from 'react'
import TransactionList from '../components/Transactions/TransactionCard';
import Header from '../components/Header/Header';

function TransactionPage() {
  return (
    <div className="transaction-page">
      <Header />
      <h1>Transaction History</h1>
      <p>Here you can view all your past transactions in detail.</p>
      {/* Render the transaction list component here, passing in the transaction data as props */}
    </div>
  )
}

export default TransactionPage