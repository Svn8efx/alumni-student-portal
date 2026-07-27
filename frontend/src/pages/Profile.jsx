import { useState } from 'react';
import { Briefcase, GraduationCap, BookOpen, Eye, KeyRound } from 'lucide-react';
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
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwSaving, setPwSaving] = useState(false);

  // Parsed live from the comma-separated input, exactly like the save does —
  // so the preview pills always match what will actually be stored.
  const previewSkills = form.skills.split(',').map((s) => s.trim()).filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, skills: previewSkills };
    // Don't send empty numeric fields — '' fails Mongoose's Number cast
    if (payload.currentYear === '') delete payload.currentYear;
    if (payload.graduationYear === '') delete payload.graduationYear;
    const { data } = await api.put('/users/me', payload);
    setUser(data.data);
    localStorage.setItem('user', JSON.stringify(data.data));
    toast.success('Profile updated.');
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    setPwSaving(true);
    try {
      await api.put('/users/me/password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not change password');
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="space-y-6">
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

      <div className="flex flex-col-reverse lg:flex-row gap-6 items-start">
        {/* ------ Edit form ------ */}
        <form onSubmit={handleSubmit} className="card p-6 space-y-4 w-full lg:max-w-xl">
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

        {/* ------ Right column: live preview + password ------ */}
        <div className="w-full lg:w-[340px] shrink-0 lg:sticky lg:top-24 space-y-6">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-500 mb-2">
              <Eye size={13} /> Directory preview
            </p>
            <div className="card p-5 flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full bg-ink-50 grid place-items-center font-semibold text-ink-700 overflow-hidden shrink-0">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={form.name} className="w-full h-full object-cover" />
                  ) : (
                    (form.name || '?').charAt(0)
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-ink-800 truncate">{form.name || 'Your name'}</p>
                  <RoleBadge role={user.role} />
                </div>
              </div>

              {user.role === 'alumni' ? (
                <div className="text-sm text-ink-600 space-y-1 mb-3">
                  {form.designation && (
                    <p className="flex items-center gap-1.5"><Briefcase size={13} /> {form.designation} {form.company && `at ${form.company}`}</p>
                  )}
                  {form.graduationYear && (
                    <p className="flex items-center gap-1.5"><GraduationCap size={13} /> Class of {form.graduationYear}</p>
                  )}
                </div>
              ) : (
                <div className="text-sm text-ink-600 space-y-1 mb-3">
                  {form.branch && <p className="flex items-center gap-1.5"><BookOpen size={13} /> {form.branch}</p>}
                  {form.currentYear && <p className="flex items-center gap-1.5"><GraduationCap size={13} /> Year {form.currentYear}</p>}
                </div>
              )}

              {form.bio && <p className="text-xs text-ink-500 line-clamp-2 mb-4">{form.bio}</p>}

              {previewSkills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {previewSkills.slice(0, 4).map((s) => (
                    <span key={s} className="text-[11px] bg-ink-50 text-ink-600 px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                  {previewSkills.length > 4 && (
                    <span className="text-[11px] bg-brass-400/10 text-brass-600 dark:text-brass-300 px-2 py-0.5 rounded-full font-medium">
                      +{previewSkills.length - 4} more
                    </span>
                  )}
                </div>
              )}

              <p className="mt-auto text-[11px] text-ink-400 italic border-t border-ink-100 pt-3">
                This is how you appear in the Directory.
              </p>
            </div>
          </div>

          <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-500 mb-2">
              <KeyRound size={13} /> Change password
            </p>
            <form onSubmit={handlePasswordChange} className="card p-5 space-y-3">
              <div>
                <label className="label">Current password</label>
                <input
                  type="password"
                  className="input"
                  value={pwForm.currentPassword}
                  onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                  autoComplete="current-password"
                />
              </div>
              <div>
                <label className="label">New password</label>
                <input
                  type="password"
                  className="input"
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                />
              </div>
              <div>
                <label className="label">Confirm new password</label>
                <input
                  type="password"
                  className="input"
                  value={pwForm.confirmPassword}
                  onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                  autoComplete="new-password"
                />
              </div>
              <button
                type="submit"
                disabled={pwSaving || !pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword}
                className="btn-secondary w-full"
              >
                {pwSaving ? 'Updating…' : 'Update password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;