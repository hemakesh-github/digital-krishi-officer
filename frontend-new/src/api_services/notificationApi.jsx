import { apiClient } from './client'

export const getNotifications = async () => {
    try {
        const response = await apiClient.get('users/notifications')
        return response.data || []
    } catch (e) {
        console.error('Error fetching notifications:', e)
        return []
    }
}

export const markNotificationRead = async (notifId) => {
    try {
        const response = await apiClient.post(`users/notifications/${notifId}/read`)
        return response.data
    } catch (e) {
        console.error('Error marking notification read:', e)
        return { success: false }
    }
}
