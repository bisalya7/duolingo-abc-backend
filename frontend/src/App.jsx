import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import AuthPage from './features/auth/AuthPage';
import ParentDashboard from './features/parents/ParentDashboard';
import ChildMap from './features/children/ChildMap';
import LessonScreen from './features/children/LessonScreen';

export default function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={!isAuthenticated ? <AuthPage /> : <Navigate to="/dashboard" />} 
        />
        
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <ParentDashboard /> : <Navigate to="/login" />} 
        />

        <Route 
          path="/child/:childId/map" 
          element={isAuthenticated ? <ChildMap /> : <Navigate to="/login" />} 
        />

        {/* ВОТ НАШ НОВЫЙ МАРШРУТ ДЛЯ ИГРЫ */}
        <Route 
          path="/child/:childId/lesson/:lessonId" 
          element={isAuthenticated ? <LessonScreen /> : <Navigate to="/login" />} 
        />

        {/* Ловушка для неправильных ссылок */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}