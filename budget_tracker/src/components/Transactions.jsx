//transaction history list item component
const Transaction = ({ date ,type, amount }) => (
  <li>{date}: {type}: ${amount.toFixed(2)}</li>
)

export default Transaction