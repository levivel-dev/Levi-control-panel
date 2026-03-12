const formatBytes = (bytes = 0) => {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = (bytes / Math.pow(1024, index)).toFixed(1);
  return `${value} ${units[index]}`;
};

const formatDateLabel = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export { formatBytes, formatDateLabel };
