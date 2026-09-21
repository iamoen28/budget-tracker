//The main card for the total amount of all the accounts
const AssetCard = ({ balance, currency, isVisible, onToggleVisibility, children }) => {
  return (
    <div className="asset-card">
        <div className="asset-card-copy">
          <h3>Total Balance</h3>
          <p aria-label={isVisible ? `Total balance ${currency}${balance.toFixed(2)}` : 'Total balance hidden'}>
            {isVisible ? `${currency}${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '******'}
          </p>
        </div>
        <div className="asset-card-actions">
          <button
            className="balance-visibility-button"
            type="button"
            aria-label={isVisible ? 'Hide total balance' : 'Show total balance'}
            aria-pressed={!isVisible}
            onClick={onToggleVisibility}
          >
            {isVisible ? 'Hide' : 'Show'}
          </button>
          {children}
        </div>
    </div>
  )
}

export default AssetCard