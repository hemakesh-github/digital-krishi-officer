import { apiClient, withAuthHeader, setWasLoggedIn } from './client'

export const genOtp = async (email, userType) => {
    const response = await apiClient.post('auth/genOTP', { email, userType }, {
        headers: { 'Content-Type': 'application/json' },
    })
    return response.data
}

export const verifyOtp = async (email, otp, userType) => {
    const response = await apiClient.post('auth/verifyOTP', { email, otp, userType }, {
        headers: { 'Content-Type': 'application/json' },
    })
    if (response.data?.success) {
        setWasLoggedIn(true)
    }
    return response.data
}

export const getUser = async () => {
    try {
        const response = await apiClient.get('auth/getUser', {
            headers: await withAuthHeader({ 'Content-Type': 'application/json' }),
        })
        return response.data
    } catch (error) {
        console.error('Error fetching user:', error)
        return null
    }
}
