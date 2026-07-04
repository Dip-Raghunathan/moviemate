import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../../shared/components/Navbar';
import * as roomService from '../../../services/roomService';
import Spinner from '../../../shared/components/ui/Spinner';
import Badge from '../../../shared/components/ui/Badge';
import { PremiumIcon } from '../../../shared/components/icons/IconComponents';
import { useAuth } from '../../../core/contexts/AuthContext';
import { io } from 'socket.io-client';

const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
  const { user }    = useAuth();
  const [room,    setRoom]     = useState(null);
  const [searching, setSearching] = useState(true);
  const [error,     setError]    = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [readyLoading, setReadyLoading] = useState(false);
  const [alternativeRooms, setAlternativeRooms] = useState([]);
  const [altLoading, setAltLoading] = useState(false);
  const wasMatchedRef = useRef(false);
  const socketRef     = useRef(null);
  const roomId      = state?.roomId;

  useEffect(() => {
    if (!roomId) { navigate('/dashboard'); return; }

    const searchTimer = setTimeout(() => setSearching(false), 1800);

    const fetchInitialRoom = async () => {
      try {
        const { room: initialRoom } = await roomService.getRoom(roomId);
        if (initialRoom) {
          setRoom(initialRoom);
          wasMatchedRef.current = initialRoom.members.length === initialRoom.capacity;
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load room.');
      }
    };
    fetchInitialRoom();

    // Connect Socket
    const socket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;

    socket.emit('join_room', roomId);

    socket.on('room_updated', (updatedRoom) => {
      if (updatedRoom) {
        const isMatchedNow = updatedRoom.members.length === updatedRoom.capacity;
        if (wasMatchedRef.current && !isMatchedNow) {
          setAlertMessage('Your companion left before chat started.');
          setTimeout(() => setAlertMessage(''), 5000);
        }
        wasMatchedRef.current = isMatchedNow;
        setRoom(updatedRoom);
      }
    });

    return () => {
      clearTimeout(searchTimer);
      if (socketRef.current) {
        socketRef.current.emit('leave_room', roomId);
        socketRef.current.disconnect();
      }
    };
  }, [roomId, navigate]);

  useEffect(() => {
    if (!room) return;
    
    let isFirstLoad = true;
    const fetchAlternatives = async () => {
      if (isFirstLoad) setAltLoading(true);
      try {
        const res = await roomService.getVacantRooms(room.city);
        const vacant = res.rooms || [];
        // Filter vacant rooms: same movie name, different theater, user not in it
        const filtered = vacant.filter(r => 
          r.movie.trim().toLowerCase() === room.movie.trim().toLowerCase() &&
          r.cinema.trim().toLowerCase() !== room.cinema.trim().toLowerCase() &&
          (r.id || r._id) !== roomId
        );
        setAlternativeRooms(filtered);
      } catch (err) {
        console.error('Failed to load alternative rooms:', err);
      } finally {
        if (isFirstLoad) {
          setAltLoading(false);
          isFirstLoad = false;
        }
      }
    };
    
    fetchAlternatives();
    const interval = setInterval(fetchAlternatives, 4000);
    return () => clearInterval(interval);
  }, [room, roomId]);

  useEffect(() => {
    if (room && !searching) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  }, [room, searching]);

  useEffect(() => {
    if (room && room.members && room.members.length === room.capacity) {
      const allReady = room.members.every(m => m.readyToChat === true);
      if (allReady) {
        navigate(`/chat/${room.id || room._id}`);
      }
    }
  }, [room, navigate]);

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
        {(searching || !room || room.members.length < room.capacity) ? (
          /* ── Searching State ── */
          <div style={{ textAlign: 'center', maxWidth: 520, margin: '0 auto', animation: 'fadeIn 0.6s ease forwards' }}>
            {alertMessage && (
              <div style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 14,
                padding: '12px 16px',
                color: '#f87171',
                fontSize: '0.875rem',
                fontWeight: 600,
                marginBottom: 20,
                animation: 'slideUp 0.3s ease-out',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8
              }}>
                <PremiumIcon name="warning" size={16} color="#f87171" />
                {alertMessage}
              </div>
            )}
            <RadarAnimation />
            <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '2rem', color: '#f0f0fa', letterSpacing: '-0.03em', marginBottom: 12 }}>
              {room ? "Waiting for another movie lover..." : "Scanning theaters..."}
            </h2>
            <p style={{ color: '#6b6b85', fontSize: '1rem', lineHeight: 1.65, marginBottom: 32 }}>
              {room ? "Your waiting room has been created successfully. Other movie lovers will see this room in Live Open Matches." : "Our matching engine is finding the perfect movie companions for you."}
            </p>
            {/* Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 320, margin: '0 auto', marginBottom: 28 }}>
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

            {room && (
              <>
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 18,
                  padding: '20px 24px',
                  maxWidth: 440,
                  margin: '0 auto 24px',
                  textAlign: 'left'
                }}>
                  <h3 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1rem', color: '#ff6b7a', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Waiting Room Details
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px' }}>
                    <div>
                      <p style={{ fontSize: '0.65rem', color: '#4a4a60', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>MOVIE</p>
                      <p style={{ fontSize: '0.85rem', color: '#f0f0fa', fontWeight: 600 }}>{room.movie}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.65rem', color: '#4a4a60', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>THEATRE</p>
                      <p style={{ fontSize: '0.85rem', color: '#f0f0fa', fontWeight: 600 }}>{room.cinema}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.65rem', color: '#4a4a60', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>DATE</p>
                      <p style={{ fontSize: '0.85rem', color: '#f0f0fa', fontWeight: 600 }}>{room.date}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.65rem', color: '#4a4a60', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>SHOWTIME</p>
                      <p style={{ fontSize: '0.85rem', color: '#f0f0fa', fontWeight: 600 }}>{room.showTiming}</p>
                    </div>
                  </div>
                </div>

                {alternativeRooms.length > 0 && (
                  <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 18,
                    padding: '20px 24px',
                    maxWidth: 440,
                    margin: '0 auto 24px',
                    textAlign: 'left'
                  }}>
                    <h3 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '0.9rem', color: '#ff6b7a', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Other Movie Lovers Nearby
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: '#6b6b85', lineHeight: 1.4, marginBottom: 14 }}>
                      No exact match at your chosen theater. Would you like to watch it at another nearby theater instead?
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {alternativeRooms.map(altRoom => (
                        <div key={altRoom.id || altRoom._id} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.05)',
                          borderRadius: 12,
                          padding: '10px 14px',
                        }}>
                          <div style={{ textAlign: 'left' }}>
                            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f0f0fa', marginBottom: 2 }}>{altRoom.cinema}</p>
                            <p style={{ fontSize: '0.7rem', color: '#6b6b85' }}>{altRoom.showTiming} • {altRoom.members?.length || 1} companion{(altRoom.members?.length || 1) === 1 ? '' : 's'}</p>
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                setSearching(true);
                                await roomService.leaveRoom(room.id || room._id);
                                await roomService.joinRoom(altRoom.id || altRoom._id, 'Hi! Excited to watch this movie together.');
                                navigate('/matching', { state: { roomId: altRoom.id || altRoom._id } });
                                window.location.reload();
                              } catch (err) {
                                setError('Could not join alternative room.');
                              }
                            }}
                            style={{
                              background: 'rgba(232,16,42,0.1)',
                              border: '1px solid rgba(232,16,42,0.3)',
                              borderRadius: 8,
                              color: '#ff6b7a',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '5px 10px',
                              cursor: 'pointer',
                              transition: 'all 150ms ease'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#e8102a'; e.currentTarget.style.color = 'white'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(232,16,42,0.1)'; e.currentTarget.style.color = '#ff6b7a'; }}
                          >
                            Join
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await roomService.leaveRoom(room.id || room._id);
                      navigate('/dashboard');
                    } catch (err) {
                      setError('Could not leave room. Please try again.');
                    }
                  }}
                  style={{
                    width: '100%',
                    maxWidth: 320,
                    padding: '12px',
                    borderRadius: 9999,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#a8a8c0',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 200ms ease'
                  }}
                >
                  Cancel Matching / Leave Room
                </button>
              </>
            )}
          </div>
        ) : (
          /* ── Match Introduction Screen (Match Found State) ── */
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto', animation: 'scaleIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards' }}>
            <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 900, fontSize: '2.2rem', color: '#f0f0fa', letterSpacing: '-0.03em', marginBottom: 6 }}>
              It's a Match!
            </h2>
            <p style={{ color: '#6b6b85', fontSize: '0.95rem', marginBottom: 32 }}>
              Say hello to your companion for <strong style={{ color: '#ff6b7a' }}>{room.movie}</strong>
            </p>

            {/* Split cards for the two members */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 32 }}>
              {room.members.map((member, idx) => {
                const memberUserId = member.user?._id || member.user?.id || member.user;
                const activeUserId = user?._id || user?.id;
                const isMe = memberUserId && activeUserId && memberUserId.toString() === activeUserId.toString();
                const initials = (member.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                
                return (
                  <div key={idx} style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: isMe ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(232,16,42,0.2)',
                    borderRadius: 24,
                    padding: 24,
                    textAlign: 'left',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    position: 'relative'
                  }}>
                    {/* Status badge */}
                    {member.readyToChat && (
                      <span style={{
                        position: 'absolute', top: 16, right: 16,
                        background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)',
                        fontSize: '0.68rem', fontWeight: 800, padding: '3px 8px', borderRadius: 8, textTransform: 'uppercase'
                      }}>
                        Ready
                      </span>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                      {/* Avatar */}
                      <div style={{
                        width: 48, height: 48, borderRadius: '50%',
                        background: isMe ? 'rgba(255,255,255,0.08)' : 'rgba(232,16,42,0.15)',
                        border: isMe ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(232,16,42,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, color: isMe ? '#f0f0fa' : '#ff6b7a', fontSize: '1rem'
                      }}>
                        {initials}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#f0f0fa', margin: 0 }}>
                          {member.name || 'User'} {isMe && '(You)'}
                        </h4>
                        <p style={{ fontSize: '0.78rem', color: '#6b6b85', margin: 0 }}>
                          {member.age ? `${member.age} yrs` : ''} · {member.gender?.charAt(0).toUpperCase() + member.gender?.slice(1)}
                        </p>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '14px 16px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.03)' }}>
                      <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b6b85', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>Introduction</p>
                      <p style={{ fontSize: '0.85rem', color: '#a8a8c0', lineHeight: 1.45, margin: 0, fontStyle: 'italic' }}>
                        "{member.introduction || 'Hi! Excited to watch this movie together.'}"
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 360, margin: '0 auto' }}>
              <button
                type="button"
                disabled={readyLoading || room.members.find(m => {
                  const mUserId = m.user?._id || m.user?.id || m.user;
                  const activeUserId = user?._id || user?.id;
                  return mUserId && activeUserId && mUserId.toString() === activeUserId.toString();
                })?.readyToChat}
                onClick={async () => {
                  setReadyLoading(true);
                  try {
                    await roomService.readyForChat(room.id || room._id);
                    const { room: updatedRoom } = await roomService.getRoom(room.id || room._id);
                    setRoom(updatedRoom);
                  } catch (err) {
                    setError('Could not update status. Please try again.');
                  } finally {
                    setReadyLoading(false);
                  }
                }}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 9999,
                  background: 'linear-gradient(135deg, #e8102a, #ff4b5e)',
                  border: 'none',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  opacity: room.members.find(m => {
                    const mUserId = m.user?._id || m.user?.id || m.user;
                    const activeUserId = user?._id || user?.id;
                    return mUserId && activeUserId && mUserId.toString() === activeUserId.toString();
                  })?.readyToChat ? 0.6 : 1
                }}
              >
                {room.members.find(m => {
                  const mUserId = m.user?._id || m.user?.id || m.user;
                  const activeUserId = user?._id || user?.id;
                  return mUserId && activeUserId && mUserId.toString() === activeUserId.toString();
                })?.readyToChat ? (
                  <>
                    <Spinner size="sm" color="white" />
                    Waiting for companion...
                  </>
                ) : (
                  'Start Chat'
                )}
              </button>

              <button
                type="button"
                onClick={async () => {
                  try {
                    await roomService.leaveIntro(room.id || room._id);
                    navigate('/dashboard');
                  } catch (err) {
                    setError('Could not leave match. Please try again.');
                  }
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 9999,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#a8a8c0',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 200ms ease'
                }}
              >
                Leave Match
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Matching;
