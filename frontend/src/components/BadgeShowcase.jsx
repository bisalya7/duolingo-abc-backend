import { motion } from 'framer-motion';

const BADGE_ICONS = {
  'Первооткрыватель': '🌟',
  'Умник': '🧠',
  'Огонек': '🔥',
  'Марафонец': '⚡',
  'Первый урок': '📚',
  '100 XP': '💯',
};

export default function BadgeShowcase({ badges = [], allBadges = [] }) {
  const earnedIds = new Set(badges.map(b => b.id));
  const displayBadges = allBadges.length > 0 ? allBadges : [
    { id: 1, name: 'Первый урок', description: 'Пройди первый урок' },
    { id: 2, name: '100 XP', description: 'Набери 100 очков' },
    { id: 3, name: 'Огонек', description: '3 дня подряд' },
    { id: 4, name: 'Марафонец', description: '7 дней подряд' },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100">
      <h3 className="font-black text-[#3c3c3c] mb-4">🏅 Награды</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {displayBadges.map((badge, i) => {
          const isEarned = earnedIds.has(badge.id);
          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`
                relative p-4 rounded-2xl border-2 text-center transition-all
                ${isEarned
                  ? 'bg-yellow-50 border-yellow-200 hover:-translate-y-1'
                  : 'bg-gray-50 border-gray-100 opacity-60 grayscale'
                }
              `}
            >
              <div className="text-4xl mb-2">{BADGE_ICONS[badge.name] || '🏅'}</div>
              <p className={`font-black text-sm ${isEarned ? 'text-[#3c3c3c]' : 'text-gray-400'}`}>
                {badge.name}
              </p>
              <p className="text-xs text-gray-400 font-bold mt-1">{badge.description}</p>
              {isEarned && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-[#58cc02] text-white rounded-full flex items-center justify-center text-xs font-black"
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