import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const setTokens = useAuthStore((state) => state.setTokens);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setErrorMsg('');
    try {
      if (isLogin) {
        const response = await api.login(data.email, data.password);
        setTokens({
          access_token: response.access_token,
          refresh_token: response.refresh_token,
          role: response.role,
        });
        // Редирект по роли
        if (response.role === 'admin') {
          window.location.replace('/admin');
        } else {
          window.location.replace('/select');
        }
      } else {
        await api.register(data);
        setIsLogin(true);
        alert('Успешная регистрация! Теперь войдите в систему.');
      }
    } catch (error) {
      const rawDetail = error.response?.data?.detail;
      let message = 'Произошла ошибка';

      if (typeof rawDetail === 'string') {
        message = rawDetail;
      } else if (Array.isArray(rawDetail) && rawDetail.length > 0) {
        message = rawDetail[0].msg;
      } else if (error.message) {
        message = error.message;
      }

      setErrorMsg(message);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-[32px] shadow-[0_10px_0_0_#e5e5e5] p-10 w-full max-w-md border-2 border-[#e5e5e5]">

        <div className="text-center mb-8">
          <div className="text-6xl mb-2">🦉</div>
          <h1 className="text-3xl font-black text-[#3c3c3c] tracking-tight">
            {isLogin ? 'С возвращением!' : 'Создать аккаунт'}
          </h1>
          <p className="text-gray-400 font-bold mt-2">Родительский контроль</p>
        </div>

        {errorMsg && (
          <div className="bg-red-100 border-2 border-red-200 text-red-500 p-4 rounded-2xl mb-6 text-center font-bold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Электронная почта"
              className="w-full p-4 rounded-2xl bg-[#f7f7f7] border-2 border-[#e5e5e5] focus:border-[#1cb0f6] outline-none transition-all font-bold text-[#4b4b4b] placeholder:text-[#afafaf]"
              {...register("email", { required: "Введите почту" })}
            />
            {errors.email && (
              <p className="text-red-500 text-sm font-bold mt-1 ml-2">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <input
              type="password"
              placeholder="Пароль"
              className="w-full p-4 rounded-2xl bg-[#f7f7f7] border-2 border-[#e5e5e5] focus:border-[#1cb0f6] outline-none transition-all font-bold text-[#4b4b4b] placeholder:text-[#afafaf]"
              {...register("password", { required: "Введите пароль", minLength: { value: 6, message: "Минимум 6 символов" } })}
            />
            {errors.password && (
              <p className="text-red-500 text-sm font-bold mt-1 ml-2">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-[#1cb0f6] hover:bg-[#1499d3] text-white font-black py-4 rounded-2xl shadow-[0_5px_0_0_#1899d6] active:shadow-none active:translate-y-[5px] transition-all text-lg uppercase tracking-wider"
          >
            {isLogin ? 'Войти' : 'Начать'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t-2 border-[#e5e5e5]">
          <button
            type="button"
            onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); }}
            className="w-full text-[#1cb0f6] font-black uppercase tracking-widest text-sm hover:brightness-90 transition-all"
          >
            {isLogin ? 'Зарегистрироваться' : 'У меня есть аккаунт'}
          </button>
        </div>
      </div>
    </div>
  );
}