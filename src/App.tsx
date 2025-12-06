import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AdminDashboard from './pages/AdminDashboard';
import TicketingDashboard from './pages/TicketingDashboard';
import LuggageDashboard from './pages/LuggageDashboard';
import CheckInDashboard from './pages/CheckInDashboard';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/ticketing" element={<TicketingDashboard />} />
          <Route path="/luggage" element={<LuggageDashboard />} />
          <Route path="/checkin" element={<CheckInDashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

