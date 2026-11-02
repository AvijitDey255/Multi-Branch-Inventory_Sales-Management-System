import axiosInstance from './axiosInstance';
import { API_ENDPOINTS } from '../constants/config';

/**
 * Variants API Service
 * Handles GET /api/variants and POST /api/variants
 */
export const variantsApi = {
  /**
   * Fetch all product variants grouped by type
   * GET /api/variants
   * @returns {Promise<object>} Map of variant type to array of { id, name, value }
   */
  getVariants: async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.VARIANTS);
      const data = response.data;
      if (data && typeof data === 'object') {
        if (data.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
          return data.data;
        }
        return data;
      }
      return {};
    } catch (err) {
      throw err;
    }
  },

  /**
   * Create a new variant
   * POST /api/variants
   * Sends name and value to backend
   * @param {object} payload - { name: string, value: string }
   * @returns {Promise<object>} Created variant response
   */
  createVariant: async (payload) => {
    const variantName = (payload.name || '').trim();
    const variantValue = (payload.value || '').trim();

    const requestData = {
      name: variantName,
      value: variantValue,
    };

    // Both body and URL query params sent to support Spring Boot @ModelAttribute and @RequestBody
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.VARIANTS, requestData, {
        params: {
          name: variantName,
          value: variantValue,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (err) {
      // Fallback: Send using FormData for multipart/form-data
      try {
        const formData = new FormData();
        formData.append('name', variantName);
        formData.append('value', variantValue);

        const formResponse = await axiosInstance.post(API_ENDPOINTS.VARIANTS, formData, {
          params: {
            name: variantName,
            value: variantValue,
          },
        });
        return formResponse.data;
      } catch {
        throw err;
      }
    }
  },
};

export default variantsApi;
