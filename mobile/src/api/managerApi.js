import axiosInstance from './axiosInstance';
import { API_ENDPOINTS } from '../constants/config';

/**
 * Manager API Service
 * Handles manager operations:
 * - GET /api/managers (List all branch managers)
 * - GET /api/managers/{id} (Get single manager details)
 * - POST /api/managers (Create branch manager)
 * - PUT /api/managers/{id} (Update manager)
 */
export const managerApi = {
  /**
   * Fetch all managers
   * GET /api/managers
   * @returns {Promise<Array>} List of manager objects
   */
  getManagers: async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.MANAGERS);
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.data)) return data.data;
      if (data && Array.isArray(data.managers)) return data.managers;
      return [];
    } catch (err) {
      throw err;
    }
  },

  /**
   * Fetch a single manager by ID
   * GET /api/managers/{id}
   * @param {number|string} id
   * @returns {Promise<object>} Manager details
   */
  getManagerById: async (id) => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.MANAGER_BY_ID(id));
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  /**
   * Create a new manager
   * POST /api/managers
   * @param {object} payload { name, username, email, password, branchId? }
   * @returns {Promise<object>} Created manager response
   */
  createManager: async (payload) => {
    try {
      const body = {
        name: payload.name ? payload.name.trim() : '',
        username: payload.username ? payload.username.trim() : '',
        email: payload.email ? payload.email.trim() : '',
        password: payload.password ? payload.password.trim() : '',
      };
      if (payload.branchId != null) {
        body.branchId = Number(payload.branchId);
      }
      const response = await axiosInstance.post(API_ENDPOINTS.MANAGERS, body);
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  /**
   * Update an existing manager
   * PUT /api/managers/{id}
   * @param {number|string} id
   * @param {object} payload { name, username, email, password?, active?, branchId? }
   * @returns {Promise<object>} Updated manager response
   */
  updateManager: async (id, payload) => {
    try {
      const body = {};
      if (payload.name != null) body.name = payload.name.trim();
      if (payload.username != null) body.username = payload.username.trim();
      if (payload.email != null) body.email = payload.email.trim();
      if (payload.password && payload.password.trim().length > 0) {
        body.password = payload.password.trim();
      }
      if (payload.active != null) body.active = Boolean(payload.active);
      if (payload.branchId != null) body.branchId = Number(payload.branchId);

      const response = await axiosInstance.put(API_ENDPOINTS.MANAGER_BY_ID(id), body);
      return response.data;
    } catch (err) {
      throw err;
    }
  },
};

export default managerApi;

