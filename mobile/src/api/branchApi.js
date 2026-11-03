import axiosInstance from './axiosInstance';
import { API_ENDPOINTS } from '../constants/config';

/**
 * Branch API Service
 * Handles branch operations:
 * - GET /api/branchs (List branches)
 * - GET /api/branchs/{id} (Get single branch)
 * - POST /api/branchs/register (Create branch)
 * - PUT /api/branchs/{id} (Update branch)
 * - PUT /api/branchs/{branchId}/assign-manager/{managerId} (Assign manager)
 * - PUT /api/branchs/{branchId}/assign-categories (Assign category IDs array)
 * - GET /api/managers (List managers)
 */
export const branchApi = {
  /**
   * Fetch all branches
   * GET /api/branchs
   * @returns {Promise<Array>} List of branch objects
   */
  getBranches: async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.BRANCHS);
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.data)) return data.data;
      if (data && Array.isArray(data.branches)) return data.branches;
      return [];
    } catch (err) {
      throw err;
    }
  },

  /**
   * Fetch a single branch by ID
   * GET /api/branchs/{id}
   * @param {number|string} id
   * @returns {Promise<object>} Branch detail
   */
  getBranchById: async (id) => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.BRANCH_BY_ID(id));
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  /**
   * Create a new branch
   * POST /api/branchs/register
   * @param {object} payload { name, email, mobile, address }
   * @returns {Promise<object>}
   */
  createBranch: async (payload) => {
    try {
      const body = {
        name: payload.name ? payload.name.trim() : '',
        email: payload.email ? payload.email.trim() : '',
        mobile: payload.mobile ? payload.mobile.trim() : '',
        address: payload.address ? payload.address.trim() : '',
      };
      const response = await axiosInstance.post(API_ENDPOINTS.BRANCH_REGISTER, body);
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  /**
   * Update an existing branch
   * PUT /api/branchs/{id}
   * @param {number|string} id
   * @param {object} payload { name, email, mobile, address }
   * @returns {Promise<object>}
   */
  updateBranch: async (id, payload) => {
    try {
      const body = {
        name: payload.name ? payload.name.trim() : '',
        email: payload.email ? payload.email.trim() : '',
        mobile: payload.mobile ? payload.mobile.trim() : '',
        address: payload.address ? payload.address.trim() : '',
      };
      const response = await axiosInstance.put(API_ENDPOINTS.BRANCH_BY_ID(id), body);
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  /**
   * Assign manager to branch
   * PUT /api/branchs/{branchId}/assign-manager/{managerId}
   * @param {number|string} branchId
   * @param {number|string} managerId
   * @returns {Promise<object>}
   */
  assignManager: async (branchId, managerId) => {
    try {
      const response = await axiosInstance.put(
        API_ENDPOINTS.BRANCH_ASSIGN_MANAGER(branchId, managerId)
      );
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  /**
   * Assign categories to branch
   * PUT /api/branchs/{branchId}/assign-categories
   * @param {number|string} branchId
   * @param {Array<number>} categoryIds Array of category IDs (e.g. [1, 2, 3])
   * @returns {Promise<object>}
   */
  assignCategories: async (branchId, categoryIds) => {
    try {
      const numericIds = Array.isArray(categoryIds)
        ? categoryIds.map((id) => Number(id)).filter((id) => !isNaN(id))
        : [];
      const response = await axiosInstance.put(
        API_ENDPOINTS.BRANCH_ASSIGN_CATEGORIES(branchId),
        numericIds
      );
      return response.data;
    } catch (err) {
      throw err;
    }
  },

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
      return [];
    } catch (err) {
      throw err;
    }
  },
};

export default branchApi;

