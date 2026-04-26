//The main card for the total amount of all the accounts
const AssetCard = ({ balance, currency }) => {
  return (
    <div className="asset-card">
        <h2>Total Balance</h2>
        
        <p>{currency}{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
    </div>
  )
}

export default AssetCard