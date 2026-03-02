import { apiClient } from './client'

export const getDistricts = async (state, q = '') => {
    try {
        const response = await apiClient.get('location/getDistrict', {
            params: { state, q },
        })
        return response.data
    } catch (error) {
        console.error('Error fetching districts:', error)
        return []
    }
}

export const getCities = async (district, q = '') => {
    try {
        const response = await apiClient.get('location/getCity', {
            params: { district, q },
        })
        return response.data
    } catch (error) {
        console.error('Error fetching cities:', error)
        return []
    }
}
