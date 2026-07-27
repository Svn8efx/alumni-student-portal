import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Rss, MessageSquare, MessagesSquare,
  Briefcase, CalendarDays, Handshake, LogOut, GraduationCap, ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from '../components/NotificationBell';
import RoleBadge from '../components/RoleBadge';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/directory', label: 'Directory', icon: Users },
  { to: '/feed', label: 'Knowledge Feed', icon: Rss },
  { to: '/forum', label: 'Forum', icon: MessagesSquare },
  { to: '/connections', label: 'Connections', icon: Handshake },
  { to: '/messages', label: 'Messages', icon: MessageSquare },
  { to: '/jobs', label: 'Jobs & Internships', icon: Briefcase },
  { to: '/events', label: 'Events', icon: CalendarDays },
];

// Sidebar nav items: brighten on hover, plus a small brass bar on the left
// edge (rendered via a ::before pseudo-element) that grows in on hover and
// stays fully lit on the active page — a stronger "you are here" marker.
const navItemClass = ({ isActive }) =>
  `relative flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-150
   before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px]
   before:rounded-full before:bg-brass-400 before:transition-all before:duration-200 ${
    isActive
      ? 'bg-white/10 text-white font-medium before:h-6 before:opacity-100'
      : 'text-ink-200 hover:bg-white/10 hover:text-white active:bg-white/15 before:h-2 before:opacity-0 hover:before:h-6 hover:before:opacity-100'
  }`;

const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-paper dark:bg-ink-900 flex">
      <aside className="hidden md:flex md:flex-col w-64 shrink-0 bg-ink-900 text-paper/90 md:sticky md:top-0 md:h-screen">
        <Link
          to="/dashboard"
          className="h-16 shrink-0 px-5 border-b border-white/10 flex items-center gap-2.5 hover:bg-white/5 transition-colors"
        >
          <GraduationCap size={24} className="text-brass-400 shrink-0" />
          <div className="min-w-0">
            <p className="font-display text-lg leading-tight text-white">The Ledger</p>
            <p className="text-[10px] uppercase tracking-[0.16em] text-ink-300 whitespace-nowrap">
              Alumni · Student Portal
            </p>
          </div>
        </Link>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={navItemClass}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={navItemClass}>
              <ShieldCheck size={18} />
              Admin Console
            </NavLink>
          )}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Ambient glow layer — four blurred color blobs, fixed to the viewport,
            drifting and breathing very slowly. Animated with transform/opacity
            only, so they're GPU-composited and cost nothing while scrolling.
            Statically positioned exactly where the old radial-gradient washes
            sat; the animations in index.css move them gently around "home". */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div
            className="glow-blob animate-glow-drift-1"
            style={{
              top: '-12%', left: '-6%', width: '44vw', height: '44vw',
              background: 'radial-gradient(circle, rgba(205,162,63,0.20), transparent 65%)',
            }}
          />
          <div
            className="glow-blob animate-glow-drift-2"
            style={{
              top: '-8%', right: '-8%', width: '46vw', height: '46vw',
              background: 'radial-gradient(circle, rgba(91,113,159,0.18), transparent 65%)',
            }}
          />
          <div
            className="glow-blob animate-glow-breathe-1"
            style={{
              bottom: '-14%', left: '10%', width: '40vw', height: '40vw',
              background: 'radial-gradient(circle, rgba(91,113,159,0.13), transparent 65%)',
            }}
          />
          <div
            className="glow-blob animate-glow-breathe-2"
            style={{
              bottom: '-12%', right: '8%', width: '42vw', height: '42vw',
              background: 'radial-gradient(circle, rgba(205,162,63,0.13), transparent 65%)',
            }}
          />
        </div>

        <header className="h-16 shrink-0 bg-white dark:bg-ink-900 border-b border-ink-100 dark:border-white/10 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
          <Link
            to="/dashboard"
            className="md:hidden font-display text-lg text-ink-900 dark:text-paper flex items-center gap-1.5"
          >
            <GraduationCap size={20} className="text-brass-500" /> The Ledger
          </Link>
          <div className="hidden md:block" />
          <div className="flex items-center gap-3 sm:gap-4">
            <NotificationBell />
            <button onClick={() => navigate('/profile')} className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-full bg-ink-100 dark:bg-ink-700 grid place-items-center text-ink-600 dark:text-ink-200 font-semibold overflow-hidden">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0)
                )}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-ink-800 dark:text-paper group-hover:underline">{user?.name}</p>
                <RoleBadge role={user?.role} />
              </div>
            </button>
            <button
              onClick={handleLogout}
              aria-label="Sign out"
              title="Sign out"
              className="p-2 rounded-full hover:bg-ink-50 dark:hover:bg-ink-700 transition-colors text-ink-500 dark:text-ink-300"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-ink-900 flex justify-around py-2 z-40">
          {NAV_ITEMS.slice(0, 5).map(({ to, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `p-2 rounded-full ${isActive ? 'text-brass-400' : 'text-ink-300'}`}>
              <Icon size={20} />
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8 max-w-6xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;