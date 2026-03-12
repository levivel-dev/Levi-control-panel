import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import ServiceWorkerUpdateBanner from './ServiceWorkerUpdateBanner';

const routeTitles = {
  '/': 'Dashboard',
  '/apis': 'API Monitoring',
  '/automations': 'Automations',
  '/bots': 'Bot Management',
  '/files': 'File Center',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
  '/users': 'User Access'
};

const Shell = ({ children }) => {
  const location = useLocation();
  const title = routeTitles[location.pathname] || 'Levi Control Panel';

  return (
    <div className="min-h-screen bg-ink text-slate-100">
      <div className="min-h-screen bg-radial-glow background-grid">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1">
            <TopBar title={title} />
            <ServiceWorkerUpdateBanner />
            <main className="px-6 pb-10 pt-6 lg:px-10">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shell;
