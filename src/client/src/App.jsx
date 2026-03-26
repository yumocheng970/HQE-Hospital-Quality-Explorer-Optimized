import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SearchPage from './SearchPage';
import HospitalDetailPage from './HospitalDetailPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/hospital/:id" element={<HospitalDetailPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}