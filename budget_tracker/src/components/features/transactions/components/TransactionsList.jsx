//TransactionList for every cards
import React from 'react'
import TransactionList from './TransactionCard.jsx'


//attach a click handler


const TransactionsList = ({ transactions, currency, accounts }) => {

  return (
    <div className="transactions-list">
      
      {transactions.map((transaction) => (
        <TransactionList
          key={transaction.id}
          date={transaction.date}
          time={transaction.time}
          type={transaction.type}
          category={transaction.category}
          accountId={transaction.accountId}
          fromAccountId={transaction.fromAccountId}
          toAccountId={transaction.toAccountId}
          amount={transaction.amount}
          description={transaction.description}
          currency={currency}
          accounts={accounts}
        />
      ))}
    </div>
  )
}

export default TransactionsList