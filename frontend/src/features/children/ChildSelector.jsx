import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { LogOut, PlusCircle } from 'lucide-react';

const CARD_COLORS = [
  { bg: 'bg-[#FFF4E0]', border: 'border-[#FFD200]', shadow: 'shadow-[0_6px_0_0_#e6bd00]', text: 'text-[#b38600]' },
  { bg: 'bg-[#E8F5FF]', border: 'border-[#1cb0f6]', shadow: 'shadow-[0_6px_0_0_#1499d3]', text: 'text-[#1499d3]' },
  { bg: 'bg-[#F0FFF0]', border: 'border-[#58cc02]', shadow: 'shadow-[0_6px_0_0_#46a302]', text: 'text-[#46a302]' },
  { bg: 'bg-[#FFF0F0]', border: 'border-[#FF4B4B]', shadow: 'shadow-[0_6px_0_0_#cc0000]', text: 'text-[#cc0000]' },
];

const AVATARS = ['🐱', '🐶', '🦊', '🐨', '🦁', '🐼', '🐸', '🦄'];

export default function ChildSelector() {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', age: '', avatar: '🐱' });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      const data = await api.getChildren();
      setChildren(data);
      if (data.length === 0) {
        navigate('/onboarding');
        return;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddChild = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.addChild({
        name: formData.name,
        age: parseInt(formData.age),
        avatar: formData.avatar,
      });
      setFormData({ name: '', age: '', avatar: '🐱' });
      setShowAddForm(false);
      fetchChildren();
    } catch {
      alert('Ошибка при создании профиля');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ddf4ff] flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="text-8xl"
        >
          🦉
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#ddf4ff] to-[#b8e8ff] flex flex-col items-center justify-center p-6">

      <div className="w-full max-w-2xl flex justify-between items-center mb-10">
        <div className="text-center">
          <h1 className="text-4xl font-black text-[#1cb0f6] drop-shadow-sm">
            Кто сегодня учится?
          </h1>
          <p className="text-[#5a8a9f] font-bold mt-1">Выбери свой профиль</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-[#5a8a9f] hover:text-[#FF4B4B] transition-colors font-bold text-sm"
        >
          <LogOut size={18} /> Выйти
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-2xl mb-8">
        {children.map((child, index) => {
          const colors = CARD_COLORS[index % CARD_COLORS.length];
          return (
            <motion.button
              key={child.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -6 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/child/${child.id}/map`)}
              className={`
                ${colors.bg} ${colors.border} ${colors.shadow}
                border-4 rounded-[2rem] p-6 flex flex-col items-center
                cursor-pointer transition-all active:shadow-none active:translate-y-[6px]
              `}
            >
              <div className="text-7xl mb-3 drop-shadow-md">
                {child.avatar || AVATARS[index % AVATARS.length]}
              </div>

              <span className="text-xl font-black text-[#3c3c3c] mb-1">
                {child.name}
              </span>

              <span className={`text-xs font-black uppercase tracking-widest ${colors.text}`}>
                {child.age} лет
              </span>

              <div className="w-full mt-4">
                <div className="flex justify-between text-xs font-bold text-gray-400 mb-1">
                  <span>Уровень {child.level}</span>
                  <span>{child.total_xp} XP</span>
                </div>
                <div className="w-full bg-white/60 rounded-full h-3 overflow-hidden border border-white">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((child.total_xp % 100) || 5, 100)}%` }}
                    transition={{ delay: index * 0.1 + 0.3, duration: 0.6 }}
                    className={`h-full rounded-full ${colors.border.replace('border-', 'bg-')}`}
                  />
                </div>
              </div>

              {child.daily_streak > 0 && (
                <div className="mt-3 flex items-center gap-1 bg-white/70 rounded-full px-3 py-1">
                  <span className="text-base">🔥</span>
                  <span className="text-xs font-black text-orange-500">
                    {child.daily_streak} дней
                  </span>
                </div>
              )}
            </motion.button>
          );
        })}

        {!showAddForm && (
          <motion.button
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: children.length * 0.1 }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddForm(true)}
            className="border-4 border-dashed border-[#1cb0f6]/40 rounded-[2rem] p-6 flex flex-col items-center justify-center text-[#1cb0f6]/60 hover:border-[#1cb0f6] hover:text-[#1cb0f6] transition-all cursor-pointer min-h-[200px]"
          >
            <PlusCircle size={48} className="mb-2" />
            <span className="font-black text-sm uppercase tracking-wide">
              Новый профиль
            </span>
          </motion.button>
        )}
      </div>

      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-[2rem] p-8 shadow-xl border-4 border-[#1cb0f6]/20"
        >
          <h2 className="text-2xl font-black text-[#3c3c3c] mb-6 text-center">
            ✨ Новый ученик
          </h2>

          <form onSubmit={handleAddChild} className="space-y-5">
            <div>
              <label className="block text-sm font-black text-gray-500 uppercase tracking-widest mb-3">
                Выбери аватар
              </label>
              <div className="grid grid-cols-4 gap-2">
                {AVATARS.map((avatar) => (
                  <button
                    key={avatar}
                    type="button"
                    onClick={() => setFormData({ ...formData, avatar })}
                    className={`
                      text-4xl p-3 rounded-2xl border-4 transition-all
                      ${formData.avatar === avatar
                        ? 'border-[#1cb0f6] bg-[#e8f5ff] scale-110'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'}
                    `}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-gray-500 uppercase tracking-widest mb-2">
                Имя
              </label>
              <input
                type="text"
                required
                placeholder="Например: Аня"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-gray-200 focus:border-[#1cb0f6] outline-none font-bold text-[#3c3c3c] placeholder:text-gray-300 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-black text-gray-500 uppercase tracking-widest mb-2">
                Возраст (3–8 лет)
              </label>
              <div className="flex gap-2">
                {[3, 4, 5, 6, 7, 8].map((age) => (
                  <button
                    key={age}
                    type="button"
                    onClick={() => setFormData({ ...formData, age: String(age) })}
                    className={`
                      flex-1 py-3 rounded-2xl border-4 font-black text-lg transition-all
                      ${formData.age === String(age)
                        ? 'border-[#1cb0f6] bg-[#e8f5ff] text-[#1cb0f6]'
                        : 'border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-300'}
                    `}
                  >
                    {age}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting || !formData.age}
                className="flex-1 bg-[#58cc02] text-white font-black py-4 rounded-2xl shadow-[0_5px_0_0_#46a302] active:shadow-none active:translate-y-[5px] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {submitting ? '...' : 'Сохранить'}
              </button>
              {children.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-100 text-gray-500 font-black py-4 rounded-2xl hover:bg-gray-200 transition-all text-lg"
                >
                  Отмена
                </button>
              )}
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
}