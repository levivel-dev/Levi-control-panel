import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { apiFetch, apiJson } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const initialForm = {
  name: '',
  triggerType: 'event',
  triggerEvent: 'api_failed',
  scheduleCron: '0 9 * * *',
  actionType: 'notify'
};

const AutomationsPage = () => {
  const [automations, setAutomations] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('');
  const { user } = useAuth();
  const canWrite = user && user.role !== 'viewer';

  const loadAutomations = async () => {
    try {
      const res = await apiFetch('/api/automations');
      setAutomations(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAutomations();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('Saving...');

    try {
      await apiJson('/api/automations', {
        name: form.name,
        triggerType: form.triggerType,
        triggerEvent: form.triggerType === 'event' ? form.triggerEvent : null,
        scheduleCron: form.triggerType === 'schedule' ? form.scheduleCron : null,
        actionType: form.actionType
      });
      setForm(initialForm);
      setStatus('Automation created');
      loadAutomations();
    } catch (err) {
      setStatus('Failed to create automation');
    }
  };

  const runAutomation = async (id) => {
    try {
      await apiJson(`/api/automations/${id}/run`, {});
      setStatus('Automation run queued');
    } catch (err) {
      setStatus('Failed to queue run');
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
        <h3 className="text-2xl font-semibold text-white">Automation Engine</h3>
        <p className="mt-2 text-sm text-white/60">
          Build event-driven automations and scheduled jobs backed by Redis queues.
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/5 bg-panel/80 p-6">
          <h4 className="text-lg font-semibold text-white">Create Automation</h4>
          {canWrite ? (
            <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-sm">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Automation name"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white"
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  name="triggerType"
                  value={form.triggerType}
                  onChange={handleChange}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white"
                >
                  <option value="event">Event</option>
                  <option value="schedule">Schedule</option>
                </select>
                <select
                  name="actionType"
                  value={form.actionType}
                  onChange={handleChange}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white"
                >
                  <option value="notify">Notify</option>
                  <option value="webhook">Webhook</option>
                  <option value="run_script">Run Script</option>
                </select>
              </div>
              {form.triggerType === 'event' ? (
                <input
                  name="triggerEvent"
                  value={form.triggerEvent}
                  onChange={handleChange}
                  placeholder="api_failed"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white"
                />
              ) : (
                <input
                  name="scheduleCron"
                  value={form.scheduleCron}
                  onChange={handleChange}
                  placeholder="0 9 * * *"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white"
                />
              )}
              <button className="w-full rounded-full bg-accent px-5 py-2 text-sm font-semibold text-ink">
                Save Automation
              </button>
              {status && <p className="text-xs text-white/60">{status}</p>}
            </form>
          ) : (
            <p className="mt-4 text-sm text-white/60">
              Your role is read-only. Ask an admin to create or edit automations.
            </p>
          )}
        </div>
        <div className="rounded-3xl border border-white/5 bg-panel/80 p-6">
          <h4 className="text-lg font-semibold text-white">Worker Status</h4>
          <div className="mt-6 space-y-4">
            {[
              { label: 'Queue', value: 'automation_jobs' },
              { label: 'Workers online', value: '1' },
              { label: 'Jobs today', value: 'Check Analytics' }
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/5 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">{item.label}</p>
                <p className="mt-2 text-xl font-semibold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/5 bg-panel/80 p-6">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-white">Automations</h4>
          <button onClick={loadAutomations} className="rounded-full bg-white/10 px-4 py-2 text-sm text-white">
            Refresh
          </button>
        </div>
        <div className="mt-6 space-y-3">
          {automations.map((row) => (
            <div key={row.id} className="rounded-2xl border border-white/5 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white">{row.name}</p>
                  <p className="text-xs text-white/50">
                    Trigger: {row.triggerType === 'schedule' ? row.scheduleCron : row.triggerEvent}
                  </p>
                </div>
                <div className="text-sm text-white/70">{row.actionType}</div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                  {row.enabled ? 'Enabled' : 'Disabled'}
                </p>
                {canWrite && (
                  <button
                    onClick={() => runAutomation(row.id)}
                    className="rounded-full bg-white/10 px-3 py-1 text-xs text-white"
                  >
                    Run
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AutomationsPage;
