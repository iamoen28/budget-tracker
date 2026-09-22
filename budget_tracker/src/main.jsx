import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import { AuthProvider } from './auth/AuthContext.jsx'


ReactDOM.createRoot(document.getElementById('root')).render(
	<AuthProvider>
		<App />
	</AuthProvider>
)