import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Briefcase, GraduationCap, Check, Clock, MessageCircle } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import RoleBadge from '../components/RoleBadge';

const Directory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState(searchParams.get('role') || '');
  const [loading, setLoading] = useState(true);
  const [connectionMap, setConnectionMap] = useState({});

  const load = async () => {
    setLoading(true);
    const params = {};
    if (role) params.role = role;
    if (search) params.search = search;
    const [usersRes, connectionsRes] = await Promise.all([
      api.get('/users', { params }),
      api.get('/connections'),
    ]);
    setUsers(usersRes.data.data.filter((u) => u._id !== user._id));

    const map = {};
    connectionsRes.data.data.forEach((c) => {
      const isRequester = c.requester._id === user._id;
      const otherId = isRequester ? c.receiver._id : c.requester._id;
      map[otherId] = { status: c.status, direction: isRequester ? 'sent' : 'received' };
    });
    setConnectionMap(map);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const handleSearch = (e) => {
    e.preventDefault();
    load();
  };

  const handleConnect = async (receiverId) => {
    try {
      await api.post('/connections', { receiverId, message: 'Hi! I would love to connect.' });
      setConnectionMap((m) => ({ ...m, [receiverId]: { status: 'pending', direction: 'sent' } }));
      toast.success('Connection request sent.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send request');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl mb-1">Directory</h1>
        <p className="text-ink-500 text-sm">Search verified alumni and students of the institution.</p>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            className="input pl-9"
            placeholder="Search by name, company, or skill…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {['', 'alumni', 'student'].map((r) => (
            <button
              type="button"
              key={r || 'all'}
              onClick={() => { setRole(r); setSearchParams(r ? { role: r } : {}); }}
              className={`px-4 py-2.5 rounded-sm text-sm font-medium border capitalize transition-colors ${
                role === r ? 'bg-ink-800 text-white border-ink-800' : 'border-ink-200 text-ink-600 hover:bg-ink-50'
              }`}
            >
              {r || 'All'}
            </button>
          ))}
          <button type="submit" className="btn-secondary">Search</button>
        </div>
      </form>

      {loading ? (
        <p className="text-sm text-ink-400">Loading directory…</p>
      ) : users.length === 0 ? (
        <p className="text-sm text-ink-400">No matching profiles found.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((u) => {
            const connection = connectionMap[u._id];
            return (
              <div key={u._id} className="card p-5 flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-full bg-ink-50 grid place-items-center font-semibold text-ink-700 overflow-hidden shrink-0">
                    {u.avatarUrl ? <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" /> : u.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-ink-800 truncate">{u.name}</p>
                    <RoleBadge role={u.role} />
                  </div>
                </div>

                {u.role === 'alumni' ? (
                  <div className="text-sm text-ink-600 space-y-1 mb-3">
                    {u.designation && <p className="flex items-center gap-1.5"><Briefcase size={13} /> {u.designation} {u.company && `at ${u.company}`}</p>}
                    {u.graduationYear && <p className="flex items-center gap-1.5"><GraduationCap size={13} /> Class of {u.graduationYear}</p>}
                  </div>
                ) : (
                  <div className="text-sm text-ink-600 space-y-1 mb-3">
                    {u.branch && <p>{u.branch}</p>}
                    {u.currentYear && <p>Year {u.currentYear}</p>}
                  </div>
                )}

                {u.bio && <p className="text-xs text-ink-500 line-clamp-2 mb-4">{u.bio}</p>}

                {u.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {u.skills.slice(0, 4).map((s) => (
                      <span key={s} className="text-[11px] bg-ink-50 text-ink-600 px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                )}

                {connection?.status === 'accepted' ? (
                  <div className="mt-auto flex gap-2">
                    <button disabled className="btn-secondary flex-1 text-xs !opacity-100 !cursor-default text-moss-600 border-moss-500/30">
                      <Check size={14} /> Connected
                    </button>
                    <button
                      onClick={() => navigate(`/messages/${u._id}`)}
                      title="Message"
                      className="btn-secondary px-3 text-xs shrink-0"
                    >
                      <MessageCircle size={14} />
                    </button>
                  </div>
                ) : connection?.status === 'pending' ? (
                  <button disabled className="btn-secondary mt-auto text-xs !opacity-100 !cursor-default">
                    <Clock size={14} /> {connection.direction === 'sent' ? 'Request sent' : 'Respond in Connections'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleConnect(u._id)}
                    className="btn-secondary mt-auto text-xs"
                  >
                    Connect
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Directory;