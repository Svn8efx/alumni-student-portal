import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Briefcase, CalendarDays, Handshake, ArrowRight } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import RoleBadge from '../components/RoleBadge';

const StatCard = ({ icon: Icon, label, value, to }) => (
  <Link to={to} className="card p-5 flex items-center gap-4 hover:border-brass-300 transition-colors">
    <div className="w-11 h-11 rounded-full bg-ink-50 grid place-items-center">
      <Icon size={20} className="text-ink-700" />
    </div>
    <div>
      <p className="text-2xl font-display text-ink-900">{value}</p>
      <p className="text-xs uppercase tracking-wide text-ink-500">{label}</p>
    </div>
  </Link>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ connections: 0, jobs: 0, events: 0, pending: 0 });
  const [recentPosts, setRecentPosts] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [connectionsRes, jobsRes, eventsRes, feedRes] = await Promise.all([
        api.get('/connections?status=accepted'),
        api.get('/jobs?limit=1'),
        api.get('/events?when=upcoming&limit=1'),
        api.get('/posts?limit=3'),
      ]);
      const pendingRes = await api.get('/connections?status=pending');
      setStats({
        connections: connectionsRes.data.data.length,
        jobs: jobsRes.data.pagination.total,
        events: eventsRes.data.pagination.total,
        pending: pendingRes.data.data.filter((c) => c.receiver._id === user._id).length,
      });
      setRecentPosts(feedRes.data.data);
    };
    load();
  }, [user._id]);

  const roleGreeting = {
    student: 'Here\'s what\'s happening in your network today.',
    alumni: 'Thank you for giving back to the institution — here\'s your activity.',
    admin: 'Platform overview and moderation queue.',
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl">Welcome, {user.name.split(' ')[0]}</h1>
          <RoleBadge role={user.role} />
        </div>
        <p className="text-ink-500 text-sm">{roleGreeting[user.role]}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Handshake} label="Connections" value={stats.connections} to="/connections" />
        <StatCard icon={Users} label="Pending Requests" value={stats.pending} to="/connections" />
        <StatCard icon={Briefcase} label="Open Postings" value={stats.jobs} to="/jobs" />
        <StatCard icon={CalendarDays} label="Upcoming Events" value={stats.events} to="/events" />
      </div>

      {user.role === 'student' && (
        <div className="card p-6 bg-ink-900 text-paper flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="font-display text-xl mb-1">Looking for a mentor?</h2>
            <p className="text-ink-300 text-sm">Browse verified alumni open to mentorship and send a connection request.</p>
          </div>
          <Link to="/directory?role=alumni" className="btn-brass shrink-0">
            Browse mentors <ArrowRight size={16} />
          </Link>
        </div>
      )}

      {user.role === 'alumni' && (
        <div className="card p-6 bg-ink-900 text-paper flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="font-display text-xl mb-1">Have an opening at your company?</h2>
            <p className="text-ink-300 text-sm">Post it directly to students of your own institution.</p>
          </div>
          <Link to="/jobs" className="btn-brass shrink-0">
            Post an opportunity <ArrowRight size={16} />
          </Link>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-display text-ink-900">Recent from the Knowledge Feed</h2>
          <Link to="/feed" className="text-sm text-brass-600 hover:underline">View all</Link>
        </div>
        <div className="space-y-3">
          {recentPosts.length === 0 && <p className="text-sm text-ink-400">No posts yet — be the first to share something.</p>}
          {recentPosts.map((post) => (
            <div key={post._id} className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-sm font-medium text-ink-800">{post.author.name}</p>
                <RoleBadge role={post.author.role} />
              </div>
              <p className="text-sm text-ink-600 line-clamp-2">{post.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
