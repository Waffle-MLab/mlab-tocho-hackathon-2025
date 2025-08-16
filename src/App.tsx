import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import ViewPage from './pages/ViewPage'
import HogePage from './pages/HogePage'
import RegisterPage from './pages/RegisterPage'
import AddRecordPage from './pages/AddRecordPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/view" replace />} />
        <Route path="/view" element={<ViewPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/add-record" element={<AddRecordPage />} />
        <Route path="/hoge" element={<HogePage />} />
      </Routes>
    </Router>
  )
}

export default App