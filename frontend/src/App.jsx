import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import DiseasePrediction from './pages/DiseasePrediction'
import CropAdvice from './pages/CropAdvice'
import History from './pages/History'
import DiseaseResult from './pages/DiseaseResult'
import Chat from './pages/Chat'
import Dashboard from './pages/Dashboard'
import AddExpert from './pages/admin/AddExpert'
import AppLayout from './components/AppLayout'
import NotificationToast from './components/NotificationToast'
import { useContext } from 'react'
import { UserContextData } from './context/UserContext'

// Requires login only; role-switching is done inside Dashboard.jsx
function ProtectedRoute({ children }) {
    const { email, loading } = useContext(UserContextData)
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-3 border-green-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-gray-500 text-sm">Loading...</span>
                </div>
            </div>
        )
    }
    if (!email) return <Navigate to="/login" replace />
    return children
}

// Farmer-only pages: redirect experts/admins to /dashboard
function FarmerRoute({ children }) {
    const { type, email, loading } = useContext(UserContextData)
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-3 border-green-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-gray-500 text-sm">Loading...</span>
                </div>
            </div>
        )
    }
    if (!email) return <Navigate to="/login" replace />
    if (type === 'expert' || type === 'admin') return <Navigate to="/dashboard" replace />
    return children
}

function App() {
    return (
        <>
            <NotificationToast />
            <Routes>
                {/* Login */}
                <Route path="/login" element={<Login />} />

                {/* Unified dashboard — renders admin / expert / farmer content by role */}
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                } />

                {/* Farmer-only pages */}
                <Route path="/addexpert" element={<ProtectedRoute><AppLayout><AddExpert /></AppLayout></ProtectedRoute>} />
                <Route path="/" element={<FarmerRoute><AppLayout><Home /></AppLayout></FarmerRoute>} />
                <Route path="/disease" element={<FarmerRoute><AppLayout><DiseasePrediction /></AppLayout></FarmerRoute>} />
                <Route path="/crop-advice" element={<FarmerRoute><AppLayout><CropAdvice /></AppLayout></FarmerRoute>} />
                <Route path="/history" element={<FarmerRoute><AppLayout><History /></AppLayout></FarmerRoute>} />
                <Route path="/disease/:sessionId" element={<FarmerRoute><AppLayout><DiseaseResult /></AppLayout></FarmerRoute>} />
                <Route path="/chat" element={<ProtectedRoute><AppLayout><Chat /></AppLayout></ProtectedRoute>} />
            </Routes>
        </>
    )
}

export default App
