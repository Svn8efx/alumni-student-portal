import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-screen bg-paper dark:bg-ink-900 grid place-items-center px-4 text-center">
    <div>
      <p className="font-display text-6xl text-ink-900 mb-2">404</p>
      <p className="text-ink-500 mb-6">This page isn't in the register.</p>
      <Link to="/" className="btn-primary">Return home</Link>
    </div>
  </div>
);

export default NotFound;
