import API from './api';

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

/**
 * Authentifie un utilisateur (Login)
 */
export const login = async (email, password) => {
  try {
    const response = await API.post('/auth/login', { email, password });
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Met à jour le profil de l'utilisateur connecté (nom, téléphone ou mot de passe)
 */
export const updateMe = async (userData) => {
  try {
    const response = await API.put('/auth/me', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default { createUser, getAllUsers, getMe, login, updateMe };
