import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const initialForm = {
  name: '',
  email: '',
  password: ''
};

const LoginPage = () => {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('Working...');

    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password });
      } else {
        await register({ name: form.name, email: form.email, password: form.password });
      }
      navigate('/');
    } catch (err) {
      setStatus('Authentication failed');
    }
  };

  return (
    <div className="min-h-screen bg-ink text-white">
      <div className="min-h-screen bg-radial-glow background-grid flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-lg rounded-3xl border border-white/10 bg-panel/80 p-8"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Levi Control Panel</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">
            {mode === 'login' ? 'Welcome back' : 'Create your admin'}
          </h1>
          <p className="mt-2 text-sm text-white/60">
            {mode === 'login'
              ? 'Sign in to access your developer cockpit.'
              : 'First user becomes admin. Later users require admin access.'}
          </p>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setMode('login')}
              className={`rounded-full px-4 py-2 text-sm ${
                mode === 'login' ? 'bg-accent text-ink' : 'bg-white/10 text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('register')}
              className={`rounded-full px-4 py-2 text-sm ${
                mode === 'register' ? 'bg-accent text-ink' : 'bg-white/10 text-white'
              }`}
            >
              Create Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-sm">
            {mode === 'register' && (
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Full name"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white"
                required
              />
            )}
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              type="email"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white"
              required
            />
            <input
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              type="password"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white"
              required
            />
            <button className="w-full rounded-full bg-accent px-5 py-2 text-sm font-semibold text-ink">
              {mode === 'login' ? 'Sign In' : 'Create Admin'}
            </button>
            {status && <p className="text-xs text-white/60">{status}</p>}
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
