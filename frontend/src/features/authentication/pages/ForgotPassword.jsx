import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as authService from '../../../services/authService';
import Spinner from '../../../shared/components/ui/Spinner';
import { PremiumIcon } from '../../../shared/components/icons/IconComponents';

const ForgotPassword = () => {
  const [email,   setEmail]   = useState('');
  const [message, setMessage] = useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [sent,    setSent]    = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      setMessage(res.message || 'If an account with that email exists, we have sent a 6-digit OTP reset code.');
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#05050a', padding: '32px 24px',
    }}>
      {/* Ambient */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }} aria-hidden="true">
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(232,16,42,0.06) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1, animation: 'slideUp 0.7s cubic-bezier(0.16,1,0.3,1) forwards' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.25rem', color: '#f0f0fa' }}>PhilixMate</span>
          </Link>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.09)', borderRadius: 24,
          padding: '36px 28px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
        }}>
          {/* Success state */}
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: 16, animation: 'scaleIn 0.5s cubic-bezier(0.16,1,0.3,1)', display: 'flex', justifyContent: 'center' }}>
                <PremiumIcon name="message" size={48} color="#e8102a" />
              </div>
              <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#f0f0fa', letterSpacing: '-0.03em', marginBottom: 12 }}>
                Check your inbox
              </h2>
              <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 12, padding: '14px 16px', marginBottom: 24 }}>
                <p style={{ color: '#34d399', fontSize: '0.9rem', lineHeight: 1.5 }}>{message}</p>
              </div>
              <button
                onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email)}`)}
                className="btn btn-primary"
                style={{ width: '100%', padding: '13px', borderRadius: 12, fontWeight: 700, marginBottom: 20 }}
              >
                Go to Reset Password
              </button>
              <p style={{ color: '#6b6b85', fontSize: '0.875rem', lineHeight: 1.6 }}>
                Didn't receive the email? Check your spam folder, or{' '}
                <button onClick={() => { setSent(false); setEmail(''); }} style={{ color: '#e8102a', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', padding: 0 }}>
                  try again
                </button>.
              </p>
            </div>
          ) : (
            <>
              <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.75rem', color: '#f0f0fa', letterSpacing: '-0.03em', marginBottom: 8 }}>
                Reset your password
              </h2>
              <p style={{ color: '#6b6b85', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 28 }}>
                Enter your email address and we'll send you a secure link to reset your password.
              </p>

              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12, padding: '12px 14px', marginBottom: 20 }}>
                  <PremiumIcon name="warning" size={18} color="#f87171" />
                  <p style={{ color: '#f87171', fontSize: '0.875rem' }}>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div style={{ marginBottom: 20 }}>
                  <label htmlFor="fp-email" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#a8a8c0', marginBottom: 8 }}>
                    Email Address
                  </label>
                  <input
                    id="fp-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    required
                    style={{
                      width: '100%', padding: '13px 16px',
                      background: focused ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.4)',
                      border: `1px solid ${focused ? '#e8102a' : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: 12, color: '#f0f0fa', fontSize: '0.9375rem',
                      fontFamily: 'Inter,sans-serif', outline: 'none',
                      transition: 'all 200ms ease',
                      boxShadow: focused ? '0 0 0 3px rgba(232,16,42,0.15)' : 'none',
                    }}
                  />
                </div>

                <button
                  id="fp-submit-btn"
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ width: '100%', padding: '13px', borderRadius: 12, fontWeight: 700 }}
                >
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <Spinner size="sm" color="white" /> Sending...
                    </span>
                  ) : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to="/login" style={{ color: '#6b6b85', fontSize: '0.875rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'color 150ms ease' }}
            onMouseEnter={e => e.currentTarget.style.color = '#a8a8c0'}
            onMouseLeave={e => e.currentTarget.style.color = '#6b6b85'}>
            ← Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
