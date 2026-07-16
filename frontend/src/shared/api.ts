import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true, // Habilitar el envío automático de cookies HttpOnly (JWT)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para redireccionar al login en caso de no estar autorizado
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Evitar bucle infinito si ya estamos en la página de login
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
