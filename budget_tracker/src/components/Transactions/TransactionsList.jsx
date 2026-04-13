//TransactionList for every cards
import React from 'react'
import TransactionList from './TransactionCard.jsx'

const TransactionsList = ({ transactions }) => {
  return (
    <div className="transactions-list">
      {transactions.map((transaction, index) => (
        <TransactionList
          key={index}
          date={transaction.date}
          time={transaction.time}
          type={transaction.type}
          category={transaction.category}
          accountType={transaction.accountType}
          amount={transaction.amount}
          description={transaction.description}
        />
      ))}
    </div>
  )
}

export default TransactionsList