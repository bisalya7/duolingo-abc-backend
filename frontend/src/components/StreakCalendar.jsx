import { motion } from 'framer-motion';

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export default function StreakCalendar({ history = [], streak = 0 }) {
  // Генерируем последние 28 дней
  const today = new Date();
  const days = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d);
  }

  // Даты из истории уроков
  const activeDates = new Set(
    history.map(h => new Date(h.completed_at).toDateString())
  );

  const isToday = (d) => d.toDateString() === today.toDateString();
  const isFuture = (d) => d > today;

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black text-[#3c3c3c]">Календарь занятий</h3>
        <div className="flex items-center gap-2 bg-orange-50 border-2 border-orange-200 px-3 py-1.5 rounded-xl">
          <span className="text-base">🔥</span>
          <span className="text-xs font-black text-orange-500">{streak} дней подряд</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {DAYS.map(d => (
          <div key={d} className="text-center text-xs font-black text-gray-400 uppercase tracking-widest py-2">
            {d}
          </div>
        ))}
        {days.map((day, i) => {
          const dateStr = day.toDateString();
          const isActive = activeDates.has(dateStr);
          const todayFlag = isToday(day);
          const future = isFuture(day);

          return (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.02 }}
              className={`
                aspect-square rounded-xl flex items-center justify-center text-sm font-black
                ${future ? 'bg-gray-50 text-gray-300' : ''}
                ${!future && !isActive && !todayFlag ? 'bg-gray-100 text-gray-400' : ''}
                ${isActive ? 'bg-[#d7ffb8] text-[#46a302] border-2 border-[#58cc02]' : ''}
                ${todayFlag && !isActive ? 'bg-[#e8f5ff] text-[#1cb0f6] border-2 border-[#1cb0f6]' : ''}
                ${todayFlag && isActive ? 'bg-[#d7ffb8] text-[#46a302] border-2 border-[#58cc02] ring-2 ring-[#58cc02]' : ''}
              `}
            >
              {day.getDate()}
            </motion.div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-4 text-xs font-bold text-gray-400">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#d7ffb8] border border-[#58cc02]"></span> Занятие</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#e8f5ff] border border-[#1cb0f6]"></span> Сегодня</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-100"></span> Пропуск</span>
      </div>
    </div>
  );
}