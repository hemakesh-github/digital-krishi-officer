import axios from 'axios';
import { checkAuth, removeToken } from '../utils/Auth';


const SERVER_URL = "http://127.0.0.1:8000/"


export const genOtp = async (mobileNo) => {
    const formData = new FormData();
    formData.append('mobileNo', mobileNo);
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

export const verifyOtp = async (mobileNo, otp) => {
    const formData = new FormData();
    formData.append('mobileNo', mobileNo);
    formData.append('otp', otp);
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
        const coordinates = await getLatLon(state + ", " + district + ", " + city);
        if (coordinates) {
            //backend api call
        }
    } catch {
        console.log("error")
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


