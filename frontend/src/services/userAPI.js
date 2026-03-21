import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

// Ajouter le token Bearer à chaque requête
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Crée un nouvel utilisateur
 */
export const createUser = async (email, password, full_name, role = 'EMPLOYE', phone = '') => {
  try {
    const response = await API.post('/auth/register', {
      email,
      password,
      full_name,
      role,
      phone: phone || null,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Récupère la liste de tous les utilisateurs
 */
export const getAllUsers = async () => {
  try {
    const response = await API.get('/auth/users');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Récupère le profil de l'utilisateur connecté
 */
export const getMe = async () => {
  try {
    const response = await API.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default { createUser, getAllUsers, getMe };
