import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/contexts/AuthContext';
import * as roomService from '../../../services/roomService';
import * as chatService from '../../../services/chatService';
import Avatar from '../../../shared/components/ui/Avatar';
import Spinner from '../../../shared/components/ui/Spinner';
import Badge from '../../../shared/components/ui/Badge';
import { PremiumIcon, IconButton } from '../../../shared/components/icons/IconComponents';
import io from 'socket.io-client';

const AVATAR_COLORS = ['#e8102a', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

// Helper to determine socket server origin URL
const getSocketUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    try {
      return new URL(envUrl).origin;
    } catch {
      return envUrl;
    }
  }
  if (window.location.port === '3000') {
    return 'http://localhost:5000';
  }
  return window.location.origin;
};

// ── Chat Bubble ───────────────────────────────────────────────────────────────
const ChatMessage = ({ msg, isMine, senderName, senderInitial, idx, onReact, onPin, reactions = {}, isPinned = false }) => {
  if (msg.isSystem) {
    return (
      <div key={msg.id || msg._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 0' }}>
        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
        <span style={{ fontSize: '0.75rem', color: '#4a4a60', fontWeight: 500, whiteSpace: 'nowrap' }}>{msg.text}</span>
        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
      </div>
    );
  }

  const color = AVATAR_COLORS[idx % AVATAR_COLORS.length];
  const time  = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  const hasReactions = Object.keys(reactions).some(k => reactions[k] > 0);

  return (
    <div style={{ display: 'flex', flexDirection: isMine ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 8, animation: 'slideUp 0.3s ease forwards', position: 'relative' }} className="group">
      {!isMine && (
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg, ${color}, ${color}aa)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'white', flexShrink: 0, marginBottom: 4 }}>
          {(senderInitial || '?').toUpperCase()}
        </div>
      )}
      <div style={{ maxWidth: '72%', display: 'flex', flexDirection: 'column', gap: 3, alignItems: isMine ? 'flex-end' : 'flex-start' }}>
        {!isMine && senderName && (
          <p style={{ fontSize: '0.72rem', color: '#6b6b85', fontWeight: 600, marginLeft: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            {senderName} {isPinned && <><PremiumIcon name="pin" size={14} color="#ffc107" /> <span style={{ color: '#ffc107' }}>Pinned</span></>}
          </p>
        )}
        {isMine && isPinned && (
          <span style={{ fontSize: '0.65rem', color: '#ffc107', marginRight: 4, alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: 4 }}><PremiumIcon name="pin" size={14} color="#ffc107" /> Pinned</span>
        )}
        <div style={{
          padding: '10px 14px',
          borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          background: isMine
            ? 'linear-gradient(135deg, #e8102a, #ff3a4a)'
            : 'rgba(255,255,255,0.08)',
          border: isMine ? 'none' : '1px solid rgba(255,255,255,0.07)',
          color: '#f0f0fa',
          fontSize: '0.9375rem',
          lineHeight: 1.5,
          boxShadow: isMine ? '0 4px 16px rgba(232,16,42,0.2)' : '0 2px 8px rgba(0,0,0,0.3)',
          position: 'relative'
        }}>
          {msg.text}

          {/* Hover actions panel */}
          <div style={{
            position: 'absolute',
            top: -28,
            right: isMine ? 'auto' : 0,
            left: isMine ? 'auto' : 0,
            background: 'rgba(15,15,30,0.95)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 8,
            padding: '2px 6px',
            display: 'flex',
            gap: 6,
            zIndex: 10,
            opacity: 0,
            transition: 'opacity 150ms ease',
            pointerEvents: 'none',
          }} className="group-hover:opacity-100 group-hover:pointer-events-auto">
            {['thumbsup', 'heart', 'laugh', 'fire'].map(name => (
              <IconButton key={name} name={name} size={18} color="#a8a8c0" onClick={() => onReact(msg._id || msg.text, name)} ariaLabel={name} />
            ))}
            <IconButton name="pin" size={18} color="#ffc107" onClick={() => onPin(msg)} ariaLabel="Pin message" />
          </div>
        </div>

        {/* Reaction Chips */}
        {hasReactions && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 2 }}>
            {Object.entries(reactions).map(([name, count]) => {
              if (count === 0) return null;
              return (
                <button
                  key={name}
                  onClick={() => onReact(msg._id || msg.text, name)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '2px 6px', borderRadius: 6,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    fontSize: '0.7rem', color: '#a8a8c0',
                    cursor: 'pointer'
                  }}
                >
                  <PremiumIcon name={name} size={14} color="#a8a8c0" />
                  <span>{count}</span>
                </button>
              );
            })}
          </div>
        )}
        <p style={{ fontSize: '0.68rem', color: '#4a4a60', paddingLeft: 4, paddingRight: 4 }}>{time}</p>
      </div>
    </div>
  );
};

