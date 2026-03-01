import { apiClient, withAuthHeader } from './client'

export const detectDisease = async (imageFile) => {
    try {
        const formData = new FormData()
        formData.append('image', imageFile)

        const response = await apiClient.post('disease/detect', formData, {
            headers: await withAuthHeader({
                'Content-Type': 'multipart/form-data',
            }),
        })

        return response.data
    } catch (error) {
        console.error('Error detecting disease:', error)
        return null
    }
}

export const getDiseaseHistory = async () => {
    try {
        const response = await apiClient.get('disease/history', {
            headers: await withAuthHeader({ 'Content-Type': 'application/json' }),
        })

        return response.data
    } catch (error) {
        console.error('Error fetching disease history:', error)
        return null
    }
}
export const getDiseaseResult = async (sessionId) => {
    try {
        const response = await apiClient.get(`disease/${sessionId}`, {
            headers: await withAuthHeader({ 'Content-Type': 'application/json' }),
        })
        return response.data
    } catch (error) {
        console.error('Error fetching disease result:', error)
        return null
    }
}
