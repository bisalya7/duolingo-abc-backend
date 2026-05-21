import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Lock, Mail, User, Volume2 } from 'lucide-react';

export default function AccountSettings({ onClose }) {
  const user = { email: 'parent@mail.com', role: 'parent' };
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [soundEnabled, setSoundEnabled] = useState(
    localStorage.getItem('sound_enabled') !== 'false'
  );
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('sound_enabled', String(next));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setMessage({ type: 'error', text: 'Пароли не совпадают' });
      return;
    }
    if (form.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Минимум 6 символов' });
      return;
    }
    setLoading(true);
    try {
      setMessage({ type: 'success', text: 'Пароль изменён!' });
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      setMessage({ type: 'error', text: 'Ошибка при смене пароля' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-[#3c3c3c]">Настройки аккаунта</h2>
        <button onClick={onClose} className="text-gray-300 hover:text-gray-500">
          <X size={24} />
        </button>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
          <div className="w-12 h-12 bg-[#e8f5ff] rounded-xl flex items-center justify-center text-[#1cb0f6]">
            <Mail size={20} />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Email</p>
            <p className="font-bold text-[#3c3c3c]">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-500">
            <User size={20} />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Роль</p>
            <p className="font-bold text-[#3c3c3c] capitalize">{user.role}</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-500">
              <Volume2 size={20} />
            </div>
            <div>
              <p className="font-bold text-[#3c3c3c]">Звуковые эффекты</p>
              <p className="text-xs text-gray-400">Для ребёнка в уроках</p>
            </div>
          </div>
          <button
            onClick={toggleSound}
            className={`w-14 h-8 rounded-full transition-all relative ${soundEnabled ? 'bg-[#58cc02]' : 'bg-gray-300'}`}
          >
            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${soundEnabled ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        <div className="border-t border-gray-100 pt-6">
          <h3 className="font-black text-[#3c3c3c] mb-4 flex items-center gap-2">
            <Lock size={18} /> Сменить пароль
          </h3>

          {message && (
            <div className={`p-3 rounded-2xl mb-4 font-bold text-sm ${message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-red-50 text-red-500 border border-red-200'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-3">
            <input
              type="password"
              placeholder="Текущий пароль"
              value={form.currentPassword}
              onChange={e => setForm({ ...form, currentPassword: e.target.value })}
              className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-[#1cb0f6] outline-none font-bold text-[#3c3c3c] placeholder:text-gray-300"
            />
            <input
              type="password"
              placeholder="Новый пароль"
              value={form.newPassword}
              onChange={e => setForm({ ...form, newPassword: e.target.value })}
              className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-[#1cb0f6] outline-none font-bold text-[#3c3c3c] placeholder:text-gray-300"
            />
            <input
              type="password"
              placeholder="Повтори новый пароль"
              value={form.confirmPassword}
              onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
              className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-[#1cb0f6] outline-none font-bold text-[#3c3c3c] placeholder:text-gray-300"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1cb0f6] text-white font-black py-4 rounded-2xl shadow-[0_4px_0_0_#1499d3] active:shadow-none active:translate-y-1 transition-all disabled:opacity-50"
            >
              {loading ? '...' : 'Сменить пароль'}
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}