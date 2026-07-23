import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Handshake, Briefcase, MessagesSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SoftAurora from '../components/SoftAurora';

const PERKS = [
  { icon: Handshake, text: 'Send structured mentorship requests to verified alumni' },
  { icon: Briefcase, text: 'Get first access to jobs & internships posted by your own alumni' },
  { icon: MessagesSquare, text: 'Ask real questions in a searchable, moderated forum' },
];

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
    <div className="min-h-screen relative overflow-hidden bg-ink-900">
      <div className="absolute inset-0">
        <SoftAurora
          speed={0.4}
          scale={1.8}
          brightness={0.6}
          color1="#cda23f"
          color2="#5b719f"
          noiseFrequency={2.0}
          bandHeight={0.4}
          bandSpread={1.2}
          enableMouseInteraction={true}
          mouseInfluence={0.15}
        />
      </div>

      <Link to="/" className="relative z-10 flex items-center gap-2 px-6 py-6 w-fit">
        <GraduationCap size={24} className="text-white" />
        <span className="font-display text-lg text-white">The Ledger</span>
      </Link>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-6 grid md:grid-cols-2 gap-12 items-center">
        <div className="order-2 md:order-none">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-400 mb-4">
            Join the register
          </p>
          <h1 className="text-4xl md:text-5xl leading-tight text-white mb-6">
            Your entry starts <span className="text-brass-400">here.</span>
          </h1>
          <p className="text-ink-200 text-base leading-relaxed mb-8 max-w-md">
            Whether you're a student looking for guidance or an alumnus ready to give back,
            this is the structured space a group chat could never be.
          </p>
          <div className="space-y-4 max-w-md">
            {PERKS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 grid place-items-center shrink-0">
                  <Icon size={15} className="text-brass-400" />
                </div>
                <p className="text-sm text-ink-200 leading-relaxed pt-1">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full max-w-md mx-auto md:mx-0 md:ml-auto">
          <form onSubmit={handleSubmit} className="rounded-sm p-6 bg-white/5 backdrop-blur-sm border border-white/10 space-y-4">
            {error && <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-sm px-3 py-2">{error}</p>}

            <div className="grid grid-cols-2 gap-2">
              {['student', 'alumni'].map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRole(r)}
                  className={`py-2.5 rounded-sm text-sm font-medium border transition-colors capitalize ${
                    role === r ? 'bg-brass-500 text-ink-900 border-brass-500' : 'border-white/20 text-ink-200 hover:bg-white/5'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <div>
              <label className="label !text-ink-300">Full name</label>
              <input required className="input !bg-white/5 !border-white/10 !text-paper placeholder:!text-ink-400" value={form.name} onChange={handleChange('name')} placeholder="Jane Doe" />
            </div>

            <div>
              <label className="label !text-ink-300">Email</label>
              <input required type="email" className="input !bg-white/5 !border-white/10 !text-paper placeholder:!text-ink-400" value={form.email} onChange={handleChange('email')} placeholder="you@krmu.edu.in" />
            </div>

            <div>
              <label className="label !text-ink-300">Password</label>
              <input required minLength={6} type="password" className="input !bg-white/5 !border-white/10 !text-paper placeholder:!text-ink-400" value={form.password} onChange={handleChange('password')} placeholder="At least 6 characters" />
            </div>

            <div>
              <label className="label !text-ink-300">Branch / Department</label>
              <input className="input !bg-white/5 !border-white/10 !text-paper placeholder:!text-ink-400" value={form.branch} onChange={handleChange('branch')} placeholder="Computer Science and Engineering" />
            </div>

            {role === 'student' ? (
              <div>
                <label className="label !text-ink-300">Current year</label>
                <select className="input !bg-white/5 !border-white/10 !text-paper" value={form.currentYear} onChange={handleChange('currentYear')}>
                  <option value="" className="text-ink-900">Select year</option>
                  {[1, 2, 3, 4].map((y) => (
                    <option key={y} value={y} className="text-ink-900">Year {y}</option>
                  ))}
                </select>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label !text-ink-300">Graduation year</label>
                    <input type="number" className="input !bg-white/5 !border-white/10 !text-paper placeholder:!text-ink-400" value={form.graduationYear} onChange={handleChange('graduationYear')} placeholder="2023" />
                  </div>
                  <div>
                    <label className="label !text-ink-300">Current company</label>
                    <input className="input !bg-white/5 !border-white/10 !text-paper placeholder:!text-ink-400" value={form.company} onChange={handleChange('company')} placeholder="Company name" />
                  </div>
                </div>
                <div>
                  <label className="label !text-ink-300">Designation</label>
                  <input className="input !bg-white/5 !border-white/10 !text-paper placeholder:!text-ink-400" value={form.designation} onChange={handleChange('designation')} placeholder="Software Engineer" />
                </div>
              </>
            )}

            <button type="submit" disabled={loading} className="btn-brass w-full">
              {loading ? 'Creating account…' : 'Create account'}
            </button>

            <p className="text-center text-sm text-ink-300">
              Already have an account? <Link to="/login" className="text-brass-400 font-medium hover:underline">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;