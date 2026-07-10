import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/contexts/AuthContext';
import Spinner from '../../../shared/components/ui/Spinner';
import { PremiumIcon } from '../../../shared/components/icons/IconComponents';

const GENRES = [
  { icon: 'fire', name: 'Action' },
  { icon: 'comedy', name: 'Comedy' },
  { icon: 'drama', name: 'Drama' },
  { icon: 'horror', name: 'Horror' },
  { icon: 'romance', name: 'Romance' },
  { icon: 'rocket', name: 'Sci-Fi' },
  { icon: 'thriller', name: 'Thriller' },
  { icon: 'animation', name: 'Animation' },
  { icon: 'anime', name: 'Anime' },
  { icon: 'movie', name: 'Indie' },
];

const FilmIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/>
    <line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/>
    <line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/>
  </svg>
);

// Password strength calculator
const getStrength = (pwd) => {
  if (!pwd) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pwd.length >= 8)          score++;
  if (/[A-Z]/.test(pwd))        score++;
  if (/[0-9]/.test(pwd))        score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const map = [
    { label: '',          color: 'transparent' },
    { label: 'Weak',      color: '#ef4444' },
    { label: 'Fair',      color: '#f59e0b' },
    { label: 'Good',      color: '#3b82f6' },
    { label: 'Strong',    color: '#10b981' },
  ];
  return { score, ...map[score] };
};

const STEPS_CONFIG = [
  { id: 1, label: 'Your Info',     icon: 'user' },
  { id: 2, label: 'Movie Tastes',  icon: 'movie' },
  { id: 3, label: 'Security',      icon: 'lock' },
];

const inputStyle = (focused) => ({
  width: '100%',
  padding: '13px 16px',
  background: focused ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.4)',
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: focused ? '#e8102a' : 'rgba(255,255,255,0.1)',
  borderRadius: 12,
  color: '#f0f0fa',
  fontSize: '0.9375rem',
  fontFamily: 'Inter,sans-serif',
  outline: 'none',
  transition: 'all 200ms ease',
  boxShadow: focused ? '0 0 0 3px rgba(232,16,42,0.15)' : 'none',
});

