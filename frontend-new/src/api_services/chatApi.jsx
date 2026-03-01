import { apiClient } from './client'

export const getMessages = async (sessionId) => {
    const response = await apiClient.get(`chat/${sessionId}`)
    return response.data
}

export const addMessage = async (message) => {
    const response = await apiClient.post('chat/message', message)
    return response.data
}

export const cropAdviceContinue = async (sessionId, query) => {
    const response = await apiClient.post(`crop_advice/continue_chat/${sessionId}`, { query })
    return response.data
}
