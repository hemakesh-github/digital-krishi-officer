import { apiClient, withAuthHeader } from './client'

const getFriendlyDiseaseError = (error) => {
    const status = error?.response?.status

    if (!status) {
        return 'Could not connect right now. Please check your internet and try again.'
    }

    if (status === 400) {
        return 'We could not read this photo. Please upload a clear crop image and try again.'
    }

    if (status === 401 || status === 403) {
        return 'Your session has expired. Please sign in again and retry.'
    }

    if (status === 503) {
        return 'Service is temporarily busy. Please try again in a few minutes.'
    }

    return 'We could not analyze the image right now. Please try again.'
}

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
        return {
            success: false,
            userMessage: getFriendlyDiseaseError(error),
        }
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
