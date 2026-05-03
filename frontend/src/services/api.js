import axios from 'axios';
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (import.meta.env.DEV) {
      console.error('[API Error]', error.response?.status, error.response?.data);
    }
    return Promise.reject(error);
  }
);

export const api = {
  // ── Авторизация ──
  login: (data) => {
    const params = new URLSearchParams();
    params.append('username', data.email);
    params.append('password', data.password);
    return axiosInstance.post('/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }).then((r) => r.data);
  },
  register: (data) => axiosInstance.post('/register', data).then((r) => r.data),

  // ── Дети ──
  getChildren:  ()             => axiosInstance.get('/children/').then((r) => r.data),
  getChild:     (id)           => axiosInstance.get(`/children/${id}`).then((r) => r.data),
  addChild:     (data)         => axiosInstance.post('/children/', data).then((r) => r.data),
  updateChild:  (id, data)     => axiosInstance.put(`/children/${id}`, data).then((r) => r.data),
  deleteChild:  (id)           => axiosInstance.delete(`/children/${id}`).then((r) => r.data),

  // ── Прогресс и бейджи ──
  getChildProgress: (id) => axiosInstance.get(`/children/${id}/progress`).then((r) => r.data),
  getChildBadges:   (id) => axiosInstance.get(`/children/${id}/badges`).then((r) => r.data),

  // ── Уроки (learning router) ──
  getLessons: (unitId = null) => {
    const params = unitId ? `?unit_id=${unitId}` : '';
    return axiosInstance.get(`/api/v1/learning/lessons${params}`).then((r) => r.data);
  },
  getLessonExercises: (lessonId) =>
    axiosInstance.get(`/api/v1/learning/lessons/${lessonId}/exercises`).then((r) => r.data),

  completeLesson: (childId, lessonId, score) =>
    axiosInstance.post(`/api/v1/learning/lessons/${lessonId}/complete`, {
      child_id: childId,
      lesson_id: lessonId,
      score,
    }).then((r) => r.data),

  // ── Лидерборд ──
  getLeaderboard: (ageGroup = 'all') =>
    axiosInstance.get(`/api/v1/learning/leaderboard?age_group=${ageGroup}`).then((r) => r.data),

  // ── Уведомления ──
  getNotifications:     ()   => axiosInstance.get('/api/v1/notifications/').then((r) => r.data),
  markNotificationRead: (id) => axiosInstance.patch(`/api/v1/notifications/${id}`).then((r) => r.data),

  // ── Admin: Units ──
  getUnits:    ()            => axiosInstance.get('/api/v1/units').then((r) => r.data),
  getUnit:     (id)          => axiosInstance.get(`/api/v1/units/${id}`).then((r) => r.data),
  createUnit:  (data)        => axiosInstance.post('/api/v1/units', data).then((r) => r.data),
  updateUnit:  (id, data)    => axiosInstance.put(`/api/v1/units/${id}`, data).then((r) => r.data),
  deleteUnit:  (id)          => axiosInstance.delete(`/api/v1/units/${id}`).then((r) => r.data),

  // Admin: Lessons CRUD (через admin router, не learning)
  getLessonsByUnit: (unitId) =>
    axiosInstance.get(`/api/v1/lessons?unit_id=${unitId}`).then((r) => r.data),
  createLesson: (data)       => axiosInstance.post('/api/v1/lessons', data).then((r) => r.data),
  updateLesson: (id, data)   => axiosInstance.put(`/api/v1/lessons/${id}`, data).then((r) => r.data),
  deleteLesson: (id)         => axiosInstance.delete(`/api/v1/lessons/${id}`).then((r) => r.data),

  // Admin: Exercises CRUD
  createExercise: (data)     => axiosInstance.post('/api/v1/exercises', data).then((r) => r.data),
  deleteExercise: (id)       => axiosInstance.delete(`/api/v1/exercises/${id}`).then((r) => r.data),

  // Admin: Stats
  getAdminStats: ()          => axiosInstance.get('/api/v1/admin/stats').then((r) => r.data),
};