import { useState, useEffect } from 'react';
import { X, Bell, Heart, MessageCircle, Users, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { apiGet, apiPost } from '../lib/api';

function NotificationPanel({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const getIconForType = (type) => {
    const icons = {
      reaction: { icon: Heart, color: 'text-rose-500', bg: 'bg-rose-100' },
      comment: { icon: MessageCircle, color: 'text-blue-500', bg: 'bg-blue-100' },
      follow: { icon: Users, color: 'text-amber-600', bg: 'bg-amber-100' },
      opportunity: { icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-100' },
      issue_update: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100' },
      review: { icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-100' },
    };
    return icons[type] || icons.comment;
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await apiGet('/api/notifications');
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await apiPost(`/api/notifications/${notificationId}/read`);
      setNotifications(notifications.map(n => 
        n.notification_id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiPost('/api/notifications/mark-all-read');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose}>
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Bell size={20} className="text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
              {unreadCount > 0 && (
                <p className="text-xs text-gray-500">{unreadCount} unread</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto h-[calc(100vh-80px)]">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mb-4">
                <Bell size={28} className="text-amber-600" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">No notifications yet</h3>
              <p className="text-sm text-gray-500 text-center">We'll notify you when something interesting happens</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => {
                const { icon: Icon, color, bg } = getIconForType(notification.type);
                return (
                  <Link
                    key={notification.notification_id}
                    to={notification.link || '#'}
                    onClick={() => {
                      if (!notification.read) markAsRead(notification.notification_id);
                      onClose();
                    }}
                    className={`block p-4 hover:bg-amber-50 transition-colors ${!notification.read ? 'bg-amber-50/50' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon size={18} className={color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold mb-1 ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                          {notification.title}
                        </p>
                        {notification.message && (
                          <p className="text-sm text-gray-500 line-clamp-2 mb-2">{notification.message}</p>
                        )}
                        <p className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {notifications.length > 0 && unreadCount > 0 && (
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
            <button 
              onClick={markAllAsRead}
              className="w-full h-10 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors text-sm"
            >
              Mark all as read
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationPanel;
