//Balance Card Component
import './BalanceCard.css'

//format balance with commas and 2 decimal places


const BalanceCard = ({ currency, balance, name }) => {
  return (
    <div className="balance-card">
      <p>{name}</p>
      <p className='bal'>{currency}{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
    </div>
  )
}

export default BalanceCard;