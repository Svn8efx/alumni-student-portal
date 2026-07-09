import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, MessageCircle } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import RoleBadge from '../components/RoleBadge';

const TABS = [
  { key: 'incoming', label: 'Incoming Requests' },
  { key: 'accepted', label: 'My Connections' },
  { key: 'sent', label: 'Sent Requests' },
];

const Connections = () => {
  const { user } = useAuth();
  const [connections, setConnections] = useState([]);
  const [tab, setTab] = useState('incoming');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await api.get('/connections');
    setConnections(data.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const respond = async (id, status) => {
    await api.patch(`/connections/${id}`, { status });
    load();
  };

  const filtered = connections.filter((c) => {
    if (tab === 'incoming') return c.status === 'pending' && c.receiver._id === user._id;
    if (tab === 'sent') return c.status === 'pending' && c.requester._id === user._id;
    if (tab === 'accepted') return c.status === 'accepted';
    return true;
  });

  const otherParty = (c) => (c.requester._id === user._id ? c.receiver : c.requester);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl mb-1">Connections</h1>
        <p className="text-ink-500 text-sm">Manage mentorship and networking requests.</p>
      </div>

      <div className="flex gap-2 border-b border-ink-100">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.key ? 'border-brass-500 text-ink-900' : 'border-transparent text-ink-400 hover:text-ink-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-ink-400">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-ink-400">Nothing here yet.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => {
            const person = otherParty(c);
            return (
              <div key={c._id} className="card p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-ink-50 grid place-items-center font-semibold text-ink-700 shrink-0">
                  {person.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-ink-800 truncate">{person.name}</p>
                    <RoleBadge role={person.role} />
                  </div>
                  {c.message && <p className="text-xs text-ink-500 truncate">"{c.message}"</p>}
                </div>

                {tab === 'incoming' && (
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => respond(c._id, 'accepted')} className="btn-primary px-3 py-2 text-xs"><Check size={14} /> Accept</button>
                    <button onClick={() => respond(c._id, 'rejected')} className="btn-secondary px-3 py-2 text-xs"><X size={14} /> Decline</button>
                  </div>
                )}
                {tab === 'accepted' && (
                  <Link to={`/messages/${person._id}`} className="btn-secondary px-3 py-2 text-xs shrink-0">
                    <MessageCircle size={14} /> Message
                  </Link>
                )}
                {tab === 'sent' && <span className="text-xs text-ink-400 shrink-0">Pending</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Connections;