const Signup = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', age: '', gender: '', password: '', confirmPassword: '' });
  const [genres, setGenres] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const toggleGenre  = (g)  => setGenres(p => p.includes(g) ? p.filter(x => x !== g) : [...p, g]);
  const setFocus     = (k, v) => setFocused(f => ({ ...f, [k]: v }));

  const validateStep = () => {
    setError('');
    if (step === 1) {
      if (!form.name.trim()) return setError('Full name is required.');
      if (!form.email.trim() || !form.email.includes('@')) return setError('A valid email is required.');
      if (!form.age || Number(form.age) < 16 || Number(form.age) > 100) return setError('Age must be between 16 and 100.');
      if (!form.gender) return setError('Please select your gender.');
    }
    if (step === 3) {
      if (!form.password || form.password.length < 6) return setError('Password must be at least 6 characters.');
      if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    }
    return true;
  };

  const nextStep = () => { if (validateStep()) setStep(s => s + 1); };
  const prevStep = () => { setError(''); setStep(s => s - 1); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    setLoading(true);
    try {
      const res = await signup({
        name: form.name,
        email: form.email,
        password: form.password,
        age: Number(form.age),
        gender: form.gender,
        favoriteGenres: genres,
      });
      if (res?.requiresVerification) {
        navigate(`/verify-email?email=${encodeURIComponent(form.email)}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const strength = getStrength(form.password);
  const progress = ((step - 1) / (STEPS_CONFIG.length - 1)) * 100;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#05050a', alignItems: 'center', justifyContent: 'center', padding: '80px 24px 40px' }}>
      {/* Background ambient */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }} aria-hidden="true">
        <div style={{ position: 'absolute', top: '20%', left: '10%', width: 500, height: 500, background: 'radial-gradient(ellipse, rgba(232,16,42,0.05) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: 400, height: 400, background: 'radial-gradient(ellipse, rgba(59,130,246,0.04) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <div style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <img 
              src="/logo.png" 
              alt="Logo" 
              style={{
                width: 56, 
                height: 56, 
                borderRadius: 14, 
                objectFit: 'cover', 
                boxShadow: '0 6px 24px rgba(0, 0, 0, 0.25)' 
              }} 
            />
            <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.6rem', color: '#f0f0fa', letterSpacing: '-0.02em' }}>PhilixMate</span>
          </div>

          {/* Step progress */}
          <div style={{ position: 'relative', height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 9999, marginBottom: 24, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg,#e8102a,#ff4b5e)', borderRadius: 9999, width: `${progress + 33}%`, transition: 'width 400ms cubic-bezier(0.16,1,0.3,1)' }} />
          </div>

          {/* Step indicators */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
            {STEPS_CONFIG.map(s => {
              const done = s.id < step;
              const active = s.id === step;
              return (
                <div key={s.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: done ? 'linear-gradient(135deg,#10b981,#34d399)' : active ? 'linear-gradient(135deg,#e8102a,#ff4b5e)' : 'rgba(255,255,255,0.06)',
                    border: `2px solid ${done ? '#10b981' : active ? '#e8102a' : 'rgba(255,255,255,0.1)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 300ms ease',
                    boxShadow: active ? '0 0 16px rgba(232,16,42,0.4)' : 'none',
                  }}>
                    {done ? (
                      <PremiumIcon name="check" size={16} color="white" />
                    ) : (
                      <PremiumIcon name={s.icon} size={16} color={active ? 'white' : '#6b6b85'} />
                    )}
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: active ? '#f0f0fa' : '#4a4a60', letterSpacing: '0.02em' }}>{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.09)', borderRadius: 24,
          padding: '32px 28px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
          animation: 'scaleIn 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
        }}>
          {/* Error */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12, padding: '12px 14px', marginBottom: 20 }}>
              <PremiumIcon name="warning" size={16} color="#f87171" style={{ flexShrink: 0 }} />
              <p style={{ color: '#f87171', fontSize: '0.875rem', lineHeight: 1.4 }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* ── STEP 1: Personal Info ── */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'slideRight 0.3s ease forwards' }}>
                <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#f0f0fa', letterSpacing: '-0.03em', marginBottom: 4 }}>
                  Create your account
                </h2>
                <p style={{ color: '#6b6b85', fontSize: '0.875rem', marginBottom: 8 }}>Tell us a bit about yourself.</p>

                <div>
                  <label htmlFor="su-name" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#a8a8c0', marginBottom: 7 }}>Full Name</label>
                  <input id="su-name" name="name" placeholder="Jane Doe" value={form.name} onChange={handleChange} onFocus={() => setFocus('name',true)} onBlur={() => setFocus('name',false)} style={inputStyle(focused.name)} required />
                </div>
                <div>
                  <label htmlFor="su-email" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#a8a8c0', marginBottom: 7 }}>Email Address</label>
                  <input id="su-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={handleChange} onFocus={() => setFocus('email',true)} onBlur={() => setFocus('email',false)} style={inputStyle(focused.email)} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label htmlFor="su-age" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#a8a8c0', marginBottom: 7 }}>Age</label>
                    <input id="su-age" name="age" type="number" min="16" max="100" placeholder="25" value={form.age} onChange={handleChange} onFocus={() => setFocus('age',true)} onBlur={() => setFocus('age',false)} style={inputStyle(focused.age)} required />
                  </div>
                  <div>
                    <label htmlFor="su-gender" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#a8a8c0', marginBottom: 7 }}>Gender</label>
                    <select id="su-gender" name="gender" value={form.gender} onChange={handleChange} onFocus={() => setFocus('gender',true)} onBlur={() => setFocus('gender',false)}
                      style={{ ...inputStyle(focused.gender), paddingRight: 36, appearance: 'none', cursor: 'pointer' }} required>
                      <option value="" disabled>Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2: Genre Preferences ── */}
            {step === 2 && (
              <div style={{ animation: 'slideRight 0.3s ease forwards' }}>
                <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#f0f0fa', letterSpacing: '-0.03em', marginBottom: 6 }}>
                  What do you love?
                </h2>
                <p style={{ color: '#6b6b85', fontSize: '0.875rem', marginBottom: 24 }}>
                  Pick your favorite genres. We'll use this to find you better matches. (optional)
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                  {GENRES.map(g => {
                    const sel = genres.includes(g.name);
                    return (
                      <button
                        key={g.name}
                        type="button"
                        onClick={() => toggleGenre(g.name)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '9px 16px', borderRadius: 9999,
                          border: `1px solid ${sel ? 'rgba(232,16,42,0.5)' : 'rgba(255,255,255,0.1)'}`,
                          background: sel ? 'rgba(232,16,42,0.15)' : 'rgba(255,255,255,0.04)',
                          color: sel ? '#ff6b7a' : '#a8a8c0',
                          fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                          transition: 'all 200ms ease',
                          boxShadow: sel ? '0 0 12px rgba(232,16,42,0.2)' : 'none',
                        }}
                      >
                        <PremiumIcon name={g.icon} size={16} color="currentColor" /> {g.name}
                      </button>
                    );
                  })}
                </div>
                <p style={{ fontSize: '0.78rem', color: '#4a4a60', marginTop: 12 }}>{genres.length} genre{genres.length !== 1 ? 's' : ''} selected</p>
              </div>
            )}

            {/* ── STEP 3: Password ── */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'slideRight 0.3s ease forwards' }}>
                <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#f0f0fa', letterSpacing: '-0.03em', marginBottom: 4 }}>
                  Secure your account
                </h2>
                <p style={{ color: '#6b6b85', fontSize: '0.875rem', marginBottom: 8 }}>Choose a strong password to protect your account.</p>

                <div>
                  <label htmlFor="su-pwd" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#a8a8c0', marginBottom: 7 }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input id="su-pwd" name="password" type={showPwd ? 'text' : 'password'} autoComplete="new-password" placeholder="At least 6 characters" minLength={6} value={form.password} onChange={handleChange} onFocus={() => setFocus('pwd',true)} onBlur={() => setFocus('pwd',false)} style={{ ...inputStyle(focused.pwd), paddingRight: 48 }} required />
                    <button type="button" onClick={() => setShowPwd(v=>!v)} style={{ position: 'absolute', right: 14, top:'50%', transform:'translateY(-50%)', color:'#6b6b85', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', transition:'color 150ms ease' }}
                      onMouseEnter={e=>e.currentTarget.style.color='#a8a8c0'} onMouseLeave={e=>e.currentTarget.style.color='#6b6b85'} aria-label="Toggle password visibility">
                      <PremiumIcon name={showPwd ? 'eye' : 'eye'} size={18} color="currentColor" />
                    </button>
                  </div>
                  {/* Strength meter */}
                  {form.password && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                        {[1,2,3,4].map(i => (
                          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength.score ? strength.color : 'rgba(255,255,255,0.08)', transition: 'background 300ms ease' }} />
                        ))}
                      </div>
                      <p style={{ fontSize: '0.75rem', color: strength.color, fontWeight: 600 }}>{strength.label}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="su-cpwd" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#a8a8c0', marginBottom: 7 }}>Confirm Password</label>
                  <input id="su-cpwd" name="confirmPassword" type="password" autoComplete="new-password" placeholder="Re-enter your password" value={form.confirmPassword} onChange={handleChange} onFocus={() => setFocus('cpwd',true)} onBlur={() => setFocus('cpwd',false)} style={{
                    ...inputStyle(focused.cpwd),
                    borderColor: form.confirmPassword && form.password !== form.confirmPassword ? '#ef4444' : focused.cpwd ? '#e8102a' : 'rgba(255,255,255,0.1)',
                  }} required />
                  {form.confirmPassword && form.password !== form.confirmPassword && (
                    <p style={{ fontSize: '0.78rem', color: '#f87171', marginTop: 6, fontWeight: 500 }}>Passwords don't match</p>
                  )}
                </div>
              </div>
            )}

            {/* ── Navigation buttons ── */}
            <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
              {step > 1 && (
                <button type="button" onClick={prevStep} className="btn btn-secondary" style={{ flex: '0 0 auto', padding: '13px 20px', borderRadius: 12 }}>
                  ← Back
                </button>
              )}
              {step < 3 ? (
                <button type="button" onClick={nextStep} className="btn btn-primary" style={{ flex: 1, padding: '13px', borderRadius: 12, fontWeight: 700 }}>
                  Continue →
                </button>
              ) : (
                <button type="submit" id="signup-submit-btn" className="btn btn-primary" disabled={loading} style={{ flex: 1, padding: '13px', borderRadius: 12, fontWeight: 700 }}>
                  {loading ? (
                    <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                      <Spinner size="sm" color="white" /> Creating account...
                    </span>
                  ) : 'Join PhilixMate'}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Sign in link */}
        <p style={{ textAlign: 'center', marginTop: 20, color: '#6b6b85', fontSize: '0.875rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#f0f0fa', fontWeight: 700, textDecoration: 'none', transition: 'color 150ms ease' }}
            onMouseEnter={e=>e.currentTarget.style.color='#e8102a'} onMouseLeave={e=>e.currentTarget.style.color='#f0f0fa'}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
        email: form.email,
        password: form.password,
        age: Number(form.age),
        gender: form.gender,
        favoriteGenres: genres,
      });
      if (res?.requiresVerification) {
        navigate(`/verify-email?email=${encodeURIComponent(form.email)}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const strength = getStrength(form.password);
  const progress = ((step - 1) / (STEPS_CONFIG.length - 1)) * 100;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#05050a', alignItems: 'center', justifyContent: 'center', padding: '80px 24px 40px' }}>
      {/* Background ambient */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }} aria-hidden="true">
        <div style={{ position: 'absolute', top: '20%', left: '10%', width: 500, height: 500, background: 'radial-gradient(ellipse, rgba(232,16,42,0.05) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: 400, height: 400, background: 'radial-gradient(ellipse, rgba(59,130,246,0.04) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <div style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <img 
              src="/logo.png" 
              alt="Logo" 
              style={{
                width: 56, 
                height: 56, 
                borderRadius: 14, 
                objectFit: 'cover', 
                boxShadow: '0 6px 24px rgba(0, 0, 0, 0.25)' 
              }} 
            />
            <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.6rem', color: '#f0f0fa', letterSpacing: '-0.02em' }}>PhilixMate</span>
          </div>

          {/* Step progress */}
          <div style={{ position: 'relative', height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 9999, marginBottom: 24, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg,#e8102a,#ff4b5e)', borderRadius: 9999, width: `${progress + 33}%`, transition: 'width 400ms cubic-bezier(0.16,1,0.3,1)' }} />
          </div>

          {/* Step indicators */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
            {STEPS_CONFIG.map(s => {
              const done = s.id < step;
              const active = s.id === step;
              return (
                <div key={s.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: done ? 'linear-gradient(135deg,#10b981,#34d399)' : active ? 'linear-gradient(135deg,#e8102a,#ff4b5e)' : 'rgba(255,255,255,0.06)',
                    border: `2px solid ${done ? '#10b981' : active ? '#e8102a' : 'rgba(255,255,255,0.1)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 300ms ease',
                    boxShadow: active ? '0 0 16px rgba(232,16,42,0.4)' : 'none',
                  }}>
                    {done ? (
                      <PremiumIcon name="check" size={16} color="white" />
                    ) : (
                      <PremiumIcon name={s.icon} size={16} color={active ? 'white' : '#6b6b85'} />
                    )}
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: active ? '#f0f0fa' : '#4a4a60', letterSpacing: '0.02em' }}>{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.09)', borderRadius: 24,
          padding: '32px 28px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
          animation: 'scaleIn 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
        }}>
          {/* Error */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12, padding: '12px 14px', marginBottom: 20 }}>
              <PremiumIcon name="warning" size={16} color="#f87171" style={{ flexShrink: 0 }} />
              <p style={{ color: '#f87171', fontSize: '0.875rem', lineHeight: 1.4 }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* ── STEP 1: Personal Info ── */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'slideRight 0.3s ease forwards' }}>
                <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#f0f0fa', letterSpacing: '-0.03em', marginBottom: 4 }}>
                  Create your account
                </h2>
                <p style={{ color: '#6b6b85', fontSize: '0.875rem', marginBottom: 8 }}>Tell us a bit about yourself.</p>

                <div>
                  <label htmlFor="su-name" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#a8a8c0', marginBottom: 7 }}>Full Name</label>
                  <input id="su-name" name="name" placeholder="Jane Doe" value={form.name} onChange={handleChange} onFocus={() => setFocus('name',true)} onBlur={() => setFocus('name',false)} style={inputStyle(focused.name)} required />
                </div>
                <div>
                  <label htmlFor="su-email" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#a8a8c0', marginBottom: 7 }}>Email Address</label>
                  <input id="su-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={handleChange} onFocus={() => setFocus('email',true)} onBlur={() => setFocus('email',false)} style={inputStyle(focused.email)} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label htmlFor="su-age" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#a8a8c0', marginBottom: 7 }}>Age</label>
                    <input id="su-age" name="age" type="number" min="18" max="100" placeholder="25" value={form.age} onChange={handleChange} onFocus={() => setFocus('age',true)} onBlur={() => setFocus('age',false)} style={inputStyle(focused.age)} required />
                  </div>
                  <div>
                    <label htmlFor="su-gender" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#a8a8c0', marginBottom: 7 }}>Gender</label>
                    <select id="su-gender" name="gender" value={form.gender} onChange={handleChange} onFocus={() => setFocus('gender',true)} onBlur={() => setFocus('gender',false)}
                      style={{ ...inputStyle(focused.gender), paddingRight: 36, appearance: 'none', cursor: 'pointer' }} required>
                      <option value="" disabled>Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2: Genre Preferences ── */}
            {step === 2 && (
              <div style={{ animation: 'slideRight 0.3s ease forwards' }}>
                <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#f0f0fa', letterSpacing: '-0.03em', marginBottom: 6 }}>
                  What do you love?
                </h2>
                <p style={{ color: '#6b6b85', fontSize: '0.875rem', marginBottom: 24 }}>
                  Pick your favorite genres. We'll use this to find you better matches. (optional)
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                  {GENRES.map(g => {
                    const sel = genres.includes(g.name);
                    return (
                      <button
                        key={g.name}
                        type="button"
                        onClick={() => toggleGenre(g.name)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '9px 16px', borderRadius: 9999,
                          border: `1px solid ${sel ? 'rgba(232,16,42,0.5)' : 'rgba(255,255,255,0.1)'}`,
                          background: sel ? 'rgba(232,16,42,0.15)' : 'rgba(255,255,255,0.04)',
                          color: sel ? '#ff6b7a' : '#a8a8c0',
                          fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                          transition: 'all 200ms ease',
                          boxShadow: sel ? '0 0 12px rgba(232,16,42,0.2)' : 'none',
                        }}
                      >
                        <PremiumIcon name={g.icon} size={16} color="currentColor" /> {g.name}
                      </button>
                    );
                  })}
                </div>
                <p style={{ fontSize: '0.78rem', color: '#4a4a60', marginTop: 12 }}>{genres.length} genre{genres.length !== 1 ? 's' : ''} selected</p>
              </div>
            )}

            {/* ── STEP 3: Password ── */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'slideRight 0.3s ease forwards' }}>
                <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#f0f0fa', letterSpacing: '-0.03em', marginBottom: 4 }}>
                  Secure your account
                </h2>
                <p style={{ color: '#6b6b85', fontSize: '0.875rem', marginBottom: 8 }}>Choose a strong password to protect your account.</p>

                <div>
                  <label htmlFor="su-pwd" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#a8a8c0', marginBottom: 7 }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input id="su-pwd" name="password" type={showPwd ? 'text' : 'password'} autoComplete="new-password" placeholder="At least 6 characters" minLength={6} value={form.password} onChange={handleChange} onFocus={() => setFocus('pwd',true)} onBlur={() => setFocus('pwd',false)} style={{ ...inputStyle(focused.pwd), paddingRight: 48 }} required />
                    <button type="button" onClick={() => setShowPwd(v=>!v)} style={{ position: 'absolute', right: 14, top:'50%', transform:'translateY(-50%)', color:'#6b6b85', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', transition:'color 150ms ease' }}
                      onMouseEnter={e=>e.currentTarget.style.color='#a8a8c0'} onMouseLeave={e=>e.currentTarget.style.color='#6b6b85'} aria-label="Toggle password visibility">
                      <PremiumIcon name={showPwd ? 'eye' : 'eye'} size={18} color="currentColor" />
                    </button>
                  </div>
                  {/* Strength meter */}
                  {form.password && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                        {[1,2,3,4].map(i => (
                          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength.score ? strength.color : 'rgba(255,255,255,0.08)', transition: 'background 300ms ease' }} />
                        ))}
                      </div>
                      <p style={{ fontSize: '0.75rem', color: strength.color, fontWeight: 600 }}>{strength.label}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="su-cpwd" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#a8a8c0', marginBottom: 7 }}>Confirm Password</label>
                  <input id="su-cpwd" name="confirmPassword" type="password" autoComplete="new-password" placeholder="Re-enter your password" value={form.confirmPassword} onChange={handleChange} onFocus={() => setFocus('cpwd',true)} onBlur={() => setFocus('cpwd',false)} style={{
                    ...inputStyle(focused.cpwd),
                    borderColor: form.confirmPassword && form.password !== form.confirmPassword ? '#ef4444' : focused.cpwd ? '#e8102a' : 'rgba(255,255,255,0.1)',
                  }} required />
                  {form.confirmPassword && form.password !== form.confirmPassword && (
                    <p style={{ fontSize: '0.78rem', color: '#f87171', marginTop: 6, fontWeight: 500 }}>Passwords don't match</p>
                  )}
                </div>
              </div>
            )}

            {/* ── Navigation buttons ── */}
            <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
              {step > 1 && (
                <button type="button" onClick={prevStep} className="btn btn-secondary" style={{ flex: '0 0 auto', padding: '13px 20px', borderRadius: 12 }}>
                  ← Back
                </button>
              )}
              {step < 3 ? (
                <button type="button" onClick={nextStep} className="btn btn-primary" style={{ flex: 1, padding: '13px', borderRadius: 12, fontWeight: 700 }}>
                  Continue →
                </button>
              ) : (
                <button type="submit" id="signup-submit-btn" className="btn btn-primary" disabled={loading} style={{ flex: 1, padding: '13px', borderRadius: 12, fontWeight: 700 }}>
                  {loading ? (
                    <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                      <Spinner size="sm" color="white" /> Creating account...
                    </span>
                  ) : 'Join PhilixMate'}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Sign in link */}
        <p style={{ textAlign: 'center', marginTop: 20, color: '#6b6b85', fontSize: '0.875rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#f0f0fa', fontWeight: 700, textDecoration: 'none', transition: 'color 150ms ease' }}
            onMouseEnter={e=>e.currentTarget.style.color='#e8102a'} onMouseLeave={e=>e.currentTarget.style.color='#f0f0fa'}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
    e.preventDefault();
    if (!validateStep()) return;
    setLoading(true);
    try {
      const res = await signup({
        name: form.name,
        email: form.email,
        password: form.password,
        age: Number(form.age),
        gender: form.gender,
        favoriteGenres: genres,
      });
      if (res?.requiresVerification) {
        navigate(`/verify-email?email=${encodeURIComponent(form.email)}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const strength = getStrength(form.password);
  const progress = ((step - 1) / (STEPS_CONFIG.length - 1)) * 100;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#05050a', alignItems: 'center', justifyContent: 'center', padding: '80px 24px 40px' }}>
      {/* Background ambient */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }} aria-hidden="true">
        <div style={{ position: 'absolute', top: '20%', left: '10%', width: 500, height: 500, background: 'radial-gradient(ellipse, rgba(232,16,42,0.05) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: 400, height: 400, background: 'radial-gradient(ellipse, rgba(59,130,246,0.04) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <div style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <img 
              src="/logo.png" 
              alt="Logo" 
              style={{
                width: 56, 
                height: 56, 
                borderRadius: 14, 
                objectFit: 'cover', 
                boxShadow: '0 6px 24px rgba(0, 0, 0, 0.25)' 
              }} 
            />
            <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.6rem', color: '#f0f0fa', letterSpacing: '-0.02em' }}>PhilixMate</span>
          </div>

          {/* Step progress */}
          <div style={{ position: 'relative', height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 9999, marginBottom: 24, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg,#e8102a,#ff4b5e)', borderRadius: 9999, width: `${progress + 33}%`, transition: 'width 400ms cubic-bezier(0.16,1,0.3,1)' }} />
          </div>

          {/* Step indicators */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
            {STEPS_CONFIG.map(s => {
              const done = s.id < step;
              const active = s.id === step;
              return (
                <div key={s.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: done ? 'linear-gradient(135deg,#10b981,#34d399)' : active ? 'linear-gradient(135deg,#e8102a,#ff4b5e)' : 'rgba(255,255,255,0.06)',
                    border: `2px solid ${done ? '#10b981' : active ? '#e8102a' : 'rgba(255,255,255,0.1)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 300ms ease',
                    boxShadow: active ? '0 0 16px rgba(232,16,42,0.4)' : 'none',
                  }}>
                    {done ? (
                      <PremiumIcon name="check" size={16} color="white" />
                    ) : (
                      <PremiumIcon name={s.icon} size={16} color={active ? 'white' : '#6b6b85'} />
                    )}
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: active ? '#f0f0fa' : '#4a4a60', letterSpacing: '0.02em' }}>{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.09)', borderRadius: 24,
          padding: '32px 28px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
          animation: 'scaleIn 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
        }}>
          {/* Error */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12, padding: '12px 14px', marginBottom: 20 }}>
              <PremiumIcon name="warning" size={16} color="#f87171" style={{ flexShrink: 0 }} />
              <p style={{ color: '#f87171', fontSize: '0.875rem', lineHeight: 1.4 }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* ── STEP 1: Personal Info ── */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'slideRight 0.3s ease forwards' }}>
                <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#f0f0fa', letterSpacing: '-0.03em', marginBottom: 4 }}>
                  Create your account
                </h2>
                <p style={{ color: '#6b6b85', fontSize: '0.875rem', marginBottom: 8 }}>Tell us a bit about yourself.</p>

                <div>
                  <label htmlFor="su-name" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#a8a8c0', marginBottom: 7 }}>Full Name</label>
                  <input id="su-name" name="name" placeholder="Jane Doe" value={form.name} onChange={handleChange} onFocus={() => setFocus('name',true)} onBlur={() => setFocus('name',false)} style={inputStyle(focused.name)} required />
                </div>
                <div>
                  <label htmlFor="su-email" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#a8a8c0', marginBottom: 7 }}>Email Address</label>
                  <input id="su-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={handleChange} onFocus={() => setFocus('email',true)} onBlur={() => setFocus('email',false)} style={inputStyle(focused.email)} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label htmlFor="su-age" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#a8a8c0', marginBottom: 7 }}>Age</label>
                    <input id="su-age" name="age" type="number" min="18" max="100" placeholder="25" value={form.age} onChange={handleChange} onFocus={() => setFocus('age',true)} onBlur={() => setFocus('age',false)} style={inputStyle(focused.age)} required />
                  </div>
                  <div>
                    <label htmlFor="su-gender" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#a8a8c0', marginBottom: 7 }}>Gender</label>
                    <select id="su-gender" name="gender" value={form.gender} onChange={handleChange} onFocus={() => setFocus('gender',true)} onBlur={() => setFocus('gender',false)}
                      style={{ ...inputStyle(focused.gender), paddingRight: 36, appearance: 'none', cursor: 'pointer' }} required>
                      <option value="" disabled>Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2: Genre Preferences ── */}
            {step === 2 && (
              <div style={{ animation: 'slideRight 0.3s ease forwards' }}>
                <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#f0f0fa', letterSpacing: '-0.03em', marginBottom: 6 }}>
                  What do you love?
                </h2>
                <p style={{ color: '#6b6b85', fontSize: '0.875rem', marginBottom: 24 }}>
                  Pick your favorite genres. We'll use this to find you better matches. (optional)
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                  {GENRES.map(g => {
                    const sel = genres.includes(g.name);
                    return (
                      <button
                        key={g.name}
                        type="button"
                        onClick={() => toggleGenre(g.name)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '9px 16px', borderRadius: 9999,
                          border: `1px solid ${sel ? 'rgba(232,16,42,0.5)' : 'rgba(255,255,255,0.1)'}`,
                          background: sel ? 'rgba(232,16,42,0.15)' : 'rgba(255,255,255,0.04)',
                          color: sel ? '#ff6b7a' : '#a8a8c0',
                          fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                          transition: 'all 200ms ease',
                          boxShadow: sel ? '0 0 12px rgba(232,16,42,0.2)' : 'none',
                        }}
                      >
                        <PremiumIcon name={g.icon} size={16} color="currentColor" /> {g.name}
                      </button>
                    );
                  })}
                </div>
                <p style={{ fontSize: '0.78rem', color: '#4a4a60', marginTop: 12 }}>{genres.length} genre{genres.length !== 1 ? 's' : ''} selected</p>
              </div>
            )}

            {/* ── STEP 3: Password ── */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'slideRight 0.3s ease forwards' }}>
                <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#f0f0fa', letterSpacing: '-0.03em', marginBottom: 4 }}>
                  Secure your account
                </h2>
                <p style={{ color: '#6b6b85', fontSize: '0.875rem', marginBottom: 8 }}>Choose a strong password to protect your account.</p>

                <div>
                  <label htmlFor="su-pwd" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#a8a8c0', marginBottom: 7 }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input id="su-pwd" name="password" type={showPwd ? 'text' : 'password'} autoComplete="new-password" placeholder="At least 6 characters" minLength={6} value={form.password} onChange={handleChange} onFocus={() => setFocus('pwd',true)} onBlur={() => setFocus('pwd',false)} style={{ ...inputStyle(focused.pwd), paddingRight: 48 }} required />
                    <button type="button" onClick={() => setShowPwd(v=>!v)} style={{ position: 'absolute', right: 14, top:'50%', transform:'translateY(-50%)', color:'#6b6b85', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', transition:'color 150ms ease' }}
                      onMouseEnter={e=>e.currentTarget.style.color='#a8a8c0'} onMouseLeave={e=>e.currentTarget.style.color='#6b6b85'} aria-label="Toggle password visibility">
                      <PremiumIcon name={showPwd ? 'eye' : 'eye'} size={18} color="currentColor" />
                    </button>
                  </div>
                  {/* Strength meter */}
                  {form.password && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                        {[1,2,3,4].map(i => (
                          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength.score ? strength.color : 'rgba(255,255,255,0.08)', transition: 'background 300ms ease' }} />
                        ))}
                      </div>
                      <p style={{ fontSize: '0.75rem', color: strength.color, fontWeight: 600 }}>{strength.label}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="su-cpwd" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#a8a8c0', marginBottom: 7 }}>Confirm Password</label>
                  <input id="su-cpwd" name="confirmPassword" type="password" autoComplete="new-password" placeholder="Re-enter your password" value={form.confirmPassword} onChange={handleChange} onFocus={() => setFocus('cpwd',true)} onBlur={() => setFocus('cpwd',false)} style={{
                    ...inputStyle(focused.cpwd),
                    borderColor: form.confirmPassword && form.password !== form.confirmPassword ? '#ef4444' : focused.cpwd ? '#e8102a' : 'rgba(255,255,255,0.1)',
                  }} required />
                  {form.confirmPassword && form.password !== form.confirmPassword && (
                    <p style={{ fontSize: '0.78rem', color: '#f87171', marginTop: 6, fontWeight: 500 }}>Passwords don't match</p>
                  )}
                </div>
              </div>
            )}

            {/* ── Navigation buttons ── */}
            <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
              {step > 1 && (
                <button type="button" onClick={prevStep} className="btn btn-secondary" style={{ flex: '0 0 auto', padding: '13px 20px', borderRadius: 12 }}>
                  ← Back
                </button>
              )}
              {step < 3 ? (
                <button type="button" onClick={nextStep} className="btn btn-primary" style={{ flex: 1, padding: '13px', borderRadius: 12, fontWeight: 700 }}>
                  Continue →
                </button>
              ) : (
                <button type="submit" id="signup-submit-btn" className="btn btn-primary" disabled={loading} style={{ flex: 1, padding: '13px', borderRadius: 12, fontWeight: 700 }}>
                  {loading ? (
                    <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                      <Spinner size="sm" color="white" /> Creating account...
                    </span>
                  ) : 'Join PhilixMate'}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Sign in link */}
        <p style={{ textAlign: 'center', marginTop: 20, color: '#6b6b85', fontSize: '0.875rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#f0f0fa', fontWeight: 700, textDecoration: 'none', transition: 'color 150ms ease' }}
            onMouseEnter={e=>e.currentTarget.style.color='#e8102a'} onMouseLeave={e=>e.currentTarget.style.color='#f0f0fa'}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
