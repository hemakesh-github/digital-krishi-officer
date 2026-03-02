import axios from 'axios'
import i18n from '../i18n'

const SERVER_URL = import.meta.env.VITE_API_URL || 'https://192.168.0.100:8000/'

axios.defaults.withCredentials = true

export const apiClient = axios.create({
    baseURL: SERVER_URL,
    withCredentials: true,
})

export const withAuthHeader = async (headers = {}) => {
    return headers
}

const getErrorKey = (error) => {
    const status = error?.response?.status
    const detail = error?.response?.data?.detail || ''
    
    if (!error.response) {
        if (error.code === 'ECONNABORTED') {
            return 'serverBusy'
        }
        return 'network'
    }

    if (status === 400) {
        if (detail?.includes('image') || detail?.includes('photo') || detail?.includes('file')) {
            return 'invalidImage'
        }
        return 'badRequest'
    }

    if (status === 401) {
        return 'unauthorized'
    }

    if (status === 403) {
        return 'sessionExpired'
    }

    if (status === 404) {
        return 'notFound'
    }

    if (status === 422) {
        return 'validationError'
    }

    if (status === 429) {
        return 'tooManyRequests'
    }

    if (status >= 500) {
        return 'serverError'
    }

    return 'default'
}

let onErrorCallback = null

export const setErrorHandler = (callback) => {
    onErrorCallback = callback
}

let refreshRequest = null

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config || {}
        const requestUrl = originalRequest?.url || ''
        const statusCode = error?.response?.status

        if (onErrorCallback) {
            const errorKey = getErrorKey(error)
            onErrorCallback(errorKey, error)
        }

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
