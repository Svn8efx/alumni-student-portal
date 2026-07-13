import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [form, setForm] = useState({
    name: '', email: '', password: '', branch: '',
    currentYear: '', graduationYear: '', company: '', designation: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({ ...form, role });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper dark:bg-ink-900 grid place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <GraduationCap size={32} className="text-ink-800 mb-2" />
          <h1 className="font-display text-2xl text-ink-900">Join the register</h1>
          <p className="text-sm text-ink-500">Create your student or alumni account</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-sm px-3 py-2">{error}</p>}

          <div className="grid grid-cols-2 gap-2">
            {['student', 'alumni'].map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => setRole(r)}
                className={`py-2.5 rounded-sm text-sm font-medium border transition-colors capitalize ${
                  role === r ? 'bg-ink-800 text-white border-ink-800' : 'border-ink-200 text-ink-600 hover:bg-ink-50'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div>
            <label className="label">Full name</label>
            <input required className="input" value={form.name} onChange={handleChange('name')} placeholder="Jane Doe" />
          </div>

          <div>
            <label className="label">Email</label>
            <input required type="email" className="input" value={form.email} onChange={handleChange('email')} placeholder="you@krmu.edu.in" />
          </div>

          <div>
            <label className="label">Password</label>
            <input required minLength={6} type="password" className="input" value={form.password} onChange={handleChange('password')} placeholder="At least 6 characters" />
          </div>

          <div>
            <label className="label">Branch / Department</label>
            <input className="input" value={form.branch} onChange={handleChange('branch')} placeholder="Computer Science and Engineering" />
          </div>

          {role === 'student' ? (
            <div>
              <label className="label">Current year</label>
              <select className="input" value={form.currentYear} onChange={handleChange('currentYear')}>
                <option value="">Select year</option>
                {[1, 2, 3, 4].map((y) => (
                  <option key={y} value={y}>Year {y}</option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Graduation year</label>
                  <input type="number" className="input" value={form.graduationYear} onChange={handleChange('graduationYear')} placeholder="2023" />
                </div>
                <div>
                  <label className="label">Current company</label>
                  <input className="input" value={form.company} onChange={handleChange('company')} placeholder="Company name" />
                </div>
              </div>
              <div>
                <label className="label">Designation</label>
                <input className="input" value={form.designation} onChange={handleChange('designation')} placeholder="Software Engineer" />
              </div>
            </>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating account…' : 'Create account'}
          </button>

          <p className="text-center text-sm text-ink-500">
            Already have an account? <Link to="/login" className="text-brass-600 font-medium hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
