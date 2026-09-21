//The main card for the total amount of all the accounts
const AssetCard = ({ balance, currency,children }) => {
  return (
    <div className="asset-card">
        <h3>Total Balance</h3>
        
        <p>{currency}{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        {children}
    </div>
  )
}

export default AssetCard