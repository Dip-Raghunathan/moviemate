import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import * as authService from '../../../services/authService';
import Spinner from '../../../shared/components/ui/Spinner';
import { PremiumIcon } from '../../../shared/components/icons/IconComponents';

const getStrength = (pwd) => {
  if (!pwd) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const map = [
    { label: '', color: 'transparent' },
    { label: 'Weak', color: '#ef4444' },
    { label: 'Fair', color: '#f59e0b' },
    { label: 'Good', color: '#3b82f6' },
    { label: 'Strong', color: '#10b981' },
  ];
  return { score, ...map[score] };
};

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail]       = useState(emailParam);
  const [otp, setOtp]           = useState('');
  const [password,      setPwd] = useState('');
  const [confirmPwd, setConf]   = useState('');
  const [error,      setError]  = useState('');
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [fp, setFp]             = useState({});
  const navigate = useNavigate();

  const strength = getStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) return setError('Email address is required.');
    if (!otp || otp.length !== 6) return setError('Please enter the 6-digit reset code.');
    if (password !== confirmPwd) return setError('Passwords do not match.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');

    setLoading(true);
    try {
      await authService.resetPasswordWithOTP(email, otp, password);
      setSuccess(true);
      setTimeout(() => navigate('/login', { state: { message: 'Password reset successful. Please log in.' } }), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please verify the code.');
    } finally {
      setLoading(false);
    }
  };

  const iStyle = (k) => ({
    width: '100%', padding: '13px 16px',
    background: fp[k] ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.4)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: fp[k] ? '#e8102a' : 'rgba(255,255,255,0.1)',
    borderRadius: 12, color: '#f0f0fa', fontSize: '0.9375rem',
    fontFamily: 'Inter,sans-serif', outline: 'none', transition: 'all 200ms ease',
    boxShadow: fp[k] ? '0 0 0 3px rgba(232,16,42,0.15)' : 'none',
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#05050a', padding: '32px 24px' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }} aria-hidden="true">
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(232,16,42,0.06) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1, animation: 'slideUp 0.7s cubic-bezier(0.16,1,0.3,1) forwards' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link to="/" style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.25rem', color: '#f0f0fa', textDecoration: 'none' }}>
            PhilixMate
          </Link>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 24, padding: '36px 28px', boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}>
          {success ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: 16, animation: 'scaleIn 0.5s cubic-bezier(0.16,1,0.3,1)', display: 'flex', justifyContent: 'center' }}>
                <PremiumIcon name="check" size={48} color="#10b981" />
              </div>
              <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#f0f0fa', letterSpacing: '-0.03em', marginBottom: 12 }}>Password reset!</h2>
              <p style={{ color: '#6b6b85', fontSize: '0.9rem', lineHeight: 1.6 }}>Redirecting you to login page...</p>
              <Spinner style={{ margin: '20px auto 0' }} />
            </div>
          ) : (
            <>
              <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.75rem', color: '#f0f0fa', letterSpacing: '-0.03em', marginBottom: 8 }}>
                Set new password
              </h2>
              <p style={{ color: '#6b6b85', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 28 }}>
                Enter the OTP reset code and choose a new password.
              </p>

              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12, padding: '12px 14px', marginBottom: 20 }}>
                  <PremiumIcon name="warning" size={18} color="#f87171" />
                  <p style={{ color: '#f87171', fontSize: '0.875rem' }}>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label htmlFor="rp-email" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#a8a8c0', marginBottom: 7 }}>Email Address</label>
                  <input id="rp-email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} onFocus={() => setFp(f=>({...f,email:true}))} onBlur={() => setFp(f=>({...f,email:false}))} style={iStyle('email')} required />
                </div>
                <div>
                  <label htmlFor="rp-otp" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#a8a8c0', marginBottom: 7 }}>Verification OTP Code</label>
                  <input id="rp-otp" type="text" maxLength="6" placeholder="Enter 6-digit code" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} onFocus={() => setFp(f=>({...f,otp:true}))} onBlur={() => setFp(f=>({...f,otp:false}))} style={iStyle('otp')} required />
                </div>
                <div>
                  <label htmlFor="rp-pwd" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#a8a8c0', marginBottom: 7 }}>New Password</label>
                  <input id="rp-pwd" type="password" autoComplete="new-password" placeholder="At least 6 characters" minLength={6} value={password} onChange={e => setPwd(e.target.value)} onFocus={() => setFp(f=>({...f,pwd:true}))} onBlur={() => setFp(f=>({...f,pwd:false}))} style={iStyle('pwd')} required />
                  {password && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                        {[1,2,3,4].map(i => <div key={i} style={{ flex:1, height:3, borderRadius:2, background: i<=strength.score ? strength.color : 'rgba(255,255,255,0.08)', transition:'background 300ms ease' }} />)}
                      </div>
                      <p style={{ fontSize:'0.75rem', color:strength.color, fontWeight:600 }}>{strength.label}</p>
                    </div>
                  )}
                </div>
                <div>
                  <label htmlFor="rp-cpwd" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#a8a8c0', marginBottom: 7 }}>Confirm New Password</label>
                  <input id="rp-cpwd" type="password" autoComplete="new-password" placeholder="Re-enter your password" value={confirmPwd} onChange={e => setConf(e.target.value)} onFocus={() => setFp(f=>({...f,cpwd:true}))} onBlur={() => setFp(f=>({...f,cpwd:false}))}
                    style={{ ...iStyle('cpwd'), borderColor: confirmPwd && password !== confirmPwd ? '#ef4444' : fp.cpwd ? '#e8102a' : 'rgba(255,255,255,0.1)' }} required />
                  {confirmPwd && password !== confirmPwd && <p style={{ fontSize: '0.78rem', color: '#f87171', marginTop: 6, fontWeight: 500 }}>Passwords don't match</p>}
                </div>
                <button type="submit" id="rp-submit-btn" className="btn btn-primary" disabled={loading} style={{ marginTop: 8, width: '100%', padding: '13px', borderRadius: 12, fontWeight: 700 }}>
                  {loading ? <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}><Spinner size="sm" color="white" /> Resetting...</span> : 'Reset Password'}
                </button>
              </form>
            </>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to="/login" style={{ color: '#6b6b85', fontSize: '0.875rem', textDecoration: 'none', transition: 'color 150ms ease' }}
            onMouseEnter={e=>e.currentTarget.style.color='#a8a8c0'} onMouseLeave={e=>e.currentTarget.style.color='#6b6b85'}>
            ← Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
