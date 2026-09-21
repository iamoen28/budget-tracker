import './TransactionCard.css'

//transaction history list item component


const TransactionList = ({ date, time, type, category, accountId, fromAccountId, toAccountId, amount, description, currency, accounts = [] }) => {
  const accountName = (id) => accounts.find(account => account.id === id)?.name ?? 'Unknown account'
  const accountLabel = type === 'Transfer'
    ? `${accountName(fromAccountId)} to ${accountName(toAccountId)}`
    : accountName(accountId)

  const normalizedAmount = parseFloat(amount)
  const amountPrefix = type === 'Income' ? '+' : type === 'Expense' ? '-' : ''
  const title = description || category || 'Transaction'
  const detailLabel = type === 'Transfer' && amount ? `${category || 'Account transfer'} · ${accountLabel}` : `${category || 'Account transfer'} · ${accountLabel}`

  return (
    <article className={`transaction-tile transaction-${type.toLowerCase()}`}>
      <div className="transaction-icon" aria-hidden="true">
        {type === 'Income' ? '+' : type === 'Expense' ? '-' : '->'}
      </div>
      <div className="transaction-details">
        <strong>{title}</strong>
        <span>{detailLabel}</span>
        <time dateTime={`${date}T${time}`}>{date} · {time}</time>
      </div>
      <strong className="transaction-amount">
        {amountPrefix}{currency}{normalizedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </strong>
    </article>
  )
}



export default TransactionList