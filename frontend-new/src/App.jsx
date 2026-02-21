import { Routes, Route } from 'react-router-dom'
import AppLayout from './components/AppLayout'
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
            {/* Login — no sidebar */}
            <Route path="/login" element={<Login />} />

            {/* All other pages — wrapped in sidebar layout */}
            <Route path="/" element={
                <AppLayout>
                    <Home />
                </AppLayout>
            } />
            <Route path="/disease" element={
                <AppLayout>
                    <DiseasePrediction />
                </AppLayout>
            } />
            <Route path="/crop-advice" element={
                <AppLayout>
                    <CropAdvice />
                </AppLayout>
            } />
            <Route path="/history" element={
                <AppLayout>
                    <History />
                </AppLayout>
            } />
            <Route path="/disease-result" element={
                <AppLayout>
                    <DiseaseResult />
                </AppLayout>
            } />
            <Route path="/chat" element={
                <AppLayout>
                    <Chat />
                </AppLayout>
            } />
        </Routes>
    )
}

export default App
