import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../shared/components/Navbar';
import Spinner from '../../../shared/components/ui/Spinner';
import { PremiumIcon, IconButton } from '../../../shared/components/icons/IconComponents';
import * as socialService from '../../../services/socialService';
import { useAuth } from '../../../core/contexts/AuthContext';
import io from 'socket.io-client';

// Helper to format relative time ago
const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

// Map notification type to icon details
const getNotificationIcon = (type) => {
  switch (type) {
    case 'match_found':
      return { icon: 'movie', color: '#ff6b7a', bg: 'rgba(232,16,42,0.1)' };
    case 'match_accepted':
      return { icon: 'user', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' };
    case 'chat_started':
      return { icon: 'chat', color: '#10b981', bg: 'rgba(16,185,129,0.1)' };
    case 'room_joined':
      return { icon: 'group', color: '#f5a623', bg: 'rgba(245,166,35,0.1)' };
    case 'intro_received':
      return { icon: 'bot', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' };
    case 'room_closed':
      return { icon: 'lock', color: '#6b6b85', bg: 'rgba(255,255,255,0.05)' };
    case 'watchlist_reminder':
      return { icon: 'star', color: '#ec4899', bg: 'rgba(236,72,153,0.1)' };
    case 'account_alert':
      return { icon: 'key', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' };
    default:
      return { icon: 'star', color: '#f0f0fa', bg: 'rgba(255,255,255,0.08)' };
  }
};

const NotificationsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await socialService.getNotifications();
      setNotifications(res.data || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    // Setup Socket connection to listen for live pushes while user is on this page
    const socketUrl = import.meta.env.VITE_API_URL 
      ? new URL(import.meta.env.VITE_API_URL).origin 
      : (window.location.port === '3000' ? 'http://localhost:5000' : window.location.origin);

    const socket = io(socketUrl, {
      transports: ['websocket'],
      withCredentials: true
    });

    socket.on('connect', () => {
      socket.emit('join_user_notifications', user.id || user._id);
    });

    socket.on('notification_received', (newNotif) => {
      setNotifications(prev => {
        if (prev.some(n => n._id === newNotif._id)) return prev;
        return [newNotif, ...prev];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const handleMarkAsRead = async (notif) => {
    if (notif.status === 'read') {
      if (notif.deepLink) navigate(notif.deepLink);
      return;
    }
    try {
      await socialService.markNotificationRead(notif._id);
      setNotifications(prev =>
        prev.map(n => (n._id === notif._id ? { ...n, status: 'read' } : n))
      );
      if (notif.deepLink) {
        navigate(notif.deepLink);
      }
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Stop trigger card click redirect
    try {
      await socialService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await socialService.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, status: 'read' })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to delete all notifications?')) return;
    try {
      await socialService.clearAllNotifications();
      setNotifications([]);
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    }
  };

  return (
    <div style={{ background: '#05050a', minHeight: '100vh', color: '#f0f0fa', paddingTop: 96, paddingBottom: 64 }}>
      <Navbar />

      <div className="section-container" style={{ maxWidth: 760 }}>
        {/* Header Options Panel */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 32,
          gap: 16,
          animation: 'slideUp 0.4s ease-out'
        }}>
          <div>
            <h1 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '2rem', letterSpacing: '-0.02em', margin: 0 }}>
              Notifications
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#6b6b85', marginTop: 4 }}>
              Stay updated with your movie sessions, companions, and alerts.
            </p>
          </div>

          {notifications.length > 0 && (
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={handleMarkAllRead}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10,
                  color: '#a8a8c0',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 150ms ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
              >
                Mark All Read
              </button>
              <button
                onClick={handleClearAll}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(232,16,42,0.1)',
                  border: '1px solid rgba(232,16,42,0.2)',
                  borderRadius: 10,
                  color: '#ff6b7a',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 150ms ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(232,16,42,0.18)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(232,16,42,0.1)'}
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* List Content */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
            <Spinner size="lg" color="#e8102a" />
          </div>
        ) : notifications.length === 0 ? (
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 24,
            padding: '64px 32px',
            textAlign: 'center',
            animation: 'fadeIn 0.5s ease-out'
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'rgba(255,255,255,0.04)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px', color: '#6b6b85'
            }}>
              <PremiumIcon name="star" size={24} color="currentColor" />
            </div>
            <h3 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.15rem', color: '#f0f0fa', margin: '0 0 8px' }}>
              No Notifications Yet
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#6b6b85', maxWidth: 360, margin: '0 auto', lineHeight: 1.5 }}>
              No notifications yet. We'll let you know when something important happens.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {notifications.map((notif, idx) => {
              const meta = getNotificationIcon(notif.type);
              const isUnread = notif.status === 'unread';
              return (
                <div
                  key={notif._id}
                  onClick={() => handleMarkAsRead(notif)}
                  style={{
                    background: isUnread ? 'rgba(232,16,42,0.04)' : 'rgba(255,255,255,0.015)',
                    border: `1px solid ${isUnread ? 'rgba(232,16,42,0.18)' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: 20,
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    cursor: 'pointer',
                    transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                    position: 'relative',
                    animation: `slideUp 0.3s ease-out both`,
                    animationDelay: `${idx * 40}ms`
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = isUnread ? 'rgba(232,16,42,0.06)' : 'rgba(255,255,255,0.04)';
                    e.currentTarget.style.borderColor = isUnread ? 'rgba(232,16,42,0.25)' : 'rgba(255,255,255,0.12)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = isUnread ? 'rgba(232,16,42,0.04)' : 'rgba(255,255,255,0.015)';
                    e.currentTarget.style.borderColor = isUnread ? 'rgba(232,16,42,0.18)' : 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  {/* Unread indicator blue dot */}
                  {isUnread && (
                    <div style={{
                      position: 'absolute',
                      left: 6,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#3b82f6',
                      boxShadow: '0 0 8px #3b82f6'
                    }} />
                  )}

                  {/* Icon avatar */}
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: meta.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <PremiumIcon name={meta.icon} size={20} color={meta.color} />
                  </div>

                  {/* Body details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
                      <h4 style={{
                        fontSize: '0.925rem',
                        fontWeight: isUnread ? 750 : 600,
                        color: isUnread ? '#f0f0fa' : '#a8a8c0',
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {notif.title}
                      </h4>
                      <span style={{ fontSize: '0.72rem', color: '#6b6b85', flexShrink: 0 }}>
                        {formatTimeAgo(notif.createdAt)}
                      </span>
                    </div>
                    <p style={{
                      fontSize: '0.825rem',
                      color: isUnread ? '#c0c0d8' : '#6b6b85',
                      lineHeight: 1.4,
                      margin: '4px 0 0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {notif.body}
                    </p>
                  </div>

                  {/* Trash action button */}
                  <div onClick={(e) => handleDelete(e, notif._id)} style={{ flexShrink: 0 }}>
                    <IconButton icon="close" size={16} style={{ color: '#4a4a60' }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
