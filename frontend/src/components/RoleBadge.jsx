const ROLE_STYLES = {
  // "Platinum" — the cool-metal counterpart to the alumni gold seal.
  student: 'bg-slate-200 text-slate-600 dark:bg-slate-300/15 dark:text-slate-200 border border-slate-300/60 dark:border-slate-300/25',
  // "Gold" — translucent gold fill with bright brass text in dark mode.
  alumni: 'bg-brass-100 text-brass-700 border border-brass-400/50 dark:bg-brass-400/15 dark:text-brass-300 dark:border-brass-400/30',
  // Emerald — vivid green seal for admin, matching the weight of gold/platinum.
  admin: 'bg-emerald-500/15 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300 border border-emerald-400/30',
};

const ROLE_LABELS = {
  student: 'Student',
  alumni: 'Alumnus',
  admin: 'Admin',
};

// A small "wax seal" style tag used throughout the app to mark a user's role
// at a glance — the visual signature of the directory and feed.
const RoleBadge = ({ role, className = '' }) => (
  <span className={`seal-tag ${ROLE_STYLES[role] || ROLE_STYLES.student} ${className}`}>
    {ROLE_LABELS[role] || role}
  </span>
);

export default RoleBadge;