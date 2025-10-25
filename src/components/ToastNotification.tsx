import { CheckCircle, AlertTriangle, X } from 'lucide-react';

export interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

interface ToastNotificationProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export default function ToastNotification({ toasts, onDismiss }: ToastNotificationProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 min-w-[320px] max-w-md rounded-xl shadow-xl p-4 animate-slide-up ${
            toast.type === 'success' ? 'bg-[#201AD9]' : 'bg-[#FF0000]'
          } text-white`}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          )}
          <p className="flex-1 text-sm font-medium">{toast.message}</p>
          <button
            onClick={() => onDismiss(toast.id)}
            className="hover:opacity-75 transition-opacity"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );
}
