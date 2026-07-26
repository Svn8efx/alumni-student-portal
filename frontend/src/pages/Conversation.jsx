import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Send, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useConfirm } from '../context/ConfirmContext';

const Conversation = () => {
  const { userId } = useParams();
  const { user, socket } = useAuth();
  const confirmDialog = useConfirm();
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  const load = async () => {
    try {
      const [msgRes, userRes] = await Promise.all([
        api.get(`/messages/${userId}`),
        api.get(`/users/${userId}`),
      ]);
      setMessages(msgRes.data.data);
      setOtherUser(userRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load conversation');
    }
  };

  useEffect(() => { load(); }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Live-append messages arriving over the socket for this conversation,
  // and live-tombstone messages the other person deletes
  useEffect(() => {
    if (!socket) return;
    const onNew = (msg) => {
      if (msg.sender === userId || msg.receiver === userId) {
        setMessages((prev) => [...prev, msg]);
      }
    };
    const onDeleted = ({ _id }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === _id ? { ...m, isDeleted: true, content: '' } : m))
      );
    };
    socket.on('new_message', onNew);
    socket.on('message_deleted', onDeleted);
    return () => {
      socket.off('new_message', onNew);
      socket.off('message_deleted', onDeleted);
    };
  }, [socket, userId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      const { data } = await api.post('/messages', { receiverId: userId, content: text });
      setMessages((prev) => [...prev, data.data]);
      setText('');
    } catch (err) {
      setError(err.response?.data?.message || 'You must be connected to message this user.');
    }
  };

  const handleDelete = async (messageId) => {
    const ok = await confirmDialog('This message will be deleted for everyone.', {
      title: 'Delete message?',
    });
    if (!ok) return;
    try {
      await api.delete(`/messages/${messageId}`);
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, isDeleted: true, content: '' } : m))
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete message');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)]">
      <div className="flex items-center gap-3 pb-4 border-b border-ink-100">
        <Link to="/messages" className="p-2 hover:bg-ink-50 rounded-full"><ArrowLeft size={18} /></Link>
        <div className="w-9 h-9 rounded-full bg-ink-50 grid place-items-center font-semibold text-ink-700">
          {(otherUser?.name || '?').charAt(0)}
        </div>
        <p className="font-medium text-ink-800">{otherUser?.name || 'Loading…'}</p>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2 mt-3">{error}</p>}

      <div className="flex-1 overflow-y-auto py-4 space-y-1.5">
        {messages.map((m) => {
          const mine = m.sender === user._id;
          return (
            <div key={m._id} className={`flex items-center gap-2 group ${mine ? 'justify-end' : 'justify-start'}`}>
              {mine && !m.isDeleted && (
                <button
                  onClick={() => handleDelete(m._id)}
                  title="Delete message"
                  className="p-1.5 text-ink-300 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              )}
              <div className={`max-w-[70%] px-3.5 py-2 text-sm ${
                m.isDeleted
                  ? `rounded-2xl ${mine ? 'rounded-br-md' : 'rounded-bl-md'} bg-transparent border border-dashed border-ink-200 dark:border-ink-600 text-ink-400 italic`
                  : mine
                  ? 'rounded-2xl rounded-br-md bg-ink-800 text-white dark:bg-brass-500 dark:text-ink-900'
                  : 'rounded-2xl rounded-bl-md bg-white dark:bg-ink-700 border border-ink-100 dark:border-ink-600 text-ink-700'
              }`}>
                <p className="break-words">
                  {m.isDeleted ? 'This message was deleted' : m.content}
                  <span className={`text-[10px] ml-2 align-bottom whitespace-nowrap ${
                    m.isDeleted ? 'text-ink-300' : mine ? 'text-white/60 dark:text-ink-900/60' : 'text-ink-400'
                  }`}>
                    {format(new Date(m.createdAt), 'p')}
                  </span>
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 pt-3 border-t border-ink-100">
        <input
          className="input flex-1 rounded-full px-4"
          placeholder="Type a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="btn-primary rounded-full w-11 h-11 !p-0 shrink-0"><Send size={16} /></button>
      </form>
    </div>
  );
};

export default Conversation;