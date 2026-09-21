//Transaction cards
import React from 'react'

//transaction history list item component


const TransactionList = ({ date, time, type, category, accountType, amount, description, currency }) => (

  <div className='card' onClick={() => console.log({ date, time, type, category, accountType, amount, description })}>
      {date} at {time}: 
      {type} - {category} ({accountType}): 
      {currency}{parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} - 
      {description}
  </div>
)



export default TransactionList