import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { PlusCircle, Play, LogOut, Star, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
export default function ParentDashboard() {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', age: '' });
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  // При загрузке страницы запрашиваем список детей с бэкенда
  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      const response = await api.get('/children/');
      setChildren(response.data);
    } catch (error) {
      console.error("Ошибка загрузки детей", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddChild = async (e) => {
    e.preventDefault();
    try {
      await api.post('/children/', { name: formData.name, age: parseInt(formData.age) });
      setFormData({ name: '', age: '' });
      setShowForm(false);
      fetchChildren(); // Обновляем список после добавления
    } catch (error) {
      alert("Ошибка при создании профиля");
    }
  };

  if (loading) return <div className="text-center mt-20 text-2xl font-bold text-secondary">Загрузка...</div>;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Шапка дашборда */}
        <div className="flex justify-between items-center mb-10 bg-white p-6 rounded-3xl shadow-sm">
          <h1 className="text-3xl font-extrabold text-secondary">Дашборд Родителя</h1>
          <button onClick={logout} className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors font-bold">
            <LogOut size={20} /> Выйти
          </button>
        </div>

        {/* Сетка с карточками детей */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {children.map(child => (
            <div key={child.id} className="bg-white rounded-3xl p-6 shadow-md border-2 border-gray-100 hover:border-secondary/30 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{child.name}</h2>
                  <p className="text-gray-500 font-semibold">{child.age} лет</p>
                </div>
                <div className="bg-warning/20 text-warning px-4 py-2 rounded-2xl font-bold flex items-center gap-2">
                  <Star size={20} className="fill-warning" /> Ур. {child.level}
                </div>
              </div>

              {/* Статистика: XP и Стрик */}
              <div className="flex gap-4 mb-6">
                <div className="bg-secondary/10 text-secondary px-4 py-2 rounded-2xl font-bold flex-1 text-center">
                  {child.total_xp} XP
                </div>
                <div className="bg-primary/10 text-primary px-4 py-2 rounded-2xl font-bold flex-1 text-center flex items-center justify-center gap-1">
                  <Flame size={18} className={child.daily_streak > 0 ? "fill-primary" : ""} /> {child.daily_streak || 0} Дней
                </div>
              </div>

              {/* Кнопка входа в детский режим (пока никуда не ведет, сделаем позже) */}
              <button 
  onClick={() => navigate(`/child/${child.id}/map`)}
  className="w-full bg-success hover:bg-green-500 text-white font-bold py-4 rounded-2xl transition-transform active:scale-95 flex items-center justify-center gap-2 text-lg mt-4"
>
  <Play fill="currentColor" /> Начать игру
</button>
            </div>
          ))}
        </div>

        {/* Форма добавления нового ребенка */}
        {!showForm ? (
          <button 
            onClick={() => setShowForm(true)}
            className="w-full border-4 border-dashed border-gray-300 rounded-3xl p-8 flex flex-col items-center justify-center text-gray-400 hover:border-secondary hover:text-secondary transition-colors bg-white"
          >
            <PlusCircle size={48} className="mb-2" />
            <span className="text-xl font-bold">Добавить профиль ребенка</span>
          </button>
        ) : (
          <form onSubmit={AddChild} className="bg-white rounded-3xl p-8 shadow-md border-2 border-secondary/20">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Новый профиль</h2>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Имя ребенка</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-secondary outline-none" placeholder="Например: Аня" />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 font-bold mb-2">Возраст (3-8 лет)</label>
              <input type="number" min="3" max="8" required value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-secondary outline-none" />
            </div>
            <div className="flex gap-4">
              <button type="submit" className="flex-1 bg-secondary text-white font-bold py-3 rounded-xl hover:bg-blue-500 active:scale-95 transition-transform">Сохранить</button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-200 active:scale-95 transition-transform">Отмена</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}