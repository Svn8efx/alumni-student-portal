/**
 * Reusable loading spinner — a brass ring that spins, with an optional label
 * sitting to the bottom-right of the circle.
 *
 * Props:
 *   label    — text shown next to the spinner (e.g. "Loading feed…")
 *   size     — 'sm' | 'md' | 'lg'
 *   center   — center it horizontally in its container with some vertical padding
 *   fullPage — fill the whole viewport and center (for the session loader)
 */
const SIZES = {
  sm: 'w-5 h-5 border-2',
  md: 'w-9 h-9 border-[3px]',
  lg: 'w-14 h-14 border-4',
};

const Spinner = ({ label = 'Loading…', size = 'md', center = false, fullPage = false }) => {
  const inner = (
    <div className="flex items-end gap-3">
      <div
        className={`${SIZES[size]} rounded-full border-ink-200 dark:border-ink-600 border-t-brass-500 animate-spin shrink-0`}
      />
      {label && <p className="text-sm text-ink-400 pb-0.5">{label}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-screen grid place-items-center bg-paper dark:bg-ink-900">
        {inner}
      </div>
    );
  }

  if (center) {
    return <div className="flex justify-center py-10">{inner}</div>;
  }

  return inner;
};

export default Spinner;