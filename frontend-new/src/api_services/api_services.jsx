import axios from 'axios';
import { checkAuth, getToken } from '../utils/Auth';


axios.defaults.withCredentials = true;


const SERVER_URL = "https://192.168.0.100:8000/"


export const genOtp = async (mobileNo, userType) => {
    const formData = new FormData();
    formData.append('mobileNo', mobileNo);
    formData.append('userType', userType);
    console.log("Sending OTP request...");
    const response = await axios.post(`${SERVER_URL}auth/genOTP/`, formData, {
        headers: {
            'Content-Type': 'application/json'
        }
    }).then((response) => {
        return response.data;
    }).catch((error) => {
        console.error('Error:', error);
        return null;
    });
    return response;
}

export const verifyOtp = async (mobileNo, otp, userType) => {
    const formData = new FormData();
    formData.append('mobileNo', mobileNo);
    formData.append('otp', otp);
    formData.append('userType', userType);
    const response = await axios.post(`${SERVER_URL}auth/verifyOTP/`, formData, {
        headers: {
            'Content-Type': 'application/json'
        }
    }).then((response) => {
        return response.data;
    }).catch((error) => {
        console.error('Error:', error);
        return null;
    });
    return response;
}

export const getWeather = async (state, district, city) => {
    try {
        let coordinates = await getLatLon(`${city}, ${district}, ${state}`)
        if (!coordinates) {
            console.log(coordinates, state, district, city)
            coordinates = await getLatLon(`${state}, ${district}`)
        }
        const response = await axios.get(`${SERVER_URL}getWeatherData`, {
            params: { lat: coordinates.lat, lon: coordinates.lon }
        })
        return response.data   // [ hourlyArray, advisoryObj ]
    } catch (err) {
        console.error('Error fetching weather:', err)
        return null
    }
}


export const getDistricts = async (state, q = "") => {
    const response = await axios.get(`${SERVER_URL}getDistrict`, {
        params: { state, q }
    }).then((response) => {
        return response.data;
    }).catch((error) => {
        console.error('Error fetching districts:', error);
        return [];
    });
    return response;
}

export const getCities = async (district, q = "") => {
    const response = await axios.get(`${SERVER_URL}getCity`, {
        params: { district, q }
    }).then((response) => {
        return response.data;
    }).catch((error) => {
        console.error('Error fetching cities:', error);
        return [];
    });
    return response;
}
const getLatLon = async (search) => {
    if (!search.trim()) return;
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}`
        );
        const results = await response.json();
        if (results && results.length > 0) {
            const { lat, lon } = results[0];
            return { "lat": lat, "lon": lon };
        }
    } catch (err) {
        console.log("Error fetching weather", err)
    }
}

export const getUser = async () => {
    try {
        const response = await axios.get(`${SERVER_URL}getUser`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${await getToken()}`
            },
            withCredentials: true
        })
        console.log(response.data)
        return response.data
    } catch (error) {
        console.error('Error fetching user:', error)
        return null
    }
}


export const getMessages = async (sessionId) => {
    const response = await axios.get(`${SERVER_URL}chat/${sessionId}`)
    console.log(response.data)
    return response.data
}

export const addMessage = async (message) => {
    const response = await axios.post(`${SERVER_URL}chat/message`, message)
    console.log(response.data)
    return response.data
}


export const cropAdvice = async (crop, location, query) => {
    try {
        const response = await axios.post(`${SERVER_URL}crop_advice`, {
            crop,
            location,
            query
        })
        return response.data // { message: ... }
    } catch (error) {
        console.error('Error getting crop advice:', error)
        return null
    }
}

export const cropAdviceContinue = async (sessionId, query) => {
    const response = await axios.post(`${SERVER_URL}crop_advice/${sessionId}`, { "query": query })
    console.log(response.data)
    return response.data
}


export const getHistory = async (userId) => {
    const token = await getToken();
    try {
        const response = await axios.post(`${SERVER_URL}history`, {"userId": userId}, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        withCredentials: true
    })
        console.log(response.data)
        return response.data
    } catch (error) {
        console.error('Error fetching history:', error)
        return null
    }
}





