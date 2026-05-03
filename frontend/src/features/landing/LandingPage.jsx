import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const FEATURES = [
  { icon: '🔤', title: 'Фоника', desc: 'Учим звуки и буквы через игры и песенки' },
  { icon: '✏️', title: 'Письмо', desc: 'Обводим буквы пальцем — весело и просто' },
  { icon: '👁️', title: 'Слова', desc: 'Узнаём слова по картинкам и звукам' },
  { icon: '📖', title: 'Чтение', desc: 'Первые слоги и слова шаг за шагом' },
];

const STEPS = [
  { num: '1', text: 'Родитель создаёт аккаунт и профиль ребёнка' },
  { num: '2', text: 'Ребёнок выбирает аватар и начинает путешествие' },
  { num: '3', text: 'Каждый день — новый урок, новые звёзды и награды' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">

      {/* ── Навигация ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🦉</span>
            <span className="text-xl font-black text-[#1cb0f6] tracking-tighter">DUO_KIDS</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/auth')}
              className="text-gray-500 font-black text-sm hover:text-[#1cb0f6] transition-colors px-4 py-2"
            >
              Войти
            </button>
            <button
              onClick={() => navigate('/auth')}
              className="bg-[#1cb0f6] text-white font-black text-sm px-5 py-2.5 rounded-2xl shadow-[0_4px_0_0_#1499d3] active:shadow-none active:translate-y-1 transition-all"
            >
              Начать бесплатно
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-28 pb-20 bg-gradient-to-b from-[#ddf4ff] to-white px-6">
        <div className="max-w-4xl mx-auto text-center">

          {/* Анимированные эмодзи */}
          <div className="flex justify-center gap-6 mb-8">
            {['🐱', '🦉', '🐶'].map((emoji, i) => (
              <motion.div
                key={emoji}
                animate={{ y: [0, -12, 0] }}
                transition={{ repeat: Infinity, duration: 2, delay: i * 0.4 }}
                className="text-6xl drop-shadow-md"
              >
                {emoji}
              </motion.div>
            ))}
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl md:text-7xl font-black text-[#3c3c3c] leading-tight mb-6"
          >
            Учимся читать{' '}
            <span className="text-[#1cb0f6]">играя!</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-500 font-bold max-w-xl mx-auto mb-10 leading-relaxed"
          >
            Платформа для детей 3–8 лет. Фоника, письмо и слова —
            через игры, анимации и любимых персонажей.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={() => navigate('/auth')}
              className="bg-[#58cc02] text-white font-black text-xl px-10 py-5 rounded-2xl shadow-[0_6px_0_0_#46a302] active:shadow-none active:translate-y-[6px] transition-all uppercase tracking-wider"
            >
              Попробовать бесплатно
            </button>
            <button
              onClick={() => document.getElementById('how').scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-[#1cb0f6] font-black text-xl px-10 py-5 rounded-2xl border-4 border-[#1cb0f6] hover:bg-blue-50 transition-all"
            >
              Как это работает?
            </button>
          </motion.div>

          {/* Соц. доказательство */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-gray-400 font-bold mt-6 text-sm"
          >
            ⭐⭐⭐⭐⭐ Уже 1 000+ детей учатся каждый день
          </motion.p>
        </div>
      </section>

      {/* ── Возможности ── */}
      <section className="py-20 bg-white px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-black text-[#3c3c3c] text-center mb-4">
            Четыре типа заданий
          </h2>
          <p className="text-gray-400 font-bold text-center mb-12">
            Разные форматы — не скучно никогда
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#F7F9FC] rounded-3xl p-8 border-2 border-gray-100 hover:border-[#1cb0f6] hover:-translate-y-1 transition-all"
              >
                <div className="text-5xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-black text-[#3c3c3c] mb-2">{f.title}</h3>
                <p className="text-gray-400 font-bold leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Геймификация ── */}
      <section className="py-20 bg-gradient-to-b from-[#fff4e0] to-white px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-black text-[#3c3c3c] mb-4">
            Играй и зарабатывай награды
          </h2>
          <p className="text-gray-400 font-bold mb-12">
            Каждый урок — шаг к новому уровню
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {[
              { icon: '⭐', label: 'XP очки', color: 'bg-yellow-50 border-yellow-200' },
              { icon: '🔥', label: 'Стрики', color: 'bg-orange-50 border-orange-200' },
              { icon: '🏅', label: 'Бейджи', color: 'bg-blue-50 border-blue-200' },
              { icon: '🏆', label: 'Лидерборд', color: 'bg-green-50 border-green-200' },
              { icon: '🎯', label: 'Уровни', color: 'bg-purple-50 border-purple-200' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, type: 'spring', bounce: 0.4 }}
                className={`${item.color} border-2 rounded-3xl px-8 py-6 flex flex-col items-center gap-2`}
              >
                <span className="text-5xl">{item.icon}</span>
                <span className="font-black text-[#3c3c3c]">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Как это работает ── */}
      <section id="how" className="py-20 bg-white px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-black text-[#3c3c3c] text-center mb-12">
            Три шага до первого урока
          </h2>
          <div className="space-y-6">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="flex items-center gap-6 bg-[#F7F9FC] rounded-3xl p-6 border-2 border-gray-100"
              >
                <div className="w-14 h-14 bg-[#1cb0f6] text-white font-black text-2xl rounded-2xl flex items-center justify-center flex-shrink-0 shadow-[0_4px_0_0_#1499d3]">
                  {step.num}
                </div>
                <p className="font-bold text-[#3c3c3c] text-lg">{step.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Для родителей ── */}
      <section className="py-20 bg-[#F7F9FC] px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-black text-[#3c3c3c] mb-4">
            Контроль для родителей
          </h2>
          <p className="text-gray-400 font-bold mb-12">
            Следи за прогрессом и получай уведомления в реальном времени
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: '📊', title: 'Графики прогресса', desc: 'XP и результаты уроков по дням недели' },
              { icon: '🔔', title: 'Уведомления', desc: 'Узнай сразу, когда ребёнок получил награду' },
              { icon: '👶', title: 'Несколько профилей', desc: 'Создай отдельный профиль для каждого ребёнка' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl p-8 border-2 border-gray-100 text-left"
              >
                <span className="text-4xl mb-4 block">{item.icon}</span>
                <h3 className="text-lg font-black text-[#3c3c3c] mb-2">{item.title}</h3>
                <p className="text-gray-400 font-bold text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 bg-gradient-to-b from-[#ddf4ff] to-[#b8e8ff] px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="text-7xl mb-6">🦉</div>
          <h2 className="text-5xl font-black text-[#3c3c3c] mb-4">
            Готовы начать?
          </h2>
          <p className="text-gray-500 font-bold text-lg mb-10">
            Бесплатно. Без рекламы. Без лишнего.
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="bg-[#58cc02] text-white font-black text-2xl px-14 py-6 rounded-2xl shadow-[0_6px_0_0_#46a302] active:shadow-none active:translate-y-[6px] transition-all uppercase tracking-wider"
          >
            Начать бесплатно 🚀
          </button>
        </motion.div>
      </section>

      {/* ── Футер ── */}
      <footer className="bg-white border-t border-gray-100 py-8 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-2xl">🦉</span>
          <span className="font-black text-[#1cb0f6]">DUO_KIDS</span>
        </div>
        <p className="text-gray-400 font-bold text-sm">
          © 2025 DUO_KIDS · Платформа для детей 3–8 лет
        </p>
      </footer>
    </div>
  );
}
