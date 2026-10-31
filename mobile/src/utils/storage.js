import AsyncStorage from '@react-native-async-storage/async-storage';

export const StorageKeys = {
  THEME_MODE: '@app_theme_mode',
  AUTH_USER: '@app_auth_user',
  AUTH_TOKEN: '@app_auth_token',
  PROJECTS: '@app_projects',
  BUSINESS_PROFILE: '@app_business_profile',
};

// In-memory fallback in case native storage is unavailable or in non-native environments
const memoryFallback = new Map();

export const saveItem = async (key, value) => {
  const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
  try {
    if (AsyncStorage && typeof AsyncStorage.setItem === 'function') {
      await AsyncStorage.setItem(key, stringValue);
    }
  } catch (e) {
    console.warn('AsyncStorage setItem warning (using fallback):', e?.message || e);
  } finally {
    memoryFallback.set(key, stringValue);
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(key, stringValue);
      } catch (_) {}
    }
  }
};

export const getItem = async (key, isJson = false) => {
  let val = null;
  try {
    if (AsyncStorage && typeof AsyncStorage.getItem === 'function') {
      val = await AsyncStorage.getItem(key);
    }
  } catch (e) {
    console.warn('AsyncStorage getItem warning (checking fallback):', e?.message || e);
  }

  // Check web localStorage if not found yet
  if (!val && typeof window !== 'undefined' && window.localStorage) {
    try {
      val = window.localStorage.getItem(key);
    } catch (_) {}
  }

  // Check in-memory fallback
  if (!val && memoryFallback.has(key)) {
    val = memoryFallback.get(key);
  }

  if (!val) return null;

  try {
    return isJson ? JSON.parse(val) : val;
  } catch {
    return val;
  }
};

export const removeItem = async (key) => {
  try {
    if (AsyncStorage && typeof AsyncStorage.removeItem === 'function') {
      await AsyncStorage.removeItem(key);
    }
  } catch (e) {
    console.warn('AsyncStorage removeItem warning:', e?.message || e);
  } finally {
    memoryFallback.delete(key);
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(key);
      } catch (_) {}
    }
  }
};

/**
 * Cookie Utilities for Web Environment
 */
export const getCookie = (name) => {
  if (typeof document === 'undefined') return null;
  try {
    const match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[2]) : null;
  } catch (_) {
    return null;
  }
};

export const setCookie = (name, value, days = 30) => {
  if (typeof document === 'undefined') return;
  try {
    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
  } catch (_) {}
};

export const deleteCookie = (name) => {
  if (typeof document === 'undefined') return;
  try {
    document.cookie = `${name}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  } catch (_) {}
};

