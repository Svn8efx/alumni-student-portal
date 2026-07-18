import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const NotificationBell = () => {
  const { socket } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    const { data } = await api.get('/notifications');
    setNotifications(data.data);
    setUnreadCount(data.unreadCount);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((c) => c + 1);
    };
    socket.on('notification', handler);
    return () => socket.off('notification', handler);
  }, [socket]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleOpen = async () => {
    setOpen((o) => !o);
  };

  const handleClickNotification = async (n) => {
    if (!n.isRead) {
      await api.patch(`/notifications/${n._id}/read`);
      setUnreadCount((c) => Math.max(0, c - 1));
      setNotifications((prev) => prev.map((x) => (x._id === n._id ? { ...x, isRead: true } : x)));
    }
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  const markAllRead = async () => {
    await api.patch('/notifications/read-all');
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        aria-label="Notifications"
        className="relative p-2 rounded-full hover:bg-ink-50 dark:hover:bg-ink-700 transition-colors"
      >
        <Bell size={20} className="text-ink-600" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-brass-500 text-[10px] font-bold text-ink-900 grid place-items-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto card z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-ink-100 dark:border-ink-700">
            <h3 className="text-sm font-semibold text-ink-800">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-brass-600 hover:underline">
                Mark all read
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="px-4 py-6 text-sm text-ink-400 text-center">You're all caught up.</p>
          ) : (
            <ul>
              {notifications.map((n) => (
                <li key={n._id}>
                  <button
                    onClick={() => handleClickNotification(n)}
                    className={`w-full text-left px-4 py-3 text-sm border-b border-ink-50 dark:border-ink-700 hover:bg-ink-50 dark:hover:bg-ink-700 transition-colors ${
                      !n.isRead ? 'bg-brass-50/60 dark:bg-brass-500/10' : ''
                    }`}
                  >
                    <p className="text-ink-700">{n.message}</p>
                    <p className="text-xs text-ink-400 mt-0.5">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;