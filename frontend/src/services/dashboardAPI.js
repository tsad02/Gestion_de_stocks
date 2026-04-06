import API from './api';

const dashboardAPI = {
  /**
   * Récupère le résumé du dashboard
   */
  getSummary: async () => {
    try {
      const response = await API.get('/dashboard/summary');
      return response.data.data;
    } catch (error) {
      console.error('Erreur récupération dashboard:', error);
      throw error;
    }
  },

  /**
   * Récupère les statistiques sur une période
   */
  getStats: async (days = 30) => {
    try {
      const response = await API.get('/dashboard/stats', {
        params: { days }
      });
      return response.data.data;
    } catch (error) {
      console.error('Erreur récupération statistiques:', error);
      throw error;
    }
  }
};

export default dashboardAPI;
