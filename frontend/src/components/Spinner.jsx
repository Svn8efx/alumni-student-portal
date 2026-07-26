/**
 * Loading spinner — SVG-based so the brass arc can't be overridden by the
 * global dark-mode CSS rules (which stomp on border-color utility classes).
 *
 * Props:
 *   label    — text shown under the spinner (e.g. "Loading feed…")
 *   size     — 'sm' | 'md' | 'lg'
 *   center   — center it horizontally in its container with vertical padding
 *   fullPage — fill the whole viewport and center (for the session loader)
 */
const SIZES = { sm: 22, md: 40, lg: 64 };

const Spinner = ({ label = 'Loading…', size = 'md', center = false, fullPage = false }) => {
  const px = SIZES[size] || SIZES.md;

  const inner = (
    <div className="flex flex-col items-center gap-3">
      <svg
        className="animate-spin"
        width={px}
        height={px}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* faint full ring (track) */}
        <circle cx="12" cy="12" r="10" stroke="#8b93a7" strokeOpacity="0.25" strokeWidth="2.5" />
        {/* brass arc — hardcoded hex so no CSS override can repaint it */}
        <path
          d="M12 2 A10 10 0 0 1 22 12"
          stroke="#cda23f"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      {label && <p className="text-sm text-ink-400">{label}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-screen w-full grid place-items-center bg-paper dark:bg-ink-900">
        {inner}
      </div>
    );
  }

  if (center) {
    return <div className="w-full flex justify-center py-12">{inner}</div>;
  }

  return inner;
};

export default Spinner;