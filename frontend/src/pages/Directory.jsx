import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Briefcase, GraduationCap, BookOpen, Check, Clock, MessageCircle, X, Handshake } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import RoleBadge from '../components/RoleBadge';
import Spinner from '../components/Spinner';

// Inline LinkedIn glyph — lucide removed brand icons in newer versions,
// so we ship our own tiny SVG instead of depending on a deprecated export.
const LinkedInIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
  </svg>
);

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
      map[otherId] = { id: c._id, status: c.status, direction: isRequester ? 'sent' : 'received' };
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
      const { data } = await api.post('/connections', { receiverId, message: 'Hi! I would love to connect.' });
      setConnectionMap((m) => ({
        ...m,
        [receiverId]: { id: data.data._id, status: 'pending', direction: 'sent' },
      }));
      toast.success('Connection request sent.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send request');
    }
  };

  const handleCancel = async (otherUserId) => {
    const connection = connectionMap[otherUserId];
    if (!connection) return;
    try {
      await api.delete(`/connections/${connection.id}`);
      setConnectionMap((m) => {
        const next = { ...m };
        delete next[otherUserId];
        return next;
      });
      toast.success('Request cancelled.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel request');
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
              className={`px-4 py-2.5 rounded-md text-sm font-medium border capitalize transition-colors ${
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
        <Spinner center label="Loading directory…" />
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
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-ink-800 truncate">{u.name}</p>
                    <RoleBadge role={u.role} />
                  </div>
                  {u.linkedinUrl && (
                    <button
                      type="button"
                      onClick={() => window.open(u.linkedinUrl, '_blank', 'noopener')}
                      title={`${u.name} on LinkedIn`}
                      className="p-1.5 text-ink-400 hover:text-brass-500 transition-colors shrink-0"
                    >
                      <LinkedInIcon size={16} />
                    </button>
                  )}
                </div>

                {u.role === 'alumni' ? (
                  <div className="text-sm text-ink-600 space-y-1 mb-3">
                    {u.designation && <p className="flex items-center gap-1.5"><Briefcase size={13} /> {u.designation} {u.company && `at ${u.company}`}</p>}
                    {u.graduationYear && <p className="flex items-center gap-1.5"><GraduationCap size={13} /> Class of {u.graduationYear}</p>}
                  </div>
                ) : (
                  <div className="text-sm text-ink-600 space-y-1 mb-3">
                    {u.branch && <p className="flex items-center gap-1.5"><BookOpen size={13} /> {u.branch}</p>}
                    {u.currentYear && <p className="flex items-center gap-1.5"><GraduationCap size={13} /> Year {u.currentYear}</p>}
                  </div>
                )}

                {u.role === 'alumni' && u.isMentorAvailable && (
                  <span className="inline-flex items-center gap-1.5 self-start rounded-full border border-brass-400/40 bg-brass-400/10 px-2.5 py-1 text-[11px] font-semibold text-brass-600 dark:text-brass-300 mb-3">
                    <Handshake size={12} /> Open to mentor
                  </span>
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
                ) : connection?.status === 'pending' && connection.direction === 'sent' ? (
                  <div className="mt-auto flex gap-2">
                    <button disabled className="btn-secondary flex-1 text-xs !opacity-100 !cursor-default">
                      <Clock size={14} /> Request sent
                    </button>
                    <button
                      onClick={() => handleCancel(u._id)}
                      title="Cancel request"
                      className="btn-secondary px-3 text-xs shrink-0 hover:text-red-600 hover:border-red-300"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : connection?.status === 'pending' ? (
                  <button disabled className="btn-secondary mt-auto text-xs !opacity-100 !cursor-default">
                    <Clock size={14} /> Respond in Connections
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