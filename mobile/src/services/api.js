import { Platform } from 'react-native';
import { getItem, StorageKeys } from '../utils/storage';
import { BACKEND_URL } from '../config/constants';

export const API_BASE_URL = BACKEND_URL || 'http://10.227.21.51:5000';

const getAuthHeaders = async () => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  try {
    const token = await getItem(StorageKeys.AUTH_TOKEN);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (_) {}
  return headers;
};

/**
 * Fetch branches from backend API GET /api/branches
 */
export const fetchBranchesFromApi = async (params = {}) => {
  const queryParts = [];
  if (params.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
  if (params.isActive !== undefined) queryParts.push(`isActive=${params.isActive}`);
  const query = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/branches${query}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || `HTTP ${response.status}: Failed to fetch branches`);
  }

  const data = await response.json();
  const branches = data?.branches || data?.data || (Array.isArray(data) ? data : []);

  return {
    success: true,
    count: branches.length,
    branches,
    fromLiveBackend: true,
  };
};

/**
 * Fetch list of managers from backend API GET /api/users/managers
 */
export const fetchManagersFromApi = async () => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/users/managers`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || `HTTP ${response.status}: Failed to fetch managers`);
  }

  const data = await response.json();
  let managersList = [];
  if (Array.isArray(data)) {
    managersList = data;
  } else if (data && Array.isArray(data.managers)) {
    managersList = data.managers;
  } else if (data && Array.isArray(data.users)) {
    managersList = data.users;
  } else if (data && Array.isArray(data.data)) {
    managersList = data.data;
  }

  return {
    success: true,
    count: managersList.length,
    managers: managersList,
    fromLiveBackend: true,
  };
};

/**
 * Create a new branch via POST /api/branches
 * Payload: { name, address, phone, email, manager_id, isActive }
 */
export const createBranchApi = async (branchData) => {
  const headers = await getAuthHeaders();
  const payload = {
    name: branchData.name?.trim(),
    address: branchData.address?.trim() || '',
    phone: branchData.phone?.trim() || '',
    email: branchData.email?.trim() || '',
    manager_id: branchData.manager_id || null,
    isActive: branchData.isActive !== false,
  };

  const response = await fetch(`${API_BASE_URL}/api/branches`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || `HTTP ${response.status}: Failed to create branch`);
  }

  const data = await response.json();
  const branch = data.branch || data.data || data;

  return {
    success: true,
    branch,
    fromLiveBackend: true,
    message: data.message || 'Branch created successfully',
  };
};

/**
 * Fetch all users from backend API GET /api/users
 */
export const fetchUsersFromApi = async () => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/users`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || `HTTP ${response.status}: Failed to fetch users`);
  }

  const data = await response.json();
  const users = data?.users || data?.data || (Array.isArray(data) ? data : []);

  return {
    success: true,
    count: users.length,
    users,
    fromLiveBackend: true,
  };
};

/**
 * Register a new user via POST /api/auth/register
 * Payload: { name, email, username, password, mobile, role }
 */
export const registerUserApi = async (userData) => {
  const headers = await getAuthHeaders();
  const payload = {
    name: userData.name?.trim(),
    email: userData.email?.trim(),
    username: userData.username?.trim(),
    password: userData.password,
    mobile: userData.mobile?.trim() || '',
    role: userData.role || 'customer',
  };

  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || `HTTP ${response.status}: Failed to register user`);
  }

  const data = await response.json();
  const user = data?.user || data?.data || data;

  return {
    success: true,
    user,
    message: data.message || 'User registered successfully',
  };
};

