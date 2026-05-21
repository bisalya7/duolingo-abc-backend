// frontend/src/services/api.js
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const client = axios.create({ baseURL: BASE_URL });

// ── Request: подставляем access-токен ─────────────────────────────────────
client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

// ── Response: при 401 пытаемся обновить токен и повторить запрос ──────────
let isRefreshing   = false;
let failedQueue    = [];

const processQueue = (error) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
};

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => client(original))
          .catch((e) => Promise.reject(e));
      }

      original._retry  = true;
      isRefreshing     = true;

      const ok = await useAuthStore.getState().refreshAccessToken();
      isRefreshing = false;
      processQueue(ok ? null : error);

      if (ok) return client(original);
    }
    return Promise.reject(error);
  }
);

// ── API-методы ────────────────────────────────────────────────────────────
export const api = {
  // Auth
  login:    (email, password) => {
    const form = new URLSearchParams();
    form.append('username', email);
    form.append('password', password);
    return client.post('/login', form).then((r) => r.data);
  },
  register: (email, password) =>
    client.post('/register', { email, password }).then((r) => r.data),
  getMe: () => client.get('/auth/me').then((r) => r.data),

  // Children
  getChildren:    ()           => client.get('/children/').then((r) => r.data),
  getChild:       (id)         => client.get(`/children/${id}`).then((r) => r.data),
  addChild:       (data)       => client.post('/children/', data).then((r) => r.data),
  updateChild:    (id, data)   => client.put(`/children/${id}`, data).then((r) => r.data),
  deleteChild:    (id)         => client.delete(`/children/${id}`).then((r) => r.data),
  getChildProgress: (id)       => client.get(`/children/${id}/progress`).then((r) => r.data),
  getChildBadges:   (id)       => client.get(`/children/${id}/badges`).then((r) => r.data),

  // Lessons & exercises
  getLessons:   (params = {}) => client.get('/api/v1/lessons', { params }).then((r) => r.data),
  getLesson:    (id)          => client.get(`/api/v1/lessons/${id}`).then((r) => r.data),
  getExercises: (lessonId)    => client.get(`/api/v1/lessons/${lessonId}/exercises`).then((r) => r.data),
  completeLesson: (lessonId, payload) =>
    client.post(`/api/v1/learning/lessons/${lessonId}/complete`, payload).then((r) => r.data),

  // Notifications
  getNotifications:     ()   => client.get('/api/v1/notifications/').then((r) => r.data),
  markNotificationRead: (id) => client.patch(`/api/v1/notifications/${id}`).then((r) => r.data),

  // Leaderboard
  getLeaderboard: (ageGroup = 'all') =>
    client.get('/api/v1/learning/leaderboard', { params: { age_group: ageGroup } }).then((r) => r.data),

  // Admin
  getAdminStats:    ()           => client.get('/api/v1/admin/stats').then((r) => r.data),
  getAdminUsers:    (params = {}) => client.get('/api/v1/admin/users', { params }).then((r) => r.data),
  getAdminLogs:     (params = {}) => client.get('/api/v1/admin/logs', { params }).then((r) => r.data),
  createUnit:       (data)        => client.post('/api/v1/units', data).then((r) => r.data),
  updateUnit:       (id, data)    => client.put(`/api/v1/units/${id}`, data).then((r) => r.data),
  deleteUnit:       (id)          => client.delete(`/api/v1/units/${id}`).then((r) => r.data),
  createLesson:     (data)        => client.post('/api/v1/lessons', data).then((r) => r.data),
  updateLesson:     (id, data)    => client.put(`/api/v1/lessons/${id}`, data).then((r) => r.data),
  deleteLesson:     (id)          => client.delete(`/api/v1/lessons/${id}`).then((r) => r.data),
  createExercise:   (data)        => client.post('/api/v1/exercises', data).then((r) => r.data),
  updateExercise:   (id, data)    => client.put(`/api/v1/exercises/${id}`, data).then((r) => r.data),
  deleteExercise:   (id)          => client.delete(`/api/v1/exercises/${id}`).then((r) => r.data),
};