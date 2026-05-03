import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Sidebar() {
  const navigate = useNavigate();
  const logout = useAuthStore(state => state.logout);

  const menuItems = [
    { name: 'Дашборд', icon: '🏠', path: '/dashboard' },
    { name: 'Статистика', icon: '📊', path: '/stats' },
    { name: 'Настройки', icon: '⚙️', path: '/settings' },
  ];

  return (
    <div className="w-64 min-h-screen border-r-2 border-[#e5e5e5] p-4 flex flex-col bg-white">
      <div className="p-4 mb-10">
        <span className="text-2xl font-black text-[#1cb0f6] tracking-tighter">DUO_KIDS</span>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map(item => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl font-black text-[#777] hover:bg-[#f7f7f7] hover:text-[#1cb0f6] transition-all uppercase text-sm tracking-widest"
          >
            <span className="text-2xl">{item.icon}</span>
            {item.name}
          </button>
        ))}
      </nav>

      <button 
        onClick={logout}
        className="mt-auto p-4 flex items-center gap-4 font-black text-red-400 hover:bg-red-50 rounded-2xl transition-all uppercase text-sm tracking-widest"
      >
        <span>🚪</span> Выйти
      </button>
    </div>
  );
}