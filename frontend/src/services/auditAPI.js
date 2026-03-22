import axios from 'axios';

const API_URL = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

const auditAPI = {
  getAuditLogs: async (limit = 50, offset = 0) => {
    const res = await axios.get(`${API_URL}/audit?limit=${limit}&offset=${offset}`, { headers: getAuthHeaders() });
    return res.data;
  }
};

export default auditAPI;
