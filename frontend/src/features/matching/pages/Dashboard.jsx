import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../../shared/components/Navbar';
import { useAuth } from '../../../core/contexts/AuthContext';
import * as roomService from '../../../services/roomService';
import * as feedService from '../../../services/feedService';
import * as engagementService from '../../../services/engagementService';
import Toggle from '../../../shared/components/ui/Toggle';
import Spinner from '../../../shared/components/ui/Spinner';
import Badge from '../../../shared/components/ui/Badge';
import ActivityFeed from '../../feed/components/ActivityFeed';
import { PremiumIcon } from '../../../shared/components/icons/IconComponents';

const GENRE_ICONS = {
  Action: 'fire', Comedy: 'comedy', Drama: 'drama', Horror: 'horror',
  Romance: 'romance', 'Sci-Fi': 'rocket', Thriller: 'thriller', Animation: 'animation',
  Anime: 'anime', Indie: 'movie',
};

// ── Field Input ───────────────────────────────────────────────────────────────
const Field = ({ label, icon, children }) => (
  <div>
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', fontWeight: 700, color: '#6b6b85', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
      {icon && <PremiumIcon name={icon} size={16} color="#6b6b85" />}
      {label}
    </label>
    {children}
  </div>
);

// ── Segment Control ───────────────────────────────────────────────────────────
const SegmentControl = ({ options, value, onChange }) => (
  <div style={{ display: 'flex', gap: 8 }}>
    {options.map(opt => {
      const active = value === opt.value;
      return (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          style={{
            flex: 1, padding: '11px 12px',
            borderRadius: 12,
            border: `1px solid ${active ? 'rgba(232,16,42,0.5)' : 'rgba(255,255,255,0.1)'}`,
            background: active ? 'rgba(232,16,42,0.15)' : 'rgba(255,255,255,0.04)',
            color: active ? '#ff6b7a' : '#6b6b85',
            fontSize: '0.875rem', fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 200ms ease',
            boxShadow: active ? '0 0 16px rgba(232,16,42,0.2)' : 'none',
          }}
          onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#a8a8c0'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; }}}
          onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#6b6b85'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}}
        >
          {opt.icon && <span style={{ marginRight: 6 }}>{opt.icon}</span>}
          {opt.label}
        </button>
      );
    })}
  </div>
);

