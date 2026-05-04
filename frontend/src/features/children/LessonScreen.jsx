import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Volume2 } from 'lucide-react';
import { api } from '../../services/api';

function parseContent(raw) {
  if (!raw) return {};
  if (typeof raw === 'string') { try { return JSON.parse(raw); } catch { return {}; } }
  return raw;
}
function getCorrect(exercise) {
  const c = parseContent(exercise.content);
  return c.correct_answer ?? c.correct ?? exercise.answer ?? '';
}

const FALLBACK_EXERCISES = [
  { id: 1, type: 'match',        content: { question: 'Найди букву А', options: ['Б', 'А', 'В', 'О'], correct_answer: 'А' } },
  { id: 2, type: 'select_image', content: { question: "Что начинается на «А»?", options: [{ icon: '🍉', word: 'Арбуз' }, { icon: '🍌', word: 'Банан' }, { icon: '🐱', word: 'Кот' }, { icon: '🍎', word: 'Апельсин' }], correct_answer: 'Арбуз' } },
  { id: 3, type: 'build_word',   content: { question: 'Собери слово МАМА', parts: ['МА', 'ПА', 'БА', 'МА'], correct_answer: 'МАМА' } },
  { id: 4, type: 'listen',       content: { text: 'Послушай и нажми правильную букву', audio_url: '/sounds/a.mp3', options: ['О', 'У', 'А', 'И'], correct_answer: 'А' } },
];

function MatchExercise({ exercise, selected, onSelect, status }) {
  const c = parseContent(exercise.content);
  const options = c.options ?? [];
  const correct = getCorrect(exercise);
  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto gap-6">
      <motion.h2 key={exercise.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="text-3xl md:text-4xl font-black text-[#3c3c3c] text-center leading-tight">{c.question}</motion.h2>
      <div className="grid grid-cols-2 gap-4 w-full">
        {options.map((opt, idx) => {
          let cls = 'border-2 border-gray-200 bg-white text-[#3c3c3c] hover:border-[#1cb0f6] hover:bg-blue-50';
          if (selected === opt && status === 'idle') cls = 'border-2 border-b-[6px] border-[#1cb0f6] bg-blue-50 text-[#1cb0f6]';
          if (status !== 'idle' && opt === correct) cls = 'border-2 border-b-[6px] border-[#58cc02] bg-green-50 text-[#58cc02]';
          if (status === 'wrong' && selected === opt) cls = 'border-2 border-b-[6px] border-[#FF4B4B] bg-red-50 text-[#FF4B4B]';
          if (status !== 'idle' && selected !== opt && opt !== correct) cls = 'border-2 border-gray-100 bg-white text-gray-300 opacity-50';
          return (
            <motion.button key={idx} whileTap={status === 'idle' ? { scale: 0.94 } : {}}
              disabled={status !== 'idle'} onClick={() => onSelect(opt)}
              className={`py-7 rounded-3xl font-black text-4xl transition-all ${cls}`}>{opt}</motion.button>
          );
        })}
      </div>
    </div>
  );
}

