import { Platform } from 'react-native';

/**
 * Application Constants & Backend API Configuration
 */


export const BACKEND_URL = "http://10.110.246.51:5000";
export const BACKEND_API = `${BACKEND_URL}/api`;
export const API_BASE_URL = BACKEND_API;

export const API_ROUTES = {
  LOGIN: `${BACKEND_API}/auth/login`,
  GET_ME: `${BACKEND_API}/auth/me`,
  BRANCHES: `${BACKEND_API}/branches`,
  MANAGERS: `${BACKEND_API}/users/managers`,
  USERS: `${BACKEND_API}/users`,
  REGISTER: `${BACKEND_API}/auth/register`,
};

export default {
  BACKEND_URL,
  BACKEND_API,
  API_BASE_URL,
  API_ROUTES,
};
