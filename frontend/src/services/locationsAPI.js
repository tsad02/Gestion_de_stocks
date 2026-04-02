import axios from 'axios';

const API_URL = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

const locationsAPI = {
  getLocations: async () => {
    const res = await axios.get(`${API_URL}/locations`, { headers: getAuthHeaders() });
    return res.data;
  },
  createLocation: async (data) => {
    const res = await axios.post(`${API_URL}/locations`, data, { headers: getAuthHeaders() });
    return res.data;
  },
  updateLocation: async (id, data) => {
    const res = await axios.put(`${API_URL}/locations/${id}`, data, { headers: getAuthHeaders() });
    return res.data;
  },
  deleteLocation: async (id) => {
    const res = await axios.delete(`${API_URL}/locations/${id}`, { headers: getAuthHeaders() });
    return res.data;
  },
  assignProducts: async (id, productIds) => {
    const res = await axios.post(`${API_URL}/locations/${id}/products`, { productIds }, { headers: getAuthHeaders() });
    return res.data;
  }
};

export default locationsAPI;
