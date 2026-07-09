const ROLE_STYLES = {
  student: 'bg-ink-50 text-ink-600',
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
