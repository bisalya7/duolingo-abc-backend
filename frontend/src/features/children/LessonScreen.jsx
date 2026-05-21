import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Volume2 } from 'lucide-react';
import { api } from '../../services/api';
import HandwritingExercise from './HandwritingExercise';

const playSound = (url) => {
  const audio = new Audio(url);
  audio.play().catch(e => console.warn("Audio play blocked", e));
};

const parseContent = (content) => {
  if (typeof content === 'string') {
    try { return JSON.parse(content); } catch { return {}; }
  }
  return content || {};
};

const getCorrect = (ex) => {
  const c = parseContent(ex.content);
  return ex.answer || c.correct_answer || '';
};

function MatchExercise({ exercise, selected, onSelect, status }) {
  const c = parseContent(exercise.content);
  const options = c.options ?? [];
  const correct = getCorrect(exercise);

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-black text-[#3c3c3c] text-center">
        {c.question ?? 'Выбери правильный перевод'}
      </h2>
      <div className="grid grid-cols-1 gap-4 w-full">
        {options.map((opt, idx) => {
          const isSelected = selected === opt;
          const isCorrect = status !== 'idle' && opt === correct;
          const isWrong = status === 'wrong' && isSelected;

          let colorClass = 'bg-white border-gray-200 text-[#3c3c3c] hover:bg-gray-50';
          if (isSelected && status === 'idle') colorClass = 'bg-[#ddf4ff] border-[#1cb0f6] text-[#1cb0f6]';
          if (isCorrect) colorClass = 'bg-[#d7ffb8] border-[#58cc02] text-[#58cc02]';
          if (isWrong) colorClass = 'bg-[#ffdfe0] border-[#ff4b4b] text-[#ff4b4b]';

          return (
            <motion.button
              key={idx}
              whileTap={{ scale: 0.98 }}
              onClick={() => status === 'idle' && onSelect(opt)}
              className={`p-5 rounded-2xl border-2 font-black text-xl transition-all shadow-[0_4px_0_0_rgba(0,0,0,0.05)] ${colorClass}`}
            >
              {opt}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function ImageExercise({ exercise, selected, onSelect, status }) {
  const c = parseContent(exercise.content);
  const options = c.options ?? [];
  const correct = getCorrect(exercise);

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <h2 className="text-2xl font-black text-[#3c3c3c] text-center">
        {c.question ?? 'Выбери картинку'}
      </h2>
      <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
        {options.map((opt, idx) => {
          const val = typeof opt === 'string' ? opt : (opt.word ?? opt.text ?? '');
          const icon = typeof opt === 'string' ? null : (opt.icon ?? null);
          const img  = typeof opt === 'string' ? null : (opt.img  ?? null);

          const isSelected = selected === val;
          const isCorrect = status !== 'idle' && val === correct;
          const isWrong = status === 'wrong' && isSelected;

          let borderColor = 'border-gray-200';
          if (isSelected) borderColor = 'border-[#1cb0f6] bg-[#ddf4ff]';
          if (isCorrect)  borderColor = 'border-[#58cc02] bg-[#d7ffb8]';
          if (isWrong)    borderColor = 'border-[#ff4b4b] bg-[#ffdfe0]';

          return (
            <motion.button
              key={idx}
              whileTap={{ scale: 0.95 }}
              onClick={() => status === 'idle' && onSelect(val)}
              className={`flex flex-col items-center p-4 rounded-3xl border-4 transition-all ${borderColor}`}
            >
              <div className="w-full aspect-square bg-gray-100 rounded-2xl mb-3 overflow-hidden flex items-center justify-center">
                {img ? (
                  <img src={img} alt={val} className="w-full h-full object-cover" />
                ) : icon ? (
                  <span className="text-6xl">{icon}</span>
                ) : (
                  <span className="text-4xl">🖼️</span>
                )}
              </div>
              <span className="font-black text-lg text-[#3c3c3c]">{val}</span>
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

  const fallbackSpeak = useCallback(() => {
    const textToSpeak = c.letter || correct || c.question;
    if (!textToSpeak) return;
    setPlaying(true);
    const utt = new SpeechSynthesisUtterance(textToSpeak);
    utt.lang = 'ru-RU';
    utt.rate = 0.7;
    utt.onend = () => setPlaying(false);
    utt.onerror = () => setPlaying(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utt);
  }, [c.letter, c.question, correct]);

  const playTaskAudio = useCallback(() => {
    if (c.audio_url) {
      const audio = new Audio(c.audio_url);
      setPlaying(true);
      audio.play().catch(() => {
        setPlaying(false);
        fallbackSpeak();
      });
      audio.onended = () => setPlaying(false);
      audio.onerror = () => {
        setPlaying(false);
        fallbackSpeak();
      };
    } else {
      fallbackSpeak();
    }
  }, [c.audio_url, fallbackSpeak]);

  useEffect(() => {
    const timer = setTimeout(playTaskAudio, 500);
    return () => {
      clearTimeout(timer);
      window.speechSynthesis.cancel();
    };
  }, [exercise.id, playTaskAudio]);

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto gap-8">
      <p className="text-xl font-black text-[#5a8a9f] text-center">
        {c.text ?? 'Послушай и выбери правильный ответ'}
      </p>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={playTaskAudio}
        className={`w-32 h-32 rounded-full flex flex-col items-center justify-center gap-2 shadow-lg transition-all
          ${playing
            ? 'bg-[#1cb0f6] text-white border-4 border-[#1499d3]'
            : 'bg-[#ddf4ff] text-[#1cb0f6] border-4 border-[#1cb0f6] hover:bg-[#c8ecff]'
          }`}
        animate={playing ? { scale: [1, 1.1, 1] } : {}}
        transition={{ repeat: playing ? Infinity : 0, duration: 0.6 }}
      >
        <Volume2 size={48} />
        <span className="text-xs font-black uppercase tracking-widest">
          {playing ? 'Слушаем...' : 'Слушать'}
        </span>
      </motion.button>

      <div className="grid grid-cols-2 gap-4 w-full mt-4">
        {options.map((opt, idx) => {
          const isSelected = selected === opt;
          const isCorrect = status !== 'idle' && opt === correct;
          const isWrong = status === 'wrong' && isSelected;

          let cls = "py-6 rounded-3xl font-black text-3xl border-4 transition-all ";
          if (status === 'idle') {
            cls += isSelected
              ? "border-[#1cb0f6] bg-[#ddf4ff] text-[#1cb0f6]"
              : "border-gray-200 text-[#3c3c3c] hover:bg-gray-50";
          } else {
            if (isCorrect)     cls += "border-[#58cc02] bg-[#d7ffb8] text-[#58cc02]";
            else if (isWrong)  cls += "border-[#ff4b4b] bg-[#ffdfe0] text-[#ff4b4b]";
            else               cls += "border-gray-100 text-gray-200 opacity-50";
          }

          return (
            <button key={idx} onClick={() => status === 'idle' && onSelect(opt)} className={cls}>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MultipleChoiceExercise({ exercise, selected, onSelect, status }) {
  const c = parseContent(exercise.content);
  const options = c.options ?? [];
  const correct = getCorrect(exercise);

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-black text-[#3c3c3c] text-center">
        {c.question ?? 'Выбери правильный ответ'}
      </h2>
      <div className="grid grid-cols-1 gap-4 w-full">
        {options.map((opt, idx) => {
          const isSelected = selected === opt;
          const isCorrect = status !== 'idle' && opt === correct;
          const isWrong = status === 'wrong' && isSelected;

          let colorClass = 'bg-white border-gray-200 text-[#3c3c3c] hover:bg-gray-50';
          if (isSelected && status === 'idle') colorClass = 'bg-[#ddf4ff] border-[#1cb0f6] text-[#1cb0f6]';
          if (isCorrect) colorClass = 'bg-[#d7ffb8] border-[#58cc02] text-[#58cc02]';
          if (isWrong)   colorClass = 'bg-[#ffdfe0] border-[#ff4b4b] text-[#ff4b4b]';

          return (
            <motion.button
              key={idx}
              whileTap={{ scale: 0.98 }}
              onClick={() => status === 'idle' && onSelect(opt)}
              className={`p-5 rounded-2xl border-2 font-black text-xl transition-all text-left shadow-[0_4px_0_0_rgba(0,0,0,0.05)] ${colorClass}`}
            >
              <span className="mr-3 opacity-50">{String.fromCharCode(65 + idx)}.</span>
              {opt}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function BuildWordExercise({ exercise, selected, onSelect, status }) {
  const c = parseContent(exercise.content);
  const correct = getCorrect(exercise);
  const letters = c.options ?? c.parts ?? (correct ? correct.split('') : []);
  const [built, setBuilt] = useState([]);
  const [remaining, setRemaining] = useState(() => letters.map((l, i) => ({ l, i })));

  useEffect(() => {
    if (!selected) {
      setBuilt([]);
      setRemaining(letters.map((l, i) => ({ l, i })));
    }
  }, [selected, exercise.id, letters]);

  const addLetter = (item) => {
    if (status !== 'idle') return;
    const newBuilt = [...built, item];
    setBuilt(newBuilt);
    setRemaining(remaining.filter((r) => r.i !== item.i));
    onSelect(newBuilt.map((b) => b.l).join(''));
  };

  const removeLetter = (item, idx) => {
    if (status !== 'idle') return;
    const newBuilt = built.filter((_, i) => i !== idx);
    setBuilt(newBuilt);
    setRemaining([...remaining, item].sort((a, b) => a.i - b.i));
    onSelect(newBuilt.map((b) => b.l).join('') || null);
  };

  const isCorrect = status === 'correct';
  const isWrong   = status === 'wrong';

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-black text-[#3c3c3c] text-center">
        {c.question ?? 'Собери слово'}
      </h2>

      <div className={`min-h-[72px] w-full flex flex-wrap gap-2 justify-center items-center p-4 rounded-2xl border-4 transition-all
        ${isCorrect ? 'border-[#58cc02] bg-[#d7ffb8]' : isWrong ? 'border-[#ff4b4b] bg-[#ffdfe0]' : 'border-gray-200 bg-gray-50'}`}
      >
        {built.length === 0 && (
          <span className="text-gray-300 font-black text-lg">Нажимай буквы снизу</span>
        )}
        {built.map((item, idx) => (
          <motion.button
            key={`${item.i}-${idx}`}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={() => removeLetter(item, idx)}
            className={`w-14 h-14 rounded-xl font-black text-2xl border-2 transition-all
              ${isCorrect ? 'border-[#58cc02] text-[#58cc02] bg-white' :
                isWrong   ? 'border-[#ff4b4b] text-[#ff4b4b] bg-white' :
                            'border-[#1cb0f6] text-[#1cb0f6] bg-white hover:bg-red-50'}`}
          >
            {item.l}
          </motion.button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        {remaining.map((item) => (
          <motion.button
            key={item.i}
            whileTap={{ scale: 0.9 }}
            onClick={() => addLetter(item)}
            className="w-14 h-14 rounded-xl font-black text-2xl border-4 border-gray-200 bg-white text-[#3c3c3c] hover:border-[#1cb0f6] hover:text-[#1cb0f6] transition-all shadow-[0_4px_0_0_rgba(0,0,0,0.08)]"
          >
            {item.l}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export default function LessonScreen() {
  const { childId, lessonId } = useParams();
  const navigate = useNavigate();

  const [exercises, setExercises]     = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected]       = useState(null);
  const [status, setStatus]           = useState('idle');
  const [correctCount, setCorrectCount] = useState(0);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    api.getLessonExercises(lessonId)
      .then(data => {
        setExercises(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [lessonId]);

  const exercise = exercises[currentIndex];

  const handleCheck = () => {
    if (!selected) return;
    if (status !== 'idle') return;
    const correct = getCorrect(exercise);

    if (selected === correct) {
      setStatus('correct');
      setCorrectCount(prev => prev + 1);
      playSound('/sounds/correct.mp3');
    } else {
      setStatus('wrong');
      playSound('/sounds/wrong.mp3');
    }
  };

  const handleNext = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelected(null);
      setStatus('idle');
    } else {
      const stars = correctCount === exercises.length
        ? 3
        : correctCount / exercises.length > 0.6 ? 2 : 1;

      api.completeLesson(childId, lessonId, correctCount)
        .then(() => {
          navigate(`/child/${childId}/lesson/${lessonId}/results`, {
            state: { stars, correctCount, total: exercises.length, lessonTitle: 'Урок завершён' },
          });
        })
        .catch(() => {
          navigate(`/child/${childId}/lesson/${lessonId}/results`, {
            state: { stars, correctCount, total: exercises.length, lessonTitle: 'Урок завершён' },
          });
        });
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center font-black text-[#1cb0f6]">
      Загрузка...
    </div>
  );
  if (!exercise) return (
    <div className="min-h-screen flex items-center justify-center font-black text-gray-400">
      Заданий пока нет
    </div>
  );

  const progress = (currentIndex / exercises.length) * 100;

  return (
    <div className="min-h-screen bg-white flex flex-col">

      <div className="max-w-5xl mx-auto w-full px-6 pt-8 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 transition-colors">
          <X size={32} />
        </button>
        <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#58cc02] shadow-[0_2px_0_0_#46a302]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center gap-1 text-[#ffd200] font-black">
          <Check size={24} /> {correctCount}
        </div>
      </div>

      <main className="flex-1 flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={exercise.id}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            className="w-full"
          >
            {exercise.type === 'match' && (
              <MatchExercise exercise={exercise} selected={selected} onSelect={setSelected} status={status} />
            )}
            {exercise.type === 'select_image' && (
              <ImageExercise exercise={exercise} selected={selected} onSelect={setSelected} status={status} />
            )}
            {exercise.type === 'listen' && (
              <ListenExercise exercise={exercise} selected={selected} onSelect={setSelected} status={status} />
            )}
            {exercise.type === 'multiple_choice' && (
              <MultipleChoiceExercise exercise={exercise} selected={selected} onSelect={setSelected} status={status} />
            )}
            {exercise.type === 'build_word' && (
              <BuildWordExercise exercise={exercise} selected={selected} onSelect={setSelected} status={status} />
            )}
            {exercise.type === 'handwriting' && (
              <HandwritingExercise
                exercise={exercise}
                onComplete={(val) => {
                  setSelected(val);
                  setStatus('correct');
                  setCorrectCount(prev => prev + 1);
                  playSound('/sounds/correct.mp3');
                }}
                status={status}
              />
            )}
            {!['match', 'select_image', 'listen', 'multiple_choice', 'build_word', 'handwriting'].includes(exercise.type) && (
              <div className="text-center text-gray-400 font-black">
                Неизвестный тип задания: {exercise.type}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className={`py-8 px-6 border-t-2 transition-colors ${
        status === 'correct' ? 'bg-[#d7ffb8] border-[#58cc02]' :
        status === 'wrong'   ? 'bg-[#ffdfe0] border-[#ff4b4b]' : 'bg-white border-gray-100'
      }`}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex-1">
            {status === 'correct' && (
              <div className="flex items-center gap-4 text-[#58cc02] font-black text-2xl">
                <div className="bg-white rounded-full p-2"><Check size={32} /></div>
                Супер! Правильно!
              </div>
            )}
            {status === 'wrong' && (
              <div className="flex items-center gap-4 text-[#ff4b4b] font-black text-2xl">
                <div className="bg-white rounded-full p-2"><X size={32} /></div>
                Ой! Правильно: {getCorrect(exercise)}
              </div>
            )}
          </div>

          {exercise.type !== 'handwriting' && (
            <button
              onClick={status === 'idle' ? handleCheck : handleNext}
              disabled={status === 'idle' && !selected}
              className={`px-10 py-4 rounded-2xl font-black text-xl uppercase tracking-wider transition-all
                ${status === 'idle' && !selected ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : ''}
                ${status === 'idle' && selected  ? 'bg-[#58cc02] text-white shadow-[0_4px_0_0_#46a302] hover:bg-[#46a302]' : ''}
                ${status === 'correct' ? 'bg-[#58cc02] text-white shadow-[0_4px_0_0_#46a302]' : ''}
                ${status === 'wrong'   ? 'bg-[#ff4b4b] text-white shadow-[0_4px_0_0_#cc0000]' : ''}
              `}
            >
              {status === 'idle' ? 'Проверить' : 'Дальше'}
            </button>
          )}

          {exercise.type === 'handwriting' && status === 'idle' && (
            <div className="text-gray-400 font-black text-lg">
              Обведи букву ✏️
            </div>
          )}

          {exercise.type === 'handwriting' && status === 'correct' && (
            <button
              onClick={handleNext}
              className="px-10 py-4 rounded-2xl font-black text-xl uppercase tracking-wider bg-[#58cc02] text-white shadow-[0_4px_0_0_#46a302]"
            >
              Дальше →
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}