import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

import LandingPage        from './features/landing/LandingPage';
import AuthPage           from './features/auth/AuthPage';
import ChildSelector      from './features/children/ChildSelector';
import ChildMap           from './features/children/ChildMap';
import LessonScreen       from './features/children/LessonScreen';
import ResultsScreen      from './features/children/ResultsScreen';  // ← убедись что файл называется ResultsScreen.jsx
import LeaderboardScreen  from './features/children/LeaderboardScreen';
import ParentDashboard    from './features/parents/ParentDashboard';
import AdminPanel         from './features/admin/AdminPanel';

function PrivateRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/auth" replace />;
}

function PublicRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return !isAuthenticated ? children : <Navigate to="/select" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Публичные ── */}
        <Route path="/"     element={<LandingPage />} />
        <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />

        {/* ── Родительские ── */}
        <Route path="/select"    element={<PrivateRoute><ChildSelector /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><ParentDashboard /></PrivateRoute>} />

        {/* ── Детские ── */}
        <Route path="/child/:childId/map"
          element={<PrivateRoute><ChildMap /></PrivateRoute>} />
        <Route path="/child/:childId/lesson/:lessonId"
          element={<PrivateRoute><LessonScreen /></PrivateRoute>} />
        <Route path="/child/:childId/lesson/:lessonId/results"
          element={<PrivateRoute><ResultsScreen /></PrivateRoute>} />
        <Route path="/child/:childId/leaderboard"
          element={<PrivateRoute><LeaderboardScreen /></PrivateRoute>} />

        {/* ── Админ ── */}
        <Route path="/admin" element={<PrivateRoute><AdminPanel /></PrivateRoute>} />

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
