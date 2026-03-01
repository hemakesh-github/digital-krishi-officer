import { apiClient, withAuthHeader } from './client'

export const getExpertDashboard = async () => {
    try {
        const response = await apiClient.get('expert/dashboard', {
            headers: await withAuthHeader({ 'Content-Type': 'application/json' }),
        })
        return response.data
    } catch (error) {
        console.error('Error fetching expert dashboard:', error)
        return { pending: [], answered: [] }
    }
}

export const sendExpertReply = async (sessionId, content) => {
    try {
        const response = await apiClient.post('expert/expertAdvice', {
            sessionId,
            content,
            role: 'expert',
        }, {
            headers: await withAuthHeader({ 'Content-Type': 'application/json' }),
        })

        return response.data
    } catch (error) {
        console.error('Error sending expert reply:', error)
        return null
    }
}

