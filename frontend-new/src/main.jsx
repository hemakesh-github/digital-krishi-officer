import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import UserContext from './context/UserContext'
import { ErrorProvider } from './context/ErrorContext'
import { setErrorHandler } from './api_services/client'
import { useError } from './context/ErrorContext'
import ErrorAlert from './components/ErrorAlert'
import './i18n'

import './index.css'
import './App.css'
import App from './App.jsx'

function ErrorHandler() {
    const { addError } = useError()
    
    setErrorHandler((errorKey, error) => {
        addError(errorKey)
    })
    
    return <ErrorAlert />
}

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <UserContext>
            <ErrorProvider>
                <StrictMode>
                    <ErrorHandler />
                    <App />
                </StrictMode>
            </ErrorProvider>
        </UserContext>
    </BrowserRouter>
)

