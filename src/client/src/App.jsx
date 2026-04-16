import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import SearchPage from "./pages/SearchPage";
import HospitalDetailPage from "./pages/HospitalDetailPage";
import DashboardPage from "./pages/DashboardPage";
import QueryPage from "./pages/QueryPage";
import LoginPage from "./pages/LoginPage";
import MapPage from "./pages/MapPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<SearchPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/query" element={<QueryPage />} />
            <Route path="/hospital/:id" element={<HospitalDetailPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/map" element={<MapPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
