import React, { createContext, useContext, useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { Button } from './button';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(7);
    const newToast = { id, message, type };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const getToastColor = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-[#c8a2c9]/10 border-[#c8a2c9]/30 text-[#c8a2c9] dark:bg-[#c8a2c9]/20 dark:border-[#c8a2c9]/40 dark:text-[#d6aad7]';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-muted border-border text-foreground';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center justify-between gap-3 p-4 rounded-lg border shadow-lg animate-in slide-in-from-top-5 ${getToastColor(toast.type)}`}
          >
            <span className="text-sm font-medium flex-1">{toast.message}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeToast(toast.id)}
              className="h-6 w-6 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
