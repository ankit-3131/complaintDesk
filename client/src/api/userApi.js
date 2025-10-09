import axios from "axios";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
import toast from "react-hot-toast";


export async function signup_API(data) {
  try {
    const response = await axios.post(`${BACKEND_URL}/user/signup`, data, {
      withCredentials: true,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    toast.error(error?.response?.data?.message || "Signup failed due to server issue");
    console.log(error);
  }
}

export async function login_API(data) {
  try {
    const response = await axios.post(`${BACKEND_URL}/user/login`, data, {
      withCredentials: true,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    toast.error(error?.response?.data?.message || "Login failed due to server issue");
    console.log(error);
  }
}

export async function getMe() {
  try {
    const token = localStorage.getItem('token');
    const headers = { Accept: 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await axios.get(`${BACKEND_URL}/user/me`, {
      withCredentials: true,
      headers
    });
    return response.data;
  } catch (error) {
    console.log('getMe error', error?.response?.data || error.message);
    return null;
  }
}