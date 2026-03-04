import { apiClient, withAuthHeader } from './client'

export const getHistory = async (userId = null) => {
    try {
        const url = userId ? `users/history?userId=${userId}` : 'users/history'
        const response = await apiClient.get(url, {
            headers: await withAuthHeader({ 'Content-Type': 'application/json' }),
        })
        return response.data
    } catch (error) {
        console.error('Error fetching history:', error)
        return null
    }
}
