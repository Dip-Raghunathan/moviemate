import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../shared/components/Navbar';
import { useAuth } from '../../../core/contexts/AuthContext';
import { useToast } from '../../../core/contexts/ToastContext';
import * as authService from '../../../services/authService';
import Badge from '../../../shared/components/ui/Badge';
import Spinner from '../../../shared/components/ui/Spinner';
import { PremiumIcon } from '../../../shared/components/icons/IconComponents';

// Get OS Icon
const getOSIcon = (os) => {
  const lower = (os || '').toLowerCase();
  if (lower.includes('window')) return 'motion';
  if (lower.includes('mac') || lower.includes('os x')) return 'apple';
  if (lower.includes('ios') || lower.includes('iphone') || lower.includes('ipad')) return 'phone';
  if (lower.includes('android')) return 'bot';
  if (lower.includes('linux')) return 'linux';
  return 'laptop';
};

// Get Browser Icon
const getBrowserIcon = (browser) => {
  const lower = (browser || '').toLowerCase();
  if (lower.includes('chrome')) return 'globe';
  if (lower.includes('firefox')) return 'firefox';
  if (lower.includes('safari')) return 'safari';
  if (lower.includes('edge') || lower.includes('msie')) return 'globe';
  return 'globe';
};

const SessionsPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState(null);
  const [revokingAll, setRevokingAll] = useState(false);

  const fetchSessions = async () => {
    try {
      const data = await authService.getSessions();
      if (data && data.sessions) {
        setSessions(data.sessions);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load active sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevoke = async (sessionId) => {
    if (!window.confirm('Are you sure you want to terminate this session? The device will be logged out immediately.')) {
      return;
    }
    setRevokingId(sessionId);
    try {
      await authService.revokeSession(sessionId);
      toast.success('Device session terminated successfully');
      await fetchSessions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to terminate session');
    } finally {
      setRevokingId(null);
    }
  };

  const handleRevokeAllOthers = async () => {
    if (!window.confirm('Are you sure you want to terminate all other active sessions? All other devices will be logged out immediately.')) {
      return;
    }
    setRevokingAll(true);
    try {
      await authService.revokeAllOtherSessions();
      toast.success('All other device sessions terminated');
      await fetchSessions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to terminate other sessions');
    } finally {
      setRevokingAll(false);
    }
  };

  const otherSessionsCount = sessions.filter(s => !s.isCurrent).length;

  return (
    <div style={{ background: '#05050a', minHeight: '100vh', color: '#f0f0fa' }}>
      <Navbar />

      {/* Ambient background glow */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }} aria-hidden="true">
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 800,
          height: 400,
          background: 'radial-gradient(ellipse, rgba(232,16,42,0.06) 0%, transparent 70%)',
          filter: 'blur(80px)'
        }} />
      </div>

      <div className="section-container" style={{ paddingTop: 96, paddingBottom: 64, position: 'relative', zIndex: 1 }}>
        {/* Back navigation */}
        <Link
          to="/profile"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: '#6b6b85',
            textDecoration: 'none',
            fontSize: '0.875rem',
            marginBottom: 24,
            transition: 'color 200ms ease',
            fontWeight: 500
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#f0f0fa'}
          onMouseLeave={e => e.currentTarget.style.color = '#6b6b85'}
        >
          ← Back to Profile
        </Link>

        {/* Page Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: 20,
          marginBottom: 32,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          paddingBottom: 24
        }}>
          <div>
            <h1 style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 900,
              fontSize: '2rem',
              color: '#f0f0fa',
              letterSpacing: '-0.02em',
              margin: '0 0 8px 0',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}>
              <PremiumIcon name="lock" size={24} color="#e8102a" style={{ marginRight: 8 }} /> Security & Devices
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#6b6b85', margin: 0, maxWidth: 600 }}>
              Manage and monitor the browser sessions, operating systems, and IP addresses currently authenticated to your PhilixMate account.
            </p>
          </div>

          {otherSessionsCount > 0 && (
            <button
              onClick={handleRevokeAllOthers}
              disabled={revokingAll}
              style={{
                padding: '10px 20px',
                borderRadius: 12,
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#f87171',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 200ms ease',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.18)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.25)';
              }}
            >
              {revokingAll ? (
                <>
                  <Spinner size="sm" color="#f87171" />
                  Terminating...
                </>
              ) : (
                'Terminate All Other Sessions'
              )}
            </button>
          )}
        </div>

        {/* Sessions list content */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200, gap: 16 }}>
            <Spinner size="lg" color="#e8102a" />
            <p style={{ color: '#6b6b85', fontSize: '0.9rem' }}>Retrieving active device sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 24,
            padding: '48px 24px',
            textAlign: 'center',
            color: '#6b6b85'
          }}>
            No active sessions found. Please re-login.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {sessions.map((session) => {
              const osIcon = getOSIcon(session.os);
              const browserIcon = getBrowserIcon(session.browser);
              const lastActiveDate = new Date(session.lastActive);
              
              return (
                <div
                  key={session.id}
                  style={{
                    background: session.isCurrent ? 'rgba(232, 16, 42, 0.03)' : 'rgba(255, 255, 255, 0.03)',
                    border: session.isCurrent ? '1px solid rgba(232, 16, 42, 0.25)' : '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: 20,
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 20,
                    transition: 'all 200ms ease',
                    boxShadow: session.isCurrent ? '0 4px 20px rgba(232, 16, 42, 0.08)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20, minWidth: 260 }}>
                    {/* Device Icon */}
                    <div style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      background: session.isCurrent ? 'rgba(232, 16, 42, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${session.isCurrent ? 'rgba(232, 16, 42, 0.2)' : 'rgba(255, 255, 255, 0.08)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <PremiumIcon name={osIcon} size={24} color={session.isCurrent ? '#e8102a' : '#a8a8c0'} />
                    </div>

                    {/* Device Details */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                        <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#f0f0fa' }}>
                          {session.os || 'Unknown OS'} • {session.browser || 'Unknown Browser'}
                        </span>
                        {session.isCurrent && (
                          <Badge variant="glow" label="This Device" style={{ color: '#ff6b7a', borderColor: 'rgba(232,16,42,0.3)', background: 'rgba(232,16,42,0.1)' }} />
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: '0.8125rem', color: '#6b6b85' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <PremiumIcon name="location" size={14} color="#6b6b85" /> {session.location || 'Unknown Location'}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <PremiumIcon name="laptop" size={14} color="#6b6b85" /> {session.ipAddress}
                        </span>
                        <span>
                          {session.isCurrent ? (
                            <span style={{ color: '#34d399', fontWeight: 600 }}>Active Now</span>
                          ) : (
                            `Last active: ${lastActiveDate.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Revoke action */}
                  {!session.isCurrent && (
                    <button
                      onClick={() => handleRevoke(session.id)}
                      disabled={revokingId === session.id}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 10,
                        background: 'transparent',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#a8a8c0',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 200ms ease'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                        e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                        e.currentTarget.style.color = '#f87171';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.color = '#a8a8c0';
                      }}
                    >
                      {revokingId === session.id ? (
                        <Spinner size="sm" color="#f87171" />
                      ) : (
                        'Revoke Access'
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionsPage;
