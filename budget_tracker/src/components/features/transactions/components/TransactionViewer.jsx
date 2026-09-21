//if i clicked on a transaction, it will show a form and prefill the form with the transaction data, then i can edit the transaction and save it, it will update the transaction data state and the transaction list will be updated with the new data. if i click on a transaction and then click on the delete button, it will delete the transaction from the transaction data state and the transaction list will be updated without that transaction. This will be implemented in the future when the transaction history page is implemented.
import React from 'react'
import TransactionList from './TransactionCard.jsx'

const TransactionViewer = ({ transaction, currency }) => {

  return (
    <div className="transaction-viewer">
      <TransactionList date={transaction.date} time={transaction.time} type={transaction.type} category={transaction.category} accountType={transaction.accountType} amount={transaction.amount} description={transaction.description} currency={currency}/>
    </div>
  )
}

export default TransactionViewer