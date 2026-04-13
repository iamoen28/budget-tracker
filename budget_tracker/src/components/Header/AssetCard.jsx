//The main card for the total amount of all the accounts
const AssetCard = ({ balance }) => {
  return (
    <div className="asset-card">
        <h2>Total Assets</h2>
        <p>${balance.toFixed(2)}</p>
    </div>
  )
}

export default AssetCard