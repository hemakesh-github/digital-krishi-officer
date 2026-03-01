import { apiClient, withAuthHeader } from './client'

export const getHistory = async (userId) => {
    try {
        const response = await apiClient.post('users/history', { userId }, {
            headers: await withAuthHeader({ 'Content-Type': 'application/json' }),
        })
        return response.data
    } catch (error) {
        console.error('Error fetching history:', error)
        return null
    }
}