// ── Chat ──────────────────────────────────────────────────────────────────────
const Chat = () => {
  const { roomId }   = useParams();
  const navigate     = useNavigate();
  const { user }     = useAuth();

  const [room,     setRoom]     = useState(null);
  const [messages, setMessages] = useState([]);
  const [input,    setInput]    = useState('');
  const [error,    setError]    = useState('');
  const [sending,  setSending]  = useState(false);

  // Advanced social elements states
  const [reactionsMap, setReactionsMap] = useState({});
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [pinnedOpen, setPinnedOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = width < 768;

  const lastMessageTime = useRef(null);
  const chatBoxRef      = useRef(null);
  const inputRef        = useRef(null);
  const pollRef         = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let socketInstance = null;

    const loadRoom = async () => {
      try {
        const { room } = await roomService.getRoom(roomId);
        if (!cancelled) setRoom(room);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Could not load room.');
      }
    };

    const pollMessages = async () => {
      try {
        const newMsgs = await chatService.getMessages(roomId, lastMessageTime.current);
        if (newMsgs.length > 0 && !cancelled) {
          setMessages(prev => {
            const filteredNew = newMsgs.filter(nm => !prev.some(m => (m.id || m._id) === (nm.id || nm._id)));
            if (filteredNew.length === 0) return prev;
            return [...prev, ...filteredNew];
          });
          lastMessageTime.current = newMsgs[newMsgs.length - 1].createdAt;
        }
      } catch {}
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial HTTP requests
    loadRoom();
    pollMessages();

    // Set up Socket.io connection for real-time updates
    const socketUrl = getSocketUrl();
    socketInstance = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socketInstance.on('connect', () => {
      socketInstance.emit('join_room', roomId);
    });

    socketInstance.on('message', (message) => {
      if (!cancelled) {
        setMessages((prev) => {
          if (prev.some((m) => (m.id || m._id) === (message.id || message._id))) return prev;
          return [...prev, message];
        });
        if (message.createdAt) {
          lastMessageTime.current = message.createdAt;
        }
      }
    });

    socketInstance.on('room_updated', (updatedRoom) => {
      if (!cancelled && updatedRoom) {
        setRoom(updatedRoom);
      }
    });

    // Fallback polling loop (re-checks database changes in serverless setups)
    pollRef.current = setInterval(() => { 
      if (navigator.onLine) {
        loadRoom(); 
        pollMessages(); 
      }
    }, 2500);

    return () => {
      cancelled = true;
      clearInterval(pollRef.current);
      if (socketInstance) {
        socketInstance.emit('leave_room', roomId);
        socketInstance.disconnect();
      }
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [roomId]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    try {
      const message = await chatService.postMessage(roomId, text);
      setMessages(prev => {
        if (prev.some((m) => (m.id || m._id) === (message.id || message._id))) return prev;
        return [...prev, message];
      });
      lastMessageTime.current = message.createdAt;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleReact = (msgId, name) => {
    setReactionsMap(prev => {
      const current = prev[msgId] || {};
      const newCount = current[name] ? 0 : 1;
      return {
        ...prev,
        [msgId]: {
          ...current,
          [name]: newCount
        }
      };
    });
  };

  const handlePin = (msg) => {
    setPinnedMessages(prev => {
      const msgId = msg.id || msg._id || msg.text;
      const isAlreadyPinned = prev.some(m => (m.id || m._id || m.text) === msgId);
      if (isAlreadyPinned) {
        return prev.filter(m => (m.id || m._id || m.text) !== msgId);
      } else {
        return [...prev, msg];
      }
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleExitChat = () => {
    navigate('/dashboard');
  };

  // Build sender name map from room members
  const memberMap = {};
  room?.members?.forEach((m, idx) => { memberMap[String(m.user)] = { name: m.name || 'User', idx }; });

  if (error && !room) {
    return (
      <div style={{ background: '#05050a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: 16 }}>
            <PremiumIcon name="warning" size={48} color="#f87171" />
          </div>
          <p style={{ color: '#f87171', marginBottom: 16 }}>{error}</p>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')} style={{ borderRadius: 9999 }}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#05050a', height: '100vh', display: 'flex', flexDirection: 'column', color: '#f0f0fa', overflow: 'hidden' }}>

      {/* ── Top Bar ── */}
      <header style={{
        height: 64, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px',
        background: 'rgba(5,5,10,0.92)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/dashboard')} aria-label="Back to dashboard" style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a8a8c0', transition: 'all 200ms ease' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#f0f0fa'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#a8a8c0'; }}>
            ←
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1rem', color: '#f0f0fa', margin: 0, letterSpacing: '-0.01em' }}>
                {room ? `Room #${room.id.slice(-4).toUpperCase()}` : 'Loading...'}
              </h1>
              {room && <Badge variant={room.status === 'full' ? 'full' : 'open'} />}
            </div>
            {room && (
              <div style={{ fontSize: '0.75rem', color: '#6b6b85', marginTop: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                <PremiumIcon name="movie" size={14} color="#6b6b85" /> {room.movie} <span>·</span> <PremiumIcon name="location" size={14} color="#6b6b85" /> {room.cinema}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Member count badge */}
          {room && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 9999, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <PremiumIcon name="group" size={14} color="#a8a8c0" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#a8a8c0' }}>{room.memberCount}/{room.capacity}</span>
            </div>
          )}
          {/* Pinned Messages Button */}
          <button
            onClick={() => {
              setPinnedOpen(o => !o);
              setMembersOpen(false);
            }}
            style={{
              padding: '6px 12px', borderRadius: 9999,
              background: pinnedOpen ? 'rgba(245,166,35,0.15)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${pinnedOpen ? 'rgba(245,166,35,0.3)' : 'rgba(255,255,255,0.08)'}`,
              color: pinnedOpen ? '#ffc107' : '#a8a8c0',
              fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', transition: 'all 200ms ease',
              display: 'flex', alignItems: 'center', gap: 4
            }}
            onMouseEnter={e => { if (!pinnedOpen) e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; }}
            onMouseLeave={e => { if (!pinnedOpen) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
          >
            <PremiumIcon name="pin" size={16} color={pinnedOpen ? '#ffc107' : '#f0f0fa'} />
            {!isMobile && 'Pinned'}
          </button>

          {/* Members List Button */}
          <button
            onClick={() => {
              setMembersOpen(o => !o);
              setPinnedOpen(false);
            }}
            style={{
              padding: '6px 12px', borderRadius: 9999,
              background: membersOpen ? 'rgba(255,107,122,0.15)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${membersOpen ? 'rgba(255,107,122,0.3)' : 'rgba(255,255,255,0.08)'}`,
              color: membersOpen ? '#ff6b7a' : '#a8a8c0',
              fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', transition: 'all 200ms ease',
              display: 'flex', alignItems: 'center', gap: 4
            }}
            onMouseEnter={e => { if (!membersOpen) e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; }}
            onMouseLeave={e => { if (!membersOpen) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
          >
            <PremiumIcon name="group" size={16} color={membersOpen ? '#ff6b7a' : '#f0f0fa'} />
            {!isMobile && `Members (${room?.members?.length || 0})`}
          </button>
          <button
            id="exit-chat-btn"
            onClick={handleExitChat}
            style={{
              padding: '7px 16px', borderRadius: 9999,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#a8a8c0',
              fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', transition: 'all 200ms ease',
              display: 'flex', alignItems: 'center', gap: 4
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
          >
            {isMobile ? 'Exit' : 'Exit Chat'}
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        
        {/* ── Main Chat Area ── */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, background: '#05050a' }}>
          
          {/* Scrollable messages container */}
          <div 
            ref={chatBoxRef}
            style={{
              flex: 1, overflowY: 'auto',
              padding: '24px 24px 12px',
              display: 'flex', flexDirection: 'column', gap: 16,
            }}
          >
            {messages.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.6 }}>
                <PremiumIcon name="message" size={48} color="#4a4a60" />
                <p style={{ marginTop: 12, fontSize: '0.875rem', color: '#6b6b85' }}>No messages yet. Say hello to your matched companion!</p>
              </div>
            ) : (
            messages.map((msg, i) => {
                const isMine = String(msg.sender) === String(user?.id);
                const senderInitial = msg.senderName ? msg.senderName.charAt(0) : '?';
                return (
                  <ChatMessage 
                    key={msg.id || msg._id || i}
                    msg={msg}
                    isMine={isMine}
                    senderName={msg.senderName}
                    senderInitial={senderInitial}
                    idx={i}
                    reactions={reactionsMap[msg.id || msg._id || msg.text]}
                    isPinned={pinnedMessages.some(pm => (pm.id || pm._id || pm.text) === (msg.id || msg._id || msg.text))}
                    onReact={handleReact}
                    onPin={handlePin}
                  />
                );
              })
            )}


          </div>

          {/* Input Error Message overlay */}
          {error && room && (
            <div style={{ margin: '0 20px 8px', padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10 }}>
              <p style={{ color: '#f87171', fontSize: '0.8125rem' }}>{error}</p>
            </div>
          )}

          {/* Input Bar */}
          <div style={{
            padding: '12px 20px 16px',
            background: 'rgba(8,8,16,0.8)',
            backdropFilter: 'blur(12px)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  ref={inputRef}
                  id="chat-input"
                  type="text"
                  placeholder={isOnline ? "Type a message... (Enter to send)" : "Connection offline. Messages cannot be sent."}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  maxLength={500}
                  disabled={!isOnline}
                  style={{
                    width: '100%', padding: '12px 16px',
                    background: isOnline ? 'rgba(255,255,255,0.05)' : 'rgba(239, 68, 68, 0.03)',
                    border: isOnline ? '1px solid rgba(255,255,255,0.1)' : '1px dashed rgba(239, 68, 68, 0.25)',
                    borderRadius: 12, color: isOnline ? '#f0f0fa' : '#6b6b85',
                    fontSize: '0.9375rem', fontFamily: 'Inter,sans-serif',
                    outline: 'none',
                    transition: 'all 200ms ease',
                    opacity: isOnline ? 1 : 0.6,
                  }}
                  onFocus={e => { if (isOnline) { e.target.style.borderColor = '#e8102a'; e.target.style.background = 'rgba(255,255,255,0.07)'; e.target.style.boxShadow = '0 0 0 3px rgba(232,16,42,0.12)'; } }}
                  onBlur={e => { if (isOnline) { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.boxShadow = 'none'; } }}
                />
              </div>
              <button
                id="send-message-btn"
                onClick={handleSend}
                disabled={!input.trim() || sending || !isOnline}
                aria-label="Send message"
                style={{
                  width: 46, height: 46, borderRadius: 12, flexShrink: 0,
                  background: (input.trim() && isOnline) ? 'linear-gradient(135deg,#e8102a,#ff3a4a)' : 'rgba(255,255,255,0.06)',
                  border: 'none', cursor: (input.trim() && isOnline) ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 200ms ease',
                  boxShadow: (input.trim() && isOnline) ? '0 4px 16px rgba(232,16,42,0.3)' : 'none',
                  opacity: isOnline ? 1 : 0.5,
                }}
              >
                {sending ? <Spinner size="sm" color="white" /> : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Right Pinned Sidebar ── */}
        {pinnedOpen && (
          <aside style={{
            width: isMobile ? '100%' : 280,
            position: isMobile ? 'absolute' : 'relative',
            right: 0, top: 0, bottom: 0,
            zIndex: isMobile ? 30 : 1,
            flexShrink: 0,
            background: 'rgba(8,8,16,0.95)',
            backdropFilter: 'blur(20px)',
            borderLeft: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', flexDirection: 'column',
            overflowY: 'auto',
            boxShadow: isMobile ? '-8px 0 32px rgba(0,0,0,0.8)' : 'none',
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f0f0fa', display: 'flex', alignItems: 'center', gap: 8 }}>
                <PremiumIcon name="pin" size={18} color="#ffc107" />
                Pinned Messages
              </h3>
              <button onClick={() => setPinnedOpen(false)} style={{ background: 'none', border: 'none', color: '#6b6b85', fontSize: '0.8rem', cursor: 'pointer' }}>Close</button>
            </div>
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pinnedMessages.length === 0 ? (
                <p style={{ fontSize: '0.75rem', color: '#6b6b85', textAlign: 'center', padding: '40px 0' }}>
                  No pinned messages. Hover on a message and click the <PremiumIcon name="pin" size={14} color="#ffc107" style={{ display: 'inline' }} /> icon to pin it here.
                </p>
              ) : (
                pinnedMessages.map((msg, i) => (
                  <div key={msg._id || i} style={{
                    padding: 12, borderRadius: 12,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}>
                    <p style={{ fontSize: '0.7rem', color: '#ff6b7a', fontWeight: 700, marginBottom: 4 }}>
                      {msg.senderName || 'Member'}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: '#f0f0fa', lineHeight: 1.4 }}>{msg.text}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                      <span style={{ fontSize: '0.625rem', color: '#4a4a60' }}>
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                      </span>
                      <button onClick={() => handlePin(msg)} style={{ background: 'none', border: 'none', color: '#f87171', fontSize: '0.7rem', cursor: 'pointer' }}>
                        Unpin
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        )}

        {/* ── Right Members Sidebar ── */}
        {membersOpen && (
          <aside style={{
            width: isMobile ? '100%' : 280,
            position: isMobile ? 'absolute' : 'relative',
            right: 0, top: 0, bottom: 0,
            zIndex: isMobile ? 30 : 1,
            flexShrink: 0,
            background: 'rgba(8,8,16,0.95)',
            backdropFilter: 'blur(20px)',
            borderLeft: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', flexDirection: 'column',
            overflowY: 'auto',
            boxShadow: isMobile ? '-8px 0 32px rgba(0,0,0,0.8)' : 'none',
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f0f0fa', display: 'flex', alignItems: 'center', gap: 8 }}>
                <PremiumIcon name="group" size={18} color="#ff6b7a" />
                Room Members ({room?.members?.length || 0})
              </h3>
              <button onClick={() => setMembersOpen(false)} style={{ background: 'none', border: 'none', color: '#6b6b85', fontSize: '0.8rem', cursor: 'pointer' }}>Close</button>
            </div>
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {room?.members?.map((m, i) => {
                const name = m.name || m.user?.name || 'User';
                const age = m.age || m.user?.age;
                return (
                  <div key={i} style={{
                    padding: 12, borderRadius: 12,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex', alignItems: 'center', gap: 10
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: m.isHost ? '#f5a623' : '#ff6b7a' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.85rem', color: '#f0f0fa', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                        {name}
                        {m.isHost && (
                          <span style={{
                            fontSize: '0.65rem', padding: '1px 5px', borderRadius: 4,
                            background: 'rgba(245,166,35,0.12)', color: '#f5a623',
                            border: '1px solid rgba(245,166,35,0.25)', fontWeight: 700
                          }}>Host</span>
                        )}
                      </p>
                      {age && <p style={{ fontSize: '0.75rem', color: '#6b6b85', margin: '2px 0 0' }}>{age} years old</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default Chat;
