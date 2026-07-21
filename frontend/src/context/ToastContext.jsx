import { createContext, useContext, useCallback, useState } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = { success: CheckCircle2, error: XCircle, info: Info };
const ACCENTS = {
  success: 'border-moss-500 text-moss-600',
  error: 'border-red-500 text-red-600',
  info: 'border-brass-500 text-brass-600',
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => dismiss(id), 3500);
  }, [dismiss]);

  const toast = {
    success: (msg) => showToast(msg, 'success'),
    error: (msg) => showToast(msg, 'error'),
    info: (msg) => showToast(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm px-4 sm:px-0">
        {toasts.map((t) => {
          const Icon = ICONS[t.type];
          return (
            <div
              key={t.id}
              className={`card border-l-4 ${ACCENTS[t.type]} p-3.5 flex items-start gap-2.5 shadow-seal animate-toast-in`}
            >
              <Icon size={18} className="shrink-0 mt-0.5" />
              <p className="text-sm text-ink-700 dark:text-ink-100 flex-1">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                className="p-0.5 text-ink-300 hover:text-ink-600 dark:hover:text-ink-100 transition-colors shrink-0"
                aria-label="Dismiss"
              >
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);