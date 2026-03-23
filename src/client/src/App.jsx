import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SearchPage from './SearchPage';

// Placeholder for the hospital detail page
function DetailPage() {
  return <div className="p-8 text-2xl font-bold">医院详情页 (建设中...)</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/hospital/:id" element={<DetailPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}