import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SearchPage from "./pages/SearchPage";
import HospitalDetailPage from "./pages/HospitalDetailPage";
import DashboardPage from "./pages/DashboardPage";
import QueryPage from "./pages/QueryPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/query" element={<QueryPage />} />
          <Route path="/hospital/:id" element={<HospitalDetailPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}