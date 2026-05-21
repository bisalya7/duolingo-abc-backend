import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, Users, FileText, ChevronDown, ChevronRight,
  Plus, Pencil, Trash2, X, Check, LogOut, Search, ChevronLeft,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

// ── Reusable Components ──────────────────────────────────────────────

function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
      <div className={`${color} w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-black text-[#3c3c3c]">{value ?? '—'}</p>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</p>
      </div>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-[#3c3c3c]">{title}</h3>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-500 transition-colors">
            <X size={24} />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <div>
      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{label}</label>
      <input
        {...props}
        className="w-full p-3 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-[#1cb0f6] outline-none font-bold text-[#3c3c3c] placeholder:text-gray-300 transition-colors"
      />
    </div>
  );
}

function Btn({ children, variant = 'primary', size = 'md', ...props }) {
  const base = 'font-black rounded-2xl transition-all active:scale-95 flex items-center gap-2';
  const sizes = { sm: 'px-3 py-2 text-sm', md: 'px-5 py-3 text-sm', lg: 'px-8 py-4 text-base' };
  const variants = {
    primary: 'bg-[#1cb0f6] text-white shadow-[0_4px_0_0_#1499d3] hover:bg-[#1499d3] active:shadow-none active:translate-y-1',
    success: 'bg-[#58cc02] text-white shadow-[0_4px_0_0_#46a302] hover:bg-[#46a302] active:shadow-none active:translate-y-1',
    danger: 'bg-[#FF4B4B] text-white shadow-[0_4px_0_0_#cc0000] hover:bg-red-500 active:shadow-none active:translate-y-1',
    ghost: 'bg-gray-100 text-gray-500 hover:bg-gray-200',
  };
  return (
    <button {...props} className={`${base} ${sizes[size]} ${variants[variant]} ${props.className ?? ''}`}>
      {children}
    </button>
  );
}

// ── Dashboard Tab ──────────────────────────────────────────────────────

function DashboardTab() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.getAdminStats?.()
      .then(setStats)
      .catch(() => setStats({ total_users: '—', total_lessons_played: '—' }));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-black text-[#3c3c3c] mb-6">Обзор платформы</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon="👨‍👩‍👧" label="Родителей" value={stats?.total_users} color="bg-blue-50" />
        <StatCard icon="📚" label="Уроков пройдено" value={stats?.total_lessons_played} color="bg-green-50" />
        <StatCard icon="🏅" label="Наград выдано" value={stats?.total_badges} color="bg-yellow-50" />
        <StatCard icon="🔥" label="Активных сегодня" value={stats?.active_today} color="bg-orange-50" />
      </div>
      <div className="bg-white rounded-3xl p-8 border border-gray-100 text-center">
        <p className="text-4xl mb-3">🦉</p>
        <p className="font-black text-[#3c3c3c] text-lg">Платформа работает отлично!</p>
        <p className="text-gray-400 font-bold mt-1 text-sm">Управляй контентом через вкладку «Учебный план»</p>
      </div>
    </div>
  );
}

// ── Curriculum Tab (твой текущий, без изменений) ──────────────────────

function CurriculumTab() {
  const [units, setUnits] = useState([]);
  const [expandedUnits, setExpandedUnits] = useState({});
  const [expandedLessons, setExpandedLessons] = useState({});
  const [lessonsByUnit, setLessonsByUnit] = useState({});
  const [exercisesByLesson, setExercisesByLesson] = useState({});
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState(null);
  const [unitForm, setUnitForm] = useState({ title: '', order: '' });
  const [lessonForm, setLessonForm] = useState({ title: '', order: '', xp_reward: '10', unit_id: '' });
  const [exForm, setExForm] = useState({ type: 'match', question: '', options: '', correct_answer: '', lesson_id: '' });

  useEffect(() => { loadUnits(); }, []);

  const loadUnits = async () => {
    try {
      const data = await api.getUnits();
      setUnits(data ?? []);
    } catch { setUnits([]); }
    finally { setLoading(false); }
  };

  const loadLessons = async (unitId) => {
    if (lessonsByUnit[unitId]) return;
    try {
      const data = await api.getLessonsByUnit(unitId);
      const items = data?.items ?? data ?? [];
      setLessonsByUnit((p) => ({ ...p, [unitId]: items }));
    } catch {
      setLessonsByUnit((p) => ({ ...p, [unitId]: [] }));
    }
  };

  const loadExercises = async (lessonId) => {
    if (exercisesByLesson[lessonId]) return;
    try {
      const data = await api.getLessonExercises(lessonId);
      setExercisesByLesson((p) => ({ ...p, [lessonId]: Array.isArray(data) ? data : [] }));
    } catch {
      setExercisesByLesson((p) => ({ ...p, [lessonId]: [] }));
    }
  };

  const toggleUnit = (id) => {
    const next = !expandedUnits[id];
    setExpandedUnits((p) => ({ ...p, [id]: next }));
    if (next) loadLessons(id);
  };

  const toggleLesson = (id) => {
    const next = !expandedLessons[id];
    setExpandedLessons((p) => ({ ...p, [id]: next }));
    if (next) loadExercises(id);
  };

  const createUnit = async () => {
    try {
      await api.createUnit({ title: unitForm.title, order: parseInt(unitForm.order) || units.length + 1 });
      setModal(null);
      setUnitForm({ title: '', order: '' });
      loadUnits();
    } catch (e) { alert('Ошибка: ' + (e.response?.data?.detail ?? e.message)); }
  };

  const deleteUnit = async (id) => {
    if (!confirm('Удалить раздел? Все уроки внутри тоже удалятся.')) return;
    try {
      await api.deleteUnit(id);
      loadUnits();
    } catch (e) { alert('Ошибка удаления'); }
  };

  const createLesson = async () => {
    try {
      await api.createLesson({
        title: lessonForm.title,
        order: parseInt(lessonForm.order) || 1,
        xp_reward: parseInt(lessonForm.xp_reward) || 10,
        unit_id: lessonForm.unit_id,
      });
      setModal(null);
      setLessonForm({ title: '', order: '', xp_reward: '10', unit_id: '' });
      setLessonsByUnit((p) => { const c = { ...p }; delete c[lessonForm.unit_id]; return c; });
      loadLessons(lessonForm.unit_id);
    } catch (e) { alert('Ошибка: ' + (e.response?.data?.detail ?? e.message)); }
  };

  const deleteLesson = async (lessonId, unitId) => {
    if (!confirm('Удалить урок?')) return;
    try {
      await api.deleteLesson(lessonId);
      setLessonsByUnit((p) => ({ ...p, [unitId]: p[unitId].filter((l) => l.id !== lessonId) }));
    } catch { alert('Ошибка удаления'); }
  };

  const createExercise = async () => {
    try {
      const content = {
        question: exForm.question,
        options: exForm.options.split(',').map((s) => s.trim()).filter(Boolean),
        correct_answer: exForm.correct_answer,
      };
      await api.createExercise({
        lesson_id: exForm.lesson_id,
        type: exForm.type,
        content,
        answer: exForm.correct_answer,
      });
      setModal(null);
      setExForm({ type: 'match', question: '', options: '', correct_answer: '', lesson_id: '' });
      setExercisesByLesson((p) => { const c = { ...p }; delete c[exForm.lesson_id]; return c; });
      loadExercises(exForm.lesson_id);
    } catch (e) { alert('Ошибка: ' + (e.response?.data?.detail ?? e.message)); }
  };

  const deleteExercise = async (exId, lessonId) => {
    if (!confirm('Удалить задание?')) return;
    try {
      await api.deleteExercise(exId);
      setExercisesByLesson((p) => ({ ...p, [lessonId]: p[lessonId].filter((e) => e.id !== exId) }));
    } catch { alert('Ошибка удаления'); }
  };

  const EX_TYPES = ['match', 'select_image', 'listen', 'build_word', 'multiple_choice', 'handwriting'];
  const EX_LABELS = { match: 'Сопоставление', select_image: 'Выбор картинки', listen: 'Аудирование', build_word: 'Собери слово', multiple_choice: 'Тест', handwriting: 'Письмо' };
  const EX_ICONS = { match: '🔤', select_image: '🖼️', listen: '🔊', build_word: '🧩', multiple_choice: '✅', handwriting: '✏️' };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-[#1cb0f6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-[#3c3c3c]">Учебный план</h2>
        <Btn variant="success" onClick={() => { setUnitForm({ title: '', order: String(units.length + 1) }); setModal('unit'); }}>
          <Plus size={16} /> Добавить раздел
        </Btn>
      </div>

      {units.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
          <p className="text-5xl mb-3">📂</p>
          <p className="font-black text-[#3c3c3c] text-lg">Разделов пока нет</p>
          <p className="text-gray-400 font-bold mt-1">Добавь первый раздел выше</p>
        </div>
      )}

      <div className="space-y-3">
        {units.map((unit) => (
          <div key={unit.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4">
              <button
                onClick={() => toggleUnit(unit.id)}
                className="flex items-center gap-3 flex-1 text-left"
              >
                <div className="w-8 h-8 rounded-xl bg-[#e8f5ff] flex items-center justify-center flex-shrink-0">
                  {expandedUnits[unit.id]
                    ? <ChevronDown size={18} className="text-[#1cb0f6]" />
                    : <ChevronRight size={18} className="text-[#1cb0f6]" />}
                </div>
                <div>
                  <p className="font-black text-[#3c3c3c]">{unit.title}</p>
                  <p className="text-xs text-gray-400 font-bold">Раздел #{unit.order}</p>
                </div>
              </button>
              <div className="flex items-center gap-2">
                <Btn
                  size="sm" variant="primary"
                  onClick={() => {
                    setLessonForm({ title: '', order: '1', xp_reward: '10', unit_id: unit.id });
                    setModal('lesson');
                  }}
                >
                  <Plus size={14} /> Урок
                </Btn>
                <button
                  onClick={() => deleteUnit(unit.id)}
                  className="p-2 rounded-xl text-gray-300 hover:text-[#FF4B4B] hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <AnimatePresence>
              {expandedUnits[unit.id] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-4 space-y-2">
                    {(lessonsByUnit[unit.id] ?? []).length === 0 ? (
                      <p className="text-sm text-gray-400 font-bold py-3 text-center">
                        Уроков нет — добавь первый ↑
                      </p>
                    ) : (
                      (lessonsByUnit[unit.id] ?? []).map((lesson) => (
                        <div key={lesson.id} className="bg-gray-50 rounded-2xl overflow-hidden">
                          <div className="flex items-center gap-3 px-4 py-3">
                            <button
                              onClick={() => toggleLesson(lesson.id)}
                              className="flex items-center gap-3 flex-1 text-left"
                            >
                              <div className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                                {expandedLessons[lesson.id]
                                  ? <ChevronDown size={14} className="text-gray-400" />
                                  : <ChevronRight size={14} className="text-gray-400" />}
                              </div>
                              <div>
                                <p className="font-black text-[#3c3c3c] text-sm">{lesson.title}</p>
                                <p className="text-xs text-gray-400 font-bold">+{lesson.xp_reward} XP</p>
                              </div>
                            </button>
                            <div className="flex items-center gap-1">
                              <Btn
                                size="sm" variant="ghost"
                                onClick={() => {
                                  setExForm({ type: 'match', question: '', options: '', correct_answer: '', lesson_id: lesson.id });
                                  setModal('exercise');
                                }}
                              >
                                <Plus size={12} /> Задание
                              </Btn>
                              <button
                                onClick={() => deleteLesson(lesson.id, unit.id)}
                                className="p-1.5 rounded-lg text-gray-300 hover:text-[#FF4B4B] hover:bg-red-50 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          <AnimatePresence>
                            {expandedLessons[lesson.id] && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 pb-3 space-y-1.5">
                                  {(exercisesByLesson[lesson.id] ?? []).length === 0 ? (
                                    <p className="text-xs text-gray-400 font-bold py-2 text-center">
                                      Заданий нет — добавь первое ↑
                                    </p>
                                  ) : (
                                    (exercisesByLesson[lesson.id] ?? []).map((ex) => {
                                      const content = typeof ex.content === 'string'
                                        ? (() => { try { return JSON.parse(ex.content); } catch { return {}; } })()
                                        : ex.content ?? {};
                                      return (
                                        <div
                                          key={ex.id}
                                          className="flex items-center gap-3 bg-white rounded-xl px-3 py-2.5 border border-gray-100"
                                        >
                                          <span className="text-lg">{EX_ICONS[ex.type] ?? '❓'}</span>
                                          <div className="flex-1 min-w-0">
                                            <p className="font-bold text-[#3c3c3c] text-xs truncate">
                                              {content.question ?? `Задание #${ex.id}`}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                              {EX_LABELS[ex.type] ?? ex.type}
                                            </p>
                                          </div>
                                          <button
                                            onClick={() => deleteExercise(ex.id, lesson.id)}
                                            className="p-1 rounded-lg text-gray-300 hover:text-[#FF4B4B] transition-colors flex-shrink-0"
                                          >
                                            <Trash2 size={13} />
                                          </button>
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {modal === 'unit' && (
          <Modal title="Новый раздел" onClose={() => setModal(null)}>
            <div className="space-y-4">
              <Field label="Название раздела" placeholder="Например: Алфавит" value={unitForm.title}
                onChange={(e) => setUnitForm({ ...unitForm, title: e.target.value })} />
              <Field label="Порядок" type="number" placeholder="1" value={unitForm.order}
                onChange={(e) => setUnitForm({ ...unitForm, order: e.target.value })} />
              <div className="flex gap-3 pt-2">
                <Btn variant="success" className="flex-1" onClick={createUnit} disabled={!unitForm.title}>
                  <Check size={16} /> Сохранить
                </Btn>
                <Btn variant="ghost" className="flex-1" onClick={() => setModal(null)}>Отмена</Btn>
              </div>
            </div>
          </Modal>
        )}

        {modal === 'lesson' && (
          <Modal title="Новый урок" onClose={() => setModal(null)}>
            <div className="space-y-4">
              <Field label="Название урока" placeholder="Буква А" value={lessonForm.title}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Порядок" type="number" placeholder="1" value={lessonForm.order}
                  onChange={(e) => setLessonForm({ ...lessonForm, order: e.target.value })} />
                <Field label="XP награда" type="number" placeholder="10" value={lessonForm.xp_reward}
                  onChange={(e) => setLessonForm({ ...lessonForm, xp_reward: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <Btn variant="success" className="flex-1" onClick={createLesson} disabled={!lessonForm.title}>
                  <Check size={16} /> Сохранить
                </Btn>
                <Btn variant="ghost" className="flex-1" onClick={() => setModal(null)}>Отмена</Btn>
              </div>
            </div>
          </Modal>
        )}

        {modal === 'exercise' && (
          <Modal title="Новое задание" onClose={() => setModal(null)}>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Тип задания</label>
                <div className="grid grid-cols-3 gap-2">
                  {EX_TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setExForm({ ...exForm, type: t })}
                      className={`py-2 px-3 rounded-xl border-2 text-xs font-black transition-all ${
                        exForm.type === t
                          ? 'border-[#1cb0f6] bg-blue-50 text-[#1cb0f6]'
                          : 'border-gray-200 text-gray-400 hover:border-gray-300'
                      }`}
                    >
                      {EX_ICONS[t]} {EX_LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>

              <Field label="Вопрос" placeholder="Найди букву А" value={exForm.question}
                onChange={(e) => setExForm({ ...exForm, question: e.target.value })} />

              <Field
                label="Варианты ответов (через запятую)"
                placeholder="А, Б, В, Г"
                value={exForm.options}
                onChange={(e) => setExForm({ ...exForm, options: e.target.value })}
              />

              <Field
                label="Правильный ответ"
                placeholder="А"
                value={exForm.correct_answer}
                onChange={(e) => setExForm({ ...exForm, correct_answer: e.target.value })}
              />

              <div className="flex gap-3 pt-2">
                <Btn
                  variant="success" className="flex-1" onClick={createExercise}
                  disabled={!exForm.question || !exForm.correct_answer}
                >
                  <Check size={16} /> Сохранить
                </Btn>
                <Btn variant="ghost" className="flex-1" onClick={() => setModal(null)}>Отмена</Btn>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── User Manager Tab ───────────────────────────────────────────────────

function UserManagerTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminUsers({ page, limit, search });
      setUsers(data.items ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <h2 className="text-2xl font-black text-[#3c3c3c] mb-6">Пользователи</h2>

      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск по email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border-2 border-gray-100 focus:border-[#1cb0f6] outline-none font-bold text-[#3c3c3c] placeholder:text-gray-300"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#1cb0f6] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
          <p className="text-5xl mb-3">👤</p>
          <p className="font-black text-[#3c3c3c] text-lg">Пользователей не найдено</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-4 font-black text-gray-400 uppercase tracking-widest text-xs">ID</th>
                  <th className="text-left px-6 py-4 font-black text-gray-400 uppercase tracking-widest text-xs">Email</th>
                  <th className="text-left px-6 py-4 font-black text-gray-400 uppercase tracking-widest text-xs">Роль</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-[#3c3c3c]">#{user.id}</td>
                    <td className="px-6 py-4 font-bold text-[#3c3c3c]">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${
                        user.role === 'admin'
                          ? 'bg-purple-50 text-purple-500 border border-purple-200'
                          : 'bg-blue-50 text-[#1cb0f6] border border-blue-200'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-xl bg-white border-2 border-gray-100 text-gray-400 hover:text-[#1cb0f6] hover:border-[#1cb0f6] disabled:opacity-40 transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="font-black text-[#3c3c3c] text-sm">
                Страница {page} из {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-xl bg-white border-2 border-gray-100 text-gray-400 hover:text-[#1cb0f6] hover:border-[#1cb0f6] disabled:opacity-40 transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Activity Log Tab ───────────────────────────────────────────────────

function ActivityLogTab() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminLogs({ page, limit });
      setLogs(data.logs ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setLogs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const totalPages = Math.ceil(total / limit);

  const actionColors = {
    CREATE_UNIT: 'bg-green-50 text-green-600 border-green-200',
    UPDATE_UNIT: 'bg-blue-50 text-blue-600 border-blue-200',
    DELETE_UNIT: 'bg-red-50 text-red-600 border-red-200',
    CREATE_LESSON: 'bg-green-50 text-green-600 border-green-200',
    UPDATE_LESSON: 'bg-blue-50 text-blue-600 border-blue-200',
    DELETE_LESSON: 'bg-red-50 text-red-600 border-red-200',
    CREATE_EXERCISE: 'bg-green-50 text-green-600 border-green-200',
    UPDATE_EXERCISE: 'bg-blue-50 text-blue-600 border-blue-200',
    DELETE_EXERCISE: 'bg-red-50 text-red-600 border-red-200',
  };

  return (
    <div>
      <h2 className="text-2xl font-black text-[#3c3c3c] mb-6">Лог действий</h2>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#1cb0f6] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
          <p className="text-5xl mb-3">📋</p>
          <p className="font-black text-[#3c3c3c] text-lg">Логов пока нет</p>
          <p className="text-gray-400 font-bold mt-1">Действия админов будут отображаться здесь</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-4 font-black text-gray-400 uppercase tracking-widest text-xs">Время</th>
                  <th className="text-left px-6 py-4 font-black text-gray-400 uppercase tracking-widest text-xs">Админ</th>
                  <th className="text-left px-6 py-4 font-black text-gray-400 uppercase tracking-widest text-xs">Действие</th>
                  <th className="text-left px-6 py-4 font-black text-gray-400 uppercase tracking-widest text-xs">Детали</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-400 font-bold whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('ru-RU')}
                    </td>
                    <td className="px-6 py-4 font-bold text-[#3c3c3c]">{log.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border ${actionColors[log.action] ?? 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-bold text-xs">{log.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-xl bg-white border-2 border-gray-100 text-gray-400 hover:text-[#1cb0f6] hover:border-[#1cb0f6] disabled:opacity-40 transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="font-black text-[#3c3c3c] text-sm">
                Страница {page} из {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-xl bg-white border-2 border-gray-100 text-gray-400 hover:text-[#1cb0f6] hover:border-[#1cb0f6] disabled:opacity-40 transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Main Admin Panel ───────────────────────────────────────────────────

const TABS = [
  { id: 'dashboard', label: 'Дашборд', icon: <LayoutDashboard size={18} /> },
  { id: 'curriculum', label: 'Учебный план', icon: <BookOpen size={18} /> },
  { id: 'users', label: 'Пользователи', icon: <Users size={18} /> },
  { id: 'logs', label: 'Логи', icon: <FileText size={18} /> },
];

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex">

      <aside className="w-60 min-h-screen bg-white border-r border-gray-100 flex flex-col py-6 flex-shrink-0">
        <div className="px-6 mb-8">
          <span className="text-2xl font-black text-[#1cb0f6] tracking-tighter">DUO_KIDS</span>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">Admin Panel</p>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-[#e8f5ff] text-[#1cb0f6]'
                  : 'text-gray-400 hover:bg-gray-50 hover:text-[#3c3c3c]'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="px-3 mt-auto">
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-sm text-red-400 hover:bg-red-50 transition-all"
          >
            <LogOut size={18} /> Выйти
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'dashboard' && <DashboardTab />}
            {activeTab === 'curriculum' && <CurriculumTab />}
            {activeTab === 'users' && <UserManagerTab />}
            {activeTab === 'logs' && <ActivityLogTab />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}