//Balance Card Component
import './BalanceCard.css'

const BalanceCard = ({ currency, balance, name }) => {
  return (
    <div className="balance-card">
      <p>{name}</p>
      <p className='bal'>{currency}{balance.toFixed(2)}</p>
    </div>
  )
}

export default BalanceCard;