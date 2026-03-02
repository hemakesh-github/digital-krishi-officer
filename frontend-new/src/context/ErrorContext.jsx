import { createContext, useContext, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

const ErrorContext = createContext(null)

export const ErrorProvider = ({ children }) => {
    const [errors, setErrors] = useState([])
    const { t } = useTranslation()

    const addError = useCallback((errorKey, params = {}) => {
        const id = Date.now() + Math.random()
        const message = t(`errors.${errorKey}`, params.fallback || t('errors.default'))
        
        setErrors(prev => [...prev, { 
            id, 
            key: errorKey, 
            message,
            params,
            timestamp: Date.now()
        }])

        setTimeout(() => {
            setErrors(prev => prev.filter(e => e.id !== id))
        }, 5000)

        return id
    }, [t])

    const removeError = useCallback((id) => {
        setErrors(prev => prev.filter(e => e.id !== id))
    }, [])

    const clearAllErrors = useCallback(() => {
        setErrors([])
    }, [])

    return (
        <ErrorContext.Provider value={{ errors, addError, removeError, clearAllErrors }}>
            {children}
        </ErrorContext.Provider>
    )
}

export const useError = () => {
    const context = useContext(ErrorContext)
    if (!context) {
        throw new Error('useError must be used within ErrorProvider')
    }
    return context
}

export const getErrorMessage = (error, t) => {
    if (!error) return t('errors.default')
    
    const status = error?.response?.status
    const data = error?.response?.data
    const detail = data?.detail || data?.message || ''
    
    if (!error.response) {
        return t('errors.network')
    }

    if (status === 400) {
        if (detail.includes('image') || detail.includes('photo')) {
            return t('errors.invalidImage')
        }
        return t('errors.badRequest')
    }

    if (status === 401) {
        return t('errors.unauthorized')
    }

    if (status === 403) {
        return t('errors.forbidden')
    }

    if (status === 404) {
        return t('errors.notFound')
    }

    if (status === 422) {
        return t('errors.validationError')
    }

    if (status === 429) {
        return t('errors.tooManyRequests')
    }

    if (status >= 500) {
        return t('errors.serverError')
    }

    return t('errors.default')
}
