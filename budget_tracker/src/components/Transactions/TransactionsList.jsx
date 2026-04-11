//transaction history list item component
const TransactionList = ({ date, time, type, category, accountType, amount, description }) => (
  <li>
    {date} at {time}: {type} - {category} ({accountType}): ${parseFloat(amount).toFixed(2)} - {description}
  </li>
)

export default TransactionList