import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy } from 'lucide-react';
import { api } from '../../services/api';

const AGE_GROUPS = [
  { id: 'all', label: 'Все' },
  { id: '3-5', label: '3–5 лет' },
  { id: '6-8', label: '6–8 лет' },
];

const MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' };
const RANK_COLORS = {
  1: 'bg-yellow-50 border-yellow-300',
  2: 'bg-gray-50 border-gray-300',
  3: 'bg-orange-50 border-orange-300',
};

export default function LeaderboardScreen() {
  const { childId } = useParams();
  const navigate = useNavigate();

  const [ageGroup, setAgeGroup] = useState('all');
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchLeaderboard(); }, [ageGroup]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getLeaderboard(ageGroup);
      setLeaders(Array.isArray(data) ? data : []);
    } catch {
      setError('Не удалось загрузить таблицу');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff4e0] to-[#ffe8a0] flex flex-col items-center pb-16">

      {/* Шапка */}
      <div className="w-full max-w-lg px-4 pt-6 pb-4 sticky top-0 z-10 bg-gradient-to-b from-[#fff4e0] to-transparent">
        <div className="bg-white/90 backdrop-blur rounded-[2rem] p-4 shadow-lg border-2 border-white flex items-center gap-4">
          <button
            onClick={() => navigate(`/child/${childId}/map`)}
            className="bg-gray-100 hover:bg-gray-200 p-3 rounded-full transition-all active:scale-90"
          >
            <ArrowLeft size={26} className="text-gray-600" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-2xl font-black text-[#3c3c3c]">🏆 Лидерборд</h1>
            <p className="text-xs text-gray-400 font-bold">Лучшие ученики по XP</p>
          </div>
          <div className="w-12" /> {/* spacer */}
        </div>
      </div>

      {/* Фильтр возраста */}
      <div className="flex gap-2 mt-4 mb-8 bg-white/70 rounded-2xl p-1.5 shadow-sm">
        {AGE_GROUPS.map((g) => (
          <button
            key={g.id}
            onClick={() => setAgeGroup(g.id)}
            className={`px-5 py-2.5 rounded-xl font-black text-sm transition-all
              ${ageGroup === g.id
                ? 'bg-[#ffd200] text-[#7a5c00] shadow-[0_3px_0_0_#e6bd00] active:shadow-none active:translate-y-[3px]'
                : 'text-gray-400 hover:text-[#3c3c3c]'}`}
          >
            {g.label}
          </button>
        ))}
      </div>

      {/* Топ-3 пьедестал */}
      {!loading && !error && leaders.length >= 3 && (
        <div className="flex items-end justify-center gap-3 mb-8 w-full max-w-lg px-4">
          {/* 2 место */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center flex-1"
          >
            <div className="text-4xl mb-1">{leaders[1]?.child_name?.[0] ?? '?'}</div>
            <div className="bg-white rounded-2xl border-4 border-gray-200 w-full py-4 flex flex-col items-center shadow-md">
              <span className="text-3xl">🥈</span>
              <p className="font-black text-[#3c3c3c] text-sm mt-1 truncate w-full text-center px-2">
                {leaders[1]?.child_name}
              </p>
              <p className="text-xs font-black text-gray-400">{leaders[1]?.total_xp} XP</p>
            </div>
            <div className="bg-gray-200 w-full h-12 rounded-b-xl -mt-1" />
          </motion.div>

          {/* 1 место */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className="flex flex-col items-center flex-1"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-5xl mb-1"
            >
              👑
            </motion.div>
            <div className="bg-white rounded-2xl border-4 border-yellow-300 w-full py-5 flex flex-col items-center shadow-xl">
              <span className="text-4xl">🥇</span>
              <p className="font-black text-[#3c3c3c] text-sm mt-1 truncate w-full text-center px-2">
                {leaders[0]?.child_name}
              </p>
              <p className="text-xs font-black text-[#b38600]">{leaders[0]?.total_xp} XP</p>
            </div>
            <div className="bg-yellow-200 w-full h-16 rounded-b-xl -mt-1" />
          </motion.div>

          {/* 3 место */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center flex-1"
          >
            <div className="text-4xl mb-1">{leaders[2]?.child_name?.[0] ?? '?'}</div>
            <div className="bg-white rounded-2xl border-4 border-orange-200 w-full py-4 flex flex-col items-center shadow-md">
              <span className="text-3xl">🥉</span>
              <p className="font-black text-[#3c3c3c] text-sm mt-1 truncate w-full text-center px-2">
                {leaders[2]?.child_name}
              </p>
              <p className="text-xs font-black text-gray-400">{leaders[2]?.total_xp} XP</p>
            </div>
            <div className="bg-orange-100 w-full h-8 rounded-b-xl -mt-1" />
          </motion.div>
        </div>
      )}

      {/* Список остальных */}
      <div className="w-full max-w-lg px-4">
        {loading && (
          <div className="flex justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="w-12 h-12 border-4 border-[#ffd200] border-t-transparent rounded-full"
            />
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">😿</p>
            <p className="text-[#FF4B4B] font-black text-lg">{error}</p>
            <button onClick={fetchLeaderboard} className="mt-4 bg-[#1cb0f6] text-white font-black px-8 py-3 rounded-2xl">
              Попробовать снова
            </button>
          </div>
        )}

        {!loading && !error && leaders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-5xl mb-3">🌱</p>
            <p className="font-black text-[#3c3c3c] text-xl">Пока никого нет</p>
            <p className="text-gray-400 font-bold mt-2">Стань первым!</p>
          </div>
        )}

        {!loading && !error && leaders.slice(3).map((player, idx) => {
          const rank = idx + 4;
          return (
            <motion.div
              key={player.rank}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center gap-4 bg-white rounded-2xl border-2 border-gray-100 px-5 py-4 mb-3 shadow-sm"
            >
              <span className="text-xl font-black text-gray-400 w-6 text-center">{rank}</span>
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-xl font-black text-gray-400">
                {player.child_name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-black text-[#3c3c3c]">{player.child_name}</p>
                <p className="text-xs text-gray-400 font-bold">Уровень {player.level}</p>
              </div>
              <div className="bg-yellow-50 border-2 border-yellow-200 px-3 py-1.5 rounded-xl">
                <span className="font-black text-[#b38600] text-sm">⭐ {player.total_xp}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
