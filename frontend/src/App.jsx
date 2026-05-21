import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

import LandingPage        from './features/landing/LandingPage';
import AuthPage           from './features/auth/AuthPage';
import ChildSelector      from './features/children/ChildSelector';
import ChildMap           from './features/children/ChildMap';
import LessonScreen       from './features/children/LessonScreen';
import ResultsScreen      from './features/children/ResultsScreen';
import LeaderboardScreen  from './features/children/LeaderboardScreen';
import ParentDashboard    from './features/parents/ParentDashboard';
import AdminPanel         from './features/admin/AdminPanel';

// ── Guards ─────────────────────────────────────────────────────────────

function PublicRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return !isAuthenticated ? children : <Navigate to="/select" replace />;
}

function PrivateRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, role } = useAuthStore((s) => ({
    isAuthenticated: s.isAuthenticated,
    role: s.role,
  }));

  if (!isAuthenticated) return <Navigate to="/auth" replace />;

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Нет доступа — редиректим куда положено по роли
    if (role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/select" replace />;
  }

  return children;
}

// ── App ────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Публичные */}
        <Route path="/"     element={<LandingPage />} />
        <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />

        {/* Parent + Child flow */}
        <Route path="/select" element={<PrivateRoute allowedRoles={['parent']}><ChildSelector /></PrivateRoute>} />
        <Route path="/onboarding" element={<PrivateRoute allowedRoles={['parent']}><OnboardingFlow /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute allowedRoles={['parent', 'admin']}><ParentDashboard /></PrivateRoute>} />

        <Route path="/child/:childId/map"
          element={<PrivateRoute allowedRoles={['parent']}><ChildMap /></PrivateRoute>} />
        <Route path="/child/:childId/lesson/:lessonId"
          element={<PrivateRoute allowedRoles={['parent']}><LessonScreen /></PrivateRoute>} />
        <Route path="/child/:childId/lesson/:lessonId/results"
          element={<PrivateRoute allowedRoles={['parent']}><ResultsScreen /></PrivateRoute>} />
        <Route path="/child/:childId/leaderboard"
          element={<PrivateRoute allowedRoles={['parent']}><LeaderboardScreen /></PrivateRoute>} />

        {/* Admin only */}
        <Route path="/admin" element={<PrivateRoute allowedRoles={['admin']}><AdminPanel /></PrivateRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}