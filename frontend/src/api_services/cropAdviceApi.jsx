import { apiClient } from './client'

export const cropAdvice = async (location, query, user_language) => {
    try {
        const response = await apiClient.post('crop_advice/new_chat', {
            location,
            query,
            user_language
        })
        return response.data
    } catch (error) {
        console.error('Error getting crop advice:', error)
        return null
    }
}
