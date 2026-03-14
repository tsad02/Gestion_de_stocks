import axios from 'axios';

const API_URL = '/api';

const dashboardAPI = {
  /**
   * Récupère le résumé du dashboard
   * @returns {Promise} Données du dashboard (stats, produits critiques, mouvements)
   */
  getSummary: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/dashboard/summary`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Erreur récupération dashboard:', error);
      throw error;
    }
  },

  /**
   * Récupère les statistiques sur une période
   * @param {number} days - Nombre de jours à afficher (défaut: 30)
   * @returns {Promise} Données statistiques
   */
  getStats: async (days = 30) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/dashboard/stats`, {
        params: { days },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Erreur récupération statistiques:', error);
      throw error;
    }
  }
};

export default dashboardAPI;
