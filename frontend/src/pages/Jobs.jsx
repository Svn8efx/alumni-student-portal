import { useEffect, useState } from 'react';
import { Briefcase, MapPin, Calendar, ExternalLink, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const JOB_TYPES = ['internship', 'full-time', 'part-time', 'freelance'];

const emptyForm = { title: '', company: '', type: 'internship', location: '', description: '', applyLink: '', deadline: '', skillsRequired: '' };

const Jobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [filterType, setFilterType] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState(new Set());

  const toggleExpanded = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const canPost = user.role === 'alumni' || user.role === 'admin';

  const load = async () => {
    setLoading(true);
    const params = filterType ? { type: filterType } : {};
    const { data } = await api.get('/jobs', { params });
    setJobs(data.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filterType]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      skillsRequired: form.skillsRequired.split(',').map((s) => s.trim()).filter(Boolean),
      deadline: form.deadline || undefined,
    };
    await api.post('/jobs', payload);
    setForm(emptyForm);
    setShowForm(false);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this posting?')) return;
    await api.delete(`/jobs/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl mb-1">Jobs & Internships</h1>
          <p className="text-ink-500 text-sm">Opportunities shared directly by alumni.</p>
        </div>
        {canPost && (
          <button onClick={() => setShowForm((s) => !s)} className="btn-primary">
            {showForm ? 'Cancel' : 'Post an opportunity'}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card p-5 grid sm:grid-cols-2 gap-3">
          <input required className="input" placeholder="Job title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input required className="input" placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input className="input" placeholder="Location (or Remote)" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <textarea required className="input sm:col-span-2 resize-none" rows={3} placeholder="Description & requirements" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input className="input" placeholder="Apply link (URL)" value={form.applyLink} onChange={(e) => setForm({ ...form, applyLink: e.target.value })} />
          <input type="date" className="input" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          <input className="input sm:col-span-2" placeholder="Skills required (comma-separated)" value={form.skillsRequired} onChange={(e) => setForm({ ...form, skillsRequired: e.target.value })} />
          <button type="submit" className="btn-primary sm:col-span-2">Publish posting</button>
        </form>
      )}

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterType('')} className={`px-3 py-1.5 rounded-full text-xs font-medium border capitalize ${!filterType ? 'bg-ink-800 text-white border-ink-800' : 'border-ink-200 text-ink-600'}`}>All</button>
        {JOB_TYPES.map((t) => (
          <button key={t} onClick={() => setFilterType(t)} className={`px-3 py-1.5 rounded-full text-xs font-medium border capitalize ${filterType === t ? 'bg-ink-800 text-white border-ink-800' : 'border-ink-200 text-ink-600'}`}>{t}</button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-ink-400">Loading postings…</p>
      ) : jobs.length === 0 ? (
        <p className="text-sm text-ink-400">No postings match this filter yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <div key={job._id} className="card p-5 flex flex-col">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-medium text-ink-800">{job.title}</p>
                  <p className="text-sm text-ink-600">{job.company}</p>
                </div>
                <span className="seal-tag bg-brass-100 text-brass-700 shrink-0 capitalize">{job.type}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-ink-400 mb-3">
                <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                {job.deadline && <span className="flex items-center gap-1"><Calendar size={12} /> {format(new Date(job.deadline), 'MMM d, yyyy')}</span>}
              </div>
              <p className={`text-sm text-ink-600 mb-1 ${expandedIds.has(job._id) ? '' : 'line-clamp-3'}`}>{job.description}</p>
              {job.description && job.description.length > 140 ? (
                <button
                  onClick={() => toggleExpanded(job._id)}
                  className="text-xs font-medium text-brass-600 hover:underline mb-2 text-left"
                >
                  {expandedIds.has(job._id) ? 'Show less' : 'Read more'}
                </button>
              ) : (
                <div className="mb-2" />
              )}
              {job.skillsRequired?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {job.skillsRequired.map((s) => <span key={s} className="text-[11px] bg-ink-50 text-ink-600 px-2 py-0.5 rounded-full">{s}</span>)}
                </div>
              )}
              <div className="mt-auto flex items-center justify-between">
                <p className="text-xs text-ink-400 flex items-center gap-1"><Briefcase size={12} /> {job.postedBy?.name}</p>
                <div className="flex gap-2">
                  {job.applyLink && (
                    <a href={job.applyLink} target="_blank" rel="noreferrer" className="btn-secondary text-xs px-3 py-1.5">
                      Apply <ExternalLink size={12} />
                    </a>
                  )}
                  {(job.postedBy?._id === user._id || user.role === 'admin') && (
                    <button onClick={() => handleDelete(job._id)} className="p-1.5 text-ink-400 hover:text-red-600"><Trash2 size={14} /></button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Jobs;