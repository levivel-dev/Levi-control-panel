import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { apiFetch, apiJson } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const roles = ['admin', 'operator', 'viewer'];

const roleStyles = {
  admin: 'bg-amber-500/20 text-amber-200',
  operator: 'bg-sky-500/20 text-sky-200',
  viewer: 'bg-emerald-500/20 text-emerald-200'
};

const initialForm = {
  name: '',
  email: '',
  password: '',
  role: 'operator'
};

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('');
  const [resetTarget, setResetTarget] = useState(null);
  const [resetPassword, setResetPassword] = useState('');
  const [resetStatus, setResetStatus] = useState('');
  const { user } = useAuth();

  const loadUsers = async () => {
    try {
      const res = await apiFetch('/api/auth/users');
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('Creating user...');

    try {
      await apiJson('/api/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role
      });
      setForm(initialForm);
      setStatus('User created');
      loadUsers();
    } catch (err) {
      setStatus('Failed to create user');
    }
  };

  const updateRole = async (id, role) => {
    setStatus('Updating role...');

    try {
      await apiJson(`/api/auth/users/${id}/role`, { role }, { method: 'PATCH' });
      setStatus('Role updated');
      loadUsers();
    } catch (err) {
      setStatus('Failed to update role');
    }
  };

  const startReset = (id) => {
    setResetTarget(id);
    setResetPassword('');
    setResetStatus('');
  };

  const submitReset = async (id) => {
    if (!resetPassword) {
      setResetStatus('Enter a new password');
      return;
    }

    setResetStatus('Resetting password...');

    try {
      await apiJson(`/api/auth/users/${id}/password`, { password: resetPassword }, { method: 'PATCH' });
      setResetStatus('Password reset');
      setResetTarget(null);
      setResetPassword('');
    } catch (err) {
      setResetStatus('Failed to reset password');
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
        <h3 className="text-2xl font-semibold text-white">User Management</h3>
        <p className="mt-2 text-sm text-white/60">
          Invite teammates, assign roles, and control access to the control panel.
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/5 bg-panel/80 p-6">
          <h4 className="text-lg font-semibold text-white">Create User</h4>
          <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-sm">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full name"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white"
              required
            />
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
              placeholder="Temporary password"
              type="password"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white"
              required
            />
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white"
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <button className="w-full rounded-full bg-accent px-5 py-2 text-sm font-semibold text-ink">
              Create User
            </button>
            {status && <p className="text-xs text-white/60">{status}</p>}
          </form>
        </div>

        <div className="rounded-3xl border border-white/5 bg-panel/80 p-6">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-white">Current Users</h4>
            <button onClick={loadUsers} className="rounded-full bg-white/10 px-4 py-2 text-sm text-white">
              Refresh
            </button>
          </div>
          <div className="mt-6 space-y-3">
            {users.map((person) => (
              <div key={person.id} className="rounded-2xl border border-white/5 bg-white/5 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-white">{person.name}</p>
                    <p className="text-xs text-white/50">{person.email}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em] ${roleStyles[person.role] || 'bg-white/10 text-white/70'}`}>
                    {person.role}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <select
                    value={person.role}
                    onChange={(event) => updateRole(person.id, event.target.value)}
                    disabled={user && person.id === user.id}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white"
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  {user && person.id === user.id && (
                    <span className="text-xs text-white/50">You can’t change your own role</span>
                  )}
                  <button
                    onClick={() => startReset(person.id)}
                    className="rounded-full bg-white/10 px-3 py-1 text-xs text-white"
                  >
                    Reset Password
                  </button>
                </div>
                {resetTarget === person.id && (
                  <div className="mt-3 space-y-2">
                    <input
                      value={resetPassword}
                      onChange={(event) => setResetPassword(event.target.value)}
                      placeholder="New temporary password"
                      type="password"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white"
                    />
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => submitReset(person.id)}
                        className="rounded-full bg-accent px-4 py-2 text-xs font-semibold text-ink"
                      >
                        Confirm Reset
                      </button>
                      {resetStatus && <span className="text-xs text-white/60">{resetStatus}</span>}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
