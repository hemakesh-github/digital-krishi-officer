import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import Header from './components/Header'
function App() {

    return (
        <div className='h-full bg-linear-to-b from-[#E8F5E9] via-[#C8E6C9] to-[#A5D6A7]'>
            <Header/>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
            </Routes>
        </div>
    )
}

export default App
