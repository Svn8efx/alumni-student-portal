import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '../api/axios';
import RoleBadge from '../components/RoleBadge';

const ForumThreadPage = () => {
  const { id } = useParams();
  const [thread, setThread] = useState(null);
  const [reply, setReply] = useState('');

  const load = async () => {
    const { data } = await api.get(`/forum/${id}`);
    setThread(data.data);
  };

  useEffect(() => { load(); }, [id]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    const { data } = await api.post(`/forum/${id}/replies`, { content: reply });
    setThread((t) => ({ ...t, replies: data.data }));
    setReply('');
  };

  if (!thread) return <p className="text-sm text-ink-400">Loading thread…</p>;

  return (
    <div className="max-w-2xl space-y-6">
      <Link to="/forum" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-800">
        <ArrowLeft size={15} /> Back to forum
      </Link>

      <div className="card p-6">
        <div className="flex items-center gap-2 mb-2">
          <p className="text-xs uppercase tracking-wide text-brass-600 font-semibold capitalize">{thread.category}</p>
        </div>
        <h1 className="text-xl mb-2">{thread.title}</h1>
        <div className="flex items-center gap-2 mb-4">
          <p className="text-sm font-medium text-ink-700">{thread.author.name}</p>
          <RoleBadge role={thread.author.role} />
          <span className="text-xs text-ink-400">{formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}</span>
        </div>
        <p className="text-sm text-ink-700 leading-relaxed whitespace-pre-wrap">{thread.body}</p>
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500 mb-3">
          {thread.replies.length} {thread.replies.length === 1 ? 'Reply' : 'Replies'}
        </h2>
        <div className="space-y-3">
          {thread.replies.map((r) => (
            <div key={r._id} className="card p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <p className="text-sm font-medium text-ink-700">{r.author.name}</p>
                <RoleBadge role={r.author.role} />
                <span className="text-xs text-ink-400 ml-auto">{formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}</span>
              </div>
              <p className="text-sm text-ink-600">{r.content}</p>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleReply} className="card p-4 space-y-3">
        <textarea
          className="input resize-none"
          rows={3}
          placeholder="Write a reply…"
          value={reply}
          onChange={(e) => setReply(e.target.value)}
        />
        <button type="submit" className="btn-primary">Post reply</button>
      </form>
    </div>
  );
};

export default ForumThreadPage;
