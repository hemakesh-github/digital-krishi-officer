import { useContext } from 'react'
import { UserContextData } from '../context/UserContext'
import AppLayout from '../components/AppLayout'
import AdminDashboardContent from './admin/AdminDashboard'
import ExpertDashboardContent from './ExpertDashboard'
import Home from './Home'

export default function Dashboard() {
    const { type } = useContext(UserContextData)

    return (
        <AppLayout>
            {type === 'admin' && <AdminDashboardContent />}
            {type === 'expert' && <ExpertDashboardContent />}
            {type === 'farmer' && <Home />}
        </AppLayout>
    )
}
