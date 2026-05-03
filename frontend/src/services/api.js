import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000',
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const api = {
  // Авторизация (проверь, чтобы в auth.py пути были /login и /register)
  login: (data) => axiosInstance.post('/login', data).then(r => r.data),
  register: (data) => axiosInstance.post('/register', data).then(r => r.data),

  // Дети (убрали лишние /api/v1)
  getChildren: () => axiosInstance.get('/children/').then(r => r.data),
  addChild: (data) => axiosInstance.post('/children/', data).then(r => r.data),

  // Прогресс
  updateProgress: (childId, xp) => axiosInstance.post(`/children/${childId}/progress`, { xp_added: xp }).then(r => r.data)
};