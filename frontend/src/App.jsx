import { Routes, Route } from 'react-router-dom';
import Shell from './components/Shell';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardPage from './pages/Dashboard/DashboardPage';
import APIsPage from './pages/APIs/APIsPage';
import AutomationsPage from './pages/Automations/AutomationsPage';
import BotsPage from './pages/Bots/BotsPage';
import FilesPage from './pages/Files/FilesPage';
import AnalyticsPage from './pages/Analytics/AnalyticsPage';
import UsersPage from './pages/Users/UsersPage';
import SettingsPage from './pages/Settings/SettingsPage';
import LoginPage from './pages/Auth/LoginPage';

const ProtectedShell = () => (
  <ProtectedRoute>
    <Shell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/apis" element={<APIsPage />} />
        <Route path="/automations" element={<AutomationsPage />} />
        <Route path="/bots" element={<BotsPage />} />
        <Route path="/files" element={<FilesPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route
          path="/users"
          element={
            <ProtectedRoute roles={['admin']}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Shell>
  </ProtectedRoute>
);

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/*" element={<ProtectedShell />} />
    </Routes>
  );
};

export default App;
