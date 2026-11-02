/**
 * Application Constants and Configuration
 * Backend API Configuration
 */

export const BASE_URL = 'http://10.187.109.51:8080/api/';

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: 'auth/login',
  LOGOUT: 'auth/logout',
  ME: 'auth/me',

  // Products & Inventory
  PRODUCTS: 'products',
  PRODUCT_BY_ID: (id) => `products/${id}`,
  CATEGORIES: 'category',
  CATEGORY: 'category',
  VARIANTS: 'variants',
  STOCKS: 'stocks',

  // Branches
  BRANCHES: 'branches',
  BRANCH_BY_ID: (id) => `branches/${id}`,

  // Orders & Sales
  ORDERS: 'orders',
  ORDER_BY_ID: (id) => `orders/${id}`,

  // Customers
  CUSTOMERS: 'customers',
  CUSTOMER_BY_ID: (id) => `customers/${id}`,

  // Dashboard & Reports
  DASHBOARD_STATS: 'reports/dashboard',
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',
  USER_DATA: '@auth_user',
  THEME_MODE: '@app_theme_mode',
};

