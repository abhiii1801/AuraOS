import { BrowserRouter as Router, Routes, Route, useLocation, Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Dashboards
import OverviewDashboard from './pages/OverviewDashboard';
import FinanceDashboard from './pages/FinanceDashboard';
import VaultDashboard from './pages/VaultDashboard';
import HealthDashboard from './pages/HealthDashboard';
import FeedDashboard from './pages/FeedDashboard';
import ChatDashboard from './pages/ChatDashboard';
import TopNav from './components/TopNav';

// Marketing & Auth
import HomePage from './pages/HomePage';
import Onboarding from './pages/Onboarding';

function DashboardLayout() {
  const location = useLocation();

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      <div className="px-4 md:px-8 pt-2 md:pt-3">
        <TopNav />
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex-1 w-full px-4 md:px-8 pb-2 md:pb-4 overflow-y-auto"
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Marketing Route */}
        <Route path="/" element={<HomePage />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* Dashboard Layout Routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/overview" element={<OverviewDashboard />} />
          <Route path="/finance" element={<FinanceDashboard />} />
          <Route path="/vault" element={<VaultDashboard />} />
          <Route path="/health" element={<HealthDashboard />} />
          <Route path="/feed" element={<FeedDashboard />} />
          <Route path="/chat" element={<ChatDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;