import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'
import './App.css'
import ViewPage from './pages/ViewPage'
import HogePage from './pages/HogePage'
import RegisterPage from './pages/RegisterPage' // Import new page

function App() {
  return (
    <Router>
      {/* Add simple navigation */}
      <nav style={{ padding: '10px', background: '#eee', marginBottom: '10px' }}>
        <Link to="/view" style={{ marginRight: '10px' }}>View</Link>
        <Link to="/register">Register</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Navigate to="/view" replace />} />
        <Route path="/view" element={<ViewPage />} />
        <Route path="/register" element={<RegisterPage />} /> {/* Add new route */}
        <Route path="/hoge" element={<HogePage />} />
      </Routes>
    </Router>
  )
}

export default App