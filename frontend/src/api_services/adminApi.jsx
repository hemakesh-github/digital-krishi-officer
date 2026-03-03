import { apiClient } from './client'

export const fetchAdminDashboard = async () => {
    const res = await apiClient.get('admin/dashboard')
    return res.data
}

export const addExpert = async ({ name, email }) => {
    const res = await apiClient.post('admin/addExpert', { name, email })
    return res.data
}
