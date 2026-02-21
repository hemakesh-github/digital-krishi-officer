import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import UserContext from './context/UserContext'

import './index.css'
import './App.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <UserContext>
            <StrictMode>
                <App />
            </StrictMode>
        </UserContext>
    </BrowserRouter>

)

