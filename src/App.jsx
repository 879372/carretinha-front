import { BrowserRouter as Router, Routes, Route, Link, useLocation, useParams } from 'react-router-dom';
import { Home, PlusCircle, Settings, BarChart2 } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import NewSession from './pages/NewSession';
import SettingsPage from './pages/Settings';
import PublicView from './pages/PublicView';
import Analytics from './pages/Analytics';

import LandingPage from './pages/LandingPage';

function BottomNav({ companyId }) {
  const location = useLocation();
  
  // Não exibe o menu na tela pública
  if (location.pathname.includes('/ver/')) return null;

  return (
    <nav className="bottom-nav">
      <Link to={`/${companyId}/`} className={`nav-item ${location.pathname === `/${companyId}` || location.pathname === `/${companyId}/` ? 'active' : ''}`}>
        <Home size={24} />
        <span>Sessões</span>
      </Link>
      <Link to={`/${companyId}/nova`} className={`nav-item ${location.pathname === `/${companyId}/nova` ? 'active' : ''}`}>
        <PlusCircle size={24} />
        <span>Nova</span>
      </Link>
      <Link to={`/${companyId}/dashboard`} className={`nav-item ${location.pathname === `/${companyId}/dashboard` ? 'active' : ''}`}>
        <BarChart2 size={24} />
        <span>Dashboard</span>
      </Link>
      <Link to={`/${companyId}/configuracoes`} className={`nav-item ${location.pathname === `/${companyId}/configuracoes` ? 'active' : ''}`}>
        <Settings size={24} />
        <span>Ajustes</span>
      </Link>
    </nav>
  );
}

function CompanyLayout() {
  const { companyId } = useParams();
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Analytics />} />
        <Route path="/nova" element={<NewSession />} />
        <Route path="/configuracoes" element={<SettingsPage />} />
        <Route path="/ver/:token" element={<PublicView />} />
      </Routes>
      <BottomNav companyId={companyId} />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/:companyId/*" element={<CompanyLayout />} />
        <Route path="/" element={<LandingPage />} />
      </Routes>
    </Router>
  );
}

export default App;
