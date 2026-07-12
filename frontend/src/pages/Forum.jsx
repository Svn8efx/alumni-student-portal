import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Eye, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['general', 'placements', 'academics', 'career-advice', 'projects'];

const Forum = () => {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [category, setCategory] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', category: 'general' });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const params = category ? { category } : {};
    const { data } = await api.get('/forum', { params });
    setThreads(data.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [category]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) return;
    await api.post('/forum', form);
    setForm({ title: '', body: '', category: 'general' });
    setShowForm(false);
    load();
  };

  const handleDelete = async (e, threadId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this thread? This cannot be undone.')) return;
    await api.delete(`/forum/${threadId}`);
    setThreads((prev) => prev.filter((t) => t._id !== threadId));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl mb-1">Discussion Forum</h1>
          <p className="text-ink-500 text-sm">Ask about placements, academics, and career paths.</p>
        </div>
        <button onClick={() => setShowForm((s) => !s)} className="btn-primary">
          {showForm ? 'Cancel' : 'New thread'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card p-5 space-y-3">
          <input
            className="input"
            placeholder="Thread title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <textarea
            className="input resize-none"
            rows={4}
            placeholder="Describe your question in detail…"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
          />
          <select className="input w-auto text-sm" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button type="submit" className="btn-primary">Post thread</button>
        </form>
      )}

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setCategory('')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border capitalize ${!category ? 'bg-ink-800 text-white border-ink-800' : 'border-ink-200 text-ink-600'}`}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border capitalize ${category === c ? 'bg-ink-800 text-white border-ink-800' : 'border-ink-200 text-ink-600'}`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-ink-400">Loading threads…</p>
      ) : threads.length === 0 ? (
        <p className="text-sm text-ink-400">No threads yet in this category.</p>
      ) : (
        <div className="space-y-3">
          {threads.map((t) => {
            const canDelete = t.author._id === user._id || user.role === 'admin';
            return (
              <Link key={t._id} to={`/forum/${t._id}`} className="card p-4 flex items-center justify-between gap-4 hover:border-brass-300 transition-colors block">
                <div className="min-w-0">
                  <p className="font-medium text-ink-800 truncate">{t.title}</p>
                  <p className="text-xs text-ink-400">
                    by {t.author.name} · {formatDistanceToNow(new Date(t.createdAt), { addSuffix: true })} ·
                    <span className="capitalize"> {t.category}</span>
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs text-ink-500 shrink-0">
                  <span className="flex items-center gap-1"><MessageSquare size={13} /> {t.repliesCount || 0}</span>
                  <span className="flex items-center gap-1"><Eye size={13} /> {t.views}</span>
                  {canDelete && (
                    <button
                      onClick={(e) => handleDelete(e, t._id)}
                      title="Delete thread"
                      className="p-1 text-ink-300 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
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

export default Forum;