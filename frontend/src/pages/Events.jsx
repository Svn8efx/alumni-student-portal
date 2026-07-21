import { useEffect, useState } from 'react';
import { CalendarDays, MapPin, Users, Trash2, UserCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';

const emptyForm = { title: '', description: '', date: '', mode: 'online', location: '', capacity: 0 };

const Events = () => {
  const { user } = useAuth();
  const toast = useToast();
  const confirmDialog = useConfirm();
  const [events, setEvents] = useState([]);
  const [when, setWhen] = useState('upcoming');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState(new Set());

  const toggleExpanded = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const canHost = user.role === 'alumni' || user.role === 'admin';

  const load = async () => {
    setLoading(true);
    const { data } = await api.get('/events', { params: { when } });
    setEvents(data.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [when]);

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.post('/events', { ...form, capacity: Number(form.capacity) || 0 });
    setForm(emptyForm);
    setShowForm(false);
    load();
    toast.success('Event published.');
  };

  const handleRegister = async (eventId) => {
    const { data } = await api.patch(`/events/${eventId}/register`);
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev._id !== eventId) return ev;
        const registrations = data.data.registered
          ? [...ev.registrations, user._id]
          : ev.registrations.filter((id) => id !== user._id);
        return { ...ev, registrations };
      })
    );
    toast.success(data.data.registered ? 'Registered for event.' : 'Registration cancelled.');
  };

  const handleDelete = async (id) => {
    const ok = await confirmDialog('This event will be permanently removed.', {
      title: 'Cancel this event?',
      confirmLabel: 'Cancel Event',
    });
    if (!ok) return;
    await api.delete(`/events/${id}`);
    load();
    toast.success('Event cancelled.');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl mb-1">Events & Webinars</h1>
          <p className="text-ink-500 text-sm">Alumni-hosted sessions and institutional events.</p>
        </div>
        {canHost && (
          <button onClick={() => setShowForm((s) => !s)} className="btn-primary">
            {showForm ? 'Cancel' : 'Host an event'}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card p-5 grid sm:grid-cols-2 gap-3">
          <input required className="input sm:col-span-2" placeholder="Event title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea required className="input sm:col-span-2 resize-none" rows={3} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input required type="datetime-local" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <select className="input" value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="hybrid">Hybrid</option>
          </select>
          <input className="input" placeholder="Venue or meeting link" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <input type="number" className="input" placeholder="Capacity (0 = unlimited)" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
          <button type="submit" className="btn-primary sm:col-span-2">Publish event</button>
        </form>
      )}

      <div className="flex gap-2">
        {['upcoming', 'past'].map((w) => (
          <button key={w} onClick={() => setWhen(w)} className={`px-3 py-1.5 rounded-full text-xs font-medium border capitalize ${when === w ? 'bg-ink-800 text-white border-ink-800' : 'border-ink-200 text-ink-600'}`}>{w}</button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-ink-400">Loading events…</p>
      ) : events.length === 0 ? (
        <p className="text-sm text-ink-400">No {when} events.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {events.map((ev) => {
            const registered = ev.registrations.includes(user._id);
            const full = ev.capacity > 0 && ev.registrations.length >= ev.capacity && !registered;
            return (
              <div key={ev._id} className="card p-5 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="font-medium text-ink-800">{ev.title}</p>
                  <span className="seal-tag bg-ink-50 text-ink-600 capitalize shrink-0">{ev.mode}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-ink-400 mb-1">
                  <span className="flex items-center gap-1"><CalendarDays size={12} /> {format(new Date(ev.date), 'MMM d, yyyy · p')}</span>
                  {ev.location && <span className="flex items-center gap-1"><MapPin size={12} /> {ev.location}</span>}
                </div>
                <p className="text-xs text-ink-500 flex items-center gap-1 mb-3">
                  <UserCircle2 size={13} /> Hosted by <span className="font-medium text-ink-700">{ev.hostedBy?.name || 'Unknown'}</span>
                  {ev.hostedBy?.company && <span className="text-ink-400">· {ev.hostedBy.company}</span>}
                </p>
                <p className={`text-sm text-ink-600 mb-1 ${expandedIds.has(ev._id) ? '' : 'line-clamp-3'}`}>{ev.description}</p>
                {ev.description && ev.description.length > 140 && (
                  <button
                    onClick={() => toggleExpanded(ev._id)}
                    className="text-xs font-medium text-brass-600 hover:underline mb-3 text-left"
                  >
                    {expandedIds.has(ev._id) ? 'Show less' : 'Read more'}
                  </button>
                )}
                {!(ev.description && ev.description.length > 140) && <div className="mb-3" />}
                <div className="mt-auto flex items-center justify-between">
                  <p className="text-xs text-ink-400 flex items-center gap-1">
                    <Users size={12} /> {ev.registrations.length}{ev.capacity > 0 ? ` / ${ev.capacity}` : ''} registered
                  </p>
                  <div className="flex gap-2">
                    {when === 'upcoming' && (
                      <button onClick={() => handleRegister(ev._id)} disabled={full} className={registered ? 'btn-secondary text-xs px-3 py-1.5' : 'btn-primary text-xs px-3 py-1.5'}>
                        {registered ? 'Registered ✓' : full ? 'Full' : 'Register'}
                      </button>
                    )}
                    {(ev.hostedBy?._id === user._id || user.role === 'admin') && (
                      <button onClick={() => handleDelete(ev._id)} className="p-1.5 text-ink-400 hover:text-red-600"><Trash2 size={14} /></button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Events;