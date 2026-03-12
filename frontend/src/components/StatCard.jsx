import { motion } from 'framer-motion';

const StatCard = ({ title, value, subtitle, trend, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="glow-ring rounded-3xl border border-white/5 bg-panel/80 p-6"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/60">{title}</p>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
          {trend}
        </span>
      </div>
      <div className="mt-4 text-3xl font-semibold text-white">{value}</div>
      <p className="mt-2 text-xs uppercase tracking-[0.3em] text-white/40">{subtitle}</p>
    </motion.div>
  );
};

export default StatCard;