function SelectImageExercise({ exercise, selected, onSelect, status }) {
  const c = parseContent(exercise.content);
  const options = c.options ?? [];
  const correct = getCorrect(exercise);
  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto gap-6">
      <motion.h2 key={exercise.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-3xl font-black text-[#3c3c3c] text-center">{c.question}</motion.h2>
      <div className="grid grid-cols-2 gap-4 w-full">
        {options.map((opt, idx) => {
          const word = typeof opt === 'object' ? opt.word : opt;
          const icon = typeof opt === 'object' ? opt.icon : '❓';
          let cls = 'border-4 border-gray-200 bg-white hover:border-[#1cb0f6] hover:bg-blue-50';
          if (selected === word && status === 'idle') cls = 'border-4 border-[#1cb0f6] bg-blue-50 scale-105 shadow-lg';
          if (status !== 'idle' && word === correct) cls = 'border-4 border-[#58cc02] bg-green-50 scale-105 shadow-lg';
          if (status === 'wrong' && selected === word) cls = 'border-4 border-[#FF4B4B] bg-red-50';
          if (status !== 'idle' && selected !== word && word !== correct) cls = 'border-4 border-gray-100 bg-white opacity-40';
          return (
            <motion.button key={idx} whileTap={status === 'idle' ? { scale: 0.93 } : {}}
              disabled={status !== 'idle'} onClick={() => onSelect(word)}
              className={`flex flex-col items-center justify-center p-5 rounded-3xl transition-all ${cls}`}>
              <span className="text-6xl mb-2">{icon}</span>
              <span className="font-black text-lg text-[#3c3c3c]">{word}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

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
      <p className="text-xl font-black text-[#5a8a9f] text-center">{c.text ?? 'Послушай и выбери правильный ответ'}</p>
      <motion.button whileTap={{ scale: 0.9 }} onClick={playAudio}
        className={`w-32 h-32 rounded-full flex flex-col items-center justify-center gap-2 shadow-lg transition-all border-4
          ${playing ? 'bg-[#1cb0f6] text-white border-[#1499d3]' : 'bg-[#ddf4ff] text-[#1cb0f6] border-[#1cb0f6]'}`}
        animate={playing ? { scale: [1, 1.08, 1] } : {}} transition={{ repeat: playing ? Infinity : 0, duration: 0.6 }}>
        <Volume2 size={48} />
        <span className="text-xs font-black uppercase tracking-widest">{playing ? 'Звучит...' : 'Слушать'}</span>
      </motion.button>
      <div className="grid grid-cols-2 gap-4 w-full">
        {options.map((opt, idx) => {
          let cls = 'border-2 border-gray-200 bg-white text-[#3c3c3c] hover:border-[#1cb0f6] hover:bg-blue-50';
          if (selected === opt && status === 'idle') cls = 'border-2 border-b-[6px] border-[#1cb0f6] bg-blue-50 text-[#1cb0f6]';
          if (status !== 'idle' && opt === correct) cls = 'border-2 border-b-[6px] border-[#58cc02] bg-green-50 text-[#58cc02]';
          if (status === 'wrong' && selected === opt) cls = 'border-2 border-b-[6px] border-[#FF4B4B] bg-red-50 text-[#FF4B4B]';
          if (status !== 'idle' && selected !== opt && opt !== correct) cls = 'border-2 border-gray-100 opacity-40';
          return (
            <motion.button key={idx} whileTap={status === 'idle' ? { scale: 0.94 } : {}}
              disabled={status !== 'idle'} onClick={() => onSelect(opt)}
              className={`py-7 rounded-3xl font-black text-4xl transition-all ${cls}`}>{opt}</motion.button>
          );
        })}
      </div>
    </div>
  );
}

function BuildWordExercise({ exercise, selected, onSelect, status }) {
  const c = parseContent(exercise.content);
  const parts = c.parts ?? [];
  const built = Array.isArray(selected) ? selected : [];
  const builtColor = status === 'correct' ? 'text-[#58cc02]' : status === 'wrong' ? 'text-[#FF4B4B]' : 'text-[#3c3c3c]';
  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto gap-6">
      <motion.h2 key={exercise.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-3xl font-black text-[#3c3c3c] text-center">{c.question}</motion.h2>
      <div className="min-h-[72px] w-full bg-gray-50 rounded-3xl border-2 border-dashed border-gray-300 flex items-center justify-center px-6 gap-2">
        {built.length === 0
          ? <span className="text-gray-300 font-black text-xl">Нажимай на слоги ↓</span>
          : built.map((p, i) => <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
              className={`text-3xl font-black ${builtColor}`}>{p}</motion.span>)
        }
      </div>
      <div className="flex flex-wrap gap-3 justify-center w-full">
        {parts.map((part, idx) => (
          <motion.button key={idx} whileTap={status === 'idle' ? { scale: 0.88 } : {}} disabled={status !== 'idle'}
            onClick={() => onSelect([...built, part])}
            className="px-6 py-4 rounded-2xl border-4 border-b-[6px] border-[#1cb0f6] bg-[#ddf4ff] text-[#1cb0f6] font-black text-2xl hover:bg-[#c8ecff] active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50">
            {part}
          </motion.button>
        ))}
      </div>
      {built.length > 0 && status === 'idle' && (
        <button onClick={() => onSelect(built.slice(0, -1))}
          className="text-gray-400 font-bold text-sm hover:text-[#FF4B4B] transition-colors">
          ← Удалить последний слог
        </button>
      )}
    </div>
  );
}

export default function LessonScreen() {
  const { childId, lessonId } = useParams();
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState('idle');
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => { loadExercises(); }, [lessonId]);

  const loadExercises = async () => {
    try {
      const data = await api.getLessonExercises(lessonId);
      setExercises(Array.isArray(data) && data.length > 0 ? data : FALLBACK_EXERCISES);
    } catch { setExercises(FALLBACK_EXERCISES); }
    finally { setLoading(false); }
  };

  const exercise = exercises[currentStep];
  const exType = exercise?.type ?? 'match';
  const progress = exercises.length > 0 ? (currentStep / exercises.length) * 100 : 0;
  const isAnswered = Array.isArray(selected) ? selected.length > 0 : !!selected;

  const handleCheck = () => {
    if (!isAnswered) return;
    const correct = getCorrect(exercise);
    const answer = Array.isArray(selected) ? selected.join('') : selected;
    if (answer === correct) { setStatus('correct'); setCorrectCount(c => c + 1); }
    else { setStatus('wrong'); }
  };

  const handleNext = async () => {
    if (currentStep < exercises.length - 1) {
      setCurrentStep(s => s + 1);
      setSelected(null);
      setStatus('idle');
      return; 
    }

    const finalCorrect = correctCount + (status === 'correct' ? 1 : 0);
    const accuracy = finalCorrect / exercises.length;
    const stars = accuracy >= 0.9 ? 3 : accuracy >= 0.6 ? 2 : 1;
    const xp = stars * 10;
    let newBadges = [];

    try {
      const result = await api.completeLesson(childId, lessonId, stars);
      newBadges = result?.new_badges ?? [];
    } catch {  }

    navigate(`/child/${childId}/lesson/${lessonId}/results`, {
      state: { stars, correctCount: finalCorrect, total: exercises.length, xp, newBadges }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 0.9 }} className="text-8xl">🦉</motion.div>
      </div>
    );
  }

  const correctAnswer = getCorrect(exercise);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex items-center gap-4 px-6 pt-6 pb-2 w-full max-w-2xl mx-auto">
        <button onClick={() => navigate(`/child/${childId}/map`)} className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0">
          <X size={34} />
        </button>
        <div className="flex-1 bg-gray-100 h-4 rounded-full overflow-hidden">
          <motion.div className="bg-[#58cc02] h-full rounded-full" initial={{ width: 0 }}
            animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
        </div>
        <span className="text-sm font-black text-gray-400 flex-shrink-0 min-w-[44px] text-right">
          {currentStep + 1}/{exercises.length}
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 w-full max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div key={currentStep} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.2 }} className="w-full">
            {(exType === 'match' || exType === 'multiple_choice') && <MatchExercise exercise={exercise} selected={selected} onSelect={setSelected} status={status} />}
            {exType === 'select_image' && <SelectImageExercise exercise={exercise} selected={selected} onSelect={setSelected} status={status} />}
            {exType === 'listen' && <ListenExercise exercise={exercise} selected={selected} onSelect={setSelected} status={status} />}
            {exType === 'build_word' && <BuildWordExercise exercise={exercise} selected={selected} onSelect={setSelected} status={status} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        <motion.div key={status} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className={`px-6 py-5 border-t-2 transition-colors duration-300
            ${status === 'correct' ? 'bg-green-50 border-green-200' : ''}
            ${status === 'wrong'   ? 'bg-red-50 border-red-200'     : ''}
            ${status === 'idle'    ? 'bg-white border-gray-100'     : ''}`}>
          <div className="w-full max-w-2xl mx-auto flex items-center justify-between gap-4">
            <div className="flex-1">
              {status === 'correct' && (
                <motion.div initial={{ x: -16, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                  className="flex items-center gap-3 text-[#58cc02] font-black text-2xl">
                  <div className="bg-white rounded-full p-2 shadow-sm flex-shrink-0"><Check size={30} className="text-[#58cc02]" /></div>
                  Отлично!
                </motion.div>
              )}
              {status === 'wrong' && (
                <motion.div initial={{ x: -16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex flex-col">
                  <span className="flex items-center gap-3 text-[#FF4B4B] font-black text-xl">
                    <div className="bg-white rounded-full p-2 shadow-sm flex-shrink-0"><X size={26} className="text-[#FF4B4B]" /></div>
                    Не расстраивайся!
                  </span>
                  <span className="text-gray-500 font-bold text-sm mt-1 ml-12">
                    Правильный ответ: <strong className="text-[#3c3c3c]">
                      {Array.isArray(correctAnswer) ? correctAnswer.join('') : correctAnswer}
                    </strong>
                  </span>
                </motion.div>
              )}
            </div>
            <button
              onClick={status === 'idle' ? handleCheck : handleNext}
              disabled={status === 'idle' && !isAnswered}
              className={`px-8 py-4 rounded-2xl font-black text-lg uppercase tracking-wider transition-all flex-shrink-0
                ${status === 'idle' && isAnswered   ? 'bg-[#58cc02] text-white border-b-4 border-[#46a302] hover:bg-[#46a302] active:translate-y-1 active:border-b-0' : ''}
                ${status === 'idle' && !isAnswered  ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : ''}
                ${status === 'correct' ? 'bg-[#58cc02] text-white border-b-4 border-[#46a302] active:translate-y-1 active:border-b-0' : ''}
                ${status === 'wrong'   ? 'bg-[#FF4B4B] text-white border-b-4 border-[#cc0000] active:translate-y-1 active:border-b-0' : ''}`}>
              {status === 'idle' ? 'Проверить' : 'Дальше →'}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
