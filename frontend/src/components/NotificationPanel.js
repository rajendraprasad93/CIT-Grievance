import { useState } from 'react';
import { X, Bell, Heart, MessageCircle, Users, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

/**
 * NotificationPanel - Tier 7: Engagement Hooks
 * Shows all user notifications
 */
function NotificationPanel({ isOpen, onClose }) {
  // Mock data - replace with API
  const [notifications] = useState([
    {
      id: 1,
      type: 'reaction',
      icon: Heart,
      color: 'text-opportunity',
      bg: 'bg-opportunity/10',
      title: 'Priya reacted to your moment',
      message: '"Anyone free for DBMS revision?"',
      link: '/community/123',
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
      read: false,
    },
    {
      id: 2,
      type: 'comment',
      icon: MessageCircle,
      color: 'text-help',
      bg: 'bg-help/10',
      title: 'New comment on your moment',
      message: 'Rohit: "I can help! Let\'s meet at 5pm"',
      link: '/community/123',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
      read: false,
    },
    {
      id: 3,
      type: 'follow',
      icon: Users,
      color: 'text-primary',
      bg: 'bg-primary/10',
      title: 'Neha started following you',
      message: 'Check out their profile',
      link: '/profile/456',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: true,
    },
    {
      id: 4,
      type: 'opportunity',
      icon: TrendingUp,
      color: 'text-opportunity',
      bg: 'bg-opportunity/10',
      title: 'New opportunity matches your interests',
      message: 'Google STEP Internship - Deadline in 3 days',
      link: '/opportunities/789',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      read: true,
    },
    {
      id: 5,
      type: 'issue_update',
      icon: CheckCircle,
      color: 'text-life',
      bg: 'bg-life/10',
      title: 'Issue you reported was resolved',
      message: 'WiFi in common room - Fixed by IT team',
      link: '/issues/321',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      read: true,
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b-2 border-border px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Bell size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-heading-2 font-heading font-bold">Notifications</h2>
              {unreadCount > 0 && (
                <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-secondary transition-colors flex items-center justify-center"
          >
            <X size={24} />
          </button>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto h-[calc(100vh-80px)]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Bell size={32} className="text-primary" />
              </div>
              <h3 className="text-heading-3 font-heading font-semibold mb-2">
                No notifications yet
              </h3>
              <p className="text-body-small text-muted-foreground text-center">
                We'll notify you when something interesting happens
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => {
                const Icon = notification.icon;
                return (
                  <Link
                    key={notification.id}
                    to={notification.link}
                    onClick={onClose}
                    className={`block p-4 hover:bg-primary/5 transition-colors ${
                      !notification.read ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full ${notification.bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon size={18} className={notification.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold mb-1 ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {notifications.length > 0 && (
          <div className="sticky bottom-0 bg-white border-t-2 border-border p-4">
            <button className="w-full h-10 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-medium transition-colors text-sm">
              Mark all as read
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationPanel;
