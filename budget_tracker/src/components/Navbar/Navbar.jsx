//navbar component that will be used across the app for navigation and branding

import './Navbar.css'

const Navbar = () => {
    return (
        <div className="navbar">
            <ul className="nav-links">
                <li><a href="/">Home</a></li>
                <li><a href="/transactions">Transactions</a></li>
                <li><a href="/accounts">Accounts</a></li>
                <li><a href="/insights">Insights</a></li>
            </ul>
        </div>
    )
}

export default Navbar