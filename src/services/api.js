import axios from 'axios';

// Defina a base URL da API (Railway ou Local)
// Ex: 'https://playground-backend-production.up.railway.app'
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor para adicionar token se houver (para rotas autenticadas)
api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getWsUrl = (publicToken) => {
  const wsProtocol = window.location.protocol === 'https:' || API_URL.startsWith('https') ? 'wss:' : 'ws:';
  const domain = API_URL.replace(/^https?:\/\//, '');
  return `${wsProtocol}//${domain}/ws/sessions/${publicToken}/`;
};

export default api;
