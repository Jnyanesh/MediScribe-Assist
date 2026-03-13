import axios from 'axios';
import {BASE_URL} from "@/app/data/data";
import {clearToken, setToken} from "@/lib/auth";

export const login = async (email, password) => {
    try {
        const response = await axios.post(`${BASE_URL}/login`, {
            email,
            password,
        });

        console.log(response.data);

        await setToken(response.data.token)

        return response?.data;
    } catch (error) {
        return error.response?.data;
    }
}

export const signUp = async (email, password) => {
    try {
        const response = await axios.post(`${BASE_URL}/auth/signup`, {
            email,
            password,
            verification: "link"
        });
        return response?.data;
    } catch (error) {
        return error.response?.data;
    }
}

export const forgotPassword = async (data) => {
    try {
        const response = await axios.post(`${BASE_URL}/auth/forgot-password`, {
            email: data?.email,
            phone: data?.phone,
        });
        return response?.data;
    } catch (error) {
        return error.response?.data;
    }
}

export const verifyEmail = async (email, otp) => {
    try {
        const response = await axios.post(`${BASE_URL}/auth/verify-email`, {
            email,
            otp,
        });
        return response?.data;
    } catch (error) {
        return error.response?.data;
    }
}

export const verifyPhone = async (phone_code, phone, otp) => {
    try {
        const response = await axios.patch(`${BASE_URL}/auth/verify-phone`, {
                phone_code,
                phone,
                otp,
            },
        );
        console.log(response);
        return response?.data;
    } catch (error) {
        return error.response?.data;
    }
}

export const changePassword = async (data) => {
    try {
        const response = await axios.patch(`${BASE_URL}/auth/reset-password`, {
            email: data?.email,
            phone: data?.phone,
            password: data?.password,
            otp: data?.otp
        });
        return response?.data;
    } catch (error) {
        return error.response?.data;
    }
}

export const resendOTP = async (email) => {
    try {
        const response = await axios.post(`${BASE_URL}/auth/resend-otp`, {
            email,
        });
        return response?.data;
    } catch (error) {
        return error.response?.data;
    }
}

export const verifyOTP = async (email, otp) => {
    try {
        const response = await axios.post(`${BASE_URL}/auth/verify-otp`, {
            email,
            otp,
        });
        return response?.data;
    } catch (error) {
        return error.response?.data;
    }
}

export const resetPassword = async (email, password) => {
    try {
        const response = await axios.post(`${BASE_URL}/auth/reset-password`, {
            email,
            password,
        });
        return response?.data;
    } catch (error) {
        return error.response?.data;
    }
}

export const logout = async () => {
    try {
        await clearToken();
        const response = await axios.post(`${BASE_URL}/auth/logout`);
        return response?.data;
    } catch (error) {
        return error.response?.data;
    }
}