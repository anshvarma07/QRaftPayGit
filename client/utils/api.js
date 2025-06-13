import axios from 'axios';

const API_BASE_URL = 'https://qraftpay.onrender.com';
// const API_BASE_URL = 'http://localhost:8080';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // You can add global request modifications here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.log('Unauthorized access - token may be expired');
    }
    return Promise.reject(error);
  }
);

// Create a new transaction
export const createTransaction = async (token, transactionData) => {
  try {
    const response = await apiClient.post('/transactions', {
      vendorId: transactionData.vendorId,
      amount: transactionData.amount,
      remarks: transactionData.remarks
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Transaction API error:', error.response?.data || error.message);
    throw error;
  }
};

// Get all transactions for the authenticated buyer
export const getTransactions = async (token) => {
  try {
    const response = await apiClient.get('/transactions', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Get transactions API error:', error.response?.data || error.message);
    throw error;
  }
};

// Get transactions filtered by vendor
export const getTransactionsByVendor = async (token, vendorId) => {
  try {
    const response = await apiClient.get(`/transactions?vendorId=${vendorId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Get vendor transactions API error:', error.response?.data || error.message);
    throw error;
  }
};

// Get transaction details by ID
export const getTransactionById = async (token, transactionId) => {
  try {
    const response = await apiClient.get(`/transactions/${transactionId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Get transaction details API error:', error.response?.data || error.message);
    throw error;
  }
};

// Get vendor details
export const getVendorDetails = async (token, vendorId) => {
  try {
    const response = await apiClient.get(`/vendors/${vendorId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Get vendor details API error:', error.response?.data || error.message);
    throw error;
  }
};

// Authentication APIs
export const loginUser = async (credentials) => {
  try {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    console.error('Login API error:', error.response?.data || error.message);
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error('Register API error:', error.response?.data || error.message);
    throw error;
  }
};

export default apiClient;