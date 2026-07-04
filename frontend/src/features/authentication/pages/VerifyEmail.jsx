import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import * as authService from '../../../services/authService';
import Spinner from '../../../shared/components/ui/Spinner';
import { PremiumIcon } from '../../../shared/components/icons/IconComponents';

const FilmIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/>
    <line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/>
    <line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/>
  </svg>
);

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const navigate = useNavigate();

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);

  const inputRefs = useRef([]);

  // Countdown timer for resending OTP
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer(t => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (index, value) => {
    // Only accept numeric inputs
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next field
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace back-focus
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pasteData)) return;

    const newOtp = pasteData.split('');
    setOtp(newOtp);
    inputRefs.current[5].focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      return setError('Please enter the full 6-digit verification code.');
    }

    setLoading(true);
    try {
      await authService.verifyEmail(email, otpCode);
      setSuccessMessage('Email verified successfully. Redirecting to Login page...');
      setTimeout(() => {
        navigate('/login', { state: { message: 'Email verified successfully. Please log in.' } });
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || resendLoading) return;
    setError('');
    setSuccessMessage('');
    setResendLoading(true);
    try {
      await authService.resendOTP(email);
      setSuccessMessage('Verification code resent successfully.');
      setTimer(60);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const otpComplete = otp.join('').length === 6;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#05050a', padding: '32px 24px',
    }}>
      {/* Ambient backgrounds */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }} aria-hidden="true">
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(232,16,42,0.06) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <div style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1, animation: 'slideUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#e8102a,#ff4b5e)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 20px rgba(232,16,42,0.4)' }}>
              <FilmIcon />
            </div>
            <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.2rem', color: '#f0f0fa' }}>PhilixMate</span>
          </div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24,
          padding: '40px 32px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
        }}>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.75rem', color: '#f0f0fa', letterSpacing: '-0.02em', marginBottom: 8, textAlign: 'center' }}>
            Verify Your Email
          </h2>
          <p style={{ color: '#6b6b85', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: 28, textAlign: 'center' }}>
            We've sent a 6-digit verification code to <strong style={{ color: '#f0f0fa' }}>{email}</strong>.
          </p>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '12px 14px', marginBottom: 24 }}>
              <PremiumIcon name="warning" size={18} color="#f87171" />
              <p style={{ color: '#f87171', fontSize: '0.85rem' }}>{error}</p>
            </div>
          )}

          {successMessage && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, padding: '12px 14px', marginBottom: 24 }}>
              <PremiumIcon name="check" size={18} color="#34d399" />
              <p style={{ color: '#34d399', fontSize: '0.85rem' }}>{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleVerify}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 32 }} onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={e => handleOtpChange(index, e.target.value)}
                  onKeyDown={e => handleKeyDown(index, e)}
                  style={{
                    width: 48,
                    height: 54,
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    color: '#f0f0fa',
                    outline: 'none',
                    transition: 'all 150ms ease',
                    boxShadow: 'none',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = '#e8102a';
                    e.target.style.boxShadow = '0 0 0 3px rgba(232,16,42,0.15)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              ))}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !otpComplete}
              style={{ width: '100%', padding: '14px', borderRadius: 12, fontWeight: 700, marginBottom: 20 }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Spinner size="sm" color="white" /> Verifying...
                </span>
              ) : 'Verify Code'}
            </button>
          </form>

          <div style={{ textAlign: 'center' }}>
            {timer > 0 ? (
              <p style={{ fontSize: '0.85rem', color: '#6b6b85' }}>
                Resend code in <strong style={{ color: '#ff6b7a' }}>{timer}s</strong>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resendLoading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#e8102a',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: 8,
                  transition: 'background 150ms ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(232,16,42,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                {resendLoading ? 'Resending...' : 'Resend Verification OTP'}
              </button>
            )}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Link to="/login" style={{ color: '#6b6b85', fontSize: '0.875rem', textDecoration: 'none', transition: 'color 150ms ease' }}
            onMouseEnter={e => e.currentTarget.style.color = '#a8a8c0'}
            onMouseLeave={e => e.currentTarget.style.color = '#6b6b85'}>
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
