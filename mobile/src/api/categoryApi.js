import { Platform } from 'react-native';
import axiosInstance from './axiosInstance';
import { API_ENDPOINTS } from '../constants/config';

/**
 * Category API Service
 * Handles GET /api/category and POST /api/category
 */
export const categoryApi = {
  /**
   * Fetch all categories
   * GET /api/category
   * @returns {Promise<Array>} List of categories with { name, imageUrl, numberProducts }
   */
  getCategories: async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.CATEGORY);
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.data)) return data.data;
      if (data && Array.isArray(data.categories)) return data.categories;
      return [];
    } catch (err) {
      // In case backend is on plural 'categories'
      if (err.status === 404) {
        const altResponse = await axiosInstance.get('categories');
        const altData = altResponse.data;
        if (Array.isArray(altData)) return altData;
        if (altData && Array.isArray(altData.data)) return altData.data;
        return [];
      }
      throw err;
    }
  },

  /**
   * Create a new category
   * POST /api/category
   * If image is not selected, NO default image is sent.
   * @param {object} payload - { name, imageUri }
   * @returns {Promise<object>} Created category object
   */
  createCategory: async (payload) => {
    const categoryName = (payload.name || '').trim();
    const hasImage = Boolean(payload.imageUri && typeof payload.imageUri === 'string' && payload.imageUri.trim().length > 0);

    const formData = new FormData();
    formData.append('name', categoryName);

    // ONLY append image if user explicitly selected one from gallery
    if (hasImage) {
      const uri = payload.imageUri;
      const filename = uri.split('/').pop() || `category_${Date.now()}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const ext = match ? match[1].toLowerCase() : 'jpg';
      const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

      const fileObj = {
        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
        name: filename,
        type: mimeType,
      };

      formData.append('image', fileObj);
      formData.append('file', fileObj);
    }

    try {
      // Send multipart form-data (compatible with Spring Boot @ModelAttribute CategoryRequestDTO)
      const response = await axiosInstance.post(API_ENDPOINTS.CATEGORY, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (err) {
      if (err.status === 404) {
        const altResponse = await axiosInstance.post('categories', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return altResponse.data;
      }

      // JSON fallback if server expects JSON body instead of multipart
      try {
        const jsonBody = { name: categoryName };
        if (hasImage) {
          jsonBody.imageUrl = payload.imageUri;
        }
        // Notice: NO default image is sent when hasImage is false
        const jsonResponse = await axiosInstance.post(API_ENDPOINTS.CATEGORY, jsonBody);
        return jsonResponse.data;
      } catch {
        throw err;
      }
    }
  },
};

export default categoryApi;
