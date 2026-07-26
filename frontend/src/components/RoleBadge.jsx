const ROLE_STYLES = {
  // "Platinum" — the cool-metal counterpart to the alumni brass seal.
  student: 'bg-slate-200 text-slate-600 dark:bg-slate-300/15 dark:text-slate-200 border border-slate-300/60 dark:border-slate-300/25',
  alumni: 'bg-brass-100 text-brass-700',
  admin: 'bg-moss-500/10 text-moss-600',
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