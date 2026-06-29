import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../../shared/components/Navbar';
import * as roomService from '../../../services/roomService';
import Spinner from '../../../shared/components/ui/Spinner';
import Badge from '../../../shared/components/ui/Badge';
import { PremiumIcon } from '../../../shared/components/icons/IconComponents';

// ── Radar Animation ────────────────────────────────────────────────────────────
const RadarAnimation = () => (
  <div style={{
    position: 'relative', width: 200, height: 200,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 32px',
  }}>
    {/* Rings */}
    {[1, 2, 3].map((r, i) => (
      <div key={r} style={{
        position: 'absolute',
        width: r * 64, height: r * 64,
        borderRadius: '50%',
        border: `1px solid rgba(232,16,42,${0.3 - i * 0.08})`,
        animation: `radarPing 2.5s ease-out ${i * 0.6}s infinite`,
      }} />
    ))}
    {/* Static rings */}
    {[80, 130, 180].map((s, i) => (
      <div key={s} style={{
        position: 'absolute',
        width: s, height: s,
        borderRadius: '50%',
        border: `1px solid rgba(255,255,255,${0.04 + i * 0.02})`,
      }} />
    ))}
    {/* Center dot */}
    <div style={{
      width: 16, height: 16, borderRadius: '50%',
      background: 'linear-gradient(135deg, #e8102a, #ff4b5e)',
      boxShadow: '0 0 20px rgba(232,16,42,0.6)',
      animation: 'pulseGlow 2s ease-in-out infinite',
      zIndex: 2,
    }} />
    {/* Sweep line */}
    <div style={{
      position: 'absolute',
      width: 90, height: 1,
      background: 'linear-gradient(to right, rgba(232,16,42,0.8), transparent)',
      transformOrigin: 'left center',
      left: '50%', top: '50%',
      animation: 'spin 3s linear infinite',
      zIndex: 1,
    }} />
  </div>
);

// ── Confetti ────────────────────────────────────────────────────────────────
const Confetti = () => {
  const pieces = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 1.5,
    duration: Math.random() * 2 + 2,
    color: ['#e8102a', '#f5a623', '#3b82f6', '#10b981', '#8b5cf6'][Math.floor(Math.random() * 5)],
    size: Math.random() * 8 + 4,
    rotation: Math.random() * 360,
  }));
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 5, overflow: 'hidden' }} aria-hidden="true">
      {pieces.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: `${p.left}%`, top: '-20px',
          width: p.size, height: p.size,
          background: p.color,
          borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          transform: `rotate(${p.rotation}deg)`,
          animation: `confettiFall ${p.duration}s ease-in ${p.delay}s forwards`,
          opacity: 0.85,
        }} />
      ))}
    </div>
  );
};

