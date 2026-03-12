import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  const isAdmin = user && user.role === 'admin';

  const navItems = [
    { to: '/', label: 'Dashboard', hint: 'System overview' },
    { to: '/apis', label: 'APIs', hint: 'Uptime + latency' },
    { to: '/automations', label: 'Automations', hint: 'Triggers + actions' },
    { to: '/bots', label: 'Bots', hint: 'Executors' },
    { to: '/files', label: 'Files', hint: 'Storage' },
    { to: '/analytics', label: 'Analytics', hint: 'Insights' },
    { to: '/settings', label: 'Settings', hint: 'PWA + environment' }
  ];

  if (isAdmin) {
    navItems.push({ to: '/users', label: 'Users', hint: 'Access control' });
  }

  return (
    <aside className="hidden w-72 flex-col border-r border-white/5 bg-panel/80 px-6 py-8 lg:flex">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-white/40">Levi</p>
        <h1 className="text-2xl font-semibold text-white">Developer Control Panel</h1>
        <p className="mt-2 text-sm text-white/60">
          Manage APIs, automations, bots, files, and analytics in one cockpit.
        </p>
      </div>
      <nav className="flex flex-1 flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `rounded-2xl px-4 py-3 transition ${
                isActive
                  ? 'bg-panelLight text-white shadow-glow'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <div className="text-sm font-medium">{item.label}</div>
            <div className="text-xs text-white/50">{item.hint}</div>
          </NavLink>
        ))}
      </nav>
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/60">
        <p className="font-mono uppercase tracking-[0.2em] text-white/50">Status</p>
        <p className="mt-2 text-sm text-white">All systems primed</p>
      </div>
    </aside>
  );
};

export default Sidebar;
