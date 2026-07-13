import { Link } from 'react-router-dom';
import { GraduationCap, Handshake, Briefcase, MessagesSquare, ArrowRight } from 'lucide-react';

const FEATURES = [
  { icon: Handshake, title: 'Mentorship & Connections', desc: 'Send structured connection requests to alumni for career guidance — no more cold emails or lost social-media threads.' },
  { icon: Briefcase, title: 'Jobs & Internships', desc: 'Alumni post real openings at their companies, directly to students of their own institution.' },
  { icon: MessagesSquare, title: 'Feed & Forum', desc: 'Alumni share career journeys; students ask placement and academic questions in a searchable, moderated space.' },
];

// Public marketing page — the "cover" of the ledger before a visitor signs the register.
const Landing = () => {
  return (
    <div className="min-h-screen bg-paper dark:bg-ink-900">
      <header className="max-w-6xl mx-auto flex items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <GraduationCap size={26} className="text-ink-800" />
          <span className="font-display text-xl text-ink-900">The Ledger</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-secondary">Sign in</Link>
          <Link to="/register" className="btn-primary">Join the register</Link>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-12 pb-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-600 mb-4">
            K.R Mangalam University · Alumni Network
          </p>
          <h1 className="text-4xl md:text-5xl leading-tight text-ink-900 mb-6">
            Every graduate who came before you, <span className="text-brass-500">on the record.</span>
          </h1>
          <p className="text-ink-600 text-base leading-relaxed mb-8 max-w-lg">
            An institution-sanctioned register connecting current students with verified alumni —
            for mentorship, referrals, and the kind of guidance a group chat can't structure.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/register" className="btn-primary">
              Create your account <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="text-sm font-medium text-ink-600 hover:text-ink-900">
              Already registered? Sign in
            </Link>
          </div>
        </div>

        <div className="card p-8 bg-ink-900 text-paper">
          <p className="font-mono text-xs text-ink-300 mb-4">ENTRY №0142</p>
          <p className="font-display text-2xl mb-2">"I found my mentor here in week one."</p>
          <p className="text-ink-300 text-sm mb-6">— a third-year student, matched with a 2022 alumnus in Software Engineering</p>
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 text-center">
            <div>
              <p className="font-display text-2xl text-brass-400">1,200+</p>
              <p className="text-[11px] uppercase tracking-wide text-ink-300">Alumni</p>
            </div>
            <div>
              <p className="font-display text-2xl text-brass-400">300+</p>
              <p className="text-[11px] uppercase tracking-wide text-ink-300">Mentorships</p>
            </div>
            <div>
              <p className="font-display text-2xl text-brass-400">80+</p>
              <p className="text-[11px] uppercase tracking-wide text-ink-300">Jobs Posted</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-6">
              <Icon size={22} className="text-brass-500 mb-4" />
              <h3 className="font-display text-lg text-ink-900 mb-2">{title}</h3>
              <p className="text-sm text-ink-600 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-ink-100 py-6 text-center text-xs text-ink-400">
        Department of Computer Science and Engineering · K.R Mangalam University, Gurugram
      </footer>
    </div>
  );
};

export default Landing;
