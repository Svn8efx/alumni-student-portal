import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { format } from 'date-fns';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Conversation = () => {
  const { userId } = useParams();
  const { user, socket } = useAuth();
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

  // Live-append messages arriving over the socket for this conversation
  useEffect(() => {
    if (!socket) return;
    const handler = (msg) => {
      if (msg.sender === userId || msg.receiver === userId) {
        setMessages((prev) => [...prev, msg]);
      }
    };
    socket.on('new_message', handler);
    return () => socket.off('new_message', handler);
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

  return (
    <div className="max-w-2xl flex flex-col h-[calc(100vh-160px)]">
      <div className="flex items-center gap-3 pb-4 border-b border-ink-100">
        <Link to="/messages" className="p-2 hover:bg-ink-50 rounded-full"><ArrowLeft size={18} /></Link>
        <div className="w-9 h-9 rounded-full bg-ink-50 grid place-items-center font-semibold text-ink-700">
          {(otherUser?.name || '?').charAt(0)}
        </div>
        <p className="font-medium text-ink-800">{otherUser?.name || 'Loading…'}</p>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-sm px-3 py-2 mt-3">{error}</p>}

      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {messages.map((m) => (
          <div key={m._id} className={`flex ${m.sender === user._id ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] px-3.5 py-2 rounded-sm text-sm ${
              m.sender === user._id ? 'bg-ink-800 text-white' : 'bg-white border border-ink-100 text-ink-700'
            }`}>
              <p>{m.content}</p>
              <p className={`text-[10px] mt-1 ${m.sender === user._id ? 'text-ink-300' : 'text-ink-400'}`}>
                {format(new Date(m.createdAt), 'p')}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 pt-3 border-t border-ink-100">
        <input
          className="input flex-1"
          placeholder="Type a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="btn-primary px-4"><Send size={16} /></button>
      </form>
    </div>
  );
};

export default Conversation;
