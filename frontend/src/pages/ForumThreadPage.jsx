import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import RoleBadge from '../components/RoleBadge';

const ForumThreadPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const confirmDialog = useConfirm();
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

  const handleDeleteThread = async () => {
    const ok = await confirmDialog('This thread and all its replies will be permanently removed.', {
      title: 'Delete this thread?',
    });
    if (!ok) return;
    await api.delete(`/forum/${id}`);
    toast.success('Thread deleted.');
    navigate('/forum');
  };

  const handleDeleteReply = async (replyId) => {
    const ok = await confirmDialog('This reply will be permanently removed.', {
      title: 'Delete this reply?',
    });
    if (!ok) return;
    await api.delete(`/forum/${id}/replies/${replyId}`);
    setThread((t) => ({ ...t, replies: t.replies.filter((r) => r._id !== replyId) }));
    toast.success('Reply deleted.');
  };

  if (!thread) return <p className="text-sm text-ink-400">Loading thread…</p>;

  const canDeleteThread = thread.author._id === user._id || user.role === 'admin';

  return (
    <div className="max-w-2xl space-y-6">
      <Link to="/forum" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-800">
        <ArrowLeft size={15} /> Back to forum
      </Link>

      <div className="card p-6">
        <div className="flex items-center justify-between gap-2 mb-2">
          <p className="text-xs uppercase tracking-wide text-brass-600 font-semibold capitalize">{thread.category}</p>
          {canDeleteThread && (
            <button
              onClick={handleDeleteThread}
              title="Delete thread"
              className="p-1.5 text-ink-300 hover:text-red-600 transition-colors"
            >
              <Trash2 size={15} />
            </button>
          )}
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
          {thread.replies.map((r) => {
            const canDeleteReply = r.author._id === user._id || user.role === 'admin';
            return (
              <div key={r._id} className="card p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <p className="text-sm font-medium text-ink-700">{r.author.name}</p>
                  <RoleBadge role={r.author.role} />
                  <span className="text-xs text-ink-400 ml-auto">{formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}</span>
                  {canDeleteReply && (
                    <button
                      onClick={() => handleDeleteReply(r._id)}
                      title="Delete reply"
                      className="p-1 text-ink-300 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
                <p className="text-sm text-ink-600">{r.content}</p>
              </div>
            );
          })}
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