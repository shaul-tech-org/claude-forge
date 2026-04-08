import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { HomePage } from './pages/HomePage';
import { PatternsPage } from './pages/PatternsPage';
import { CreatePage } from './pages/CreatePage';
import { PatternDetailPage } from './pages/PatternDetailPage';
import { LearnPage } from './pages/LearnPage';
import { AnalyzePage } from './pages/AnalyzePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/patterns" element={<PatternsPage />} />
        <Route path="/patterns/:id" element={<PatternDetailPage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/create/builder" element={<AppLayout />} />
        <Route path="/analyze" element={<AnalyzePage />} />
        <Route path="/learn" element={<LearnPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
