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
import { useEffect } from "react";

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
function TestAPIComponent() {

  useEffect(() => {
    fetch("https://levi-control-panel-api.onrender.com/api/test")
      .then(res => res.json())
      .then(data => console.log(data))  // Check console to see the response
      .catch(err => console.error(err));
  }, []);  // Empty dependency array → runs only once when component mounts

  return (
    <div>
      <h1>Testing API Connection</h1>
      <p>Check your console for results!</p>
    </div>
  );
}


export default App;
