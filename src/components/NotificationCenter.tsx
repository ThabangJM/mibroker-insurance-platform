import { createContext, useContext, useState, ReactNode } from 'react';

// Notification type
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  description?: string;
  timestamp: Date;
  read?: boolean;
}

// Context
interface NotificationContextType {
  notifications: Notification[];
  addNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
  return ctx;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    setNotifications(prev => [
      {
        ...n,
        id: Math.random().toString(36).slice(2),
        timestamp: new Date(),
        read: false,
      },
      ...prev,
    ]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markAsRead, removeNotification }}>
      {children}
      <NotificationCenter />
    </NotificationContext.Provider>
  );
};

// NotificationCenter UI
const NotificationCenter = () => {
  const { notifications, removeNotification } = useNotification();
  if (notifications.length === 0) return null;
  return (
    <div className="fixed top-6 right-6 z-50 space-y-3 w-96 max-w-full">
      {notifications.slice(0, 5).map(n => (
        <div
          key={n.id}
          className={`flex items-start p-4 rounded-lg shadow-lg border-l-4 bg-white ${
            n.type === 'success' ? 'border-green-500' :
            n.type === 'error' ? 'border-red-500' :
            n.type === 'warning' ? 'border-yellow-500' :
            'border-blue-500'
          } animate-fade-in`}
        >
          <div className="flex-1">
            <div className="font-semibold mb-1">
              {n.type.charAt(0).toUpperCase() + n.type.slice(1)}
              <span className="ml-2 text-xs text-gray-400">{n.timestamp.toLocaleTimeString()}</span>
            </div>
            <div className="text-gray-900">{n.message}</div>
            {n.description && <div className="text-gray-600 text-sm mt-1">{n.description}</div>}
          </div>
          <button
            className="ml-4 text-gray-400 hover:text-gray-700"
            onClick={() => removeNotification(n.id)}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};
