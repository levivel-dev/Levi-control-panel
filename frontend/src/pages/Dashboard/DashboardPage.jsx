import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import StatCard from '../../components/StatCard';
import LineChartCard from '../../components/LineChartCard';
import SystemLogFeed from '../../components/SystemLogFeed';
import { apiFetch } from '../../utils/api';
import { formatBytes, formatDateLabel } from '../../utils/format';

const DashboardPage = () => {
  const [summary, setSummary] = useState({
    apis: { count: 0, healthy: 0 },
    automations: { count: 0, enabled: 0 },
    bots: { count: 0, running: 0 },
    files: { totalBytes: 0, fileCount: 0 },
    logsToday: 0
  });
  const [uptimeSeries, setUptimeSeries] = useState([]);
  const [automationSeries, setAutomationSeries] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [summaryRes, uptimeRes, automationRes] = await Promise.all([
          apiFetch('/api/dashboard/summary'),
          apiFetch('/api/analytics/api-uptime?days=7'),
          apiFetch('/api/analytics/automations?days=7')
        ]);

        if (!isMounted) return;

        setSummary(summaryRes.data);
        setUptimeSeries(
          uptimeRes.data.map((item) => ({
            name: formatDateLabel(item.date),
            value: item.value
          }))
        );
        setAutomationSeries(
          automationRes.data.map((item) => ({
            name: formatDateLabel(item.date),
            value: item.value
          }))
        );
      } catch (err) {
        console.error(err);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-3xl border border-white/10 bg-panel/70 p-8"
      >
        <p className="text-xs uppercase tracking-[0.3em] text-white/40">Live overview</p>
        <h3 className="mt-2 text-3xl font-semibold text-white">
          Welcome back, Levi. Your stack is humming.
        </h3>
        <p className="mt-2 text-sm text-white/60">
          Track uptime, automations, bots, and storage from one high-signal cockpit.
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-4">
        <StatCard
          title="Active APIs"
          value={`${summary.apis.healthy}/${summary.apis.count}`}
          subtitle="Healthy"
          trend="Live"
          delay={0.1}
        />
        <StatCard
          title="Running Automations"
          value={`${summary.automations.enabled}`}
          subtitle="Enabled"
          trend="Scheduled"
          delay={0.2}
        />
        <StatCard
          title="Bot Status"
          value={`${summary.bots.running}/${summary.bots.count}`}
          subtitle="Running"
          trend="Live"
          delay={0.3}
        />
        <StatCard
          title="System Logs"
          value={`${summary.logsToday}`}
          subtitle="Today"
          trend="Streaming"
          delay={0.4}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <LineChartCard
          title="API Uptime (%)"
          dataKey="value"
          data={uptimeSeries}
          color="#4FD1C5"
          delay={0.2}
        />
        <LineChartCard
          title="Automation Runs"
          dataKey="value"
          data={automationSeries}
          color="#F6C453"
          delay={0.3}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/5 bg-panel/80 p-6">
          <h3 className="text-lg font-semibold text-white">System Snapshot</h3>
          <div className="mt-6 grid gap-4">
            {[
              { label: 'API health', value: `${summary.apis.healthy}/${summary.apis.count}`, note: 'Healthy now' },
              { label: 'Automation success', value: `${summary.automations.enabled} enabled`, note: 'Scheduler live' },
              {
                label: 'File storage',
                value: `${formatBytes(summary.files.totalBytes)}`,
                note: `${summary.files.fileCount} files stored`
              }
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/5 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">{item.label}</p>
                <p className="mt-2 text-xl font-semibold text-white">{item.value}</p>
                <p className="text-sm text-white/60">{item.note}</p>
              </div>
            ))}
          </div>
        </div>
        <SystemLogFeed />
      </div>
    </div>
  );
};

export default DashboardPage;
