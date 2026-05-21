import { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid
} from 'recharts';
import {
  LogOut, PlusCircle, Play, Star, Flame, Bell, ChevronRight, Trophy, BookOpen, X, Settings
} from 'lucide-react';
import StreakCalendar from '../../components/StreakCalendar';
import BadgeShowcase from '../../components/BadgeShowcase';
import AccountSettings from './AccountSettings';

export default function ParentDashboard() {
  const [children, setChildren] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childProgress, setChildProgress] = useState(null);
  const [childBadges, setChildBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', age: '' });
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [wsMessage, setWsMessage] = useState(null);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const wsRef = useRef(null);

  useEffect(() => {
    fetchAll();
    connectWebSocket();
    return () => wsRef.current?.close();
  }, []);

  // ... (начало файла без изменений до connectWebSocket)

  const connectWebSocket = () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.sub;
      
      // ИСПРАВЛЕНО: динамический URL вместо хардкода
      const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8001')
        .replace(/^http/, 'ws')
        .replace(/^https/, 'wss');
      const wsUrl = `${baseUrl}/api/v1/notifications/ws/${userId}`;
      
      console.log('Connecting WebSocket:', wsUrl);
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      wsRef.current.onmessage = (event) => {
        setWsMessage(event.data);
        setTimeout(() => setWsMessage(null), 5000);
        fetchNotifications();
      };
      
      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
      };
    } catch (e) {
      console.error('WebSocket setup error:', e);
    }
  };

