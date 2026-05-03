import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { api } from '../../services/api';

// Временные данные урока
const LESSON_DATA = [
  { question: 'Найди букву А', options: ['О', 'А', 'У', 'М'], correct: 'А' },
  { question: 'Какая буква первая в слове КОТ?', options: ['М', 'Т', 'К', 'В'], correct: 'К' },
  { question: 'Выбери букву О', options: ['А', 'О', 'П', 'С'], correct: 'О' }
];

export default function LessonScreen() {
  const { childId } = useParams();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, correct, wrong
  const [showFinish, setShowFinish] = useState(false);

  const task = LESSON_DATA[currentStep];
  const progress = ((currentStep) / LESSON_DATA.length) * 100;

  const handleCheck = () => {
    if (!selectedOption) return;

    if (selectedOption === task.correct) {
      setStatus('correct');
    } else {
      setStatus('wrong');
    }
  };

  // ВОТ ОНА - ЕДИНСТВЕННАЯ ПРАВИЛЬНАЯ ФУНКЦИЯ ПРОДОЛЖЕНИЯ
  const handleNext = async () => {
    if (currentStep < LESSON_DATA.length - 1) {
      setCurrentStep(currentStep + 1);
      setSelectedOption(null);
      setStatus('idle');
    } else {
      // Урок закончен - отправляем XP на бэкенд!
      try {
        await api.updateProgress(childId, 10);
        setShowFinish(true);
      } catch (error) {
        console.error("Ошибка при сохранении прогресса", error);
        setShowFinish(true);
      }
    }
  };

  // Экран успешного завершения урока
  if (showFinish) {
    return (
      <div className="min-h-screen bg-success flex flex-col items-center justify-center p-6 text-white text-center">
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }} 
          transition={{ type: "spring", bounce: 0.5 }}
        >
          <h1 className="text-6xl font-black mb-6 uppercase tracking-widest text-yellow-300 drop-shadow-lg">
            Молодец!
          </h1>
          <p className="text-2xl font-bold mb-10">+10 XP</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full max-w-sm bg-white text-success font-black text-2xl py-5 rounded-2xl border-b-8 border-gray-200 active:border-b-0 active:translate-y-2 transition-all"
          >
            Продолжить
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Шапка с Прогресс-баром */}
      <div className="flex items-center gap-4 p-6 w-full max-w-3xl mx-auto">
        <button onClick={() => navigate(`/child/${childId}/map`)} className="text-gray-400 hover:text-gray-600 transition-colors">
          <X size={32} />
        </button>
        <div className="flex-1 bg-gray-200 h-4 rounded-full overflow-hidden">
          <div 
            className="bg-success h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Основной контент (Вопрос и варианты) */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-black text-gray-800 mb-12 text-center">
          {task.question}
        </h2>

        <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
          {task.options.map((option, idx) => (
            <button
              key={idx}
              disabled={status !== 'idle'}
              onClick={() => setSelectedOption(option)}
              className={`
                text-4xl font-black py-8 rounded-3xl border-b-8 transition-all active:scale-95
                ${selectedOption === option && status === 'idle' ? 'bg-blue-100 border-blue-300 text-secondary border-2 border-b-8' : ''}
                ${selectedOption !== option && status === 'idle' ? 'bg-white border-gray-200 text-gray-700 border-2' : ''}
                ${option === task.correct && status === 'correct' ? 'bg-green-100 border-green-500 text-success border-2 border-b-8' : ''}
                ${selectedOption === option && status === 'wrong' ? 'bg-red-100 border-red-500 text-primary border-2 border-b-8' : ''}
                ${status !== 'idle' && option !== task.correct && selectedOption !== option ? 'opacity-50 border-2 border-gray-200' : ''}
              `}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Нижняя панель */}
      <div className={`p-6 border-t-2 transition-colors ${status === 'correct' ? 'bg-green-100 border-green-200' : status === 'wrong' ? 'bg-red-100 border-red-200' : 'bg-white border-gray-100'}`}>
        <div className="w-full max-w-3xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            {status === 'correct' && (
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center gap-3 text-success font-black text-2xl">
                <div className="bg-white rounded-full p-2"><Check size={32} className="text-success" /></div>
                Отлично!
              </motion.div>
            )}
            {status === 'wrong' && (
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center gap-3 text-primary font-black text-2xl">
                <div className="bg-white rounded-full p-2"><X size={32} className="text-primary" /></div>
                Упс! Правильно: {task.correct}
              </motion.div>
            )}
          </div>

          <button
            onClick={status === 'idle' ? handleCheck : handleNext}
            disabled={status === 'idle' && !selectedOption}
            className={`
              px-10 py-4 rounded-2xl font-black text-xl uppercase tracking-wider transition-all
              ${status === 'idle' && selectedOption ? 'bg-success hover:bg-green-500 text-white border-b-4 border-green-700 active:translate-y-1 active:border-b-0' : ''}
              ${status === 'idle' && !selectedOption ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : ''}
              ${status === 'correct' ? 'bg-success hover:bg-green-500 text-white border-b-4 border-green-700 active:translate-y-1 active:border-b-0' : ''}
              ${status === 'wrong' ? 'bg-primary hover:bg-red-500 text-white border-b-4 border-red-700 active:translate-y-1 active:border-b-0' : ''}
            `}
          >
            {status === 'idle' ? 'Проверить' : 'Дальше'}
          </button>
        </div>
      </div>
    </div>
  );
}