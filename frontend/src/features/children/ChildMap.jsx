import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { ArrowLeft, Star, Lock, PlayCircle, Flame } from 'lucide-react';

export default function ChildMap() {
  const { childId } = useParams();
  const navigate = useNavigate();

  const [child, setChild] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [completedIds, setCompletedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [childId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [childData, lessonsData, progressData] = await Promise.all([
        api.getChild(childId),
        api.getLessons(),
        api.getChildProgress(childId),
      ]);

      setChild(childData);

      const done = new Set(
        (progressData.history || []).map((p) => p.lesson_id)
      );
      setCompletedIds(done);

      const lessonsList = (lessonsData.items || lessonsData || []).map((lesson, index) => {
        const isCompleted = done.has(lesson.id);
        const prevLesson = index > 0 ? lessonsData.items?.[index - 1] || lessonsData[index - 1] : null;
        const isLocked = index > 0 && !done.has(prevLesson?.id);

        return { ...lesson, isCompleted, isLocked };
      });

      setLessons(lessonsList);
    } catch (e) {
      setError('Не удалось загрузить уроки. Проверь подключение.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#ddf4ff] to-[#b8e8ff] flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="text-8xl"
        >
          🦉
        </motion.div>
        <p className="text-2xl font-black text-[#1cb0f6]">Загружаем карту...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#ddf4ff] to-[#b8e8ff] flex flex-col items-center justify-center gap-6 p-6 text-center">
        <div className="text-8xl">😿</div>
        <p className="text-2xl font-black text-[#FF4B4B]">{error}</p>
        <button
          onClick={loadData}
          className="bg-[#1cb0f6] text-white font-black px-10 py-4 rounded-2xl shadow-[0_5px_0_0_#1499d3] active:shadow-none active:translate-y-[5px] transition-all text-lg"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#ddf4ff] to-[#b8e8ff] flex flex-col items-center justify-center gap-6 p-6 text-center">
        <div className="text-8xl">🏗️</div>
        <p className="text-2xl font-black text-[#3c3c3c]">Уроки ещё готовятся!</p>
        <p className="text-gray-400 font-bold">Скоро здесь появятся задания</p>
        <button
          onClick={() => navigate('/select')}
          className="flex items-center gap-2 text-[#1cb0f6] font-black"
        >
          <ArrowLeft size={20} /> Назад
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#ddf4ff] to-[#b8e8ff] flex flex-col items-center pb-16">

      <div className="w-full max-w-lg px-4 pt-6 pb-4 sticky top-0 z-10 bg-gradient-to-b from-[#ddf4ff] to-transparent">
        <div className="bg-white/90 backdrop-blur rounded-[2rem] p-4 shadow-lg border-2 border-white flex items-center justify-between">

          <button
            onClick={() => navigate('/select')}
            className="bg-gray-100 hover:bg-gray-200 p-3 rounded-full transition-all active:scale-90"
          >
            <ArrowLeft size={28} className="text-gray-600" />
          </button>

          {child && (
            <div className="flex items-center gap-3">
              <span className="text-3xl">{child.avatar || '🐱'}</span>
              <div className="text-center">
                <p className="font-black text-[#3c3c3c] text-lg leading-none">{child.name}</p>
                <p className="text-xs text-gray-400 font-bold">Уровень {child.level}</p>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {/* XP */}
            <div className="bg-[#fff4e0] border-2 border-[#ffd200] text-[#b38600] px-3 py-2 rounded-2xl font-black text-sm flex items-center gap-1">
              ⭐ {child?.total_xp || 0}
            </div>
            {child?.daily_streak > 0 && (
              <div className="bg-orange-50 border-2 border-orange-300 text-orange-500 px-3 py-2 rounded-2xl font-black text-sm flex items-center gap-1">
                <Flame size={16} /> {child.daily_streak}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="text-center my-6">
        <h1 className="text-3xl font-black text-[#1cb0f6] drop-shadow-sm">Карта уроков</h1>
        <p className="text-[#5a8a9f] font-bold mt-1">
          Пройдено: {completedIds.size} из {lessons.length}
        </p>
      </div>

      <div className="relative w-full max-w-sm px-4">

        <div className="absolute left-1/2 top-0 bottom-0 w-3 -translate-x-1/2 rounded-full bg-white/50 -z-10" />

        <div className="flex flex-col items-center gap-6">
          {lessons.map((lesson, index) => {
            const offsetClass = index % 2 === 0 ? '-translate-x-16' : 'translate-x-16';

            let btnStyle = '';
            let icon = null;
            let labelColor = '';

            if (lesson.isCompleted) {
              btnStyle = 'bg-[#58cc02] border-[#46a302] text-white hover:-translate-y-2 cursor-pointer';
              icon = <Star size={40} className="fill-white mb-1" />;
              labelColor = 'text-white';
            } else if (!lesson.isLocked) {
              btnStyle = 'bg-[#1cb0f6] border-[#1499d3] text-white hover:-translate-y-2 cursor-pointer animate-pulse';
              icon = <PlayCircle size={44} className="mb-1" />;
              labelColor = 'text-white';
            } else {
              btnStyle = 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed opacity-70';
              icon = <Lock size={36} className="mb-1 opacity-60" />;
              labelColor = 'text-gray-400';
            }

            return (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.08, type: 'spring', bounce: 0.4 }}
                className={`${offsetClass} transition-transform`}
              >
                <button
                  disabled={lesson.isLocked}
                  onClick={() =>
                    !lesson.isLocked &&
                    navigate(`/child/${childId}/lesson/${lesson.id}`)
                  }
                  className={`
                    w-28 h-28 rounded-full flex flex-col items-center justify-center
                    border-b-[6px] transition-all active:border-b-0 active:translate-y-[6px]
                    shadow-lg ${btnStyle}
                  `}
                >
                  {icon}
                  <span className={`font-black text-xs text-center leading-tight px-2 ${labelColor}`}>
                    {lesson.title}
                  </span>
                </button>

                {!lesson.isLocked && (
                  <p className="text-center text-xs font-black text-[#5a8a9f] mt-2">
                    +{lesson.xp_reward} XP
                  </p>
                )}
              </motion.div>
            );
          })}

          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: lessons.length * 0.08 + 0.2 }}
            className="text-6xl mt-4"
          >
            🏆
          </motion.div>
        </div>
      </div>
    </div>
  );
}
