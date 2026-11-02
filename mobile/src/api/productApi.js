import { Platform } from 'react-native';
import axiosInstance from './axiosInstance';
import { API_ENDPOINTS } from '../constants/config';

/**
 * Product API Service
 * Handles GET /api/products and POST /api/products
 */
export const productApi = {
  /**
   * Fetch all products
   * GET /api/products
   * @returns {Promise<Array>} List of product objects
   */
  getProducts: async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.PRODUCTS);
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.data)) return data.data;
      if (data && Array.isArray(data.products)) return data.products;
      return [];
    } catch (err) {
      throw err;
    }
  },

  /**
   * Create a new product
   * POST /api/products
   * Supports multipart/form-data with gallery image and Spring Boot @ModelAttribute ProductRequest
   * @param {object} payload
   * @returns {Promise<object>} Created product response
   */
  createProduct: async (payload) => {
    const formData = new FormData();

    // Required & Basic product fields
    if (payload.name) formData.append('name', payload.name.trim());
    if (payload.mrp != null && payload.mrp !== '') formData.append('mrp', String(payload.mrp));
    if (payload.selling_price != null && payload.selling_price !== '') {
      formData.append('selling_price', String(payload.selling_price));
    }
    if (payload.stock_quantity != null && payload.stock_quantity !== '') {
      formData.append('stock_quantity', String(payload.stock_quantity));
    }

    // Category: name is "category" and value is category ID (e.g. 1)
    const rawCat = payload.category != null ? payload.category : payload.categoryId;
    const catId = typeof rawCat === 'object' && rawCat !== null ? rawCat.id : rawCat;
    if (catId != null && catId !== '') {
      formData.append('category', String(catId));
    }

    // Helper to safely extract variant ID
    const extractId = (val) => {
      if (val == null || val === '') return null;
      if (typeof val === 'object' && val.id != null) return val.id;
      return val;
    };

    // Variants attributes: name is attribute name and value is variant ID (e.g. brand -> 3)
    const packId = extractId(payload.packagingTyp != null ? payload.packagingTyp : payload.packagingType);
    if (packId != null) {
      formData.append('packagingTyp', String(packId));
      formData.append('packagingType', String(packId));
    }

    const volumeId = extractId(payload.volume);
    if (volumeId != null) {
      formData.append('volume', String(volumeId));
    }

    const brandId = extractId(payload.brand);
    if (brandId != null) {
      formData.append('brand', String(brandId));
    }

    const unitsId = extractId(payload.units);
    if (unitsId != null) {
      formData.append('units', String(unitsId));
    }

    const sizeId = extractId(payload.size);
    if (sizeId != null) {
      formData.append('size', String(sizeId));
    }

    const colorId = extractId(payload.color);
    if (colorId != null) {
      formData.append('color', String(colorId));
    }

    const weightId = extractId(payload.weight);
    if (weightId != null) {
      formData.append('weight', String(weightId));
    }

    // Image from device gallery
    if (payload.imageUri) {
      const uri = payload.imageUri;
      const filename = uri.split('/').pop() || `prod_${Date.now()}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const ext = match ? match[1].toLowerCase() : 'jpg';
      const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

      const fileObj = {
        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
        name: filename,
        type: mimeType,
      };

      formData.append('image', fileObj);
    }

    try {
      const response = await axiosInstance.post(API_ENDPOINTS.PRODUCTS, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (err) {
      // Fallback to JSON payload if server expects application/json
      try {
        const jsonBody = {
          name: payload.name,
          mrp: payload.mrp,
          selling_price: payload.selling_price,
          stock_quantity: payload.stock_quantity,
          category: catId != null ? Number(catId) : undefined,
          packagingTyp: packId != null ? Number(packId) : undefined,
          packagingType: packId != null ? Number(packId) : undefined,
          volume: volumeId != null ? Number(volumeId) : undefined,
          brand: brandId != null ? Number(brandId) : undefined,
          units: unitsId != null ? Number(unitsId) : undefined,
          size: sizeId != null ? Number(sizeId) : undefined,
          color: colorId != null ? Number(colorId) : undefined,
          weight: weightId != null ? Number(weightId) : undefined,
        };
        const jsonResponse = await axiosInstance.post(API_ENDPOINTS.PRODUCTS, jsonBody);
        return jsonResponse.data;
      } catch {
        throw err;
      }
    }
  },
};

export default productApi;
