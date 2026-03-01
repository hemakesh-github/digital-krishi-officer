import { apiClient, getLatLon } from './client'

export const getWeather = async (state, district, city) => {
    try {
        const fixedState = 'Andhra Pradesh'
        let coordinates = await getLatLon(`${city}, ${district}, ${fixedState}`)

        if (!coordinates) {
            coordinates = await getLatLon(`${fixedState}, ${district}`)
        }

        if (!coordinates) {
            return null
        }

        const response = await apiClient.get('weather/getWeatherData', {
            params: { lat: coordinates.lat, lon: coordinates.lon },
        })

        return response.data
    } catch (error) {
        console.error('Error fetching weather:', error)
        return null
    }
}
