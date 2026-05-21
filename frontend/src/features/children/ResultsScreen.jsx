import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star } from 'lucide-react';

function Confetti() {
  const pieces = Array.from({ length: 48 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: ['#58cc02', '#1cb0f6', '#FF4B4B', '#FFD200', '#CE82FF'][i % 5],
    delay: Math.random() * 0.8,
    duration: 2 + Math.random() * 1.5,
    size: 8 + Math.random() * 8,
    rotate: Math.random() * 360,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -20, x: `${p.x}vw`, opacity: 1, rotate: 0 }}
          animate={{ y: '110vh', opacity: [1, 1, 0], rotate: p.rotate + 360 }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.id % 3 === 0 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
}

function getMessage(stars) {
  if (stars === 3) return { emoji: '🏆', text: 'Идеально!', sub: 'Ты настоящий чемпион!' };
  if (stars === 2) return { emoji: '🎉', text: 'Молодец!', sub: 'Почти идеально, так держать!' };
  return { emoji: '💪', text: 'Хорошая попытка!', sub: 'Продолжай — и станешь лучше!' };
}

export default function ResultsScreen() {
  const { childId, lessonId } = useParams();
  const navigate = useNavigate();

  const location = useLocation();
  const {
    stars = 2,
    correctCount = 0,
    total = 0,
    xp = 20,
    newBadges = [],
    lessonTitle = 'Урок',
  } = location.state ?? {};

  const msg = getMessage(stars);
  const [showBadge, setShowBadge] = useState(false);

  useEffect(() => {
    // Показываем бейдж-уведомление с задержкой если есть новые награды
    if (newBadges.length > 0) {
      const t = setTimeout(() => setShowBadge(true), 1600);
      return () => clearTimeout(t);
    }
  }, [newBadges]);

  return (
    <div className="min-h-screen bg-[#58cc02] flex flex-col items-center justify-center p-6 relative overflow-hidden">

      {stars >= 2 && <Confetti />}

      <AnimatePresence>
        {showBadge && newBadges.length > 0 && (
          <motion.div
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white rounded-3xl shadow-2xl px-6 py-4 flex items-center gap-4 border-4 border-yellow-300"
          >
            <motion.span
              animate={{ rotate: [0, -15, 15, -10, 10, 0] }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl"
            >
              🏅
            </motion.span>
            <div>
              <p className="font-black text-[#3c3c3c] text-sm uppercase tracking-widest">Новая награда!</p>
              <p className="font-black text-[#3c3c3c] text-lg">{newBadges[0]}</p>
            </div>
            <button
              onClick={() => setShowBadge(false)}
              className="text-gray-300 hover:text-gray-500 ml-2 text-xl leading-none"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col items-center w-full max-w-sm">

        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', bounce: 0.55, delay: 0.1 }}
          className="text-9xl mb-2 drop-shadow-xl"
        >
          {msg.emoji}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-5xl font-black text-white uppercase tracking-widest mb-2 drop-shadow-lg"
        >
          {msg.text}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-white/80 font-bold text-lg mb-8 text-center"
        >
          {msg.sub}
        </motion.p>

        <div className="flex gap-3 mb-6">
          {[1, 2, 3].map((s) => (
            <motion.div
              key={s}
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.4 + s * 0.15, type: 'spring', bounce: 0.7 }}
            >
              <Star
                size={68}
                className={
                  s <= stars
                    ? 'fill-yellow-300 text-yellow-300 drop-shadow-lg'
                    : 'fill-white/20 text-white/20'
                }
              />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="w-full bg-white/20 rounded-3xl p-5 mb-8 backdrop-blur-sm"
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-black text-white">{correctCount}/{total}</p>
              <p className="text-white/70 text-xs font-bold uppercase tracking-widest mt-1">Ответов</p>
            </div>
            <div className="border-x border-white/20">
              <p className="text-3xl font-black text-white">+{xp}</p>
              <p className="text-white/70 text-xs font-bold uppercase tracking-widest mt-1">XP</p>
            </div>
            <div>
              <p className="text-3xl font-black text-white">{stars}/3</p>
              <p className="text-white/70 text-xs font-bold uppercase tracking-widest mt-1">Звёзды</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="w-full flex flex-col gap-3"
        >
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate(`/child/${childId}/map`)}
            className="w-full bg-white text-[#58cc02] font-black text-xl py-5 rounded-2xl border-b-8 border-white/30 active:border-b-0 active:translate-y-2 transition-all uppercase tracking-wider shadow-xl"
          >
            Продолжить →
          </motion.button>

          {stars < 3 && (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate(`/child/${childId}/lesson/${lessonId}`)}
              className="w-full bg-transparent border-4 border-white/40 text-white font-black text-lg py-4 rounded-2xl hover:bg-white/10 transition-all uppercase tracking-wider"
            >
              Попробовать снова
            </motion.button>
          )}
        </motion.div>

      </div>
    </div>
  );
}
