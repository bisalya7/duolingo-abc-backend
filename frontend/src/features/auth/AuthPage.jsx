import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true); // Переключатель: Вход / Регистрация
  const [errorMsg, setErrorMsg] = useState('');
  const login = useAuthStore((state) => state.login);

  // Подключаем react-hook-form для удобной валидации
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setErrorMsg('');
    try {
      if (isLogin) {
        // Запрос на логин
        const response = await api.post('/auth/login', data);
        login(response.data.access_token); // Сохраняем токен в Zustand и localStorage
      } else {
        // Запрос на регистрацию
        await api.post('/auth/register', data);
        setIsLogin(true); // После регистрации перекидываем на логин
        alert('Успешная регистрация! Теперь войдите в систему.');
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.detail || 'Произошла ошибка');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md border-4 border-secondary/20">
        <h1 className="text-3xl font-bold text-center text-secondary mb-6">
          {isLogin ? 'Вход для родителей' : 'Регистрация'}
        </h1>

        {errorMsg && (
          <div className="bg-primary/10 text-primary p-3 rounded-xl mb-4 text-center font-bold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-bold mb-2">Email</label>
            <input 
              type="email"
              className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-secondary outline-none transition-colors"
              {...register("email", { required: "Email обязателен" })}
            />
            {errors.email && <p className="text-primary text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">Пароль</label>
            <input 
              type="password"
              className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-secondary outline-none transition-colors"
              {...register("password", { required: "Пароль обязателен", minLength: { value: 4, message: "Минимум 4 символа" } })}
            />
            {errors.password && <p className="text-primary text-sm mt-1">{errors.password.message}</p>}
          </div>

          <button 
            type="submit" 
            className="w-full bg-secondary text-white font-bold py-4 rounded-2xl hover:bg-blue-500 transition-transform active:scale-95 text-lg"
          >
            {isLogin ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>

        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="w-full text-center mt-6 text-gray-500 hover:text-secondary font-semibold"
        >
          {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
        </button>
      </div>
    </div>
  );
}