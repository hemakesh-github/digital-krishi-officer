import { apiClient, clearWasLoggedIn } from '../api_services/client'

export const setToken = async () => true

export const getToken = async () => null

export const removeToken = async () => true

export const checkAuth = async () => {
    try {
        const response = await apiClient.get('auth/getUser')
        return Boolean(response?.data?.success)
    } catch {
        return false
    }
}

export const logout = async () => {
    clearWasLoggedIn()
    try {
        await apiClient.post('auth/logout')
    } catch (error) {
        console.error('Logout failed:', error)
    }
}