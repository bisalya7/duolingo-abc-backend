import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Volume2, Star } from 'lucide-react';
import { api } from '../../services/api';

// ─── Парсинг контента ────────────────────────────────────────────────────────
// Бэкенд хранит content как JSON-строку или уже как объект
function parseContent(raw) {
  if (!raw) return {};
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch { return {}; }
  }
  return raw;
}

// ─── Получить правильный ответ из упражнения ─────────────────────────────────
function getCorrect(exercise) {
  const c = parseContent(exercise.content);
  // Бэкенд кладёт правильный ответ в content.correct_answer
  return c.correct_answer ?? c.correct ?? exercise.answer ?? '';
}

// ─── Заглушка для демо / если бэкенд пуст ────────────────────────────────────
const FALLBACK_EXERCISES = [
  {
    id: 1,
    type: 'match',
    content: { question: 'Найди букву А', options: ['Б', 'А', 'В', 'О'], correct_answer: 'А' },
  },
  {
    id: 2,
    type: 'select_image',
    content: {
      question: "Что начинается на звук «А»?",
      options: [
        { icon: '🍉', word: 'Арбуз' },
        { icon: '🍌', word: 'Банан' },
        { icon: '🐱', word: 'Кот' },
        { icon: '🍎', word: 'Апельсин' },
      ],
      correct_answer: 'Арбуз',
    },
  },
  {
    id: 3,
    type: 'build_word',
    content: {
      question: 'Собери слово МАМА',
      parts: ['МА', 'ПА', 'БА', 'МА'],
      correct_answer: 'МАМА',
    },
  },
  {
    id: 4,
    type: 'listen',
    content: {
      text: 'Послушай и нажми правильную букву',
      audio_url: '/sounds/a.mp3',
      options: ['О', 'У', 'А', 'И'],
      correct_answer: 'А',
    },
  },
];

// ════════════════════════════════════════════════════════════════════════════════
// Типы упражнений
// ════════════════════════════════════════════════════════════════════════════════

