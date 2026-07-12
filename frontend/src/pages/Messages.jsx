import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquarePlus, X } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import RoleBadge from '../components/RoleBadge';

const Messages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [inbox, setInbox] = useState([]);
  const [connections, setConnections] = useState([]);
  const [people, setPeople] = useState({});
  const [loading, setLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [inboxRes, connectionsRes] = await Promise.all([
        api.get('/messages'),
        api.get('/connections?status=accepted'),
      ]);
      const map = {};
      const others = connectionsRes.data.data.map((c) => {
        const other = c.requester._id === user._id ? c.receiver : c.requester;
        map[other._id] = other;
        return other;
      });
      setPeople(map);
      setConnections(others);
      setInbox(inboxRes.data.data);
      setLoading(false);
    };
    load();
  }, [user._id]);

  const getOtherUserId = (conversationId) => conversationId.split('_').find((id) => id !== user._id);

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl mb-1">Messages</h1>
          <p className="text-ink-500 text-sm">Direct conversations with your accepted connections.</p>
        </div>
        {connections.length > 0 && (
          <button onClick={() => setShowPicker((s) => !s)} className="btn-primary shrink-0 text-sm">
            <MessageSquarePlus size={16} /> New Message
          </button>
        )}
      </div>

      {showPicker && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-ink-700">Message one of your connections</p>
            <button onClick={() => setShowPicker(false)} className="p-1 text-ink-400 hover:text-ink-700"><X size={16} /></button>
          </div>
          <div className="space-y-1 max-h-72 overflow-y-auto">
            {connections.map((person) => (
              <button
                key={person._id}
                onClick={() => navigate(`/messages/${person._id}`)}
                className="w-full flex items-center gap-3 p-2 rounded-sm hover:bg-ink-50 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-full bg-ink-50 grid place-items-center font-semibold text-ink-700 shrink-0">
                  {person.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink-800 truncate">{person.name}</p>
                </div>
                <RoleBadge role={person.role} />
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-ink-400">Loading inbox…</p>
      ) : inbox.length === 0 ? (
        <div className="card p-6 text-center">
          <p className="text-sm text-ink-500 mb-3">No conversations yet.</p>
          <Link to="/connections" className="text-brass-600 text-sm hover:underline">View your connections to start one</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {inbox.map((conv) => {
            const otherId = getOtherUserId(conv._id);
            const person = people[otherId];
            return (
              <Link key={conv._id} to={`/messages/${otherId}`} className="card p-4 flex items-center gap-3 hover:border-brass-300 transition-colors">
                <div className="w-10 h-10 rounded-full bg-ink-50 grid place-items-center font-semibold text-ink-700 shrink-0">
                  {(person?.name || '?').charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink-800 text-sm truncate">{person?.name || 'Unknown user'}</p>
                  <p className="text-xs text-ink-500 truncate">{conv.lastMessage.content}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-ink-400">{formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: true })}</p>
                  {conv.unreadCount > 0 && (
                    <span className="inline-block mt-1 min-w-[18px] h-[18px] px-1 rounded-full bg-brass-500 text-[10px] font-bold text-ink-900 text-center leading-[18px]">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Messages;