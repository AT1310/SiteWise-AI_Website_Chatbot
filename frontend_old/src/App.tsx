import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WebsiteProvider } from './contexts/WebsiteContext';
import HomePage from './pages/HomePage';
import WebsitePage from './pages/WebsitePage';

export default function App() {
  return (
    <BrowserRouter>
      <WebsiteProvider>
        <div className="h-full w-full bg-[#0a0a0f]">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/website" element={<WebsitePage />} />
          </Routes>
        </div>
      </WebsiteProvider>
    </BrowserRouter>
  );
}