// ── Matching ──────────────────────────────────────────────────────────────────
const Matching = () => {
  const { state }   = useLocation();
  const navigate    = useNavigate();
  const [room,    setRoom]     = useState(null);
  const [searching, setSearching] = useState(true);
  const [error,     setError]    = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const pollRef     = useRef(null);
  const roomId      = state?.roomId;

  useEffect(() => {
    if (!roomId) { navigate('/dashboard'); return; }

    const searchTimer = setTimeout(() => setSearching(false), 1800);

    const poll = async () => {
      try {
        const { room } = await roomService.getRoom(roomId);
        setRoom(room);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load room.');
      }
    };
    poll();
    pollRef.current = setInterval(poll, 3000);
    return () => { clearTimeout(searchTimer); clearInterval(pollRef.current); };
  }, [roomId, navigate]);

  useEffect(() => {
    if (room && !searching) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  }, [room, searching]);

  if (error) {
    return (
      <div style={{ background: '#05050a', minHeight: '100vh' }}>
        <Navbar />
        <div className="section-container" style={{ paddingTop: 120, textAlign: 'center' }}>
          <div style={{ marginBottom: 16 }}>
            <PremiumIcon name="warning" size={48} color="#f87171" />
          </div>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#f0f0fa', marginBottom: 12 }}>Something went wrong</h2>
          <p style={{ color: '#f87171', marginBottom: 24 }}>{error}</p>
          <Link to="/dashboard" className="btn btn-primary" style={{ textDecoration: 'none', borderRadius: 9999, padding: '12px 28px' }}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#05050a', minHeight: '100vh', color: '#f0f0fa' }}>
      <Navbar />
      {showConfetti && <Confetti />}

      {/* Ambient glow */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }} aria-hidden="true">
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(232,16,42,0.1) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <div className="section-container" style={{ paddingTop: 120, paddingBottom: 64, position: 'relative', zIndex: 1 }}>
        {(searching || !room) ? (
          /* ── Searching State ── */
          <div style={{ textAlign: 'center', maxWidth: 520, margin: '0 auto', animation: 'fadeIn 0.6s ease forwards' }}>
            <RadarAnimation />
            <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '2rem', color: '#f0f0fa', letterSpacing: '-0.03em', marginBottom: 12 }}>
              Scanning theaters...
            </h2>
            <p style={{ color: '#6b6b85', fontSize: '1rem', lineHeight: 1.65, marginBottom: 32 }}>
              Our matching engine is finding the perfect movie companions for you.
              This usually takes just a few seconds.
            </p>
            {/* Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 320, margin: '0 auto' }}>
              {[
                { text: 'Scanning your city\'s theaters', done: true },
                { text: 'Matching your showtime preferences', done: true },
                { text: 'Finding compatible companions...', done: false },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: s.done ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.04)', border: `1px solid ${s.done ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.07)'}` }}>
                  {s.done ? (
                    <PremiumIcon name="check" size={16} color="#10b981" />
                  ) : (
                    <Spinner size="sm" color="#e8102a" />
                  )}
                  <span style={{ fontSize: '0.875rem', color: s.done ? '#34d399' : '#6b6b85' }}>{s.text}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* ── Match Found State ── */
          <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto', animation: 'scaleIn 0.6s cubic-bezier(0.16,1,0.3,1) forwards' }}>
            {/* Celebration emoji */}
            <div style={{ marginBottom: 16, animation: 'float 2s ease-in-out infinite' }}>
              <PremiumIcon name="star" size={56} color="#f5a623" />
            </div>

            <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 900, fontSize: 'clamp(2rem,5vw,2.8rem)', color: '#f0f0fa', letterSpacing: '-0.04em', marginBottom: 8 }}>
              Match Found!
            </h2>
            <p style={{ color: '#6b6b85', marginBottom: 32 }}>
              {room.status === 'full'
                ? 'Your room is full. Time to enjoy the show!'
                : `Waiting for ${room.capacity - room.memberCount} more companion${room.capacity - room.memberCount !== 1 ? 's' : ''}. You can join now and chat while you wait.`}
            </p>

            {/* Room card */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(232,16,42,0.1) 0%, rgba(14,14,28,0.98) 40%, rgba(245,166,35,0.05) 100%)',
              border: '1px solid rgba(232,16,42,0.25)',
              borderRadius: 24, padding: '28px',
              boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 60px rgba(232,16,42,0.08)',
              marginBottom: 20, textAlign: 'left',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <h3 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#f0f0fa', letterSpacing: '-0.02em' }}>
                      Room #{room.id.slice(-4).toUpperCase()}
                    </h3>
                    <Badge variant={room.status === 'full' ? 'full' : 'open'} />
                  </div>
                  <p style={{ color: '#a8a8c0', fontSize: '0.9375rem', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <PremiumIcon name="movie" size={18} color="#a8a8c0" />
                    {room.movie}
                  </p>
                  <p style={{ color: '#6b6b85', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <PremiumIcon name="location" size={16} color="#6b6b85" />
                    {room.cinema} · {room.date} · {room.time}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.78rem', color: '#4a4a60', marginBottom: 4, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Members</p>
                  <p style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.75rem', color: '#f0f0fa', lineHeight: 1 }}>
                    {room.memberCount}<span style={{ fontSize: '1rem', color: '#4a4a60' }}>/{room.capacity}</span>
                  </p>
                </div>
              </div>

              {/* Member seat indicators */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {Array.from({ length: room.capacity }).map((_, i) => (
                  <div key={i} style={{
                    flex: 1, height: 6, borderRadius: 9999,
                    background: i < room.memberCount
                      ? 'linear-gradient(90deg, #e8102a, #ff4b5e)'
                      : 'rgba(255,255,255,0.08)',
                    transition: 'background 300ms ease',
                    boxShadow: i < room.memberCount ? '0 0 8px rgba(232,16,42,0.4)' : 'none',
                  }} />
                ))}
              </div>

              {/* Tags */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 9999, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.8rem', fontWeight: 600, color: '#a8a8c0' }}>
                  <PremiumIcon name={room.matchType === 'solo' ? 'user' : 'group'} size={14} color="#a8a8c0" />
                  {room.matchType === 'solo' ? 'Solo Match' : 'Group Match'}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 9999, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.8rem', fontWeight: 600, color: '#a8a8c0' }}>
                  <PremiumIcon name={room.intent === 'date' ? 'romance' : 'movie'} size={14} color="#a8a8c0" />
                  {room.intent.charAt(0).toUpperCase() + room.intent.slice(1)}
                </span>
                {room.womenOnly && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 9999, background: 'rgba(232,16,42,0.1)', border: '1px solid rgba(232,16,42,0.2)', fontSize: '0.8rem', fontWeight: 600, color: '#ff6b7a' }}>
                    <PremiumIcon name="user" size={14} color="#ff6b7a" />
                    Women Only
                  </span>
                )}
              </div>

              {/* Matched Companions */}
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <h4 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '0.85rem', color: '#6b6b85', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Matched Companions</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {room.members?.map((member, idx) => {
                    if (!member.user) return null;
                    return (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ position: 'relative' }}>
                          <img 
                            src={member.user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.user.name)}&background=random`} 
                            alt={member.user.name} 
                            style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} 
                          />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontWeight: 700, color: '#f0f0fa', fontSize: '0.88rem' }}>{member.user.name}</span>
                            {member.compatibility && (
                              <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '1px 6px', borderRadius: 6, background: member.compatibility.score >= 80 ? 'rgba(16,185,129,0.1)' : 'rgba(59,130,246,0.1)', color: member.compatibility.score >= 80 ? '#10b981' : '#3b82f6', border: `1px solid ${member.compatibility.score >= 80 ? 'rgba(16,185,129,0.2)' : 'rgba(59,130,246,0.2)'}` }}>
                                {member.compatibility.score}% Match
                              </span>
                            )}
                          </div>
                          {member.compatibility?.explanation && (
                            <p style={{ fontSize: '0.75rem', color: '#6b6b85', margin: '2px 0 0', lineHeight: 1.3 }}>
                              {member.compatibility.explanation}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              id="join-room-btn"
              className="btn btn-primary btn-xl"
              onClick={() => navigate(`/chat/${room.id}`)}
              style={{ borderRadius: 9999, width: '100%', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <PremiumIcon name={room.status === 'full' ? 'movie' : 'message'} size={20} color="white" />
              {room.status === 'full' ? 'Enter Room' : 'Join Room & Chat'}
            </button>

            <Link to="/dashboard" style={{ display: 'block', marginTop: 16, color: '#6b6b85', fontSize: '0.875rem', textDecoration: 'none', transition: 'color 150ms ease' }}
              onMouseEnter={e => e.currentTarget.style.color = '#a8a8c0'}
              onMouseLeave={e => e.currentTarget.style.color = '#6b6b85'}>
              ← Find a different match
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Matching;
