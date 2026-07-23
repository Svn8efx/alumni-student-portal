import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SoftAurora from '../components/SoftAurora';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-ink-900 flex items-center justify-center px-4">
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

      <div className="relative z-10 w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <GraduationCap size={32} className="text-white mb-2" />
          <h1 className="font-display text-2xl text-white">Welcome back</h1>
          <p className="text-sm text-ink-300">Sign in to The Ledger</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-sm p-6 bg-white/5 backdrop-blur-sm border border-white/10 space-y-4">
          {error && <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-sm px-3 py-2">{error}</p>}

          <div>
            <label className="label !text-ink-300" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              className="input !bg-white/5 !border-white/10 !text-paper placeholder:!text-ink-400"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@krmu.edu.in"
            />
          </div>

          <div>
            <label className="label !text-ink-300" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              className="input !bg-white/5 !border-white/10 !text-paper placeholder:!text-ink-400"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-brass w-full">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="text-center text-sm text-ink-300">
            New here? <Link to="/register" className="text-brass-400 font-medium hover:underline">Create an account</Link>
          </p>
        </form>

        <p className="text-center text-xs text-ink-400 mt-6">
          Designed & built by Vele Interns · K.R Mangalam University
        </p>
      </div>
    </div>
  );
};

export default Login;