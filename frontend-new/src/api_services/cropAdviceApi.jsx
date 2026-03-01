import { apiClient } from './client'

export const cropAdvice = async (location, query) => {
    try {
        const response = await apiClient.post('crop_advice/new_chat', {
            location,
            query,
        })
        return response.data
    } catch (error) {
        console.error('Error getting crop advice:', error)
        return null
    }
}
