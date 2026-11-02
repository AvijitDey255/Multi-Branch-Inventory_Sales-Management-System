import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL, STORAGE_KEYS } from '../constants/config';

// Create dedicated axios instance with base URL
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Automatically inject Bearer JWT token if stored
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.warn('Error reading token from storage:', err);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Uniform error handling & token expiration detection
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response) {
      // Server returned error status code (e.g. 400, 401, 403, 500)
      if (error.response.status === 401) {
        console.warn('Unauthorized request - session may be expired');
      }
      return Promise.reject({
        status: error.response.status,
        message:
          error.response.data?.message ||
          error.response.data?.error ||
          'Server returned an error. Please try again.',
        data: error.response.data,
      });
    } else if (error.request) {
      // Request made but no response received (network failure, offline, wrong host)
      return Promise.reject({
        status: 0,
        message: `Network error. Unable to connect to backend server at ${BASE_URL}. Ensure your phone or emulator is on the same network.`,
      });
    } else {
      return Promise.reject({
        status: -1,
        message: error.message || 'An unexpected error occurred.',
      });
    }
  }
);

export default axiosInstance;

