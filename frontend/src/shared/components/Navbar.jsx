import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../core/contexts/AuthContext';
import Avatar from './ui/Avatar';
import Badge from './ui/Badge';
import { PremiumIcon } from './icons/IconComponents';
import * as socialService from '../../services/socialService';
import io from 'socket.io-client';
import myLogo from '../../logo.png';

// Film reel icon SVG
const FilmIcon = () => (
  <img 
    src={myLogo}
    alt="Logo"
    width="22"
    height="22"
    style={{ objectFit: 'contain' }}
    />
);

const NAV_LINKS = [
  { to: '/dashboard', label: 'Find Match' },
  { to: '/search',    label: 'Search Catalog' },
  { to: '/discover',  label: 'Discover' },
  { to: '/watchlist', label: 'Watchlist' },
  { to: '/profile',   label: 'Profile' },
];

const Navbar = ({ rightContent }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled]         = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const dropdownRef                      = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const notificationRef = useRef(null);

  // Scroll-aware transparency
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile nav on route change
  useEffect(() => { setMobileOpen(false); setDropdownOpen(false); setNotificationOpen(false); }, [location.pathname]);

  // Fetch notifications & requests
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const notifRes = await socialService.getNotifications();
        setNotifications(notifRes.data || []);
        
        const reqRes = await socialService.getRequests();
        setPendingRequests(reqRes.data?.pending || []);
      } catch (err) {
        console.error('Failed to fetch notifications or requests:', err);
      }
    };

    fetchData();

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

    socket.on('notification_received', (newNotification) => {
      setNotifications(prev => {
        if (prev.some(n => n._id === newNotification._id)) return prev;
        return [newNotification, ...prev];
      });
    });

    socket.on('friend_request_received', (newRequest) => {
      setPendingRequests(prev => {
        if (prev.some(r => r._id === newRequest._id)) return prev;
        return [newRequest, ...prev];
      });
    });

    socket.on('friend_request_accepted_received', () => {
      fetchData();
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const handleRequestResponse = async (requestId, accept) => {
    try {
      await socialService.respondFriendRequest(requestId, accept);
      setPendingRequests(prev => prev.filter(r => r._id !== requestId));
      const notifRes = await socialService.getNotifications();
      setNotifications(notifRes.data || []);
    } catch (err) {
      console.error('Failed to respond to friend request:', err);
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      if (notif.status === 'unread') {
        await socialService.markNotificationRead(notif._id);
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, status: 'read' } : n));
      }
      setNotificationOpen(false);
      if (notif.deepLink) {
        navigate(notif.deepLink);
      }
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await socialService.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, status: 'read' })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const unreadCount = notifications.filter(n => n.status === 'unread').length + pendingRequests.length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (to) => location.pathname === to;

  return (
    <>
      <nav
        role="navigation"
        aria-label="Main navigation"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          transition: 'background 300ms ease, backdrop-filter 300ms ease, border-color 300ms ease, box-shadow 300ms ease',
          background: scrolled ? 'rgba(5,5,10,0.88)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
          boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.4)' : 'none',
        }}
      >
        <div className="section-container" style={{ height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* ── Logo ── */}
          <Link
            to={user ? '/dashboard' : '/'}
            aria-label="PhilixMate Home"
            style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #e8102a, #ff4b5e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white',
              boxShadow: '0 4px 16px rgba(232,16,42,0.4)',
              flexShrink: 0,
            }}>
              <FilmIcon />
            </div>
            <div>
              <span style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 800,
                fontSize: '1.125rem',
                background: 'linear-gradient(135deg, #f0f0fa 0%, #a8a8c0 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em',
              }}>PhilixMate</span>
            </div>
          </Link>

          {/* ── Desktop Nav ── */}
          <div className="hidden md:flex items-center gap-1" style={{ flex: 1, justifyContent: 'center' }}>
            {user && NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                style={{
                  padding: '7px 16px',
                  borderRadius: 9999,
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  color: isActive(to) ? '#f0f0fa' : '#a8a8c0',
                  background: isActive(to) ? 'rgba(255,255,255,0.08)' : 'transparent',
                  transition: 'all 200ms ease',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => { if (!isActive(to)) { e.currentTarget.style.color = '#f0f0fa'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}}
                onMouseLeave={e => { if (!isActive(to)) { e.currentTarget.style.color = '#a8a8c0'; e.currentTarget.style.background = 'transparent'; }}}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* ── Desktop Right ── */}
          <div className="hidden md:flex items-center gap-3" style={{ flexShrink: 0 }}>
            {rightContent}
            {user ? (
              <>
                {/* ── Notification Dropdown ── */}
                <div ref={notificationRef} style={{ position: 'relative' }}>
                  <button
                    onClick={() => {
                      if (window.innerWidth < 768) {
                        navigate('/notifications');
                      } else {
                        setNotificationOpen(o => !o);
                      }
                    }}
                    style={{
                      position: 'relative',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 38, height: 38, borderRadius: '50%',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#a8a8c0',
                      cursor: 'pointer',
                      transition: 'all 200ms ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = '#f0f0fa'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#a8a8c0'; }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    {unreadCount > 0 && (
                      <span style={{
                        position: 'absolute', top: -2, right: -2,
                        minWidth: 16, height: 16, borderRadius: 8,
                        background: '#e8102a', color: 'white',
                        fontSize: '9px', fontWeight: 'bold',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '0 4px',
                        boxShadow: '0 0 8px rgba(232,16,42,0.6)'
                      }}>
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown Container */}
                  {notificationOpen && (
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                      background: 'rgba(13,13,26,0.98)',
                      backdropFilter: 'blur(24px)',
                      WebkitBackdropFilter: 'blur(24px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 16,
                      padding: '12px',
                      width: 320,
                      boxShadow: '0 16px 48px rgba(0,0,0,0.7), 0 4px 16px rgba(0,0,0,0.4)',
                      zIndex: 50,
                      animation: 'slideDown 0.25s cubic-bezier(0.16,1,0.3,1) forwards',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f0f0fa' }}>Notifications</span>
                        {notifications.length > 0 && (
                          <button onClick={handleMarkAllRead} style={{ background: 'none', border: 'none', color: '#e8102a', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer' }}>
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div style={{ maxHeight: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {pendingRequests.length === 0 && notifications.length === 0 ? (
                          <div style={{ padding: '24px 0', textAlign: 'center', color: '#6b6b85', fontSize: '0.8125rem' }}>
                            No new notifications
                          </div>
                        ) : (
                          <>
                            {/* Friend Requests */}
                            {pendingRequests.map(req => (
                              <div key={req._id} style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: 8, borderRadius: 10,
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.04)',
                              }}>
                                <Avatar name={req.sender.name} size="sm" />
                                <div style={{ flex: 1 }}>
                                  <p style={{ fontSize: '0.75rem', color: '#f0f0fa', fontWeight: 500 }}>
                                    <span style={{ fontWeight: 600 }}>{req.sender.name}</span> sent a friend request
                                  </p>
                                  <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                                    <button onClick={() => handleRequestResponse(req._id, true)} style={{
                                      padding: '4px 10px', borderRadius: 6,
                                      background: '#e8102a', color: 'white',
                                      border: 'none', fontSize: '0.6875rem', fontWeight: 600,
                                      cursor: 'pointer'
                                    }}>Accept</button>
                                    <button onClick={() => handleRequestResponse(req._id, false)} style={{
                                      padding: '4px 10px', borderRadius: 6,
                                      background: 'rgba(255,255,255,0.08)', color: '#a8a8c0',
                                      border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.6875rem', fontWeight: 600,
                                      cursor: 'pointer'
                                    }}>Ignore</button>
                                  </div>
                                </div>
                              </div>
                            ))}

                            {/* Standard Notifications */}
                            {notifications.map(notif => (
                              <div
                                key={notif._id}
                                onClick={() => handleNotificationClick(notif)}
                                style={{
                                  display: 'flex', gap: 10,
                                  padding: '8px 10px', borderRadius: 10,
                                  background: notif.status === 'unread' ? 'rgba(232,16,42,0.05)' : 'transparent',
                                  border: `1px solid ${notif.status === 'unread' ? 'rgba(232,16,42,0.1)' : 'transparent'}`,
                                  cursor: 'pointer',
                                  transition: 'all 150ms ease',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                onMouseLeave={e => e.currentTarget.style.background = notif.status === 'unread' ? 'rgba(232,16,42,0.05)' : 'transparent'}
                              >
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  {notif.sender ? (
                                    <Avatar name={notif.sender.name} size="sm" />
                                  ) : (
                                    <div style={{
                                      width: 32, height: 32, borderRadius: '50%',
                                      background: 'linear-gradient(135deg, #e8102a, #ff4b5e)',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      color: 'white', fontSize: '0.875rem'
                                    }}>
                                      <PremiumIcon name="movie" size={16} color="white" />
                                    </div>
                                  )}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                    <p style={{ fontSize: '0.8125rem', fontWeight: notif.status === 'unread' ? 700 : 500, color: '#f0f0fa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>
                                      {notif.title}
                                    </p>
                                    <span style={{ fontSize: '0.625rem', color: '#6b6b85' }}>
                                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  <p style={{ fontSize: '0.75rem', color: '#a8a8c0', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {notif.body}
                                  </p>
                                </div>
                              </div>
                            ))}

                            <Link
                              to="/notifications"
                              onClick={() => setNotificationOpen(false)}
                              style={{
                                display: 'block',
                                textAlign: 'center',
                                padding: '10px 0 2px',
                                borderTop: '1px solid rgba(255,255,255,0.08)',
                                color: '#ff6b7a',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                textDecoration: 'none',
                                transition: 'color 150ms ease',
                                marginTop: 8
                              }}
                              onMouseEnter={e => e.currentTarget.style.color = '#e8102a'}
                              onMouseLeave={e => e.currentTarget.style.color = '#ff6b7a'}
                            >
                              View All Notifications
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div ref={dropdownRef} style={{ position: 'relative' }}>
                  <button
                    id="user-menu-button"
                    aria-haspopup="true"
                    aria-expanded={dropdownOpen}
                    onClick={() => setDropdownOpen(o => !o)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '6px 12px 6px 6px',
                      background: dropdownOpen ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${dropdownOpen ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.09)'}`,
                      borderRadius: 9999,
                      cursor: 'pointer',
                      transition: 'all 200ms ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                    onMouseLeave={e => { if (!dropdownOpen) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; }}}
                  >
                    <Avatar name={user.name} size="xs" />
                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#f0f0fa', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.name?.split(' ')[0]}
                    </span>
                    {user.isPro && <Badge variant="pro" />}
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ color: '#6b6b85', transition: 'transform 200ms ease', transform: dropdownOpen ? 'rotate(180deg)' : 'none' }}>
                      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>

                  {/* Dropdown */}
                  {dropdownOpen && (
                    <div
                      role="menu"
                      aria-labelledby="user-menu-button"
                      style={{
                        position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                        background: 'rgba(13,13,26,0.98)',
                        backdropFilter: 'blur(24px)',
                        WebkitBackdropFilter: 'blur(24px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 16,
                        padding: '8px',
                        minWidth: 200,
                        boxShadow: '0 16px 48px rgba(0,0,0,0.7), 0 4px 16px rgba(0,0,0,0.4)',
                        animation: 'slideDown 0.25s cubic-bezier(0.16,1,0.3,1) forwards',
                        zIndex: 50,
                      }}
                    >
                      {/* User info header */}
                      <div style={{ padding: '10px 12px 12px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar name={user.name} size="sm" />
                          <div>
                            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f0f0fa', lineHeight: 1.2 }}>{user.name}</p>
                            <p style={{ fontSize: '0.75rem', color: '#6b6b85', marginTop: 2, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Links */}
                      {[
                        { to: '/dashboard', icon: 'movie', label: 'Find a Match' },
                        { to: '/profile',   icon: 'user', label: 'My Profile' },
                        { to: '/sessions',  icon: 'key', label: 'Security & Sessions' },
                      ].map(({ to, icon, label }) => (
                        <Link
                          key={to}
                          to={to}
                          role="menuitem"
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '9px 12px',
                            borderRadius: 10,
                            fontSize: '0.875rem',
                            color: '#a8a8c0',
                            textDecoration: 'none',
                            transition: 'all 150ms ease',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#f0f0fa'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#a8a8c0'; }}
                        >
                          <PremiumIcon name={icon} size={18} color="currentColor" />
                          {label}
                        </Link>
                      ))}

                      <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '6px 0' }} />

                      <button
                        role="menuitem"
                        onClick={handleLogout}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          width: '100%', padding: '9px 12px',
                          borderRadius: 10,
                          fontSize: '0.875rem',
                          color: '#f87171',
                          background: 'none', border: 'none',
                          cursor: 'pointer', textAlign: 'left',
                          transition: 'all 150ms ease',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <PremiumIcon name="cross" size={18} color="currentColor" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Link
                  to="/login"
                  style={{
                    padding: '8px 18px', borderRadius: 9999,
                    fontSize: '0.875rem', fontWeight: 500,
                    color: '#a8a8c0', textDecoration: 'none',
                    transition: 'color 150ms ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#f0f0fa'}
                  onMouseLeave={e => e.currentTarget.style.color = '#a8a8c0'}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="btn btn-primary btn-sm"
                  style={{ borderRadius: 9999, textDecoration: 'none', padding: '8px 20px' }}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            className="flex md:hidden items-center justify-center"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(o => !o)}
            style={{
              width: 40, height: 40, borderRadius: 10,
              background: mobileOpen ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 200ms ease',
            }}
          >
            <div style={{ width: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  height: 2, background: '#f0f0fa', borderRadius: 2,
                  transition: 'all 250ms cubic-bezier(0.16,1,0.3,1)',
                  transformOrigin: 'center',
                  width: mobileOpen && i === 1 ? 0 : '100%',
                  transform: mobileOpen
                    ? i === 0 ? 'rotate(45deg) translateY(8px)' : i === 2 ? 'rotate(-45deg) translateY(-8px)' : 'scaleX(0)'
                    : 'none',
                  opacity: mobileOpen && i === 1 ? 0 : 1,
                }} />
              ))}
            </div>
          </button>
        </div>
      </nav>

      {/* ── Mobile Menu Drawer ── */}
      {mobileOpen && (
        <>
          <div
            onClick={() => setMobileOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 35,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(4px)',
              animation: 'fadeInFast 0.2s ease forwards',
            }}
          />
          <div
            style={{
              position: 'fixed', top: 72, left: 0, right: 0, zIndex: 38,
              background: 'rgba(8,8,16,0.98)',
              backdropFilter: 'blur(24px)',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              padding: '16px 24px 24px',
              animation: 'slideDown 0.3s cubic-bezier(0.16,1,0.3,1) forwards',
            }}
          >
            {user && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <Avatar name={user.name} size="md" />
                  <div>
                    <p style={{ fontWeight: 600, color: '#f0f0fa', fontSize: '0.9375rem' }}>{user.name}</p>
                    <p style={{ color: '#6b6b85', fontSize: '0.8125rem', marginTop: 2 }}>{user.email}</p>
                  </div>
                  {user.isPro && <Badge variant="pro" style={{ marginLeft: 'auto' }} />}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 12 }}>
                  {NAV_LINKS.map(({ to, label }) => (
                    <Link
                      key={to}
                      to={to}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 12,
                        fontSize: '0.9375rem',
                        fontWeight: 500,
                        color: isActive(to) ? '#f0f0fa' : '#a8a8c0',
                        background: isActive(to) ? 'rgba(255,255,255,0.07)' : 'transparent',
                        textDecoration: 'none',
                        transition: 'all 150ms ease',
                      }}
                    >
                      {label}
                    </Link>
                  ))}
                  <Link
                    to="/notifications"
                    style={{
                      padding: '12px 16px',
                      borderRadius: 12,
                      fontSize: '0.9375rem',
                      fontWeight: 500,
                      color: isActive('/notifications') ? '#f0f0fa' : '#a8a8c0',
                      background: isActive('/notifications') ? 'rgba(255,255,255,0.07)' : 'transparent',
                      textDecoration: 'none',
                      transition: 'all 150ms ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    <PremiumIcon name="star" size={16} color="currentColor" /> Notifications
                    {unreadCount > 0 && (
                      <span style={{
                        marginLeft: 'auto',
                        background: '#e8102a', color: 'white',
                        fontSize: '10px', fontWeight: 'bold',
                        padding: '2px 8px', borderRadius: 9999
                      }}>{unreadCount}</span>
                    )}
                  </Link>
                  <Link
                    to="/sessions"
                    style={{
                      padding: '12px 16px',
                      borderRadius: 12,
                      fontSize: '0.9375rem',
                      fontWeight: 500,
                      color: isActive('/sessions') ? '#f0f0fa' : '#a8a8c0',
                      background: isActive('/sessions') ? 'rgba(255,255,255,0.07)' : 'transparent',
                      textDecoration: 'none',
                      transition: 'all 150ms ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    <PremiumIcon name="key" size={16} color="currentColor" /> Security & Sessions
                  </Link>
                  <button
                    onClick={handleLogout}
                    style={{
                      padding: '12px 16px', borderRadius: 12,
                      fontSize: '0.9375rem', fontWeight: 500,
                      color: '#f87171',
                      background: 'rgba(239,68,68,0.08)',
                      border: 'none', cursor: 'pointer', textAlign: 'left',
                      transition: 'all 150ms ease',
                      marginTop: 8,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    <PremiumIcon name="cross" size={16} color="#f87171" /> Sign Out
                  </button>
                </div>
              </>
            )}
            {!user && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Link to="/login" style={{ padding: '14px', borderRadius: 14, textAlign: 'center', background: 'rgba(255,255,255,0.06)', color: '#f0f0fa', fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)' }}>Sign In</Link>
                <Link to="/signup" style={{ padding: '14px', borderRadius: 14, textAlign: 'center', background: 'linear-gradient(135deg,#e8102a,#ff3a4a)', color: 'white', fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 16px rgba(232,16,42,0.35)' }}>Get Started</Link>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;
