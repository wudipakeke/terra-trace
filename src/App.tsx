import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useMapStore } from './store/useMapStore';
import { LandingPage } from './pages/LandingPage';
import { EditorPage } from './pages/EditorPage';
import AppHome from './pages/AppHome';
import { NovelList } from './pages/NovelList';
import { NovelDetail } from './pages/NovelDetail';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ActivitiesPage from './pages/ActivitiesPage';
import ShopPage from './pages/ShopPage';
import TutorialsPage from './pages/TutorialsPage';
import StudioPage from './pages/StudioPage';
import Navbar from './components/Navbar';
import { useAuth } from './contexts/AuthContext';
import { setOnUnauthorized } from './api/client';

function MapRoutes() {
  const page = useMapStore((s) => s.page);

  useEffect(() => {
    if (page === 'editor') {
      document.body.classList.add('editor-mode');
    } else {
      document.body.classList.remove('editor-mode');
    }
  }, [page]);

  if (page === 'editor') return <EditorPage />;
  return <LandingPage />;
}

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const onMapRoute = location.pathname === '/map';
  const mapEditorActive = useMapStore((s) => s.page === 'editor');

  useEffect(() => {
    if (!onMapRoute) {
      document.body.classList.remove('editor-mode');
    }
  }, [onMapRoute]);

  // Wire up 401 unauthorized handler
  useEffect(() => {
    setOnUnauthorized(() => {
      logout();
      navigate('/login', { replace: true });
    });
  }, [logout, navigate]);

  const hideNavbar =
    location.pathname === '/auth' ||
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    /^\/novel\/[^/]+$/.test(location.pathname) ||
    (onMapRoute && mapEditorActive);

  return (
    <div className={hideNavbar ? '' : 'pt-14'}>
      {!hideNavbar && <Navbar />}
      <Routes>
        {/* Home */}
        <Route path="/" element={<AppHome />} />

        {/* Studio - creative hub */}
        <Route path="/studio" element={<StudioPage />} />

        {/* Map - use existing state-based routing */}
        <Route path="/map" element={<MapRoutes />} />
        <Route path="/map/:projectId" element={<MapRoutes />} />

        {/* Novel */}
        <Route path="/novel" element={<NovelList />} />
        <Route path="/novel/:id" element={<NovelDetail />} />
        <Route path="/novel/:id/map" element={<MapRoutes />} />

        {/* Auth */}
        <Route path="/auth" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Activities */}
        <Route path="/activities" element={<ActivitiesPage />} />

        {/* Shop - publicly browsable, login on purchase */}
        <Route path="/shop" element={<ShopPage />} />

        {/* Tutorials - publicly browsable, login after first preview */}
        <Route path="/tutorials" element={<TutorialsPage />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
