//Transactionlist component
import Transaction from './Transactions'
const TransactionList = ({ transactions }) => {
  return (
    <div className="transaction-list">
      {transactions.map((tx, index) => (
        <Transaction key={index} date={tx.date} type={tx.type} amount={tx.amount} />
      ))}
    </div>
  )
}

export default TransactionList