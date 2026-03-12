import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';
import { API_BASE_URL, apiFetch } from '../utils/api';

const initialLogs = [
  {
    level: 'info',
    scope: 'system',
    message: 'System boot sequence complete',
    timestamp: new Date().toISOString()
  },
  {
    level: 'warn',
    scope: 'automation',
    message: 'No automations scheduled yet',
    timestamp: new Date().toISOString()
  }
];

const levelStyles = {
  info: 'text-emerald-300',
  warn: 'text-yellow-300',
  error: 'text-rose-300',
  http: 'text-sky-300'
};

const scopeOptions = ['all', 'api', 'bot', 'automation', 'file', 'http', 'audit', 'system'];

const SystemLogFeed = () => {
  const [logs, setLogs] = useState([]);
  const [scope, setScope] = useState('all');
  const [entityId, setEntityId] = useState('');

  useEffect(() => {
    let isMounted = true;

    apiFetch('/api/logs?limit=40')
      .then((res) => {
        if (!isMounted) return;
        if (res.data && res.data.length) {
          setLogs(res.data);
        } else {
          setLogs(initialLogs);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLogs(initialLogs);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const socket = io(API_BASE_URL, {
      transports: ['websocket']
    });

    socket.on('system-log', (payload) => {
      setLogs((prev) => [payload, ...prev].slice(0, 60));
    });

    socket.on('connect_error', () => {
      setLogs((prev) => [
        {
          level: 'error',
          scope: 'system',
          message: 'Unable to connect to live logs. Check backend.',
          timestamp: new Date().toISOString()
        },
        ...prev
      ].slice(0, 60));
    });

    return () => socket.disconnect();
  }, []);

  const displayLogs = useMemo(() => {
    return logs.filter((log) => {
      const scopeMatch = scope === 'all' || log.scope === scope;
      const idMatch =
        !entityId ||
        (log.entityId && String(log.entityId).includes(entityId.trim()));
      return scopeMatch && idMatch;
    });
  }, [logs, scope, entityId]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="rounded-3xl border border-white/5 bg-panel/80 p-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Real-time System Logs</h3>
        <span className="text-xs text-white/50">Socket.io</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs">
        <select
          value={scope}
          onChange={(event) => setScope(event.target.value)}
          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white"
        >
          {scopeOptions.map((option) => (
            <option key={option} value={option}>
              {option.toUpperCase()}
            </option>
          ))}
        </select>
        <input
          value={entityId}
          onChange={(event) => setEntityId(event.target.value)}
          placeholder="Filter by ID"
          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white"
        />
      </div>

      <div className="mt-6 space-y-3 text-xs font-mono">
        {displayLogs.map((log, index) => (
          <div key={`${log.timestamp}-${index}`} className="flex items-start gap-3 rounded-2xl bg-white/5 px-4 py-3">
            <span className={`uppercase ${levelStyles[log.level] || 'text-white/60'}`}>{log.level}</span>
            <div className="flex-1">
              <p className="text-white/80">{log.message}</p>
              <p className="text-white/40">
                {log.scope || 'system'}
                {log.entityId ? ` · ID ${log.entityId}` : ''}
                {' · '}
                {new Date(log.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default SystemLogFeed;
