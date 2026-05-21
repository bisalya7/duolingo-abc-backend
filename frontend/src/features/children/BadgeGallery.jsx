import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock } from 'lucide-react';
import { api } from '../../services/api';

const BADGE_ICONS = {
  'Первооткрыватель': '🌟',
  'Умник': '🧠',
  'Огонек': '🔥',
  'Марафонец': '⚡',
  'Первый урок': '📚',
  '100 XP': '💯',
};

const ALL_BADGES = [
  { id: 1, name: 'Первый урок', description: 'Пройди первый урок', xp: 0 },
  { id: 2, name: '100 XP', description: 'Набери 100 очков', xp: 100 },
  { id: 3, name: 'Огонек', description: '3 дня подряд', xp: 0 },
  { id: 4, name: 'Марафонец', description: '7 дней подряд', xp: 0 },
  { id: 5, name: 'Первооткрыватель', description: 'Достигни 5 уровня', xp: 0 },
  { id: 6, name: 'Умник', description: 'Ответь правильно на 10 заданий подряд', xp: 0 },
];

export default function BadgeGallery() {
  const { childId } = useParams();
  const navigate = useNavigate();
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [childId]);

  const loadData = async () => {
    try {
      const [badges, childData] = await Promise.all([
        api.getChildBadges(childId),
        api.getChild(childId),
      ]);
      setEarnedBadges(badges);
      setChild(childData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const earnedIds = new Set(earnedBadges.map(b => b.id));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fff4e0] to-[#ffe8a0] flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-12 h-12 border-4 border-[#ffd200] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff4e0] to-[#ffe8a0] flex flex-col items-center pb-16">
      <div className="w-full max-w-lg px-4 pt-6 pb-4 sticky top-0 z-10 bg-gradient-to-b from-[#fff4e0] to-transparent">
        <div className="bg-white/90 backdrop-blur rounded-[2rem] p-4 shadow-lg border-2 border-white flex items-center gap-4">
          <button
            onClick={() => navigate(`/child/${childId}/map`)}
            className="bg-gray-100 hover:bg-gray-200 p-3 rounded-full transition-all active:scale-90"
          >
            <ArrowLeft size={26} className="text-gray-600" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-2xl font-black text-[#3c3c3c]">🏅 Награды</h1>
            <p className="text-xs text-gray-400 font-bold">{earnedBadges.length} из {ALL_BADGES.length}</p>
          </div>
          <div className="w-12" />
        </div>
      </div>

      <div className="w-full max-w-lg px-4 mb-6">
        <div className="bg-white rounded-2xl p-4 border-2 border-yellow-200 flex items-center gap-4">
          <span className="text-4xl">{child?.avatar || '🐱'}</span>
          <div className="flex-1">
            <p className="font-black text-[#3c3c3c]">{child?.name}</p>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mt-1">
              <motion.div
                className="h-full bg-[#ffd200] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(earnedBadges.length / ALL_BADGES.length) * 100}%` }}
              />
            </div>
          </div>
          <span className="text-xl font-black text-[#b38600]">
            {Math.round((earnedBadges.length / ALL_BADGES.length) * 100)}%
          </span>
        </div>
      </div>

      <div className="w-full max-w-lg px-4 grid grid-cols-2 gap-4">
        {ALL_BADGES.map((badge, i) => {
          const isEarned = earnedIds.has(badge.id);
          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`
                relative p-6 rounded-3xl border-4 text-center transition-all
                ${isEarned
                  ? 'bg-yellow-50 border-yellow-300 hover:-translate-y-1'
                  : 'bg-white/60 border-gray-200 opacity-60'
                }
              `}
            >
              <div className={`text-6xl mb-3 ${isEarned ? '' : 'grayscale'}`}>
                {BADGE_ICONS[badge.name] || '🏅'}
              </div>
              <p className={`font-black text-lg ${isEarned ? 'text-[#3c3c3c]' : 'text-gray-400'}`}>
                {badge.name}
              </p>
              <p className="text-xs text-gray-400 font-bold mt-1">{badge.description}</p>

              {!isEarned && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/30 rounded-3xl">
                  <div className="bg-gray-200/80 p-3 rounded-full">
                    <Lock size={24} className="text-gray-400" />
                  </div>
                </div>
              )}

              {isEarned && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.08, type: 'spring' }}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-[#58cc02] text-white rounded-full flex items-center justify-center text-lg"
                >
                  ✓
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}