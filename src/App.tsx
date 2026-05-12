import { useEffect } from 'react';
import { useMapStore } from './store/useMapStore';
import { LandingPage } from './pages/LandingPage';
import { EditorPage } from './pages/EditorPage';

export default function App() {
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
