import { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import RoleBadge from '../components/RoleBadge';

const Profile = () => {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    name: user.name || '',
    bio: user.bio || '',
    branch: user.branch || '',
    linkedinUrl: user.linkedinUrl || '',
    company: user.company || '',
    designation: user.designation || '',
    graduationYear: user.graduationYear || '',
    currentYear: user.currentYear || '',
    skills: (user.skills || []).join(', '),
    isMentorAvailable: user.isMentorAvailable || false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean) };
    const { data } = await api.put('/users/me', payload);
    setUser(data.data);
    localStorage.setItem('user', JSON.stringify(data.data));
    toast.success('Profile updated.');
  };

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-full bg-ink-50 grid place-items-center font-display text-2xl text-ink-700">
          {user.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-2xl">{user.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <RoleBadge role={user.role} />
            <span className="text-sm text-ink-400">{user.email}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label className="label">Full name</label>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>

        <div>
          <label className="label">Bio</label>
          <textarea className="input resize-none" rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tell your network a little about yourself…" />
        </div>

        <div>
          <label className="label">Branch / Department</label>
          <input className="input" value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} />
        </div>

        <div>
          <label className="label">LinkedIn URL</label>
          <input className="input" value={form.linkedinUrl} onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })} placeholder="https://linkedin.com/in/…" />
        </div>

        <div>
          <label className="label">Skills (comma-separated)</label>
          <input className="input" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="React, Node.js, Public Speaking" />
        </div>

        {user.role === 'alumni' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Company</label>
                <input className="input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
              </div>
              <div>
                <label className="label">Designation</label>
                <input className="input" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Graduation year</label>
              <input type="number" className="input" value={form.graduationYear} onChange={(e) => setForm({ ...form, graduationYear: e.target.value })} />
            </div>
            <label className="flex items-center gap-2 text-sm text-ink-700">
              <input type="checkbox" checked={form.isMentorAvailable} onChange={(e) => setForm({ ...form, isMentorAvailable: e.target.checked })} />
              Available for mentorship
            </label>
          </>
        )}

        {user.role === 'student' && (
          <div>
            <label className="label">Current year</label>
            <select className="input" value={form.currentYear} onChange={(e) => setForm({ ...form, currentYear: e.target.value })}>
              <option value="">Select year</option>
              {[1, 2, 3, 4].map((y) => <option key={y} value={y}>Year {y}</option>)}
            </select>
          </div>
        )}

        <button type="submit" className="btn-primary">Save changes</button>
      </form>
    </div>
  );
};

export default Profile;