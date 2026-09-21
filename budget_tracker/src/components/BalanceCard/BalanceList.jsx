//shows the balance of each account type and the total balance. It will be a card that is displayed on the budget overview page. It will take in the balance as a prop and display it in a nice format.
import BalanceCard from './BalanceCard.jsx'


const BalanceList = ({ currency, balances, children }) => {
  return (
    <div className="balance-list"> 
    {children}
      {balances.map((account, index) => (
        <BalanceCard
          key={index}
          currency={currency}
          balance={account.balance}
          name={account.name}
        />
      ))}
        
    </div>
  )
}


export default BalanceList