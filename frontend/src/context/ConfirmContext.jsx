import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmContext = createContext(null);

export const ConfirmProvider = ({ children }) => {
  const [dialog, setDialog] = useState(null);
  const resolveRef = useRef(null);

  const confirmDialog = useCallback((message, options = {}) => {
    setDialog({
      message,
      title: options.title || 'Are you sure?',
      danger: options.danger !== false,
      confirmLabel: options.confirmLabel || 'Delete',
    });
    return new Promise((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const close = (result) => {
    setDialog(null);
    if (resolveRef.current) {
      resolveRef.current(result);
      resolveRef.current = null;
    }
  };

  return (
    <ConfirmContext.Provider value={confirmDialog}>
      {children}
      {dialog && (
        <div
          className="fixed inset-0 z-[110] bg-ink-900/50 backdrop-blur-[2px] flex items-center justify-center p-4"
          onClick={() => close(false)}
        >
          <div
            className="card p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              {dialog.danger && (
                <div className="w-9 h-9 rounded-full bg-red-50 dark:bg-red-500/10 grid place-items-center shrink-0">
                  <AlertTriangle size={18} className="text-red-600" />
                </div>
              )}
              <div>
                <h3 className="font-display text-lg text-ink-900 dark:text-paper">{dialog.title}</h3>
                <p className="text-sm text-ink-600 mt-1">{dialog.message}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => close(false)} className="btn-secondary text-sm">
                Cancel
              </button>
              <button
                onClick={() => close(true)}
                className={dialog.danger
                  ? 'inline-flex items-center justify-center gap-2 rounded-sm bg-red-600 text-white px-4 py-2.5 text-sm font-medium hover:bg-red-700 transition-colors'
                  : 'btn-primary text-sm'}
              >
                {dialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => useContext(ConfirmContext);