// ── Ticket Preview ────────────────────────────────────────────────────────────
const TicketPreview = ({ form, matchType, intent, womenOnly, showWomenOnly }) => {
  const hasData = form.movie || form.cinema;
  return (
    <div style={{
      position: 'relative',
      background: 'linear-gradient(145deg, rgba(232,16,42,0.12) 0%, rgba(14,14,28,0.98) 40%, rgba(245,166,35,0.06) 100%)',
      border: '1px solid rgba(232,16,42,0.25)',
      borderRadius: 24,
      padding: '0',
      overflow: 'hidden',
      boxShadow: '0 8px 40px rgba(0,0,0,0.5), inset 0 0 40px rgba(232,16,42,0.04)',
    }}>
      {/* Shimmer overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.02) 50%, transparent 60%)', backgroundSize: '200% 100%', animation: 'shimmer 4s ease-in-out infinite', pointerEvents: 'none' }} aria-hidden="true" />

      {/* Ticket top */}
      <div style={{ padding: '28px 28px 20px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1rem', color: '#e8102a', letterSpacing: '-0.01em' }}>
            PhilixMate
          </span>
          <span style={{ fontSize: '0.7rem', color: '#4a4a60', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            ADMISSION TICKET
          </span>
        </div>

        {/* Movie title */}
        <h3 style={{
          fontFamily: 'Outfit,sans-serif', fontWeight: 900,
          fontSize: hasData ? (form.movie?.length > 20 ? '1.4rem' : '1.8rem') : '1.8rem',
          color: form.movie ? '#f0f0fa' : 'rgba(240,240,250,0.2)',
          letterSpacing: '-0.03em', lineHeight: 1.1,
          marginBottom: 6, transition: 'all 300ms ease',
        }}>
          {form.movie || 'Your Movie'}
        </h3>
        <p style={{ color: form.cinema ? '#a8a8c0' : 'rgba(168,168,192,0.3)', fontSize: '0.9rem', transition: 'all 300ms ease', display: 'flex', alignItems: 'center', gap: 6 }}>
          <PremiumIcon name="location" size={16} color="currentColor" />
          {form.cinema || 'Cinema Hall'}
        </p>
      </div>

      {/* Perforated divider */}
      <div style={{ display: 'flex', alignItems: 'center', margin: '0 0', position: 'relative', padding: '0 -12px' }}>
        <div style={{ position: 'absolute', left: -14, width: 28, height: 28, borderRadius: '50%', background: '#0d0d1a' }} />
        <div style={{ flex: 1, height: 1, backgroundImage: 'repeating-linear-gradient(to right, rgba(255,255,255,0.12) 0, rgba(255,255,255,0.12) 6px, transparent 6px, transparent 12px)', margin: '0 14px' }} />
        <div style={{ position: 'absolute', right: -14, width: 28, height: 28, borderRadius: '50%', background: '#0d0d1a' }} />
      </div>

      {/* Ticket details */}
      <div style={{ padding: '20px 28px 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px', marginBottom: 20 }}>
          {[
            { label: 'DATE',       val: form.date || '—',             icon: 'calendar' },
            { label: 'TIME',       val: form.time || '—',             icon: 'clock' },
            { label: 'MATCH TYPE', val: matchType === 'solo' ? 'Solo (2)' : 'Group (4)', icon: matchType === 'solo' ? 'user' : 'group' },
            { label: 'INTENT',     val: matchType === 'solo' ? intent : 'Friendship',    icon: intent === 'date' ? 'romance' : 'movie' },
          ].map(({ label, val, icon }) => (
            <div key={label}>
              <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#4a4a60', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>{label}</p>
              <p style={{ fontSize: '0.9rem', fontWeight: 700, color: val === '—' ? '#35354a' : '#f0f0fa', transition: 'all 200ms ease', display: 'flex', alignItems: 'center', gap: 6 }}>
                <PremiumIcon name={icon} size={16} color="currentColor" /> {val}
              </p>
            </div>
          ))}
        </div>

        {showWomenOnly && womenOnly && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'rgba(232,16,42,0.1)', borderRadius: 8, marginBottom: 16 }}>
            <PremiumIcon name="user" size={16} color="#ff6b7a" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ff6b7a' }}>Women-Only Safety Mode</span>
          </div>
        )}

        {/* Barcode */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginTop: 8 }}>
          <div style={{ display: 'flex', gap: 1.5, height: 32 }}>
            {Array.from({ length: 42 }, (_, i) => (
              <div key={i} style={{
                width: i % 3 === 0 ? 3 : 1.5,
                height: i % 5 === 0 ? '100%' : `${60 + Math.sin(i) * 30}%`,
                background: 'rgba(255,255,255,0.15)',
                borderRadius: 1,
                alignSelf: 'flex-end',
              }} />
            ))}
          </div>
          <p style={{ fontSize: '0.6rem', color: '#4a4a60', letterSpacing: '0.2em', fontFamily: 'JetBrains Mono, monospace', fontWeight: 500 }}>
            MMX-{Math.random().toString(36).slice(2,6).toUpperCase()}-2026
          </p>
        </div>
      </div>
    </div>
  );
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();

  const [form,      setForm]      = useState({ movie: state?.movie || '', cinema: '', date: '', time: '' });
  const [matchType, setMatchType] = useState('solo');
  const [intent,    setIntent]    = useState('friendship');
  const [womenOnly, setWomenOnly] = useState(false);
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);

  const [recommendations, setRecommendations] = useState(null);
  const [stats, setStats] = useState(null);
  const [recLoading, setRecLoading] = useState(true);

  const [vacantRooms, setVacantRooms] = useState([]);
  const [vacantLoading, setVacantLoading] = useState(true);

  const fetchIntelAndVacant = async () => {
    try {
      const recRes = await feedService.getPersonalizedRecommendations();
      if (recRes.data) {
        setRecommendations(recRes.data);
      }
      const statsRes = await engagementService.getEngagementStats();
      if (statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard intelligence elements:', err);
    } finally {
      setRecLoading(false);
    }

    try {
      const vRes = await roomService.getVacantRooms();
      if (vRes.rooms) {
        setVacantRooms(vRes.rooms);
      }
    } catch (err) {
      console.error('Failed to load vacant match sessions:', err);
    } finally {
      setVacantLoading(false);
    }
  };

  useEffect(() => {
    fetchIntelAndVacant();
  }, []);

  const isFemale = user?.gender === 'female';
  const showWomenOnlyToggle = isFemale && matchType === 'solo' && intent === 'friendship';

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleMatchTypeChange = (type) => {
    setMatchType(type);
    if (type === 'group') setIntent('friendship');
  };

  const handleStartMatch = async () => {
    setError('');
    if (!form.movie || !form.cinema || !form.date || !form.time) {
      setError('Please fill in all show details before finding a match.');
      return;
    }
    setLoading(true);
    try {
      const { room } = await roomService.startMatch({
        ...form,
        matchType,
        intent: matchType === 'group' ? 'friendship' : intent,
        womenOnly: showWomenOnlyToggle ? womenOnly : false,
      });
      navigate('/events');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start matching. Please try again.');
      setLoading(false);
    }
  };

  const handleJoinVacantRoom = async (roomId) => {
    setError('');
    setLoading(true);
    try {
      const res = await roomService.joinRoom(roomId);
      navigate('/events');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not join vacant session. Please try again.');
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px',
    background: 'rgba(0,0,0,0.4)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12, color: '#f0f0fa',
    fontSize: '0.9375rem', fontFamily: 'Inter,sans-serif',
    outline: 'none',
    transition: 'all 200ms ease',
  };

  const inputFocusHandlers = {
    onFocus: e => { e.target.style.borderColor = '#e8102a'; e.target.style.boxShadow = '0 0 0 3px rgba(232,16,42,0.15)'; e.target.style.background = 'rgba(0,0,0,0.55)'; },
    onBlur:  e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; e.target.style.background = 'rgba(0,0,0,0.4)'; },
  };

  return (
    <div style={{ background: '#05050a', minHeight: '100vh', color: '#f0f0fa' }}>
      <Navbar />

      {/* Background ambient */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }} aria-hidden="true">
        <div style={{ position: 'absolute', top: '20%', left: '5%', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(232,16,42,0.06) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '5%', width: 500, height: 400, background: 'radial-gradient(ellipse, rgba(59,130,246,0.04) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <div className="section-container" style={{ paddingTop: 104, paddingBottom: 64, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ marginBottom: 36, animation: 'slideUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards' }}>
          <p style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.12em', color: '#e8102a', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <PremiumIcon name="movie" size={18} color="#e8102a" />
            Ready to match?
          </p>
          <h1 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: 'clamp(1.75rem,4vw,2.5rem)', color: '#f0f0fa', letterSpacing: '-0.03em' }}>
            Find Your Perfect Cinema Companion
          </h1>
          {user && (
            <p style={{ color: '#6b6b85', fontSize: '0.9375rem', marginTop: 8 }}>
              Welcome back, <span style={{ color: '#a8a8c0', fontWeight: 600 }}>{user.name?.split(' ')[0]}</span>. Let's find your match.
            </p>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24, alignItems: 'start' }}>
          {/* ── Left: Form ── */}
          <div
            style={{
              background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.09)', borderRadius: 24,
              padding: '28px',
              boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
              animation: 'slideUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s both',
            }}
          >
            <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.25rem', color: '#f0f0fa', marginBottom: 24, letterSpacing: '-0.02em' }}>
              Show Details
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <Field label="Movie" icon="movie">
                <input name="movie" placeholder="e.g. Dune: Part Two" value={form.movie} onChange={handleChange} style={inputStyle} {...inputFocusHandlers} />
              </Field>
              <Field label="Cinema" icon="location">
                <input name="cinema" placeholder="e.g. IMAX Cineplex" value={form.cinema} onChange={handleChange} style={inputStyle} {...inputFocusHandlers} />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Date" icon="calendar">
                  <input type="date" name="date" value={form.date} onChange={handleChange} style={inputStyle} {...inputFocusHandlers} />
                </Field>
                <Field label="Time" icon="clock">
                  <input type="time" name="time" value={form.time} onChange={handleChange} style={inputStyle} {...inputFocusHandlers} />
                </Field>
              </div>

              <Field label="Match Type" icon="group">
                <SegmentControl
                  value={matchType}
                  onChange={handleMatchTypeChange}
                  options={[
                    { value: 'solo',  label: 'Solo Match',  icon: <PremiumIcon name="user" size={16} /> },
                    { value: 'group', label: 'Group (4)',   icon: <PremiumIcon name="group" size={16} /> },
                  ]}
                />
                {matchType === 'group' && (
                  <p style={{ fontSize: '0.78rem', color: '#4a4a60', marginTop: 8, lineHeight: 1.5 }}>
                    Group rooms seat 4 — mixed genders, friendship only.
                  </p>
                )}
              </Field>

              {matchType === 'solo' && (
                <Field label="Looking for" icon="star">
                  <SegmentControl
                    value={intent}
                    onChange={setIntent}
                    options={[
                      { value: 'friendship', label: 'Friendship', icon: <PremiumIcon name="movie" size={16} /> },
                      { value: 'date',       label: 'Date',       icon: <PremiumIcon name="romance" size={16} /> },
                    ]}
                  />
                  {intent === 'date' && (
                    <p style={{ fontSize: '0.78rem', color: '#4a4a60', marginTop: 8, lineHeight: 1.5 }}>
                      You'll be matched 1-on-1 with someone of the opposite gender.
                    </p>
                  )}
                </Field>
              )}

              {/* Women-only toggle */}
              {showWomenOnlyToggle && (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 16px', borderRadius: 14,
                  background: womenOnly ? 'rgba(232,16,42,0.08)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${womenOnly ? 'rgba(232,16,42,0.25)' : 'rgba(255,255,255,0.08)'}`,
                  transition: 'all 300ms ease',
                }}>
                  <div style={{ paddingRight: 12 }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f0f0fa', marginBottom: 3 }}>Women-only matching</p>
                    <p style={{ fontSize: '0.78rem', color: '#6b6b85', lineHeight: 1.4 }}>Only match me with other women, for safety.</p>
                  </div>
                  <Toggle checked={womenOnly} onChange={setWomenOnly} label="Women-only matching" />
                </div>
              )}

              {/* Error */}
              {error && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12, padding: '12px 14px' }}>
                  <PremiumIcon name="warning" size={16} color="#f87171" />
                  <p style={{ color: '#f87171', fontSize: '0.875rem', lineHeight: 1.4 }}>{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                id="find-match-btn"
                type="button"
                className="btn btn-primary"
                onClick={handleStartMatch}
                disabled={loading}
                style={{ width: '100%', padding: '14px', borderRadius: 14, fontWeight: 700, fontSize: '1rem', marginTop: 4 }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    <Spinner size="sm" color="white" /> Finding matches...
                  </span>
                ) : 'Find My Match'}
              </button>
            </div>
          </div>

          {/* ── Right: Ticket Preview ── */}
          <div style={{ animation: 'slideUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.2s both' }}>
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em', color: '#6b6b85', textTransform: 'uppercase', marginBottom: 4 }}>Your Ticket Preview</p>
              <p style={{ fontSize: '0.8125rem', color: '#4a4a60' }}>Updates as you fill in the details above.</p>
            </div>
            <TicketPreview
              form={form}
              matchType={matchType}
              intent={intent}
              womenOnly={womenOnly}
              showWomenOnly={showWomenOnlyToggle}
            />
          </div>

          {/* ── Rightmost: Activity Feed ── */}
          <div style={{ animation: 'slideUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.3s both' }}>
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em', color: '#6b6b85', textTransform: 'uppercase', marginBottom: 4 }}>Social Activity & Stream</p>
              <p style={{ fontSize: '0.8125rem', color: '#4a4a60' }}>See what the community is up to.</p>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24,
              padding: '24px',
              boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
              maxHeight: 500,
              overflowY: 'auto'
            }} className="premium-scrollbar">
              <ActivityFeed />
            </div>
          </div>
        </div>

        {/* ── Vacant Matching Sessions Lobby ── */}
        <div style={{ marginTop: 40, animation: 'slideUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.32s both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <PremiumIcon name="group" size={24} color="#e8102a" />
            <div>
              <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#f0f0fa', letterSpacing: '-0.02em', margin: 0 }}>
                Live Open Match Sessions
              </h2>
              <p style={{ fontSize: '0.8125rem', color: '#6b6b85', margin: '2px 0 0' }}>
                Join an active vacant session directly and meet other cinema-goers.
              </p>
            </div>
          </div>

          {vacantLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0', background: 'rgba(255,255,255,0.02)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
              <Spinner size="md" color="#e8102a" />
            </div>
          ) : vacantRooms.length === 0 ? (
            <div style={{ padding: '32px 24px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ color: '#6b6b85', fontSize: '0.9rem', margin: 0 }}>
                No active vacant sessions currently. Use the form above to start a session!
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {vacantRooms.map((room) => (
                <div
                  key={room.id}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 20,
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                    transition: 'all 200ms ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(232,16,42,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'none'; }}
                >
                  <div>
                    {/* Header: Movie & Type */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f0f0fa', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.3 }}>
                        {room.movie}
                      </h3>
                      <Badge variant={room.matchType === 'solo' ? 'verified' : 'primary'}>
                        {room.matchType === 'solo' ? 'Solo' : 'Group'}
                      </Badge>
                    </div>

                    {/* Cinema & Timing */}
                    <p style={{ fontSize: '0.8rem', color: '#a8a8c0', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <PremiumIcon name="location" size={14} color="#6b6b85" />
                      {room.cinema}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: '#6b6b85', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <PremiumIcon name="calendar" size={14} color="#6b6b85" />
                      {room.date} @ {room.time}
                    </p>

                    {/* Members List */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b6b85' }}>Members:</span>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {room.members?.map((m, idx) => (
                          <div
                            key={idx}
                            title={m.user?.name}
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              background: 'rgba(232,16,42,0.15)',
                              border: '1px solid rgba(232,16,42,0.3)',
                              color: '#ff6b7a',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                            }}
                          >
                            {m.user?.name ? m.user.name.charAt(0).toUpperCase() : '?'}
                          </div>
                        ))}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, marginLeft: 'auto' }}>
                        {room.members?.length} / {room.capacity} Slots
                      </span>
                    </div>
                  </div>

                  {/* Join Button */}
                  <button
                    type="button"
                    onClick={() => handleJoinVacantRoom(room.id)}
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: 12,
                      background: 'rgba(232,16,42,0.1)',
                      border: '1px solid rgba(232,16,42,0.25)',
                      color: '#ff6b7a',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#e8102a'; e.currentTarget.style.color = 'white'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(232,16,42,0.1)'; e.currentTarget.style.color = '#ff6b7a'; }}
                  >
                    Join Session
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Intelligence & Personalization Section ── */}
        <div style={{ marginTop: 48, animation: 'slideUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.35s both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <PremiumIcon name="star" size={24} color="#f5a623" />
            <div>
              <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#f0f0fa', letterSpacing: '-0.02em', margin: 0 }}>
                Personalized Recommendation Desk
              </h2>
              <p style={{ fontSize: '0.8125rem', color: '#6b6b85', margin: '2px 0 0' }}>
                Intelligent content-based recommendations and viewing analytics.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, alignItems: 'start' }}>
            
            {/* Recommendations Panels */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              {/* AI picks */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '24px' }}>
                <h3 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#f0f0fa', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <PremiumIcon name="bot" size={20} color="#ff6b7a" /> AI Movie Picks
                  <span style={{ fontSize: '0.72rem', fontWeight: 500, padding: '2px 8px', borderRadius: 9999, background: 'rgba(232,16,42,0.1)', color: '#ff6b7a', border: '1px solid rgba(232,16,42,0.2)' }}>Explainable</span>
                </h3>

                {recLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}><Spinner size="md" color="#e8102a" /></div>
                ) : !recommendations?.aiPicks?.length ? (
                  <p style={{ color: '#6b6b85', fontSize: '0.875rem' }}>No picks generated yet. Enable personalization in your profile!</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {recommendations.aiPicks.map((m, idx) => (
                      <div key={idx} style={{ padding: '12px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f0f0fa', margin: '0 0 4px' }}>{m.title}</h4>
                          <p style={{ fontSize: '0.76rem', color: '#a8a8c0', margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.3 }}>{m.description}</p>
                          <span style={{ fontSize: '0.72rem', color: '#e8102a', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <PremiumIcon name="lightbulb" size={12} color="#e8102a" /> {m.explanation}
                          </span>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f5a623', background: 'rgba(245,166,35,0.1)', padding: '2px 6px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <PremiumIcon name="star" size={12} color="#f5a623" /> {m.rating}
                          </span>
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8, justifyContent: 'flex-end' }}>
                            {m.genres?.slice(0, 2).map(g => (
                              <span key={g} style={{ fontSize: '0.65rem', color: '#6b6b85', background: 'rgba(255,255,255,0.05)', padding: '1px 5px', borderRadius: 4 }}>{g}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Trending Nearby */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '24px' }}>
                <h3 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#f0f0fa', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <PremiumIcon name="fire" size={22} color="#e8102a" />
                  Trending Nearby
                </h3>

                {recLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}><Spinner size="md" color="#e8102a" /></div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {recommendations?.trendingNearby?.map((m, idx) => (
                      <div key={idx} style={{ padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f0f0fa' }}>{m.title}</h4>
                          <span style={{ fontSize: '0.72rem', color: '#ff6b7a', fontWeight: 700 }}>{m.streaming}</span>
                        </div>
                        <p style={{ fontSize: '0.74rem', color: '#6b6b85', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <PremiumIcon name="location" size={14} color="#6b6b85" />
                          {m.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Friend watched */}
              {recommendations?.friendWatched?.length > 0 && (
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '24px' }}>
                  <h3 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#f0f0fa', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <PremiumIcon name="group" size={20} color="#3b82f6" /> Because Your Friend Watched
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {recommendations.friendWatched.map((m, idx) => (
                      <div key={idx} style={{ padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f0f0fa' }}>{m.title}</h4>
                          <span style={{ fontSize: '0.75rem', color: '#f5a623', fontWeight: 800 }}>{m.rating}/10</span>
                        </div>
                        <p style={{ fontSize: '0.74rem', color: '#6b6b85', margin: 0 }}>{m.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Stats and Suggestions Panels */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              {/* Watch Stats */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '24px' }}>
                <h3 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#f0f0fa', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <PremiumIcon name="motion" size={20} color="#a8a8c0" /> My Watch Stats & Analytics
                </h3>

                {stats?.analytics ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <span style={{ fontSize: '0.7rem', color: '#6b6b85', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Watched this Month</span>
                        <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f0f0fa', margin: '4px 0 0' }}>{stats.analytics.moviesWatchedThisMonth}</p>
                      </div>
                      <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <span style={{ fontSize: '0.7rem', color: '#6b6b85', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Viewing Pattern</span>
                        <p style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f0f0fa', margin: '6px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stats.analytics.viewingPattern}</p>
                      </div>
                    </div>

                    {/* Genre progress bars */}
                    {stats.analytics.favoriteGenres?.length > 0 && (
                      <div>
                        <span style={{ fontSize: '0.7rem', color: '#6b6b85', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em', display: 'block', marginBottom: 10 }}>Favorite Genres Breakdown</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {stats.analytics.favoriteGenres.map((g, idx) => (
                            <div key={idx}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 4 }}>
                                <span style={{ color: '#a8a8c0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <PremiumIcon name={GENRE_ICONS[g.genre] || 'movie'} size={14} color="#a8a8c0" />
                                  {g.genre}
                                </span>
                                <span style={{ color: '#6b6b85' }}>{g.percentage}%</span>
                              </div>
                              <div style={{ width: '100%', height: 6, borderRadius: 9999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                                <div style={{ width: `${g.percentage}%`, height: '100%', background: 'linear-gradient(90deg, #e8102a 0%, #ff4b5e 100%)', borderRadius: 9999 }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ padding: '12px 14px', borderRadius: 14, background: 'rgba(232,16,42,0.05)', border: '1px solid rgba(232,16,42,0.15)', marginTop: 8 }}>
                      <span style={{ fontSize: '0.7rem', color: '#ff6b7a', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>Year in Review</span>
                      <p style={{ fontSize: '0.8rem', color: '#a8a8c0', margin: 0, lineHeight: 1.45 }}>{stats.analytics.yearInReviewSummary}</p>
                    </div>

                  </div>
                ) : (
                  <p style={{ color: '#6b6b85', fontSize: '0.875rem' }}>No viewing statistics generated yet.</p>
                )}
              </div>

              {/* Communities You May Like */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '24px' }}>
                <h3 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#f0f0fa', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <PremiumIcon name="message" size={20} color="#3b82f6" /> Clubs You May Like
                </h3>

                {recLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}><Spinner size="md" color="#e8102a" /></div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {recommendations?.suggestedCommunities?.map((c, idx) => (
                      <div key={idx} style={{ padding: '12px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img 
                          src={c.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=random`} 
                          alt={c.name} 
                          style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} 
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f0f0fa', margin: '0 0 2px' }}>{c.name}</h4>
                          <p style={{ fontSize: '0.74rem', color: '#6b6b85', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.description}</p>
                          <span style={{ fontSize: '0.7rem', color: '#3b82f6', fontWeight: 600 }}>{c.explanation}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Events This Weekend */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '24px' }}>
                <h3 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#f0f0fa', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <PremiumIcon name="calendar" size={20} color="#10b981" /> Suggested Watch Meetups
                </h3>

                {recLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}><Spinner size="md" color="#e8102a" /></div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {recommendations?.suggestedEvents?.map((e, idx) => (
                      <div key={idx} style={{ padding: '12px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f0f0fa' }}>{e.title}</h4>
                          <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700 }}>Host: {e.organizer}</span>
                        </div>
                        <p style={{ fontSize: '0.74rem', color: '#a8a8c0', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <PremiumIcon name="movie" size={14} color="#a8a8c0" />
                          {e.movie} @ {e.theatre}
                        </p>
                        <span style={{ fontSize: '0.7rem', color: '#6b6b85', fontWeight: 500 }}>{e.explanation}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
