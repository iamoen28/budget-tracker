//Balance Card Component
import './BalanceCard.css'

//format balance with commas and 2 decimal places



const BalanceCard = ({ currency, balance, name }) => {
  return (
    <div className="balance-card" onClick={() => console.log({ balance, name })}>
      <p className='name'>{name}</p>
      <p className='bal'>{currency}{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
    </div>
  )
}

export default BalanceCard;