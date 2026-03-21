import axios from 'axios';

const API_URL = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

const inventoryAPI = {
  // --- Produits ---
  getProducts: async () => {
    const res = await axios.get(`${API_URL}/products`, {
      headers: getAuthHeaders()
    });
    return Array.isArray(res.data) ? res.data : [];
  },

  getProductById: async (id) => {
    const res = await axios.get(`${API_URL}/products/${id}`, {
      headers: getAuthHeaders()
    });
    return res.data;
  },

  addProduct: async (productData) => {
    const res = await axios.post(`${API_URL}/products`, productData, {
      headers: getAuthHeaders()
    });
    return res.data;
  },

  updateProduct: async (id, productData) => {
    const res = await axios.put(`${API_URL}/products/${id}`, productData, {
      headers: getAuthHeaders()
    });
    return res.data;
  },

  deleteProduct: async (id) => {
    const res = await axios.delete(`${API_URL}/products/${id}`, {
      headers: getAuthHeaders()
    });
    return res.data;
  },

  // --- Mouvements ---
  getMovements: async (filters = {}) => {
    const res = await axios.get(`${API_URL}/inventory-movements`, {
      params: filters,
      headers: getAuthHeaders()
    });
    // API returns { total, movements: [...] }
    return {
      total: res.data?.total || 0,
      movements: Array.isArray(res.data?.movements) ? res.data.movements : []
    };
  },

  addMovement: async (movementData) => {
    const res = await axios.post(`${API_URL}/inventory-movements`, movementData, {
      headers: getAuthHeaders()
    });
    return res.data;
  }
};

export default inventoryAPI;
