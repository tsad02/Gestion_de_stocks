import API from './api';

const locationsAPI = {
  getLocations: async () => {
    const res = await API.get('/locations');
    return res.data;
  },
  createLocation: async (data) => {
    const res = await API.post('/locations', data);
    return res.data;
  },
  updateLocation: async (id, data) => {
    const res = await API.put(`/locations/${id}`, data);
    return res.data;
  },
  deleteLocation: async (id) => {
    const res = await API.delete(`/locations/${id}`);
    return res.data;
  },
  assignProducts: async (id, productIds) => {
    const res = await API.post(`/locations/${id}/products`, { productIds });
    return res.data;
  }
};

export default locationsAPI;
