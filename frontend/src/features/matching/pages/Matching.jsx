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
  const [copied, setCopied] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNearbyRooms, setShowNearbyRooms] = useState(true);
  const [showBuddyOverlay, setShowBuddyOverlay] = useState(false);
  const [editForm, setEditForm] = useState({ cinema: '', date: '', showTiming: '' });
  
  const [waitMsgIdx, setWaitMsgIdx] = useState(0);
  const waitMessages = [
    "🎬 Looking for movie lovers...",
    "🍿 Checking nearby theatres...",
    "❤️ Finding your perfect cinema companion...",
    "🎟️ Almost there..."
  ];

  const wasMatchedRef = useRef(false);
  const socketRef     = useRef(null);
  const roomId      = state?.roomId;

  // Synthesize pleasant dual-tone chime on match found
  const playMatchSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const msgTimer = setInterval(() => {
      setWaitMsgIdx(prev => (prev + 1) % waitMessages.length);
    }, 3000);
    return () => clearInterval(msgTimer);
  }, []);

  useEffect(() => {
    if (room && showEditModal) {
      setEditForm({
        cinema: room.cinema || '',
        date: room.date || '',
        showTiming: room.showTiming || ''
      });
    }
  }, [room, showEditModal]);

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
        
        // Auto-match overlay alert and audio beep triggers
        if (isMatchedNow) {
          playMatchSound();
          setShowBuddyOverlay(true);
          setTimeout(() => {
            navigate(`/chat/${updatedRoom.id || updatedRoom._id}`);
          }, 2500);
        }
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
    const interval = setInterval(fetchAlternatives, 5000); // Polling alternatives every 5 seconds
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

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await roomService.updateRoom(roomId, editForm);
      setRoom(res.room || res);
      setShowEditModal(false);
    } catch (err) {
      setError('Could not update preferences.');
    }
  };

  const handleCancelRoom = async () => {
    try {
      await roomService.deleteRoom(roomId);
      navigate('/dashboard');
    } catch (err) {
      try {
        await roomService.leaveRoom(roomId);
        navigate('/dashboard');
      } catch {
        setError('Could not cancel room. Please try again.');
      }
    }
  };

  const handleShareRoom = () => {
    const shareLink = `${window.location.origin}/dashboard?joinRoom=${roomId}`;
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isMatchUnlocked = room && (
    (room.matchType === 'group' && room.members.length >= 2) ||
    (room.matchType === 'solo' && room.members.length >= 2)
  );

  const showWaitScreen = searching || !room || !isMatchUnlocked;

  const totalMovieLovers = (room?.members?.length || 0) + alternativeRooms.reduce((acc, r) => acc + (r.members?.length || 0), 0);

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
        {showWaitScreen ? (
          /* ── Interactive Waiting Lobby ── */
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

            <div style={{
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.25)',
              borderRadius: 14,
              padding: '10px 18px',
              color: '#34d399',
              fontSize: '0.875rem',
              fontWeight: 600,
              marginBottom: 24,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 20px rgba(16,185,129,0.15)'
            }}>
              <PremiumIcon name="check" size={16} color="#34d399" />
              Room Created Successfully
            </div>

            <RadarAnimation />

            {/* Real-time Progress Bar */}
            {room && (
              <div style={{ maxWidth: 460, margin: '16px auto 24px', padding: '0 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#a8a8c0', marginBottom: 8, fontWeight: 600 }}>
                  <span>Lobby Status</span>
                  <span>{room.members.length} / {room.capacity} Members</span>
                </div>
                <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 9999, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <div style={{
                    height: '100%',
                    width: `${(room.members.length / room.capacity) * 100}%`,
                    background: 'linear-gradient(90deg, #e8102a, #ff6b7a)',
                    borderRadius: 9999,
                    transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                  }} />
                </div>
                {room.matchType === 'group' && room.members.length < 2 && (
                  <p style={{ fontSize: '0.78rem', color: '#ff6b7a', marginTop: 8, margin: 0, fontWeight: 700 }}>
                    Waiting for at least 2 members to unlock group chat.
                  </p>
                )}
                {room.matchType === 'group' && room.members.length >= 2 && room.members.length < 4 && (
                  <p style={{ fontSize: '0.78rem', color: '#34d399', marginTop: 8, margin: 0, fontWeight: 700 }}>
                    Lobby unlocked! Waiting for remaining members (Max 4).
                  </p>
                )}
              </div>
            )}

            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 20,
              padding: '8px 16px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 16,
              fontSize: '0.85rem',
              color: '#f0f0fa',
              fontWeight: 600
            }}>
              <span style={{ animation: 'pulseGlow 2s infinite' }}>👥</span>
              {totalMovieLovers} movie lover{totalMovieLovers === 1 ? '' : 's'} looking for this movie nearby
            </div>

            <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '2rem', color: '#f0f0fa', letterSpacing: '-0.03em', marginBottom: 12 }}>
              {waitMessages[waitMsgIdx]}
            </h2>
            <p style={{ color: '#6b6b85', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 28 }}>
              Waiting for another movie lover to join your room. While waiting, you can explore other rooms or manage this session below.
            </p>

            {room && (
              <>
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 18,
                  padding: '20px 24px',
                  maxWidth: 460,
                  margin: '0 auto 28px',
                  textAlign: 'left',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                }}>
                  <h3 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '0.9rem', color: '#ff6b7a', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    My Show Preferences
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 16px' }}>
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

                {/* Live Lobbies Control Panel Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                  maxWidth: 460,
                  margin: '0 auto 32px'
                }}>
                  <button
                    type="button"
                    onClick={() => navigate(`/chat/${roomId}`)}
                    style={{
                      gridColumn: 'span 2',
                      padding: '14px',
                      borderRadius: 14,
                      background: 'linear-gradient(135deg, #e8102a, #ff4b5e)',
                      border: 'none',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(232,16,42,0.3)',
                      transition: 'all 200ms ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8
                    }}
                  >
                    <PremiumIcon name="group" size={18} color="white" />
                    View My Room (Host)
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowEditModal(true)}
                    style={{
                      padding: '12px',
                      borderRadius: 12,
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#f0f0fa',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 200ms ease'
                    }}
                  >
                    Edit Preferences
                  </button>

                  <button
                    type="button"
                    onClick={handleShareRoom}
                    style={{
                      padding: '12px',
                      borderRadius: 12,
                      background: copied ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.04)',
                      border: copied ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.08)',
                      color: copied ? '#34d399' : '#f0f0fa',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 200ms ease'
                    }}
                  >
                    {copied ? 'Link Copied! ✓' : 'Share Room Link'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowNearbyRooms(prev => !prev)}
                    style={{
                      padding: '12px',
                      borderRadius: 12,
                      background: showNearbyRooms ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#f0f0fa',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 200ms ease'
                    }}
                  >
                    {showNearbyRooms ? 'Hide Nearby Rooms' : 'Browse Nearby Rooms'}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancelRoom}
                    style={{
                      padding: '12px',
                      borderRadius: 12,
                      background: 'rgba(239,68,68,0.06)',
                      border: '1px solid rgba(239,68,68,0.2)',
                      color: '#f87171',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 200ms ease'
                    }}
                  >
                    Cancel / Delete Room
                  </button>
                </div>

                {/* Nearby Movie Rooms (Similar Rooms Section) */}
                {showNearbyRooms && (
                  <div style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: 24,
                    padding: '24px 28px',
                    maxWidth: 460,
                    margin: '0 auto',
                    textAlign: 'left'
                  }}>
                    <h3 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1rem', color: '#ff6b7a', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Nearby Movie Rooms
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: '#6b6b85', lineHeight: 1.4, marginBottom: 18 }}>
                      Others watching <strong style={{ color: '#f0f0fa' }}>{room.movie}</strong> nearby. Click Join below to switch theaters and pair immediately!
                    </p>
                    
                    {altLoading && alternativeRooms.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <Spinner size="sm" color="#ff6b7a" />
                      </div>
                    ) : alternativeRooms.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {alternativeRooms.map(altRoom => (
                          <div key={altRoom.id || altRoom._id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: 16,
                            padding: '12px 16px',
                            transition: 'all 150ms ease'
                          }}>
                            <div style={{ textAlign: 'left', minWidth: 0, paddingRight: 10 }}>
                              <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f0f0fa', marginBottom: 3, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                {altRoom.cinema}
                              </p>
                              <p style={{ fontSize: '0.72rem', color: '#6b6b85', margin: 0 }}>
                                {altRoom.showTiming} • {altRoom.members?.length || 1} movie lover{(altRoom.members?.length || 1) === 1 ? '' : 's'}
                              </p>
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
                                borderRadius: 10,
                                color: '#ff6b7a',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                padding: '6px 14px',
                                cursor: 'pointer',
                                transition: 'all 150ms ease',
                                flexShrink: 0
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = '#e8102a'; e.currentTarget.style.color = 'white'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(232,16,42,0.1)'; e.currentTarget.style.color = '#ff6b7a'; }}
                            >
                              Join
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{
                        padding: '24px 16px',
                        background: 'rgba(255,255,255,0.01)',
                        border: '1px dashed rgba(255,255,255,0.06)',
                        borderRadius: 16,
                        textAlign: 'center',
                        color: '#6b6b85',
                        fontSize: '0.85rem'
                      }}>
                        No other multiplex rooms found for this movie. We will keep checking in the background!
                      </div>
                    )}
                  </div>
                )}
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
                const initials = (member.name || member.user?.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                
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
                          {(member.name || member.user?.name || 'User')} {isMe && '(You)'}
                        </h4>
                        <p style={{ fontSize: '0.78rem', color: '#6b6b85', margin: 0 }}>
                          {(member.age || member.user?.age) ? `${member.age || member.user?.age} yrs` : ''} · {(member.gender || member.user?.gender)?.charAt(0).toUpperCase() + (member.gender || member.user?.gender)?.slice(1)}
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

      {/* Edit Preferences Modal */}
      {showEditModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5,5,10,0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            width: '90%',
            maxWidth: 440,
            background: 'linear-gradient(135deg, rgba(232,16,42,0.06) 0%, rgba(255,255,255,0.03) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 24,
            padding: 28,
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
          }}>
            <h3 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.2rem', color: '#f0f0fa', marginBottom: 20 }}>
              Edit Show Preferences
            </h3>
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ff6b7a', display: 'block', marginBottom: 6 }}>CINEMA THEATRE</label>
                <input
                  type="text"
                  value={editForm.cinema}
                  onChange={e => setEditForm(f => ({ ...f, cinema: e.target.value }))}
                  style={{
                    width: '100%', padding: '10px 14px',
                    background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10, color: '#f0f0fa', outline: 'none'
                  }}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ff6b7a', display: 'block', marginBottom: 6 }}>DATE</label>
                <input
                  type="date"
                  value={editForm.date}
                  onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))}
                  style={{
                    width: '100%', padding: '10px 14px',
                    background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10, color: '#f0f0fa', outline: 'none'
                  }}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ff6b7a', display: 'block', marginBottom: 6 }}>SHOWTIME</label>
                <select
                  value={editForm.showTiming}
                  onChange={e => setEditForm(f => ({ ...f, showTiming: e.target.value }))}
                  style={{
                    width: '100%', padding: '10px 14px',
                    background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10, color: '#f0f0fa', outline: 'none'
                  }}
                  required
                >
                  <option value="Morning Show">Morning Show</option>
                  <option value="Afternoon Show">Afternoon Show</option>
                  <option value="Evening Show">Evening Show</option>
                  <option value="Night Show">Night Show</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  style={{
                    flex: 1, padding: '11px 0', borderRadius: 10,
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                    color: '#a8a8c0', fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1, padding: '11px 0', borderRadius: 10,
                    background: 'linear-gradient(135deg, #e8102a, #ff4b5e)', border: 'none',
                    color: 'white', fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Match Found Overlay with chime */}
      {showBuddyOverlay && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5,5,10,0.92)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          animation: 'fadeIn 0.4s ease-out'
        }}>
          <div style={{
            textAlign: 'center',
            animation: 'bounceIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
          }}>
            <div style={{ fontSize: '5rem', marginBottom: 20 }}>🎉</div>
            <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 900, fontSize: '2.5rem', color: '#ff6b7a', marginBottom: 12, letterSpacing: '-0.02em' }}>
              We found your movie buddy!
            </h2>
            <p style={{ color: '#a8a8c0', fontSize: '1.1rem', marginBottom: 32 }}>
              Opening room chat lobby...
            </p>
            <Spinner size="lg" color="#e8102a" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Matching;
