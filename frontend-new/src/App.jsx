import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import DiseasePrediction from './pages/DiseasePrediction'
import CropAdvice from './pages/CropAdvice'
import History from './pages/History'
import DiseaseResult from './pages/DiseaseResult'
import Chat from './pages/Chat'

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/disease" element={<DiseasePrediction />} />
            <Route path="/crop-advice" element={<CropAdvice />} />
            <Route path="/history" element={<History />} />
            <Route path="/disease-result" element={<DiseaseResult />} />
            <Route path="/chat" element={<Chat />} />
        </Routes>
    )
}

export default App
