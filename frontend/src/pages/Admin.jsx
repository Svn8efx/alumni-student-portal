import { useEffect, useState } from 'react';
import { ShieldCheck, ShieldOff, BadgeCheck } from 'lucide-react';
import api from '../api/axios';
import RoleBadge from '../components/RoleBadge';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');

  const load = async () => {
    setLoading(true);
    const { data } = await api.get('/users/admin/all');
    setUsers(data.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (u) => {
    await api.patch(`/users/admin/${u._id}`, { isActive: !u.isActive });
    load();
  };

  const toggleVerified = async (u) => {
    await api.patch(`/users/admin/${u._id}`, { isVerified: !u.isVerified });
    load();
  };

  const filtered = roleFilter ? users.filter((u) => u.role === roleFilter) : users;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl mb-1">Admin Console</h1>
        <p className="text-ink-500 text-sm">Manage user accounts, roles, and verification status.</p>
      </div>

      <div className="flex gap-2">
        {['', 'student', 'alumni', 'admin'].map((r) => (
          <button
            key={r || 'all'}
            onClick={() => setRoleFilter(r)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border capitalize ${roleFilter === r ? 'bg-ink-800 text-white border-ink-800' : 'border-ink-200 text-ink-600'}`}
          >
            {r || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-ink-400">Loading users…</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wide text-ink-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u._id} className="border-b border-ink-50 last:border-0">
                  <td className="px-4 py-3 font-medium text-ink-800">{u.name}</td>
                  <td className="px-4 py-3 text-ink-500">{u.email}</td>
                  <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${u.isActive ? 'text-moss-600' : 'text-red-500'}`}>
                      {u.isActive ? 'Active' : 'Deactivated'}
                    </span>
                    {u.isVerified && <span className="ml-2 text-xs text-brass-600">✓ Verified</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => toggleVerified(u)} title="Toggle verified" className="p-1.5 text-ink-400 hover:text-brass-600"><BadgeCheck size={16} /></button>
                      <button onClick={() => toggleActive(u)} title="Toggle active" className="p-1.5 text-ink-400 hover:text-red-600">
                        {u.isActive ? <ShieldOff size={16} /> : <ShieldCheck size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Admin;
