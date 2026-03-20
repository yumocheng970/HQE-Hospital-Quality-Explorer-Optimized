import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import SearchPage from './pages/SearchPage.jsx'
import HospitalDetailPage from './pages/HospitalDetailPage.jsx'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/hospitals/:id" element={<HospitalDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
