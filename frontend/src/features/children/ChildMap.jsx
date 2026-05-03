import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { ArrowLeft, Star, PlayCircle } from 'lucide-react';

export default function ChildMap() {
  const { childId } = useParams(); // Получаем ID ребенка из адресной строки
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Временно используем заглушку, пока не настроим реальный эндпоинт уроков
    setLessons([
      { id: 1, title: "Буква А", isLocked: false },
      { id: 2, title: "Буква О", isLocked: true },
      { id: 3, title: "Слово МАМА", isLocked: true },
    ]);
    setLoading(false);
  }, []);

  if (loading) return <div className="text-4xl text-center mt-20 font-extrabold text-secondary animate-bounce">Грузим игру...</div>;

  return (
    <div className="min-h-screen bg-blue-50 p-6 flex flex-col items-center">
      {/* Детская шапка */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-10 bg-white p-4 rounded-[2rem] shadow-lg border-4 border-blue-200">
        <button 
          onClick={() => navigate('/dashboard')}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-4 rounded-full transition-transform active:scale-90"
        >
          <ArrowLeft size={32} />
        </button>
        <h1 className="text-3xl font-black text-secondary uppercase tracking-widest">Карта уроков</h1>
        <div className="bg-warning text-white px-6 py-3 rounded-full font-black text-xl flex items-center gap-2 border-b-4 border-yellow-600">
          <Star size={28} className="fill-white" /> 0
        </div>
      </div>

      {/* Игровой путь (Nodes) */}
      <div className="flex flex-col items-center gap-8 relative w-full max-w-md mt-10">
        {/* Декоративная линия пути */}
        <div className="absolute top-0 bottom-0 w-4 bg-blue-200 -z-10 rounded-full left-1/2 -translate-x-1/2"></div>

        {lessons.map((lesson, index) => {
          // Чередуем кнопки влево-вправо для эффекта "змейки"
          const offsetClass = index % 2 === 0 ? '-ml-24' : 'ml-24';
          const isLocked = lesson.isLocked;

          return (
            <div key={lesson.id} className={`relative flex items-center justify-center ${offsetClass}`}>
              <button
                disabled={isLocked}
                onClick={() => navigate(`/child/${childId}/lesson/${lesson.id}`)}
                className={`
                  w-32 h-32 rounded-full flex flex-col items-center justify-center border-b-8 transition-transform active:scale-90
                  ${isLocked 
                    ? 'bg-gray-300 border-gray-400 text-gray-500 cursor-not-allowed' 
                    : 'bg-primary border-red-700 text-white hover:bg-red-400 cursor-pointer hover:-translate-y-2'}
                `}
              >
                {isLocked ? (
                  <Star size={40} className="mb-2 opacity-50" />
                ) : (
                  <PlayCircle size={48} className="mb-2 fill-white text-primary" />
                )}
                <span className="font-black text-lg text-center leading-tight">
                  {lesson.title}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}