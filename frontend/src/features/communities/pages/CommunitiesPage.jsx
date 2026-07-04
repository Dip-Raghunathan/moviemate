import { useEffect, useState, useRef } from 'react';
import Navbar from '../../../shared/components/Navbar';
import * as communityService from '../../../services/communityService';
import { useAuth } from '../../../core/contexts/AuthContext';
import Spinner from '../../../shared/components/ui/Spinner';
import Avatar from '../../../shared/components/ui/Avatar';
import Badge from '../../../shared/components/ui/Badge';
import { PremiumIcon } from '../../../shared/components/icons/IconComponents';

const CHANNELS = [
  { id: 'general', name: 'general', label: 'General Discussion' },
  { id: 'reviews', name: 'reviews', label: 'Movie Reviews & Ratings' },
  { id: 'spoilers', name: 'spoilers', label: 'Spoiler Alerts!' },
  { id: 'polls', name: 'movie-polls', label: 'Community Movie Voting Polls' },
  { id: 'memes', name: 'memes', label: 'Film Memes & Fun' },
  { id: 'events', name: 'events', label: 'Local Screening Meetups' },
];

const CommunitiesPage = () => {
  const { user } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [activeCommunity, setActiveCommunity] = useState(null);
  const [activeChannel, setActiveChannel] = useState(CHANNELS[0]);
  const [communityData, setCommunityData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [summarizedMsgIds, setSummarizedMsgIds] = useState({});
  const [revealedSpoilerMsgIds, setRevealedSpoilerMsgIds] = useState({});

  const summarizeReviewText = (text) => {
    if (text.length < 50) return [text];
    const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 5);
    if (sentences.length <= 2) return sentences;
    return [
      `Main Premise: ${sentences[0]}.`,
      `Critique: ${sentences[Math.floor(sentences.length / 2)]}.`,
      `Verdict: ${sentences[sentences.length - 1]}.`
    ];
  };

  const messagesEndRef = useRef(null);
  const pollTimerRef = useRef(null);
  const lastMsgTimeRef = useRef(null);

  // 1. Fetch communities list on mount
  useEffect(() => {
    const init = async () => {
      try {
        const res = await communityService.getPublicCommunities();
        setCommunities(res.data || []);
        if (res.data && res.data.length > 0) {
          setActiveCommunity(res.data[0]);
        }
      } catch (err) {
        console.error('Failed to load communities:', err);
      } finally {
        setLoadingList(false);
      }
    };
    init();
  }, []);

  // 2. Fetch community details (members, roles) when active community changes
  useEffect(() => {
    if (!activeCommunity) return;

    const loadDetails = async () => {
      setLoadingDetails(true);
      try {
        const res = await communityService.getCommunityDetails(activeCommunity._id);
        setCommunityData(res.data);
        // Clear message history for new community
        setMessages([]);
        lastMsgTimeRef.current = null;
      } catch (err) {
        console.error('Failed to fetch community details:', err);
      } finally {
        setLoadingDetails(false);
      }
    };

    loadDetails();
  }, [activeCommunity]);

  // 3. Poll messages for the active channel
  useEffect(() => {
    if (!activeCommunity || !activeChannel || !communityData?.isMember) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        const msgs = await communityService.getChannelMessages(
          activeCommunity._id,
          activeChannel.id,
          lastMsgTimeRef.current
        );
        if (msgs && msgs.length > 0) {
          setMessages((prev) => {
            // Deduplicate incoming polled messages
            const existingIds = new Set(prev.map((m) => m._id));
            const newMsgs = msgs.filter((m) => !existingIds.has(m._id));
            if (newMsgs.length === 0) return prev;
            return [...prev, ...newMsgs];
          });
          lastMsgTimeRef.current = msgs[msgs.length - 1].createdAt;
        }
      } catch (err) {
        console.error('Failed to poll channel messages:', err);
      }
    };

    // Initial load
    fetchMessages();

    // Start polling every 3 seconds
    pollTimerRef.current = setInterval(fetchMessages, 3000);

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, [activeCommunity, activeChannel, communityData?.isMember]);

  // Scroll to bottom when messages load/update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleJoin = async () => {
    if (!activeCommunity) return;
    try {
      await communityService.joinCommunity(activeCommunity._id);
      // Refresh details
      const res = await communityService.getCommunityDetails(activeCommunity._id);
      setCommunityData(res.data);
    } catch (err) {
      console.error('Failed to join community:', err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeCommunity || !activeChannel) return;

    try {
      const sentMsg = await communityService.postChannelMessage(
        activeCommunity._id,
        activeChannel.id,
        text.trim()
      );
      setMessages((prev) => [...prev, sentMsg]);
      setText('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#05050a] text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex-1 flex overflow-hidden max-h-[calc(100vh-64px)]">
        {/* Leftmost Community Icons Column */}
        <div className="w-20 bg-[#020204] border-r border-white/[0.03] flex flex-col items-center py-4 gap-4 overflow-y-auto">
          {loadingList ? (
            <Spinner size="sm" />
          ) : (
            communities.map((comm) => {
              const active = activeCommunity?._id === comm._id;
              return (
                <button
                  key={comm._id}
                  onClick={() => setActiveCommunity(comm)}
                  className={`relative w-12 height-12 rounded-2xl overflow-hidden transition-all duration-300 ${
                    active
                      ? 'ring-2 ring-[#e8102a] scale-105 shadow-[0_0_16px_rgba(232,16,42,0.4)]'
                      : 'hover:scale-105 hover:opacity-80'
                  }`}
                  style={{ height: '48px' }}
                >
                  {comm.avatar ? (
                    <img src={comm.avatar} alt={comm.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#1b1b2a] flex items-center justify-center font-bold text-xs">
                      {comm.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Center Sidebar: Channels Drawer */}
        <div className="w-60 bg-[#08080f] border-r border-white/[0.03] flex flex-col p-4">
          {activeCommunity && (
            <>
              <div className="mb-6">
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-1.5 leading-tight">
                  {activeCommunity.name}
                  <Badge variant="glow" className="text-[10px]">Active</Badge>
                </h2>
                <p className="text-xs text-slate-400 font-medium mt-1 leading-relaxed line-clamp-2">
                  {activeCommunity.description}
                </p>
              </div>

              <div className="flex-1 flex flex-col gap-1 overflow-y-auto">
                <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-2">
                  Text Channels
                </span>
                {CHANNELS.map((ch) => {
                  const active = activeChannel.id === ch.id;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => setActiveChannel(ch)}
                      className={`text-left text-xs font-semibold px-3 py-2.5 rounded-lg transition-all ${
                        active
                          ? 'bg-white/[0.06] text-[#ff4b5e]'
                          : 'text-slate-400 hover:bg-white/[0.02] hover:text-slate-200'
                      }`}
                    >
                      {ch.name}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Right Main Chat Frame */}
        <div className="flex-1 flex flex-col bg-[#05050a] relative">
          {activeCommunity && (
            <>
              {/* Channel Header */}
              <div className="h-16 border-b border-white/[0.03] flex items-center justify-between px-6 bg-white/[0.01] backdrop-blur-md z-10">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    {activeChannel.name}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {activeChannel.label}
                  </span>
                </div>

                {!communityData?.isMember && (
                  <button
                    onClick={handleJoin}
                    className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#e8102a] to-[#ff4b5e] text-xs font-bold shadow-[0_4px_16px_rgba(232,16,42,0.3)] hover:brightness-110 active:scale-95 transition-all"
                  >
                    Join Community
                  </button>
                )}
              </div>

              {/* Message History area */}
              <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
                {loadingDetails ? (
                  <div className="flex-1 flex items-center justify-center">
                    <Spinner size="md" />
                  </div>
                ) : !communityData?.isMember ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <div className="mb-4">
                      <PremiumIcon name="lock" size={48} color="#e8102a" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-200">Join Community to Discuss</h3>
                    <p className="text-xs text-slate-400 max-w-sm mt-2 leading-relaxed">
                      You are viewing this channel as a guest. Click join in the top right to start posting reviews, sharing memes, and co-watching shows!
                    </p>
                  </div>
                ) : activeChannel.id === 'polls' ? (
                  <div style={{ flex: 1, padding: 12, overflowY: 'auto' }}>
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(232,16,42,0.1) 0%, rgba(8,8,16,0.6) 100%)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 20,
                      padding: 24,
                      marginBottom: 20
                    }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f0f0fa', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <PremiumIcon name="popcorn" size={20} color="#ff6b7a" /> Weekly Community Choice Watch Poll
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: '#a8a8c0', marginBottom: 24 }}>
                        Vote on which movie we should match and watch together this weekend at local theaters in your city!
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        {[
                          { id: 1, title: 'Deadpool & Wolverine', votes: 42, color: '#ff6b7a' },
                          { id: 2, title: 'Dune: Part Two', votes: 28, color: '#3b82f6' },
                          { id: 3, title: 'Inside Out 2', votes: 15, color: '#10b981' }
                        ].map((movieOption) => {
                          const totalVotes = 85;
                          const percentage = Math.round((movieOption.votes / totalVotes) * 100);
                          return (
                            <div key={movieOption.id} style={{ position: 'relative' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: '#f0f0fa', marginBottom: 8 }}>
                                <span>{movieOption.title}</span>
                                <span style={{ color: movieOption.color }}>{percentage}% ({movieOption.votes} votes)</span>
                              </div>
                              <div style={{ height: 10, background: 'rgba(255,255,255,0.04)', borderRadius: 5, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${percentage}%`, background: movieOption.color, borderRadius: 5, transition: 'width 0.4s ease' }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
                        <button
                          onClick={() => window.location.href = '/dashboard?movie=Deadpool%20%26%20Wolverine'}
                          style={{
                            padding: '10px 20px',
                            background: 'linear-gradient(135deg, #e8102a, #ff3a4a)',
                            border: 'none', borderRadius: 12,
                            color: 'white', fontWeight: 700, fontSize: '0.8rem',
                            cursor: 'pointer', transition: 'all 200ms ease',
                          }}
                        >
                          Match For winning movie ➔
                        </button>
                      </div>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 text-xs gap-2">
                    <span>Welcome to the beginning of the #{activeChannel.id} channel!</span>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender?.toString() === user?.id?.toString();
                    const isReviewChannel = activeChannel.id === 'reviews' || activeChannel.id === 'spoilers';
                    const isSpoilerChannel = activeChannel.id === 'spoilers';
                    const containsSpoilers = isSpoilerChannel || /spoiler|ending|twist|dies|death|reveal|killed|secret|climax/i.test(msg.text);
                    const isRevealed = revealedSpoilerMsgIds[msg._id];
                    const isSummarized = summarizedMsgIds[msg._id];

                    return (
                      <div key={msg._id} className="flex gap-3 hover:bg-white/[0.01] p-2.5 rounded-xl border border-transparent hover:border-white/[0.03] transition-all">
                        <Avatar size="sm" name={msg.senderName} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-baseline gap-2">
                              <span className="text-xs font-bold text-slate-200">{msg.senderName}</span>
                              <span className="text-[9px] text-slate-500 font-bold">
                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            
                            {/* AI Helper Actions for Reviews */}
                            {isReviewChannel && (
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setSummarizedMsgIds(prev => ({ ...prev, [msg._id]: !prev[msg._id] }))}
                                  style={{
                                    fontSize: '10px',
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    background: isSummarized ? 'rgba(0,240,255,0.15)' : 'rgba(255,255,255,0.05)',
                                    border: `1px solid ${isSummarized ? 'rgba(0,240,255,0.3)' : 'rgba(255,255,255,0.1)'}`,
                                    color: isSummarized ? '#00f0ff' : '#6b6b85',
                                    cursor: 'pointer',
                                    transition: 'all 200ms ease'
                                  }}
                                >
                                  Summarize
                                </button>
                                {containsSpoilers && (
                                  <button
                                    type="button"
                                    onClick={() => setRevealedSpoilerMsgIds(prev => ({ ...prev, [msg._id]: !prev[msg._id] }))}
                                    style={{
                                      fontSize: '10px',
                                      padding: '2px 8px',
                                      borderRadius: '6px',
                                      background: isRevealed ? 'rgba(245,166,35,0.15)' : 'rgba(232,16,42,0.15)',
                                      border: `1px solid ${isRevealed ? 'rgba(245,166,35,0.3)' : 'rgba(232,16,42,0.3)'}`,
                                      color: isRevealed ? '#f5a623' : '#ff6b7a',
                                      cursor: 'pointer',
                                      transition: 'all 200ms ease'
                                    }}
                                  >
                                    {isRevealed ? 'Spoilers Shown' : 'Hide Spoilers'}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Review Content (with Spoiler Blurring if active) */}
                          <div style={{ marginTop: '4px', position: 'relative' }}>
                            {containsSpoilers && !isRevealed ? (
                              <div
                                onClick={() => setRevealedSpoilerMsgIds(prev => ({ ...prev, [msg._id]: true }))}
                                style={{
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  background: 'rgba(232,16,42,0.06)',
                                  border: '1px dashed rgba(232,16,42,0.25)',
                                  cursor: 'pointer',
                                  position: 'relative',
                                  overflow: 'hidden'
                                }}
                              >
                                <span style={{ fontSize: '11px', color: '#ff6b7a', fontWeight: 700, display: 'block', marginBottom: '2px' }}>
                                  SPOILER ALERT (Click to reveal)
                                </span>
                                <p className="text-xs text-slate-300 font-medium leading-relaxed select-none" style={{ filter: 'blur(6px)', opacity: 0.35 }}>
                                  {msg.text}
                                </p>
                              </div>
                            ) : (
                              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                                {msg.text}
                              </p>
                            )}
                          </div>

                          {/* AI Summary Panel */}
                          {isSummarized && (
                            <div style={{
                              marginTop: 10,
                              padding: '10px 14px',
                              background: 'rgba(0,240,255,0.04)',
                              border: '1px solid rgba(0,240,255,0.15)',
                              borderRadius: 12,
                              fontSize: '11px'
                            }}>
                              <span style={{ color: '#00f0ff', fontWeight: 800, display: 'block', marginBottom: 6 }}>AI Summarizer Bullet List</span>
                              <ul style={{ paddingLeft: 14, listStyleType: 'disc', color: '#a8a8c0', display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {summarizeReviewText(msg.text).map((bullet, bIdx) => (
                                  <li key={bIdx} style={{ lineHeight: 1.3 }}>{bullet}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              {communityData?.isMember && activeChannel.id !== 'polls' && (
                <form onSubmit={handleSend} className="p-4 border-t border-white/[0.03]">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder={`Message ${activeChannel.name}`}
                      className="w-full bg-[#0a0a14] border border-white/[0.04] rounded-xl pl-4 pr-12 py-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#e8102a] focus:ring-1 focus:ring-[#e8102a]"
                    />
                    <button
                      type="submit"
                      disabled={!text.trim()}
                      className="absolute right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-100 disabled:opacity-50 disabled:hover:text-slate-400 transition-colors"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"/>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                      </svg>
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>

        {/* Rightmost Sidebar: Active Members list */}
        {activeCommunity && communityData?.isMember && (
          <div className="w-56 bg-[#08080f] border-l border-white/[0.03] flex flex-col p-4 overflow-y-auto">
            <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-4">
              Online Members — {communityData.members?.length || 0}
            </span>
            <div className="flex flex-col gap-3">
              {communityData.members?.map((m) => (
                <div key={m._id} className="flex items-center gap-2.5">
                  <Avatar size="xs" src={m.user?.profilePicture} name={m.user?.name} />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-slate-300 truncate">
                      {m.user?.name}
                    </span>
                    <span className="text-[9px] text-slate-500 font-bold capitalize">
                      {m.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunitiesPage;
