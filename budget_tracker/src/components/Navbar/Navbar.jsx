//navbar component that will be used across the app for navigation and branding

import './Navbar.css'
import { useAuth } from '../../auth/useAuth.js'

const Navbar = ({ onNavigate }) => {
    const { user, signOut } = useAuth()
    const handleNavigate = (event, path) => {
        event.preventDefault()
        onNavigate(path)
    }

    return (
        <div className="navbar">
            <ul className="nav-links">
                <li><a href="/" onClick={(event) => handleNavigate(event, '/')}>Home</a></li>
                <li><a href="/transactions" onClick={(event) => handleNavigate(event, '/transactions')}>Transactions</a></li>
                <li><a href="/accounts" onClick={(event) => handleNavigate(event, '/accounts')}>Accounts</a></li>
                <li><a href="/insights" onClick={(event) => handleNavigate(event, '/insights')}>Insights</a></li>
                <li><a href="/settings" onClick={(event) => handleNavigate(event, '/settings')}>Settings</a></li>
                <li className="nav-user"><span>{user?.email}</span><button type="button" onClick={signOut}>Sign out</button></li>
            </ul>
        </div>
    )
}

export default Navbar