// ... (остальное без изменений)

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchChildren(), fetchNotifications()]);
    setLoading(false);
  };

  const fetchChildren = async () => {
    try {
      const data = await api.getChildren();
      setChildren(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (e) {}
  };

  const openChildDetail = async (child) => {
    setSelectedChild(child);
    setShowSettings(false);
    try {
      const [progress, badges] = await Promise.all([
        api.getChildProgress(child.id),
        api.getChildBadges(child.id),
      ]);
      setChildProgress(progress);
      setChildBadges(badges);
    } catch (e) {
      setChildProgress(null);
      setChildBadges([]);
    }
  };

  const handleAddChild = async (e) => {
    e.preventDefault();
    try {
      await api.addChild({ name: formData.name, age: parseInt(formData.age) });
      setFormData({ name: '', age: '' });
      setShowAddForm(false);
      fetchChildren();
    } catch {
      alert('Ошибка при создании профиля');
    }
  };

  const markRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (e) {}
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const buildXpChartData = (history = []) => {
    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const map = Object.fromEntries(days.map((d) => [d, 0]));
    history.forEach((item) => {
      const date = new Date(item.completed_at);
      const day = days[date.getDay() === 0 ? 6 : date.getDay() - 1];
      map[day] += 10;
    });
    return days.map((day) => ({ day, xp: map[day] }));
  };

  const buildLessonsChartData = (history = []) => {
    return history.slice(-7).map((item, i) => ({
      name: `Урок ${i + 1}`,
      score: item.score,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#1cb0f6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC]">

      {wsMessage && (
        <div className="fixed top-4 right-4 z-50 bg-white border-l-4 border-[#58cc02] rounded-2xl p-4 shadow-xl max-w-sm animate-bounce">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-black text-[#3c3c3c] text-sm">{wsMessage}</p>
            </div>
            <button onClick={() => setWsMessage(null)} className="text-gray-300 hover:text-gray-500 ml-2">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🦉</span>
            <div>
              <h1 className="text-xl font-black text-[#3c3c3c]">Родительский кабинет</h1>
              <p className="text-xs text-gray-400 font-bold">Следи за успехами детей</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { setShowSettings(!showSettings); setSelectedChild(null); }}
              className={`p-3 rounded-2xl transition-colors ${showSettings ? 'bg-[#e8f5ff] text-[#1cb0f6]' : 'bg-gray-50 hover:bg-gray-100 text-gray-500'}`}
            >
              <Settings size={22} />
            </button>

            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <Bell size={22} className="text-gray-500" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FF4B4B] text-white text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={logout}
              className="flex items-center gap-2 text-gray-400 hover:text-[#FF4B4B] transition-colors font-bold text-sm"
            >
              <LogOut size={18} /> Выйти
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">

        {showSettings && (
          <div className="mb-8">
            <AccountSettings onClose={() => setShowSettings(false)} />
          </div>
        )}

        {showNotifications && (
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 mb-8 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-black text-[#3c3c3c] text-lg">Уведомления</h2>
              <button onClick={() => setShowNotifications(false)} className="text-gray-300 hover:text-gray-500">
                <X size={20} />
              </button>
            </div>

            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-4xl mb-3">🔔</p>
                <p className="text-gray-400 font-bold">Пока уведомлений нет</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`flex items-start gap-4 px-6 py-4 transition-colors ${!n.is_read ? 'bg-blue-50/40' : ''}`}
                  >
                    <span className="text-xl mt-0.5">
                      {n.message.includes('наград') ? '🏅' : '📚'}
                    </span>
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${n.is_read ? 'text-gray-400' : 'text-[#3c3c3c]'}`}>
                        {n.message}
                      </p>
                      <p className="text-xs text-gray-300 mt-1">
                        {new Date(n.created_at).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                    {!n.is_read && (
                      <button
                        onClick={() => markRead(n.id)}
                        className="text-xs text-[#1cb0f6] font-black hover:underline whitespace-nowrap"
                      >
                        Прочитано
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          {children.map((child) => (
            <div
              key={child.id}
              className="bg-white rounded-[28px] p-6 shadow-sm border border-gray-100 hover:-translate-y-1 transition-transform"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl bg-gray-50 w-14 h-14 flex items-center justify-center rounded-2xl border border-gray-100">
                    {child.avatar || '🐱'}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-[#3c3c3c]">{child.name}</h2>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                      {child.age} лет · Уровень {child.level}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <div className="flex items-center gap-1 text-[#ffc800] font-black text-sm">
                    <Star size={14} className="fill-[#ffc800]" /> {child.total_xp} XP
                  </div>
                  {child.daily_streak > 0 && (
                    <div className="flex items-center gap-1 text-orange-400 font-black text-sm">
                      <Flame size={14} /> {child.daily_streak} дней
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-5">
                <div className="flex justify-between text-xs font-bold text-gray-300 mb-1 uppercase tracking-widest">
                  <span>Прогресс</span>
                  <span>{child.total_xp % 100}/100 XP до ур. {child.level + 1}</span>
                </div>
                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-[#1cb0f6] h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(child.total_xp % 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/child/${child.id}/map`)}
                  className="flex-1 bg-[#58cc02] text-white font-black py-3 rounded-2xl shadow-[0_4px_0_0_#46a302] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
                >
                  <Play size={16} fill="currentColor" /> Играть
                </button>
                <button
                  onClick={() => openChildDetail(child)}
                  className={`px-4 py-3 rounded-2xl border-2 transition-all ${
                    selectedChild?.id === child.id
                      ? 'border-[#1cb0f6] text-[#1cb0f6] bg-[#e8f5ff]'
                      : 'border-gray-100 hover:border-[#1cb0f6] text-gray-400 hover:text-[#1cb0f6]'
                  }`}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          ))}

          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="border-2 border-dashed border-gray-200 rounded-[28px] p-6 flex flex-col items-center justify-center text-gray-300 hover:border-[#1cb0f6] hover:text-[#1cb0f6] transition-all bg-white min-h-[180px]"
            >
              <PlusCircle size={40} className="mb-2" />
              <span className="font-bold">Добавить ребёнка</span>
            </button>
          )}
        </div>

        {showAddForm && (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8">
            <h2 className="text-xl font-black text-[#3c3c3c] mb-6">Новый профиль</h2>
            <form onSubmit={handleAddChild} className="flex flex-col sm:flex-row gap-4">
              <input
                type="text" required placeholder="Имя ребёнка"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="flex-1 p-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-[#1cb0f6] outline-none font-bold text-[#3c3c3c]"
              />
              <input
                type="number" min="3" max="8" required placeholder="Возраст"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-32 p-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-[#1cb0f6] outline-none font-bold text-[#3c3c3c]"
              />
              <button type="submit" className="bg-[#1cb0f6] text-white font-black px-8 py-4 rounded-2xl shadow-[0_4px_0_0_#1499d3] active:shadow-none active:translate-y-1 transition-all">
                Сохранить
              </button>
              <button type="button" onClick={() => setShowAddForm(false)} className="bg-gray-100 text-gray-500 font-black px-6 py-4 rounded-2xl hover:bg-gray-200 transition-all">
                Отмена
              </button>
            </form>
          </div>
        )}

        {selectedChild && (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{selectedChild.avatar || '🐱'}</span>
                <div>
                  <h2 className="text-2xl font-black text-[#3c3c3c]">{selectedChild.name}</h2>
                  <p className="text-sm text-gray-400 font-bold">Детальная статистика</p>
                </div>
              </div>
              <button onClick={() => setSelectedChild(null)} className="text-gray-300 hover:text-gray-500">
                <X size={24} />
              </button>
            </div>

            {childProgress ? (
              <>
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[
                    { icon: <BookOpen size={20} />, label: 'Уроков', value: childProgress.total_completed_lessons, color: 'text-[#1cb0f6]', bg: 'bg-blue-50' },
                    { icon: <Star size={20} />, label: 'Всего XP', value: selectedChild.total_xp, color: 'text-[#ffc800]', bg: 'bg-yellow-50' },
                    { icon: <Trophy size={20} />, label: 'Уровень', value: selectedChild.level, color: 'text-[#58cc02]', bg: 'bg-green-50' },
                  ].map((stat) => (
                    <div key={stat.label} className={`${stat.bg} rounded-2xl p-4 text-center`}>
                      <div className={`${stat.color} flex justify-center mb-1`}>{stat.icon}</div>
                      <p className="text-2xl font-black text-[#3c3c3c]">{stat.value}</p>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="mb-8">
                  <h3 className="font-black text-[#3c3c3c] mb-4">XP по дням недели</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={buildXpChartData(childProgress.history)}>
                      <XAxis dataKey="day" tick={{ fontWeight: 700, fontSize: 12 }} />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                        formatter={(v) => [`${v} XP`, '']}
                      />
                      <Bar dataKey="xp" fill="#1cb0f6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {childProgress.history.length > 0 && (
                  <div className="mb-8">
                    <h3 className="font-black text-[#3c3c3c] mb-4">Звёзды за последние уроки</h3>
                    <ResponsiveContainer width="100%" height={160}>
                      <LineChart data={buildLessonsChartData(childProgress.history)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" tick={{ fontWeight: 700, fontSize: 11 }} />
                        <YAxis domain={[0, 3]} ticks={[1, 2, 3]} tick={{ fontWeight: 700, fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                          formatter={(v) => [`${v} ⭐`, 'Звёзды']}
                        />
                        <Line type="monotone" dataKey="score" stroke="#58cc02" strokeWidth={3} dot={{ fill: '#58cc02', r: 5 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="mb-8">
                  <StreakCalendar
                    history={childProgress?.history || []}
                    streak={selectedChild?.daily_streak || 0}
                  />
                </div>

                <div className="mb-8">
                  <BadgeShowcase
                    badges={childBadges}
                    allBadges={[
                      { id: 1, name: 'Первый урок', description: 'Пройди первый урок' },
                      { id: 2, name: '100 XP', description: 'Набери 100 очков' },
                      { id: 3, name: 'Огонек', description: '3 дня подряд' },
                      { id: 4, name: 'Марафонец', description: '7 дней подряд' },
                    ]}
                  />
                </div>

                {childProgress.history.length > 0 ? (
                  <div>
                    <h3 className="font-black text-[#3c3c3c] mb-4">История уроков</h3>
                    <div className="overflow-x-auto rounded-2xl border border-gray-100">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left px-4 py-3 font-black text-gray-400 uppercase tracking-widest text-xs">Урок</th>
                            <th className="text-center px-4 py-3 font-black text-gray-400 uppercase tracking-widest text-xs">Звёзды</th>
                            <th className="text-right px-4 py-3 font-black text-gray-400 uppercase tracking-widest text-xs">Дата</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {childProgress.history.map((item, i) => (
                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 font-bold text-[#3c3c3c]">{item.lesson_title}</td>
                              <td className="px-4 py-3 text-center">
                                {'⭐'.repeat(item.score)}{'☆'.repeat(3 - item.score)}
                              </td>
                              <td className="px-4 py-3 text-right text-gray-400">
                                {new Date(item.completed_at).toLocaleDateString('ru-RU')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-4xl mb-2">📚</p>
                    <p className="text-gray-400 font-bold">Уроки ещё не пройдены</p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex justify-center py-12">
                <div className="w-10 h-10 border-4 border-[#1cb0f6] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}