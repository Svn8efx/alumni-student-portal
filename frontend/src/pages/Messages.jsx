import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Messages = () => {
  const { user } = useAuth();
  const [inbox, setInbox] = useState([]);
  const [people, setPeople] = useState({}); // userId -> user object, resolved from connections
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [inboxRes, connectionsRes] = await Promise.all([
        api.get('/messages'),
        api.get('/connections?status=accepted'),
      ]);
      const map = {};
      connectionsRes.data.data.forEach((c) => {
        const other = c.requester._id === user._id ? c.receiver : c.requester;
        map[other._id] = other;
      });
      setPeople(map);
      setInbox(inboxRes.data.data);
      setLoading(false);
    };
    load();
  }, [user._id]);

  const getOtherUserId = (conversationId) => conversationId.split('_').find((id) => id !== user._id);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl mb-1">Messages</h1>
        <p className="text-ink-500 text-sm">Direct conversations with your accepted connections.</p>
      </div>

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
