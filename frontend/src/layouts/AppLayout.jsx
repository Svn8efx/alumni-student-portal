import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Rss, MessageSquare, MessagesSquare,
  Briefcase, CalendarDays, Handshake, LogOut, GraduationCap, ShieldCheck, Sun, Moon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../hooks/useDarkMode';
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

// Shared classes for sidebar nav items: inactive items brighten and lift a
// shade on hover (reads as "bolder" without the width-shift of real bold),
// with a slightly stronger tint while being clicked.
const navItemClass = ({ isActive }) =>
  `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-150 ${
    isActive
      ? 'bg-white/10 text-white font-medium'
      : 'text-ink-200 hover:bg-white/10 hover:text-white active:bg-white/15'
  }`;

const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { isDark, toggle } = useDarkMode();
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
        {/* Fixed to the viewport (not the page), so it always covers whatever's
            visible no matter how long the page is or how far you've scrolled —
            renders behind header/main naturally since it's the first child here,
            and header/sidebar keep their own solid backgrounds painted on top. */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(circle at 12% 8%, rgba(205,162,63,0.16), transparent 38%),
              radial-gradient(circle at 90% 15%, rgba(91,113,159,0.14), transparent 42%),
              radial-gradient(circle at 25% 85%, rgba(91,113,159,0.10), transparent 45%),
              radial-gradient(circle at 75% 90%, rgba(205,162,63,0.10), transparent 42%)
            `,
          }}
        />
        <header className="h-16 shrink-0 bg-white dark:bg-ink-800 border-b border-ink-100 dark:border-ink-700 flex items-center justify-between px-4 md:px-8">
          <Link
            to="/dashboard"
            className="md:hidden font-display text-lg text-ink-900 dark:text-paper flex items-center gap-1.5"
          >
            <GraduationCap size={20} className="text-brass-500" /> The Ledger
          </Link>
          <div className="hidden md:block" />
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={toggle}
              aria-label="Toggle dark mode"
              className="p-2 rounded-full hover:bg-ink-50 dark:hover:bg-ink-700 transition-colors text-ink-500 dark:text-ink-300"
            >
              {isDark ? <Sun size={19} /> : <Moon size={19} />}
            </button>
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