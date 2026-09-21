//Header component, displays the app title
import './Header.css'

const Header = () => {
  const timeofday = datetime => {
  const hour = datetime.getHours()
  if (hour < 12) return 'Morning'
  if (hour < 18) return 'Afternoon'
  return 'Evening'
  }

  return(
  <div className='header'>
    <h1>Budget Tracker</h1>
    <p>Track your income and expenses with ease.</p>
     <p>Good {timeofday(new Date())}!</p>
  </div>
  )
}

export default Header