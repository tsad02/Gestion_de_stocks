import API from './api';

const inventoryAPI = {
  // --- Produits ---
  getProducts: async () => {
    const res = await API.get('/products');
    return Array.isArray(res.data) ? res.data : [];
  },

  getProductById: async (id) => {
    const res = await API.get(`/products/${id}`);
    return res.data;
  },

  addProduct: async (productData) => {
    const res = await API.post('/products', productData);
    return res.data;
  },

  updateProduct: async (id, productData) => {
    const res = await API.put(`/products/${id}`, productData);
    return res.data;
  },

  deleteProduct: async (id) => {
    const res = await API.delete(`/products/${id}`);
    return res.data;
  },

  // --- Mouvements ---
  getMovements: async (filters = {}) => {
    const res = await API.get('/inventory-movements', {
      params: filters,
    });
    // API returns { total, movements: [...] }
    return {
      total: res.data?.total || 0,
      movements: Array.isArray(res.data?.movements) ? res.data.movements : []
    };
  },

  addMovement: async (movementData) => {
    const res = await API.post('/inventory-movements', movementData);
    return res.data;
  }
};

export default inventoryAPI;
