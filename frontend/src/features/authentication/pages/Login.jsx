import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/contexts/AuthContext';
import Spinner from '../../../shared/components/ui/Spinner';
import { PremiumIcon } from '../../../shared/components/icons/IconComponents';

const FilmIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/>
    <line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/>
    <line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/>
  </svg>
);

const EyeIcon = ({ open }) => open ? (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const Login = () => {
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [showPwd,     setShowPwd]     = useState(false);
  const [error,       setError]       = useState('');
  const [loading,     setLoading]     = useState(false);
  const [emailFocus,  setEmailFocus]  = useState(false);
  const [pwdFocus,    setPwdFocus]    = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (focused) => ({
    width: '100%',
    padding: '14px 18px',
    background: focused ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.4)',
    border: `1px solid ${focused ? '#e8102a' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: 14,
    color: '#f0f0fa',
    fontSize: '0.9375rem',
    fontFamily: 'Inter,sans-serif',
    outline: 'none',
    transition: 'all 200ms ease',
    boxShadow: focused ? '0 0 0 3px rgba(232,16,42,0.15)' : 'none',
  });

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: '#05050a',
    }}>
      {/* ── Left: Cinematic Poster Panel ── */}
      <div
        className="hidden lg:flex"
        style={{
          flex: '0 0 52%',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: "url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80')",
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'brightness(0.35)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, transparent 60%, #05050a 100%), linear-gradient(to top, #05050a 0%, transparent 30%)',
        }} />
        {/* Red glow */}
        <div style={{
          position: 'absolute', bottom: '15%', left: '30%',
          width: 400, height: 300,
          background: 'radial-gradient(ellipse, rgba(232,16,42,0.25) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }} aria-hidden="true" />

        {/* Branding overlay */}
        <div style={{ position: 'relative', zIndex: 2, padding: 48, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#e8102a,#ff4b5e)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 20px rgba(232,16,42,0.4)' }}>
              <FilmIcon />
            </div>
            <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.25rem', color: '#f0f0fa' }}>VX ShowMate<span style={{ color: '#e8102a' }}>X</span></span>
          </div>

          {/* Bottom quote */}
          <div>
            <p style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: 'clamp(1.5rem,3vw,2.2rem)', color: '#f0f0fa', lineHeight: 1.25, letterSpacing: '-0.03em', marginBottom: 16 }}>
              "The best movies are<br />better with company."
            </p>
            <p style={{ color: '#6b6b85', fontSize: '0.875rem' }}>— VX ShowMate</p>
          </div>
        </div>
      </div>

      {/* ── Right: Auth Panel ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
        position: 'relative',
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)',
          width: 400, height: 400,
          background: 'radial-gradient(ellipse, rgba(232,16,42,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} aria-hidden="true" />

        <div style={{
          width: '100%', maxWidth: 420,
          animation: 'slideUp 0.7s cubic-bezier(0.16,1,0.3,1) forwards',
          position: 'relative', zIndex: 1,
        }}>
          {/* Logo (mobile only) */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#e8102a,#ff4b5e)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <FilmIcon />
            </div>
            <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.125rem', color: '#f0f0fa' }}>VX ShowMate<span style={{ color: '#e8102a' }}>X</span></span>
          </div>

          {/* Header */}
          <div style={{ marginBottom: 36 }}>
            <h1 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '2rem', color: '#f0f0fa', letterSpacing: '-0.03em', marginBottom: 8 }}>
              Welcome back
            </h1>
            <p style={{ color: '#6b6b85', fontSize: '0.9375rem' }}>
              Sign in to find your next movie companion.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 12, padding: '12px 14px', marginBottom: 20,
              animation: 'scaleIn 0.3s ease forwards',
            }}>
              <PremiumIcon name="warning" size={18} color="#f87171" style={{ marginTop: 1 }} />
              <p style={{ color: '#f87171', fontSize: '0.875rem', lineHeight: 1.4 }}>{error}</p>
            </div>
          )}



          {/* Form */}
          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Email */}
            <div>
              <label htmlFor="login-email" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#a8a8c0', marginBottom: 8 }}>
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setEmailFocus(true)}
                onBlur={() => setEmailFocus(false)}
                required
                style={inputStyle(emailFocus)}
              />
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label htmlFor="login-password" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#a8a8c0' }}>
                  Password
                </label>
                <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: '#6b6b85', transition: 'color 150ms ease', textDecoration: 'none' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#e8102a'}
                  onMouseLeave={e => e.currentTarget.style.color = '#6b6b85'}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setPwdFocus(true)}
                  onBlur={() => setPwdFocus(false)}
                  required
                  style={{ ...inputStyle(pwdFocus), paddingRight: 48 }}
                />
                <button
                  type="button"
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPwd(v => !v)}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    color: '#6b6b85', background: 'none', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'color 150ms ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#a8a8c0'}
                  onMouseLeave={e => e.currentTarget.style.color = '#6b6b85'}
                >
                  <EyeIcon open={showPwd} />
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ marginTop: 8, width: '100%', padding: '14px', borderRadius: 14, fontSize: '0.9375rem', fontWeight: 700 }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Spinner size="sm" color="white" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ fontSize: '0.8rem', color: '#4a4a60', fontWeight: 500 }}>New to VX ShowMate?</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          </div>

          <Link
            to="/signup"
            style={{
              display: 'block', width: '100%', padding: '13px',
              borderRadius: 14, textAlign: 'center',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#f0f0fa', fontSize: '0.9375rem', fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 200ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          >
            Create a free account →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
