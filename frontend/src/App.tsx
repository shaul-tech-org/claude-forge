import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { HomePage } from './pages/HomePage';
import { PatternsPage } from './pages/PatternsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/patterns" element={<PatternsPage />} />
        <Route path="/create/builder" element={<AppLayout />} />
        {/* Placeholder routes — implemented in later phases */}
        <Route path="/create" element={<HomePage />} />
        <Route path="/analyze" element={<HomePage />} />
        <Route path="/learn" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