// ── 1. match / multiple_choice ── выбери правильную букву/слог из вариантов ───
function MatchExercise({ exercise, selected, onSelect, status }) {
  const c = parseContent(exercise.content);
  const options = c.options ?? [];
  const correct = getCorrect(exercise);

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto gap-6">
      <motion.h2
        key={exercise.id}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl md:text-4xl font-black text-[#3c3c3c] text-center leading-tight"
      >
        {c.question}
      </motion.h2>

      <div className="grid grid-cols-2 gap-4 w-full">
        {options.map((opt, idx) => {
          const isSelected = selected === opt;
          const isCorrect = status !== 'idle' && opt === correct;
          const isWrong = status === 'wrong' && isSelected;

          let cls =
            'border-2 border-gray-200 bg-white text-[#3c3c3c] hover:border-[#1cb0f6] hover:bg-blue-50';
          if (isSelected && status === 'idle')
            cls = 'border-2 border-b-[6px] border-[#1cb0f6] bg-blue-50 text-[#1cb0f6]';
          if (isCorrect)
            cls = 'border-2 border-b-[6px] border-[#58cc02] bg-green-50 text-[#58cc02]';
          if (isWrong)
            cls = 'border-2 border-b-[6px] border-[#FF4B4B] bg-red-50 text-[#FF4B4B]';
          if (status !== 'idle' && !isSelected && !isCorrect)
            cls = 'border-2 border-gray-100 bg-white text-gray-300 opacity-50';

          return (
            <motion.button
              key={idx}
              whileTap={status === 'idle' ? { scale: 0.94 } : {}}
              disabled={status !== 'idle'}
              onClick={() => onSelect(opt)}
              className={`py-7 rounded-3xl font-black text-4xl transition-all ${cls}`}
            >
              {opt}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ── 2. select_image ── нажми на нужную картинку ──────────────────────────────
function SelectImageExercise({ exercise, selected, onSelect, status }) {
  const c = parseContent(exercise.content);
  const options = c.options ?? []; // [{icon, word}, ...]
  const correct = getCorrect(exercise); // строка — word

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto gap-6">
      <motion.h2
        key={exercise.id}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-3xl font-black text-[#3c3c3c] text-center"
      >
        {c.question}
      </motion.h2>

      <div className="grid grid-cols-2 gap-4 w-full">
        {options.map((opt, idx) => {
          const word = typeof opt === 'object' ? opt.word : opt;
          const icon = typeof opt === 'object' ? opt.icon : '❓';
          const isSelected = selected === word;
          const isCorrect = status !== 'idle' && word === correct;
          const isWrong = status === 'wrong' && isSelected;

          let cls =
            'border-4 border-gray-200 bg-white hover:border-[#1cb0f6] hover:bg-blue-50';
          if (isSelected && status === 'idle')
            cls = 'border-4 border-[#1cb0f6] bg-blue-50 scale-105 shadow-lg';
          if (isCorrect)
            cls = 'border-4 border-[#58cc02] bg-green-50 scale-105 shadow-lg';
          if (isWrong)
            cls = 'border-4 border-[#FF4B4B] bg-red-50';
          if (status !== 'idle' && !isSelected && !isCorrect)
            cls = 'border-4 border-gray-100 bg-white opacity-40';

          return (
            <motion.button
              key={idx}
              whileTap={status === 'idle' ? { scale: 0.93 } : {}}
              disabled={status !== 'idle'}
              onClick={() => onSelect(word)}
              className={`flex flex-col items-center justify-center p-5 rounded-3xl transition-all ${cls}`}
            >
              <span className="text-6xl mb-2">{icon}</span>
              <span className="font-black text-lg text-[#3c3c3c]">{word}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ── 3. listen ── послушай и выбери ───────────────────────────────────────────
function ListenExercise({ exercise, selected, onSelect, status }) {
  const c = parseContent(exercise.content);
  const options = c.options ?? [];
  const correct = getCorrect(exercise);
  const [playing, setPlaying] = useState(false);

  const playAudio = useCallback(() => {
    if (c.audio_url) {
      const audio = new Audio(c.audio_url);
      setPlaying(true);
      audio.play().catch(() => {});
      audio.onended = () => setPlaying(false);
    }
  }, [c.audio_url]);

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto gap-6">
      <p className="text-xl font-black text-[#5a8a9f] text-center">
        {c.text ?? 'Послушай и выбери правильный ответ'}
      </p>

      {/* Кнопка воспроизведения */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={playAudio}
        className={`w-32 h-32 rounded-full flex flex-col items-center justify-center gap-2 shadow-lg transition-all
          ${playing
            ? 'bg-[#1cb0f6] text-white border-4 border-[#1499d3]'
            : 'bg-[#ddf4ff] text-[#1cb0f6] border-4 border-[#1cb0f6] hover:bg-[#c8ecff]'
          }`}
        animate={playing ? { scale: [1, 1.08, 1] } : {}}
        transition={{ repeat: playing ? Infinity : 0, duration: 0.6 }}
      >
        <Volume2 size={48} />
        <span className="text-xs font-black uppercase tracking-widest">
          {playing ? 'Звучит...' : 'Слушать'}
        </span>
      </motion.button>

      <div className="grid grid-cols-2 gap-4 w-full">
        {options.map((opt, idx) => {
          const isSelected = selected === opt;
          const isCorrect = status !== 'idle' && opt === correct;
          const isWrong = status === 'wrong' && isSelected;

          let cls =
            'border-2 border-gray-200 bg-white text-[#3c3c3c] hover:border-[#1cb0f6] hover:bg-blue-50';
          if (isSelected && status === 'idle')
            cls = 'border-2 border-b-[6px] border-[#1cb0f6] bg-blue-50 text-[#1cb0f6]';
          if (isCorrect)
            cls = 'border-2 border-b-[6px] border-[#58cc02] bg-green-50 text-[#58cc02]';
          if (isWrong)
            cls = 'border-2 border-b-[6px] border-[#FF4B4B] bg-red-50 text-[#FF4B4B]';
          if (status !== 'idle' && !isSelected && !isCorrect)
            cls = 'border-2 border-gray-100 opacity-40';

          return (
            <motion.button
              key={idx}
              whileTap={status === 'idle' ? { scale: 0.94 } : {}}
              disabled={status !== 'idle'}
              onClick={() => onSelect(opt)}
              className={`py-7 rounded-3xl font-black text-4xl transition-all ${cls}`}
            >
              {opt}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ── 4. build_word ── перетащи/нажми слоги чтобы собрать слово ────────────────
function BuildWordExercise({ exercise, selected, onSelect, status }) {
  const c = parseContent(exercise.content);
  const parts = c.parts ?? [];
  const correct = getCorrect(exercise);

  // selected здесь — массив нажатых слогов
  const built = Array.isArray(selected) ? selected : [];

  const addPart = (part) => {
    if (status !== 'idle') return;
    onSelect([...built, part]);
  };

  const removeLast = () => {
    if (status !== 'idle') return;
    onSelect(built.slice(0, -1));
  };

  const builtWord = built.join('');
  const builtColor =
    status === 'correct'
      ? 'text-[#58cc02]'
      : status === 'wrong'
      ? 'text-[#FF4B4B]'
      : 'text-[#3c3c3c]';

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto gap-6">
      <motion.h2
        key={exercise.id}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-3xl font-black text-[#3c3c3c] text-center"
      >
        {c.question}
      </motion.h2>

      {/* Экран собираемого слова */}
      <div className="min-h-[72px] w-full bg-gray-50 rounded-3xl border-2 border-dashed border-gray-300 flex items-center justify-center px-6 gap-2">
        {built.length === 0 ? (
          <span className="text-gray-300 font-black text-xl">Нажимай на слоги ↓</span>
        ) : (
          built.map((p, i) => (
            <motion.span
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`text-3xl font-black ${builtColor}`}
            >
              {p}
            </motion.span>
          ))
        )}
      </div>

      {/* Кнопки слогов */}
      <div className="flex flex-wrap gap-3 justify-center w-full">
        {parts.map((part, idx) => (
          <motion.button
            key={idx}
            whileTap={status === 'idle' ? { scale: 0.88 } : {}}
            disabled={status !== 'idle'}
            onClick={() => addPart(part)}
            className="px-6 py-4 rounded-2xl border-4 border-b-[6px] border-[#1cb0f6] bg-[#ddf4ff] text-[#1cb0f6] font-black text-2xl hover:bg-[#c8ecff] active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50"
          >
            {part}
          </motion.button>
        ))}
      </div>

      {/* Стереть последний */}
      {built.length > 0 && status === 'idle' && (
        <button
          onClick={removeLast}
          className="text-gray-400 font-bold text-sm hover:text-[#FF4B4B] transition-colors"
        >
          ← Удалить последний слог
        </button>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// Финальный экран
// ════════════════════════════════════════════════════════════════════════════════
function ResultsScreen({ stars, correctCount, total, xp, onContinue }) {
  return (
    <div className="min-h-screen bg-[#58cc02] flex flex-col items-center justify-center p-6 text-white text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        className="flex flex-col items-center"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-8xl mb-4"
        >
          🎉
        </motion.div>

        <h1 className="text-5xl font-black mb-4 uppercase tracking-widest drop-shadow-lg">
          Молодец!
        </h1>

        {/* Звёзды */}
        <div className="flex gap-3 mb-6">
          {[1, 2, 3].map((s) => (
            <motion.div
              key={s}
              initial={{ scale: 0, rotate: -40 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3 + s * 0.15, type: 'spring', bounce: 0.7 }}
            >
              <Star
                size={64}
                className={
                  s <= stars
                    ? 'fill-yellow-300 text-yellow-300 drop-shadow-lg'
                    : 'fill-white/20 text-white/20'
                }
              />
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-3xl font-black mb-2"
        >
          +{xp} XP
        </motion.p>
        <p className="text-white/80 font-bold mb-10 text-lg">
          Правильных ответов: {correctCount} из {total}
        </p>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          whileTap={{ scale: 0.96 }}
          onClick={onContinue}
          className="w-full max-w-xs bg-white text-[#58cc02] font-black text-xl py-5 rounded-2xl border-b-8 border-white/30 active:border-b-0 active:translate-y-2 transition-all uppercase tracking-wider shadow-xl"
        >
          Продолжить →
        </motion.button>
      </motion.div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// Главный компонент
// ════════════════════════════════════════════════════════════════════════════════
export default function LessonScreen() {
  const { childId, lessonId } = useParams();
  const navigate = useNavigate();

  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [selected, setSelected] = useState(null); // null | string | string[]
  const [status, setStatus] = useState('idle');   // idle | correct | wrong
  const [correctCount, setCorrectCount] = useState(0);
  const [showFinish, setShowFinish] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);

  useEffect(() => {
    loadExercises();
  }, [lessonId]);

  const loadExercises = async () => {
    try {
      const data = await api.getLessonExercises(lessonId);
      const list = Array.isArray(data) && data.length > 0 ? data : FALLBACK_EXERCISES;
      setExercises(list);
    } catch {
      setExercises(FALLBACK_EXERCISES);
    } finally {
      setLoading(false);
    }
  };

  const exercise = exercises[currentStep];
  const progress = exercises.length > 0 ? (currentStep / exercises.length) * 100 : 0;

  // Нормализуем тип: бэкенд может вернуть 'multiple_choice' тоже
  const exType = exercise?.type ?? 'match';

  const handleCheck = () => {
    if (!selected && !Array.isArray(selected)) return;
    if (Array.isArray(selected) && selected.length === 0) return;

    const correct = getCorrect(exercise);
    const answer = Array.isArray(selected) ? selected.join('') : selected;

    if (answer === correct) {
      setStatus('correct');
      setCorrectCount((c) => c + 1);
    } else {
      setStatus('wrong');
    }
  };

  const handleNext = async () => {
    if (currentStep < exercises.length - 1) {
      setCurrentStep((s) => s + 1);
      setSelected(null);
      setStatus('idle');
    } else {
      // Урок окончен
      const finalCorrect = correctCount + (status === 'correct' ? 1 : 0);
      const accuracy = finalCorrect / exercises.length;
      const stars = accuracy >= 0.9 ? 3 : accuracy >= 0.6 ? 2 : 1;
      setEarnedStars(stars);

      try {
        const result = await api.completeLesson(childId, lessonId, stars);
        setXpEarned(result?.current_xp ? stars * 10 : stars * 10);
      } catch {
        setXpEarned(stars * 10);
      }
      setShowFinish(true);
    }
    navigate(`/child/${childId}/lesson/${lessonId}/results`, {
  state: { stars, correctCount, total: exercises.length, xp: xpEarned, newBadges }
});
  };

  const isAnswered = () => {
    if (!selected) return false;
    if (Array.isArray(selected)) return selected.length > 0;
    return true;
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ repeat: Infinity, duration: 0.9 }}
          className="text-8xl"
        >
          🦉
        </motion.div>
      </div>
    );
  }

  // ── Results ──
  if (showFinish) {
    return (
      <ResultsScreen
        stars={earnedStars}
        correctCount={correctCount}
        total={exercises.length}
        xp={xpEarned}
        onContinue={() => navigate(`/child/${childId}/map`)}
      />
    );
  }

  const correctAnswer = getCorrect(exercise);

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── Прогресс-бар ── */}
      <div className="flex items-center gap-4 px-6 pt-6 pb-2 w-full max-w-2xl mx-auto">
        <button
          onClick={() => navigate(`/child/${childId}/map`)}
          className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0"
        >
          <X size={34} />
        </button>
        <div className="flex-1 bg-gray-100 h-4 rounded-full overflow-hidden">
          <motion.div
            className="bg-[#58cc02] h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <span className="text-sm font-black text-gray-400 flex-shrink-0 min-w-[44px] text-right">
          {currentStep + 1}/{exercises.length}
        </span>
      </div>

      {/* ── Упражнение ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 w-full max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            {(exType === 'match' || exType === 'multiple_choice') && (
              <MatchExercise
                exercise={exercise}
                selected={selected}
                onSelect={setSelected}
                status={status}
              />
            )}
            {exType === 'select_image' && (
              <SelectImageExercise
                exercise={exercise}
                selected={selected}
                onSelect={setSelected}
                status={status}
              />
            )}
            {exType === 'listen' && (
              <ListenExercise
                exercise={exercise}
                selected={selected}
                onSelect={setSelected}
                status={status}
              />
            )}
            {exType === 'build_word' && (
              <BuildWordExercise
                exercise={exercise}
                selected={selected}
                onSelect={setSelected}
                status={status}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Нижняя панель: фидбек + кнопка ── */}
      <AnimatePresence>
        <motion.div
          key={status}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`
            px-6 py-5 border-t-2 transition-colors duration-300
            ${status === 'correct' ? 'bg-green-50 border-green-200' : ''}
            ${status === 'wrong'   ? 'bg-red-50   border-red-200'   : ''}
            ${status === 'idle'    ? 'bg-white     border-gray-100'  : ''}
          `}
        >
          <div className="w-full max-w-2xl mx-auto flex items-center justify-between gap-4">

            {/* Фидбек */}
            <div className="flex-1">
              {status === 'correct' && (
                <motion.div
                  initial={{ x: -16, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="flex items-center gap-3 text-[#58cc02] font-black text-2xl"
                >
                  <div className="bg-white rounded-full p-2 shadow-sm flex-shrink-0">
                    <Check size={30} className="text-[#58cc02]" />
                  </div>
                  Отлично!
                </motion.div>
              )}
              {status === 'wrong' && (
                <motion.div
                  initial={{ x: -16, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="flex flex-col"
                >
                  <span className="flex items-center gap-3 text-[#FF4B4B] font-black text-xl">
                    <div className="bg-white rounded-full p-2 shadow-sm flex-shrink-0">
                      <X size={26} className="text-[#FF4B4B]" />
                    </div>
                    Не расстраивайся!
                  </span>
                  <span className="text-gray-500 font-bold text-sm mt-1 ml-12">
                    Правильный ответ:{' '}
                    <strong className="text-[#3c3c3c]">
                      {Array.isArray(correctAnswer)
                        ? correctAnswer.join('')
                        : correctAnswer}
                    </strong>
                  </span>
                </motion.div>
              )}
            </div>

            {/* Кнопка */}
            <button
              onClick={status === 'idle' ? handleCheck : handleNext}
              disabled={status === 'idle' && !isAnswered()}
              className={`
                px-8 py-4 rounded-2xl font-black text-lg uppercase tracking-wider transition-all flex-shrink-0
                ${status === 'idle' && isAnswered()
                  ? 'bg-[#58cc02] text-white border-b-4 border-[#46a302] hover:bg-[#46a302] active:translate-y-1 active:border-b-0'
                  : ''}
                ${status === 'idle' && !isAnswered()
                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  : ''}
                ${status === 'correct'
                  ? 'bg-[#58cc02] text-white border-b-4 border-[#46a302] active:translate-y-1 active:border-b-0'
                  : ''}
                ${status === 'wrong'
                  ? 'bg-[#FF4B4B] text-white border-b-4 border-[#cc0000] active:translate-y-1 active:border-b-0'
                  : ''}
              `}
            >
              {status === 'idle' ? 'Проверить' : 'Дальше →'}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
