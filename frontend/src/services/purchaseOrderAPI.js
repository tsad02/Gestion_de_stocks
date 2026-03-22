import axios from 'axios';

const API_URL = '/api/purchase-orders';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const purchaseOrderAPI = {
    // List all POs
    getAll: async () => {
        const response = await axios.get(API_URL, { headers: getAuthHeader() });
        return response.data;
    },

    // Get single PO
    getById: async (id) => {
        const response = await axios.get(`${API_URL}/${id}`, { headers: getAuthHeader() });
        return response.data;
    },

    // Create PO
    create: async (data) => {
        const response = await axios.post(API_URL, data, { headers: getAuthHeader() });
        return response.data;
    },

    // Auto-Create PO based on critical products
    autoCreate: async () => {
        const response = await axios.post(`${API_URL}/auto`, {}, { headers: getAuthHeader() });
        return response.data;
    },

    // Update PO (status or items)
    update: async (id, data) => {
        const response = await axios.put(`${API_URL}/${id}`, data, { headers: getAuthHeader() });
        return response.data;
    },

    // Delete PO
    delete: async (id) => {
        const response = await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() });
        return response.data;
    }
};

export default purchaseOrderAPI;
