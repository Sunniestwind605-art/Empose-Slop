import { HashRouter, Route, Routes } from 'react-router-dom';
import { AppProvider } from './AppContext';
import { Layout } from './components/Layout';
import { AboutPage } from './pages/AboutPage';
import { ExplorePage } from './pages/ExplorePage';
import { FavouritesPage } from './pages/FavouritesPage';
import { GeneratorPage } from './pages/GeneratorPage';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PoseDetailPage } from './pages/PoseDetailPage';
import { SelfieStudioPage } from './pages/SelfieStudioPage';
import { SessionPage } from './pages/SessionPage';

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/generate" element={<GeneratorPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/selfie" element={<SelfieStudioPage />} />
            <Route path="/favourites" element={<FavouritesPage />} />
            <Route path="/session" element={<SessionPage />} />
            <Route path="/pose/:id" element={<PoseDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}

