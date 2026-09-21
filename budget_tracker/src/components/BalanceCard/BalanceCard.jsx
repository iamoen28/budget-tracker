//Balance Card Component
import './BalanceCard.css'

//format balance with commas and 2 decimal places



const BalanceCard = ({ currency, balance, name, onClick }) => {
  return (
    <button className="balance-card" type="button" onClick={onClick} aria-label={`View ${name} transactions`}>
      <div className="account-card-mark" aria-hidden="true">$</div>
      <p className='name'>{name}</p>
      <p className='bal'>{currency}{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
    </button>
  )
}

export default BalanceCard;