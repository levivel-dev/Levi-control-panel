import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { apiFetch, apiJson } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const initialForm = {
  name: '',
  botType: ''
};

const BotsPage = () => {
  const [bots, setBots] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('');
  const { user } = useAuth();
  const canWrite = user && user.role !== 'viewer';

  const loadBots = async () => {
    try {
      const res = await apiFetch('/api/bots');
      setBots(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadBots();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('Saving...');

    try {
      await apiJson('/api/bots', {
        name: form.name,
        botType: form.botType
      });
      setForm(initialForm);
      setStatus('Bot registered');
      loadBots();
    } catch (err) {
      setStatus('Failed to register bot');
    }
  };

  const updateStatus = async (id, action) => {
    try {
      await apiJson(`/api/bots/${id}/${action}`, {});
      loadBots();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-3xl border border-white/10 bg-panel/70 p-8"
      >
        <h3 className="text-2xl font-semibold text-white">Bot Management</h3>
        <p className="mt-2 text-sm text-white/60">
          Start, stop, and monitor bots with live status and log streams.
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-white/5 bg-panel/80 p-6">
          <h4 className="text-lg font-semibold text-white">Register Bot</h4>
          {canWrite ? (
            <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-sm">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Bot name"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white"
                required
              />
              <input
                name="botType"
                value={form.botType}
                onChange={handleChange}
                placeholder="Trading, scraping, automation"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white"
              />
              <button className="w-full rounded-full bg-accent px-5 py-2 text-sm font-semibold text-ink">
                Add Bot
              </button>
              {status && <p className="text-xs text-white/60">{status}</p>}
            </form>
          ) : (
            <p className="mt-4 text-sm text-white/60">
              Read-only access. Ask an admin or operator to register bots.
            </p>
          )}
        </div>
        {bots.map((bot) => (
          <div key={bot.id} className="rounded-3xl border border-white/5 bg-panel/80 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">{bot.status}</p>
            <h4 className="mt-3 text-lg font-semibold text-white">{bot.name}</h4>
            <p className="mt-2 text-sm text-white/60">
              Type: {bot.botType || 'General'}
            </p>
            <p className="mt-1 text-xs text-white/40">
              Last seen: {bot.lastSeenAt ? new Date(bot.lastSeenAt).toLocaleString() : 'Never'}
            </p>
            {canWrite && (
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => updateStatus(bot.id, 'start')}
                  className="rounded-full bg-accent px-4 py-2 text-xs font-semibold text-ink"
                >
                  Start
                </button>
                <button
                  onClick={() => updateStatus(bot.id, 'stop')}
                  className="rounded-full bg-white/10 px-4 py-2 text-xs text-white"
                >
                  Stop
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BotsPage;
