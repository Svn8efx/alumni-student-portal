import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Heart, MessageCircle, Send, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import RoleBadge from '../components/RoleBadge';

const POST_TYPES = ['general', 'experience', 'advice', 'announcement'];

const PostCard = ({ post, onLike, onComment, onDeletePost, onDeleteComment, currentUser, defaultOpen, cardRef, highlighted }) => {
  const [showComments, setShowComments] = useState(defaultOpen);
  const [commentText, setCommentText] = useState('');
  const liked = post.likes.includes(currentUser._id);
  const canDeletePost = post.author._id === currentUser._id || currentUser.role === 'admin';

  const submitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await onComment(post._id, commentText);
    setCommentText('');
  };

  return (
    <div ref={cardRef} className={`card p-5 transition-shadow ${highlighted ? 'ring-2 ring-brass-400' : ''}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-ink-50 grid place-items-center font-semibold text-ink-700 shrink-0">
          {post.author.name.charAt(0)}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-ink-800 text-sm">{post.author.name}</p>
            <RoleBadge role={post.author.role} />
          </div>
          <p className="text-xs text-ink-400">
            {post.author.company && `${post.author.company} · `}
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </p>
        </div>
        <span className="ml-auto text-[11px] uppercase tracking-wide text-brass-600 font-semibold">{post.type}</span>
        {canDeletePost && (
          <button
            onClick={() => onDeletePost(post._id)}
            title="Delete post"
            className="p-1.5 text-ink-300 hover:text-red-600 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <p className="text-sm text-ink-700 leading-relaxed whitespace-pre-wrap mb-4">{post.content}</p>

      <div className="flex items-center gap-4 text-sm text-ink-500 border-t border-ink-50 pt-3">
        <button onClick={() => onLike(post._id)} className={`flex items-center gap-1.5 hover:text-brass-600 ${liked ? 'text-brass-600' : ''}`}>
          <Heart size={16} fill={liked ? 'currentColor' : 'none'} /> {post.likes.length}
        </button>
        <button onClick={() => setShowComments((s) => !s)} className="flex items-center gap-1.5 hover:text-ink-800">
          <MessageCircle size={16} /> {post.comments.length}
        </button>
      </div>

      {showComments && (
        <div className="mt-3 pt-3 border-t border-ink-50 space-y-3">
          {post.comments.map((c) => {
            const canDeleteComment = c.author._id === currentUser._id || currentUser.role === 'admin';
            return (
              <div key={c._id} className="flex gap-2 text-sm items-start group">
                <span className="font-medium text-ink-700 shrink-0">{c.author.name}:</span>
                <span className="text-ink-600 flex-1">{c.content}</span>
                {canDeleteComment && (
                  <button
                    onClick={() => onDeleteComment(post._id, c._id)}
                    title="Delete comment"
                    className="p-1 text-ink-300 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            );
          })}
          <form onSubmit={submitComment} className="flex gap-2">
            <input
              className="input flex-1 text-sm"
              placeholder="Write a comment…"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button type="submit" className="btn-secondary px-3"><Send size={15} /></button>
          </form>
        </div>
      )}
    </div>
  );
};

const Feed = () => {
  const { user } = useAuth();
  const toast = useToast();
  const confirmDialog = useConfirm();
  const [searchParams, setSearchParams] = useSearchParams();
  const targetPostId = searchParams.get('post');
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [type, setType] = useState('general');
  const [loading, setLoading] = useState(true);
  const targetRef = useRef(null);
  const hasScrolled = useRef(false);

  const load = async () => {
    setLoading(true);
    const { data } = await api.get('/posts');
    setPosts(data.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!targetPostId || loading || hasScrolled.current) return;
    if (targetRef.current) {
      targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      hasScrolled.current = true;
      setTimeout(() => setSearchParams({}, { replace: true }), 1200);
    }
  }, [targetPostId, loading, posts, setSearchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    const { data } = await api.post('/posts', { content, type });
    setPosts((prev) => [data.data, ...prev]);
    setContent('');
    toast.success('Posted to the feed.');
  };

  const handleLike = async (postId) => {
    await api.patch(`/posts/${postId}/like`);
    setPosts((prev) =>
      prev.map((p) => {
        if (p._id !== postId) return p;
        const liked = p.likes.includes(user._id);
        return { ...p, likes: liked ? p.likes.filter((id) => id !== user._id) : [...p.likes, user._id] };
      })
    );
  };

  const handleComment = async (postId, text) => {
    const { data } = await api.post(`/posts/${postId}/comments`, { content: text });
    setPosts((prev) => prev.map((p) => (p._id === postId ? { ...p, comments: data.data } : p)));
  };

  const handleDeletePost = async (postId) => {
    const ok = await confirmDialog('This post and all its comments will be permanently removed.', {
      title: 'Delete this post?',
    });
    if (!ok) return;
    await api.delete(`/posts/${postId}`);
    setPosts((prev) => prev.filter((p) => p._id !== postId));
    toast.success('Post deleted.');
  };

  const handleDeleteComment = async (postId, commentId) => {
    const ok = await confirmDialog('This comment will be permanently removed.', {
      title: 'Delete this comment?',
    });
    if (!ok) return;
    await api.delete(`/posts/${postId}/comments/${commentId}`);
    setPosts((prev) =>
      prev.map((p) => (p._id === postId ? { ...p, comments: p.comments.filter((c) => c._id !== commentId) } : p))
    );
    toast.success('Comment deleted.');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl mb-1">Knowledge Feed</h1>
        <p className="text-ink-500 text-sm">Career journeys, advice, and updates shared across the network.</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-4 space-y-3">
        <textarea
          className="input resize-none"
          rows={3}
          placeholder={user.role === 'alumni' ? 'Share advice or your career journey…' : 'Ask a question or share an update…'}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="flex items-center justify-between">
          <select className="input w-auto text-sm" value={type} onChange={(e) => setType(e.target.value)}>
            {POST_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <button type="submit" className="btn-primary">Post</button>
        </div>
      </form>

      {loading ? (
        <p className="text-sm text-ink-400">Loading feed…</p>
      ) : posts.length === 0 ? (
        <p className="text-sm text-ink-400">No posts yet — be the first to share something.</p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onLike={handleLike}
              onComment={handleComment}
              onDeletePost={handleDeletePost}
              onDeleteComment={handleDeleteComment}
              currentUser={user}
              defaultOpen={post._id === targetPostId}
              highlighted={post._id === targetPostId}
              cardRef={post._id === targetPostId ? targetRef : null}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Feed;