import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { apiFetch, apiUpload } from '../../utils/api';
import { formatBytes } from '../../utils/format';
import { useAuth } from '../../context/AuthContext';

const workspaceTypes = [
  { value: 'all', label: 'All' },
  { value: 'general', label: 'General' },
  { value: 'api', label: 'API' },
  { value: 'bot', label: 'Bot' }
];

const FilesPage = () => {
  const [files, setFiles] = useState([]);
  const [apis, setApis] = useState([]);
  const [bots, setBots] = useState([]);
  const [status, setStatus] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterId, setFilterId] = useState('');
  const [uploadType, setUploadType] = useState('general');
  const [uploadId, setUploadId] = useState('');
  const { user } = useAuth();
  const canWrite = user && user.role !== 'viewer';

  const loadFiles = async () => {
    try {
      const params = new URLSearchParams();
      if (filterType !== 'all') {
        params.set('workspaceType', filterType);
        if (filterType !== 'general' && filterId) {
          params.set('workspaceId', filterId);
        }
      }

      const res = await apiFetch(`/api/files${params.toString() ? `?${params.toString()}` : ''}`);
      setFiles(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadWorkspaces = async () => {
    try {
      const [apiRes, botRes] = await Promise.all([
        apiFetch('/api/apis'),
        apiFetch('/api/bots')
      ]);
      setApis(apiRes.data || []);
      setBots(botRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [filterType, filterId]);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (uploadType !== 'general' && !uploadId) {
      setStatus('Select a workspace before uploading.');
      return;
    }

    setStatus('Uploading...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      if (uploadType !== 'general') {
        formData.append('workspaceType', uploadType);
        formData.append('workspaceId', uploadId);
      } else {
        formData.append('workspaceType', 'general');
      }

      await apiUpload('/api/files', formData);

      setStatus('Upload complete');
      loadFiles();
    } catch (err) {
      setStatus('Upload failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiFetch(`/api/files/${id}`, { method: 'DELETE' });
      loadFiles();
    } catch (err) {
      console.error(err);
    }
  };

  const renderWorkspaceSelector = (type, value, onChange) => {
    if (type === 'api') {
      return (
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white"
        >
          <option value="">Select API</option>
          {apis.map((api) => (
            <option key={api.id} value={api.id}>
              {api.name}
            </option>
          ))}
        </select>
      );
    }

    if (type === 'bot') {
      return (
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white"
        >
          <option value="">Select Bot</option>
          {bots.map((bot) => (
            <option key={bot.id} value={bot.id}>
              {bot.name}
            </option>
          ))}
        </select>
      );
    }

    return null;
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-3xl border border-white/10 bg-panel/70 p-8"
      >
        <h3 className="text-2xl font-semibold text-white">File Uploads</h3>
        <p className="mt-2 text-sm text-white/60">
          Store metadata, trigger automations, and preview files from one hub.
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/5 bg-panel/80 p-6">
          <h4 className="text-lg font-semibold text-white">Upload Pipeline</h4>
          <div className="mt-4 space-y-3 text-sm text-white/70">
            <p>POST /api/files</p>
            <p>GET /api/files</p>
            <p>DELETE /api/files/:id</p>
          </div>
          {canWrite ? (
            <div className="mt-6 space-y-3">
              <select
                value={uploadType}
                onChange={(event) => setUploadType(event.target.value)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white"
              >
                {workspaceTypes.filter((type) => type.value !== 'all').map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label} Workspace
                  </option>
                ))}
              </select>
              {renderWorkspaceSelector(uploadType, uploadId, setUploadId)}
              <input
                type="file"
                onChange={handleUpload}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"
              />
              {status && <p className="text-xs text-white/60">{status}</p>}
            </div>
          ) : (
            <p className="mt-4 text-sm text-white/60">
              Read-only access. Ask an admin or operator to upload files.
            </p>
          )}
        </div>
        <div className="rounded-3xl border border-white/5 bg-panel/80 p-6">
          <h4 className="text-lg font-semibold text-white">Storage Usage</h4>
          <div className="mt-6 rounded-2xl border border-white/5 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Stored Files</p>
            <p className="mt-2 text-2xl font-semibold text-white">{files.length}</p>
            <p className="text-sm text-white/60">Latest uploads listed below</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/5 bg-panel/80 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h4 className="text-lg font-semibold text-white">Recent Files</h4>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filterType}
              onChange={(event) => {
                setFilterType(event.target.value);
                setFilterId('');
              }}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white"
            >
              {workspaceTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {filterType !== 'all' && filterType !== 'general' && (
              <div className="min-w-[180px]">
                {renderWorkspaceSelector(filterType, filterId, setFilterId)}
              </div>
            )}
            <button onClick={loadFiles} className="rounded-full bg-white/10 px-4 py-2 text-sm text-white">
              Refresh
            </button>
          </div>
        </div>
        <div className="mt-6 space-y-3">
          {files.map((file) => (
            <div key={file.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
              <div>
                <p className="text-white">{file.originalName}</p>
                <p className="text-xs text-white/50">
                  {formatBytes(file.sizeBytes)} · {file.mimeType || 'unknown'}
                </p>
                <p className="text-xs text-white/40">
                  Workspace: {file.workspaceType ? `${file.workspaceType} #${file.workspaceId}` : 'general'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={file.publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-white/10 px-3 py-1 text-xs text-white"
                >
                  View
                </a>
                {canWrite && (
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="rounded-full bg-white/10 px-3 py-1 text-xs text-white"
                  >
                    Delete
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

export default FilesPage;
