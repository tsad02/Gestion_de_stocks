import axios from 'axios';

/**
 * Création d'une instance Axios centralisée.
 * Utilise la variable d'environnement VITE_API_URL pour pointer vers Render ou Local.
 */
const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'https://gestion-de-stocks.onrender.com'}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Intercepteur de requête pour ajouter automatiquement le token JWT.
 * Le token est récupéré depuis le localStorage à chaque appel.
 */
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Intercepteur de réponse pour gérer globalement les erreurs d'authentification (401).
 * Redirige vers le login si le token est expiré ou invalide.
 */
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Optionnel : Déclencher ici une déconnexion automatique ou redirection
      console.warn('Session expirée ou non autorisée');
    }
    return Promise.reject(error);
  }
);

export default API;
