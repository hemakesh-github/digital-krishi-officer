import { apiClient, withAuthHeader } from './client'

export const genOtp = async (mobileNo, userType) => {
    const formData = new FormData()
    formData.append('mobileNo', mobileNo)
    formData.append('userType', userType)

    try {
        const response = await apiClient.post('auth/genOTP', formData, {
            headers: { 'Content-Type': 'application/json' },
        })
        return response.data
    } catch (error) {
        console.error('Error:', error)
        return null
    }
}

export const verifyOtp = async (mobileNo, otp, userType) => {
    const formData = new FormData()
    formData.append('mobileNo', mobileNo)
    formData.append('otp', otp)
    formData.append('userType', userType)

    try {
        const response = await apiClient.post('auth/verifyOTP', formData, {
            headers: { 'Content-Type': 'application/json' },
        })
        return response.data
    } catch (error) {
        console.error('Error:', error)
        return null
    }
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
