import API from './api';

const auditAPI = {
  /**
   * Récupère les logs d'audit
   */
  getAuditLogs: async (limit = 50, offset = 0) => {
    try {
      const res = await API.get('/audit', {
        params: { limit, offset }
      });
      return res.data;
    } catch (error) {
      console.error('Erreur récupération logs d\'audit:', error);
      throw error;
    }
  }
};

export default auditAPI;
