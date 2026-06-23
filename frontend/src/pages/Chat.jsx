import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import * as roomService from '../services/roomService';
import * as chatService from '../services/chatService';

const AVATAR_COLORS = ['#E50914', '#3b82f6', '#10b981', '#f59e0b'];

const Chat = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const lastMessageTime = useRef(null);
  const chatBoxRef = useRef(null);
  const pollRef = useRef(null);

  // Load room details once, then poll for new messages every 2.5s.
  useEffect(() => {
    let cancelled = false;

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
        if (newMsgs.length > 0) {
          setMessages((prev) => [...prev, ...newMsgs]);
          lastMessageTime.current = newMsgs[newMsgs.length - 1].createdAt;
        }
      } catch (err) {
        // Silently ignore transient poll failures; don't spam the user with errors
      }
    };

    loadRoom();
    pollMessages();
    pollRef.current = setInterval(() => {
      loadRoom(); // also refresh member count / status periodically
      pollMessages();
    }, 2500);

    return () => {
      cancelled = true;
      clearInterval(pollRef.current);
    };
  }, [roomId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const text = input;
    setInput('');
    try {
      const message = await chatService.postMessage(roomId, text);
      setMessages((prev) => [...prev, message]);
      lastMessageTime.current = message.createdAt;
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send message.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  const handleLeave = async () => {
    try {
      await roomService.leaveRoom(roomId);
    } catch {
      // even if the leave call fails, still navigate away
    }
    navigate('/dashboard');
  };

  if (error && !room) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto max-w-[1200px] px-5 pt-32 text-center text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div>
      <nav className="flex justify-between items-center px-5 py-5 fixed top-0 w-full z-10 bg-bg-dark/95">
        <div className="text-2xl font-bold text-primary-red">
          {room ? `Room #${room.id.slice(-4).toUpperCase()}` : 'Loading...'}
        </div>
        <button onClick={handleLeave} className="btn-outline !py-2 !px-4 text-sm">
          Leave Room
        </button>
      </nav>

      <div className="container mx-auto max-w-[1200px] px-5 pt-28 pb-5 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-5 h-[75vh] md:h-[75vh]">
          {/* Sidebar */}
          <div className="glass-card overflow-y-auto max-h-[200px] md:max-h-none">
            <h3 className="mb-3 font-semibold">
              Members ({room?.memberCount ?? '...'}/{room?.capacity ?? '...'})
            </h3>
            {room?.members?.map((m, idx) => (
              <div key={m.user} className="flex items-center gap-3 py-2 border-b border-white/10">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0"
                  style={{ background: AVATAR_COLORS[idx % AVATAR_COLORS.length] }}
                >
                  {(m.name || '?')[0].toUpperCase()}
                </div>
                <div className="truncate">{m.user === user?.id ? 'You' : m.name}</div>
              </div>
            ))}
          </div>

          {/* Chat main */}
          <div className="glass-card flex flex-col justify-between h-[60vh] md:h-auto">
            <div ref={chatBoxRef} className="flex-1 overflow-y-auto p-2 flex flex-col gap-3">
              {messages.map((msg) => {
                const isSystem = msg.isSystem;
                const isMine = msg.sender === user?.id;
                if (isSystem) {
                  return (
                    <div key={msg._id} className="text-center text-xs text-text-muted py-1">
                      {msg.text}
                    </div>
                  );
                }
                return (
                  <div
                    key={msg._id}
                    className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                      isMine
                        ? 'bg-primary-red self-end rounded-br-none'
                        : 'bg-white/10 self-start rounded-bl-none'
                    }`}
                  >
                    {!isMine && <strong className="block text-xs text-text-muted mb-1">{msg.senderName}</strong>}
                    {msg.text}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-3 mt-4">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 p-4 rounded-lg bg-black/50 outline-none"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button className="btn-primary" onClick={handleSend}>
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
