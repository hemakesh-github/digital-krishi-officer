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
        }    }).then((response) => {
        return response.data;
    }).catch((error) => {
        console.error('Error:', error);
        return null;
    });
    return response;
}


