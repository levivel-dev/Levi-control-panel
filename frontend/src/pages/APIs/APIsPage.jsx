import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { apiFetch, apiJson } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const initialForm = {
  name: '',
  url: '',
  method: 'GET',
  expectedStatus: 200
};

const APIsPage = () => {
  const [apis, setApis] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('');
  const { user } = useAuth();
  const canWrite = user && user.role !== 'viewer';

  const loadApis = async () => {
    try {
      const res = await apiFetch('/api/apis');
      setApis(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadApis();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('Saving...');

    try {
      await apiJson('/api/apis', {
        name: form.name,
        url: form.url,
        method: form.method,
        expectedStatus: Number(form.expectedStatus)
      });
      setForm(initialForm);
      setStatus('API registered');
      loadApis();
    } catch (err) {
      setStatus('Failed to register API');
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
        <h3 className="text-2xl font-semibold text-white">API Monitoring Panel</h3>
        <p className="mt-2 text-sm text-white/60">
          Register endpoints, track uptime, and stream failure logs in real time.
        </p>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Endpoint</p>
            <p className="mt-2 font-mono text-sm text-white">POST /api/apis</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Status feed</p>
            <p className="mt-2 font-mono text-sm text-white">GET /api/apis</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Analytics</p>
            <p className="mt-2 font-mono text-sm text-white">GET /api/analytics/apis</p>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {canWrite ? (
          <div className="rounded-3xl border border-white/5 bg-panel/80 p-6 lg:col-span-1">
            <h4 className="text-lg font-semibold text-white">Register API</h4>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-sm">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="API name"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white"
                required
              />
              <input
                name="url"
                value={form.url}
                onChange={handleChange}
                placeholder="https://example.com/health"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white"
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  name="method"
                  value={form.method}
                  onChange={handleChange}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                </select>
                <input
                  name="expectedStatus"
                  value={form.expectedStatus}
                  onChange={handleChange}
                  type="number"
                  min="100"
                  max="599"
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white"
                />
              </div>
              <button className="w-full rounded-full bg-accent px-5 py-2 text-sm font-semibold text-ink">
                Add API
              </button>
              {status && <p className="text-xs text-white/60">{status}</p>}
            </form>
          </div>
        ) : (
          <div className="rounded-3xl border border-white/5 bg-panel/80 p-6 lg:col-span-1">
            <h4 className="text-lg font-semibold text-white">Read-only mode</h4>
            <p className="mt-3 text-sm text-white/60">
              Your role allows viewing API status but not registering new endpoints.
            </p>
          </div>
        )}
        <div className="rounded-3xl border border-white/5 bg-panel/80 p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-white">Registered APIs</h4>
            <button onClick={loadApis} className="rounded-full bg-white/10 px-4 py-2 text-sm text-white">
              Refresh
            </button>
          </div>
          <div className="mt-6 overflow-hidden rounded-2xl border border-white/5">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-xs uppercase tracking-[0.2em] text-white/50">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Latency</th>
                  <th className="px-4 py-3">Last Check</th>
                </tr>
              </thead>
              <tbody>
                {apis.map((row) => (
                  <tr key={row.id} className="border-t border-white/5">
                    <td className="px-4 py-3 text-white">{row.name}</td>
                    <td className="px-4 py-3 text-white/70">
                      {row.lastOk === null ? 'Pending' : row.lastOk ? 'Healthy' : 'Failing'}
                    </td>
                    <td className="px-4 py-3 text-white/70">
                      {row.lastResponseTimeMs ? `${row.lastResponseTimeMs}ms` : '--'}
                    </td>
                    <td className="px-4 py-3 text-white/70">
                      {row.lastCheckedAt ? new Date(row.lastCheckedAt).toLocaleString() : '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIsPage;
