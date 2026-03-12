import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import LineChartCard from '../../components/LineChartCard';
import { apiFetch } from '../../utils/api';
import { formatDateLabel } from '../../utils/format';

const AnalyticsPage = () => {
  const [apiUptime, setApiUptime] = useState([]);
  const [automationRuns, setAutomationRuns] = useState([]);
  const [botActivity, setBotActivity] = useState([]);
  const [fileUploads, setFileUploads] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadAnalytics = async () => {
      try {
        const [uptimeRes, automationRes, botRes, fileRes] = await Promise.all([
          apiFetch('/api/analytics/api-uptime?days=7'),
          apiFetch('/api/analytics/automations?days=7'),
          apiFetch('/api/analytics/bots?days=7'),
          apiFetch('/api/analytics/files?days=7')
        ]);

        if (!isMounted) return;

        setApiUptime(uptimeRes.data.map((item) => ({ name: formatDateLabel(item.date), value: item.value })));
        setAutomationRuns(automationRes.data.map((item) => ({ name: formatDateLabel(item.date), value: item.value })));
        setBotActivity(botRes.data.map((item) => ({ name: formatDateLabel(item.date), value: item.value })));
        setFileUploads(fileRes.data.map((item) => ({ name: formatDateLabel(item.date), value: item.value })));
      } catch (err) {
        console.error(err);
      }
    };

    loadAnalytics();

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
        <h3 className="text-2xl font-semibold text-white">Analytics Dashboard</h3>
        <p className="mt-2 text-sm text-white/60">
          Visualize uptime, automation runs, bot activity, and file usage trends.
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <LineChartCard title="API Uptime (%)" dataKey="value" data={apiUptime} color="#4FD1C5" delay={0.2} />
        <LineChartCard title="Automation Runs" dataKey="value" data={automationRuns} color="#F6C453" delay={0.3} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <LineChartCard title="Bot Activity" dataKey="value" data={botActivity} color="#8B5CF6" delay={0.2} />
        <LineChartCard title="File Uploads" dataKey="value" data={fileUploads} color="#38BDF8" delay={0.3} />
      </div>
    </div>
  );
};

export default AnalyticsPage;
