//Balance Card Component
import './BalanceCard.css'

const BalanceCard = ({ balance, name }) => {
  return (
    <div className="balance-card">
      <h3>{name}</h3>
      <p>${balance.toFixed(2)}</p>
    </div>
  )
}

export default BalanceCard;