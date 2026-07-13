import { NavLink, useNavigate } from 'react-router-dom';
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
      <aside className="hidden md:flex md:flex-col w-64 shrink-0 bg-ink-900 text-paper/90">
        <div className="px-6 py-6 border-b border-white/10 flex items-center gap-2">
          <GraduationCap size={26} className="text-brass-400" />
          <div>
            <p className="font-display text-lg leading-tight text-white">The Ledger</p>
            <p className="text-[11px] uppercase tracking-widest text-ink-300">Alumni · Student Portal</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-colors ${
                  isActive ? 'bg-white/10 text-white font-medium' : 'text-ink-200 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-colors ${
                  isActive ? 'bg-white/10 text-white font-medium' : 'text-ink-200 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <ShieldCheck size={18} />
              Admin Console
            </NavLink>
          )}
        </nav>

        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          <button
            onClick={toggle}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-sm text-sm text-ink-200 hover:bg-white/5 hover:text-white transition-colors"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            {isDark ? 'Light mode' : 'Dark mode'}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-sm text-sm text-ink-200 hover:bg-white/5 hover:text-white transition-colors"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 shrink-0 bg-white dark:bg-ink-800 border-b border-ink-100 dark:border-ink-700 flex items-center justify-between px-4 md:px-8">
          <p className="md:hidden font-display text-lg text-ink-900 dark:text-paper flex items-center gap-1.5">
            <GraduationCap size={20} className="text-brass-500" /> The Ledger
          </p>
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
              className="md:hidden p-2 rounded-full hover:bg-ink-50 dark:hover:bg-ink-700 transition-colors text-ink-500 dark:text-ink-300"
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