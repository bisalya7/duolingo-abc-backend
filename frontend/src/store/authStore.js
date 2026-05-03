import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  // При загрузке приложения проверяем, есть ли токен в памяти браузера
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),

  // Функция для входа
  login: (token) => {
    localStorage.setItem('token', token);
    set({ token, isAuthenticated: true });
  },

  // Функция для выхода
  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, isAuthenticated: false });
  }
}));