//transaction history list item component
const TransactionList = ({ date ,type, amount }) => (
  <li>{date}: {type}: ${amount.toFixed(2)}</li>
)

export default TransactionList