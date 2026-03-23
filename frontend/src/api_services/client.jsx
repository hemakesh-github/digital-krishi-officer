import axios from 'axios'
import i18n from '../i18n'

const SERVER_URL = import.meta.env.VITE_API_URL || "https://digital-krishi-officer-git-backend-48090216647.asia-south1.run.app/"
console.log(SERVER_URL)
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

const SILENT_ENDPOINTS = [
    'getUser',
    '/auth/user',
    'auth/refresh',
    'auth/genOTP',
    'auth/verifyOTP',
]

const shouldShowError = (url) => {
    if (!url) return true
    const normalizedUrl = url.replace(/^\/+/, '').replace(/^https?:\/\/[^/]+\//, '')
    return !SILENT_ENDPOINTS.some(endpoint => 
        normalizedUrl.includes(endpoint) || normalizedUrl.endsWith(endpoint)
    )
}

let onErrorCallback = null
let errorQueue = []

export const setErrorHandler = (callback) => {
    onErrorCallback = callback
    errorQueue.forEach(({ key, error }) => callback(key, error))
    errorQueue = []
}

export const triggerError = (errorKey, error = null) => {
    if (onErrorCallback) {
        onErrorCallback(errorKey, error)
    } else {
        errorQueue.push({ key: errorKey, error })
    }
}

let refreshRequest = null

const wasLoggedIn = () => {
    return sessionStorage.getItem('wasLoggedIn') === 'true'
}

export const setWasLoggedIn = (value) => {
    sessionStorage.setItem('wasLoggedIn', String(value))
}

export const clearWasLoggedIn = () => {
    sessionStorage.removeItem('wasLoggedIn')
}

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config || {}
        const requestUrl = originalRequest?.url || ''
        const statusCode = error?.response?.status

        const isSilentEndpoint = shouldShowError(requestUrl) === false
        const isGetUserCall = requestUrl.includes('auth/getUser')
        
        // Don't show error for getUser on 401 (will attempt refresh)
        if (isSilentEndpoint || (isGetUserCall && statusCode === 401)) {
            return Promise.reject(error)
        }

        const isRefreshCall = requestUrl.includes('auth/refresh')

        if (isRefreshCall && statusCode === 401) {
            clearWasLoggedIn()
            window.location.href = '/login'
            return Promise.reject(error)
        }

        // Check if we should attempt token refresh
        const shouldAttemptRefresh = 
            statusCode === 401 &&
            !originalRequest?._retry &&
            !isRefreshCall &&
            (wasLoggedIn() || isGetUserCall)

        // Only show error if we're NOT attempting refresh
        if (!shouldAttemptRefresh && onErrorCallback) {
            const errorKey = getErrorKey(error)
            onErrorCallback(errorKey, error)
        }

        if (
            statusCode !== 401 ||
            originalRequest?._retry ||
            isRefreshCall ||
            (!wasLoggedIn() && !isGetUserCall)
        ) {
            throw error
        }

        originalRequest._retry = true

        try {
            if (!refreshRequest) {
                refreshRequest = (async () => {
                    try {
                        await apiClient.post('auth/refresh')
                    } catch (e) {
                        refreshRequest = null
                        throw e
                    } finally {
                        refreshRequest = null
                    }
                })()
            }

            await refreshRequest
            return await apiClient(originalRequest)
        } catch (refreshError) {
            clearWasLoggedIn()
            window.location.href = '/login'
            return Promise.reject(refreshError)
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
