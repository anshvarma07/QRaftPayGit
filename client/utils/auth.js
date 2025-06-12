import axios from 'axios';
import Constants from 'expo-constants';

const API_BASE_URL = 'https://qraftpay.onrender.com';

export async function login(email, password) {
  try {
    const res = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password,
    });

    console.log('Full response data:', res.data);

    const token = res.data.data?.token;
    const user = res.data.data?.user;

    return {
      success: true,
      token,
      user,
      message: res.data.message || 'Login successful',
    };
  } catch (err) {
    console.error('Login error:', err);

    if (err.response && err.response.data) {
      return {
        success: false,
        message: err.response.data.message || 'Login failed',
      };
    }

    return { success: false, message: 'Network error' };
  }
}


export async function register(name, email, password, role) {
  try {
    console.log('Registering with:', {name, email, password, role });

    const res = await axios.post(`${API_BASE_URL}/auth/register`, {
      name,
      email,
      password,
      role
    });

    // Axios automatically parses JSON response
    return { success: true, data: res.data };
  } catch (err) {
    console.error('Registration error:', err);

    // Handle errors returned from the server
    if (err.response && err.response.data) {
      return {
        success: false,
        message: err.response.data ,
      };
    }

    // Fallback for network errors
    return { success: false, message: 'Network error' };
  }
}