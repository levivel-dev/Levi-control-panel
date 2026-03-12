import { useAuth } from '../context/AuthContext';

const roleBadgeStyles = {
  admin: 'bg-amber-500/20 text-amber-200',
  operator: 'bg-sky-500/20 text-sky-200',
  viewer: 'bg-emerald-500/20 text-emerald-200'
};

const TopBar = ({ title }) => {
  const now = new Date();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-10 border-b border-white/5 bg-panel/70 backdrop-blur">
      <div className="flex items-center justify-between px-6 py-4 lg:px-10">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Command</p>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
        </div>
        <div className="flex items-center gap-6 text-right">
          <div>
            <p className="text-xs text-white/50">Local time</p>
            <p className="font-mono text-sm text-white/80">{now.toLocaleString()}</p>
          </div>
          {user && (
            <div className="text-right">
              <p className="text-xs text-white/50">Signed in</p>
              <p className="text-sm text-white">{user.name}</p>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em] ${roleBadgeStyles[user.role] || 'bg-white/10 text-white/70'}`}>
                {user.role}
              </span>
            </div>
          )}
          <button
            onClick={logout}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/70 hover:bg-white/10"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
