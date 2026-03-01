import axios from 'axios'

const SERVER_URL = 'https://192.168.0.100:8000/'

axios.defaults.withCredentials = true

export const apiClient = axios.create({
    baseURL: SERVER_URL,
    withCredentials: true,
})

export const withAuthHeader = async (headers = {}) => {
    return headers
}

let refreshRequest = null

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config || {}
        const requestUrl = originalRequest?.url || ''
        const statusCode = error?.response?.status

        if (
            statusCode !== 401 ||
            originalRequest?._retry ||
            requestUrl.includes('auth/refresh')
        ) {
            throw error
        }

        originalRequest._retry = true

        try {
            if (!refreshRequest) {
                refreshRequest = (async () => {
                    try {
                        await apiClient.post('auth/refresh')
                    } finally {
                        refreshRequest = null
                    }
                })()
            }

            await refreshRequest
            return await apiClient(originalRequest)
        } catch (refreshError) {
            throw refreshError
        }
    }
)

export const getLatLon = async (search) => {
    if (!search?.trim()) return null

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}`
        )
        const results = await response.json()

        if (results?.length > 0) {
            const { lat, lon } = results[0]
            return { lat, lon }
        }
    } catch (error) {
        console.error('Error fetching coordinates:', error)
    }

    return null
}
