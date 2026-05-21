import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const AVATARS = ['🐱', '🐶', '🦊', '🐨', '🦁', '🐼', '🐸', '🦄'];
const STEPS = ['welcome', 'name', 'avatar', 'age', 'ready'];

export default function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: '', age: '', avatar: '🐱' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep(s => Math.max(s - 1, 0));

  const createChild = async () => {
    setLoading(true);
    try {
      await api.addChild({
        name: form.name,
        age: parseInt(form.age),
        avatar: form.avatar,
      });
      navigate('/select');
    } catch {
      alert('Ошибка при создании профиля');
      setLoading(false);
    }
  };

  const stepId = STEPS[step];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#ddf4ff] to-[#b8e8ff] flex flex-col items-center justify-center p-6">

      {/* Прогресс бар */}
      <div className="w-full max-w-md flex gap-2 mb-8">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full transition-all ${i <= step ? 'bg-[#1cb0f6]' : 'bg-white/50'}`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {stepId === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="text-center max-w-md"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-8xl mb-6"
            >
              🦉
            </motion.div>
            <h1 className="text-4xl font-black text-[#3c3c3c] mb-4">
              Добро пожаловать!
            </h1>
            <p className="text-lg text-[#5a8a9f] font-bold mb-8">
              Создай профиль ребёнка и начни обучение за 2 минуты
            </p>
            <button
              onClick={next}
              className="w-full bg-[#58cc02] text-white font-black py-4 rounded-2xl shadow-[0_5px_0_0_#46a302] active:shadow-none active:translate-y-[5px] transition-all text-lg uppercase tracking-wider"
            >
              Начать →
            </button>
          </motion.div>
        )}

        {stepId === 'name' && (
          <motion.div
            key="name"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-md"
          >
            <h2 className="text-3xl font-black text-[#3c3c3c] mb-2 text-center">
              Как зовут ребёнка?
            </h2>
            <p className="text-[#5a8a9f] font-bold text-center mb-8">
              Имя будет отображаться в профиле
            </p>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Например: Аня"
              className="w-full p-5 rounded-2xl bg-white border-4 border-[#1cb0f6]/20 focus:border-[#1cb0f6] outline-none font-black text-2xl text-[#3c3c3c] text-center placeholder:text-gray-300 mb-6"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={prev}
                className="flex-1 bg-gray-100 text-gray-500 font-black py-4 rounded-2xl hover:bg-gray-200 transition-all"
              >
                ← Назад
              </button>
              <button
                onClick={next}
                disabled={!form.name.trim()}
                className="flex-1 bg-[#1cb0f6] text-white font-black py-4 rounded-2xl shadow-[0_5px_0_0_#1499d3] active:shadow-none active:translate-y-[5px] transition-all disabled:opacity-40 disabled:shadow-none"
              >
                Дальше →
              </button>
            </div>
          </motion.div>
        )}

        {stepId === 'avatar' && (
          <motion.div
            key="avatar"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="w-full max-w-md"
          >
            <h2 className="text-3xl font-black text-[#3c3c3c] mb-2 text-center">
              Выбери аватар
            </h2>
            <p className="text-[#5a8a9f] font-bold text-center mb-8">
              Ребёнок увидит его на экране
            </p>
            <div className="grid grid-cols-4 gap-3 mb-8">
              {AVATARS.map(a => (
                <motion.button
                  key={a}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setForm({ ...form, avatar: a })}
                  className={`aspect-square rounded-2xl text-5xl flex items-center justify-center border-4 transition-all ${
                    form.avatar === a
                      ? 'border-[#1cb0f6] bg-[#e8f5ff] scale-110'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  {a}
                </motion.button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={prev} className="flex-1 bg-gray-100 text-gray-500 font-black py-4 rounded-2xl hover:bg-gray-200 transition-all">
                ← Назад
              </button>
              <button onClick={next} className="flex-1 bg-[#1cb0f6] text-white font-black py-4 rounded-2xl shadow-[0_5px_0_0_#1499d3] active:shadow-none active:translate-y-[5px] transition-all">
                Дальше →
              </button>
            </div>
          </motion.div>
        )}

        {stepId === 'age' && (
          <motion.div
            key="age"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="w-full max-w-md"
          >
            <h2 className="text-3xl font-black text-[#3c3c3c] mb-2 text-center">
              Сколько лет?
            </h2>
            <p className="text-[#5a8a9f] font-bold text-center mb-8">
              Мы подберём задания по возрасту
            </p>
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[3, 4, 5, 6, 7, 8].map(age => (
                <motion.button
                  key={age}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setForm({ ...form, age: String(age) })}
                  className={`py-5 rounded-2xl font-black text-2xl border-4 transition-all ${
                    form.age === String(age)
                      ? 'border-[#58cc02] bg-[#d7ffb8] text-[#46a302]'
                      : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'
                  }`}
                >
                  {age}
                </motion.button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={prev} className="flex-1 bg-gray-100 text-gray-500 font-black py-4 rounded-2xl hover:bg-gray-200 transition-all">
                ← Назад
              </button>
              <button
                onClick={next}
                disabled={!form.age}
                className="flex-1 bg-[#58cc02] text-white font-black py-4 rounded-2xl shadow-[0_5px_0_0_#46a302] active:shadow-none active:translate-y-[5px] transition-all disabled:opacity-40"
              >
                Дальше →
              </button>
            </div>
          </motion.div>
        )}

        {stepId === 'ready' && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md"
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-8xl mb-6"
            >
              {form.avatar}
            </motion.div>
            <h2 className="text-3xl font-black text-[#3c3c3c] mb-2">
              Всё готово, {form.name}!
            </h2>
            <p className="text-[#5a8a9f] font-bold mb-8">
              Первый урок уже ждёт
            </p>
            <button
              onClick={createChild}
              disabled={loading}
              className="w-full bg-[#58cc02] text-white font-black py-5 rounded-2xl shadow-[0_6px_0_0_#46a302] active:shadow-none active:translate-y-[6px] transition-all text-xl uppercase tracking-wider disabled:opacity-50"
            >
              {loading ? 'Создаём...' : '🚀 Начать обучение!'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}