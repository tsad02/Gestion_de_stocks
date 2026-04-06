import API from './api';

const purchaseOrderAPI = {
    // List all POs
    getAll: async () => {
        const response = await API.get('/purchase-orders');
        return response.data;
    },

    // Get single PO
    getById: async (id) => {
        const response = await API.get(`/purchase-orders/${id}`);
        return response.data;
    },

    // Create PO
    create: async (data) => {
        const response = await API.post('/purchase-orders', data);
        return response.data;
    },

    // Auto-Create PO based on critical products
    autoCreate: async () => {
        const response = await API.post('/purchase-orders/auto', {});
        return response.data;
    },

    // Update PO (status or items)
    update: async (id, data) => {
        const response = await API.put(`/purchase-orders/${id}`, data);
        return response.data;
    },

    // Delete PO
    delete: async (id) => {
        const response = await API.delete(`/purchase-orders/${id}`);
        return response.data;
    }
};

export default purchaseOrderAPI;
