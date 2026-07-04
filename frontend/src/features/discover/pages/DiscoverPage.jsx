import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../shared/components/Navbar';
import * as discoverService from '../../../services/discoverService';
import { PremiumIcon } from '../../../shared/components/icons/IconComponents';

const DiscoverPage = () => {
  const navigate = useNavigate();
  const [feed, setFeed] = useState({
    trendingMovies: [],
    popularTheatres: [],
    recentActivity: [],
    communityNotes: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Noticeboard states
  const [noteText, setNoteText] = useState('');
  const [postingNote, setPostingNote] = useState(false);
  const [noteError, setNoteError] = useState('');

  const fetchFeed = async () => {
    try {
      const res = await discoverService.getDiscoverFeed();
      setFeed({
        trendingMovies: res.trendingMovies || [],
        popularTheatres: res.popularTheatres || [],
        recentActivity: res.recentActivity || [],
        communityNotes: res.communityNotes || []
      });
    } catch (err) {
      console.error('Failed to load discover feed:', err);
      setError('Could not fetch activity feed. Please check back shortly.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const handlePostNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setPostingNote(true);
    setNoteError('');
    try {
      await discoverService.postCommunityNote(noteText);
      setNoteText('');
      await fetchFeed();
    } catch (err) {
      setNoteError(err.response?.data?.message || 'Could not post note.');
    } finally {
      setPostingNote(false);
    }
  };

  // Helper for generating user initials avatar
  const getInitials = (name) => {
    if (!name) return 'PM';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#05050a', color: '#f0f0fa', paddingTop: 100, paddingBottom: 60, position: 'relative' }}>
      <Navbar />

      {/* Decorative Blur Backdrops */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }} aria-hidden="true">
        <div style={{ position: 'absolute', top: '10%', right: '5%', width: 500, height: 400, background: 'radial-gradient(ellipse, rgba(232,16,42,0.05) 0%, transparent 70%)', filter: 'blur(100px)' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: 500, height: 400, background: 'radial-gradient(ellipse, rgba(59,130,246,0.04) 0%, transparent 70%)', filter: 'blur(100px)' }} />
      </div>

      <div className="section-container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 1 }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48, animation: 'slideUp 0.6s cubic-bezier(0.16,1,0.3,1) both' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.12em', color: '#e8102a', textTransform: 'uppercase', marginBottom: 8 }}>
            Community Hub
          </p>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3rem)', background: 'linear-gradient(135deg, #f0f0fa 0%, #a8a8c0 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0, letterSpacing: '-0.03em' }}>
            Discover PhilixMate
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#6b6b85', marginTop: 10, maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
            Check trending movies, popular local theatres, or leave a note on our community noticeboard.
          </p>
        </div>

        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '16px', borderRadius: 14,
            background: 'rgba(232,16,42,0.08)',
            border: '1px solid rgba(232,16,42,0.2)',
            color: '#ff6b7a',
            fontSize: '0.9rem',
            marginBottom: 24,
            animation: 'slideUp 0.3s ease-out'
          }}>
            <PremiumIcon name="cross" size={18} color="#ff6b7a" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <div className="spinner" style={{ margin: '0 auto 20px', width: 40, height: 40, border: '3px solid rgba(232,16,42,0.1)', borderTopColor: '#e8102a', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: '#6b6b85', fontSize: '0.9rem' }}>Connecting to PhilixMate...</p>
          </div>
        ) : (
          <div className="discover-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32, animation: 'slideUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s both' }}>
            
            {/* ── Left Column: Billboard Noticeboard & Actions ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              
              {/* Noticeboard Card */}
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 24,
                padding: '24px 28px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                  <PremiumIcon name="edit" size={20} color="#e8102a" />
                  <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.25rem', color: '#f0f0fa', margin: 0 }}>
                    Noticeboard
                  </h2>
                </div>

                {/* Post note form */}
                <form onSubmit={handlePostNote} style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input
                      placeholder="Share a quick note (e.g. 'Dune at PVR 6pm?')"
                      maxLength={120}
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 12,
                        color: '#f0f0fa',
                        fontSize: '0.875rem',
                        outline: 'none',
                        transition: 'border-color 200ms ease'
                      }}
                      onFocus={e => e.target.style.borderColor = '#e8102a'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                    <button
                      type="submit"
                      disabled={postingNote || !noteText.trim()}
                      style={{
                        padding: '10px 18px',
                        borderRadius: 12,
                        background: 'linear-gradient(135deg, #e8102a, #ff4b5e)',
                        border: 'none',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        opacity: noteText.trim() ? 1 : 0.6,
                        transition: 'all 200ms ease'
                      }}
                    >
                      Post
                    </button>
                  </div>
                  {noteError && (
                    <p style={{ color: '#ff6b7a', fontSize: '0.75rem', marginTop: 6, margin: '6px 0 0' }}>{noteError}</p>
                  )}
                </form>

                {/* Notes scrolling list */}
                <div style={{ maxHeight: 290, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, paddingRight: 4 }} className="custom-scroll">
                  {feed.communityNotes.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px 0', color: '#6b6b85', fontSize: '0.85rem', fontStyle: 'italic' }}>
                      No community notes yet. Be the first to leave one!
                    </div>
                  ) : (
                    feed.communityNotes.map((note) => (
                      <div key={note.id} style={{
                        display: 'flex',
                        gap: 12,
                        padding: '12px 14px',
                        background: 'rgba(255,255,255,0.015)',
                        border: '1px solid rgba(255,255,255,0.03)',
                        borderRadius: 14,
                        alignItems: 'flex-start'
                      }}>
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, rgba(232,16,42,0.2) 0%, rgba(59,130,246,0.2) 100%)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: '#e8102a',
                          flexShrink: 0
                        }}>
                          {getInitials(note.userName)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f0f0fa' }}>{note.userName}</span>
                            <span style={{ fontSize: '0.7rem', color: '#4a4a60' }}>
                              {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.85rem', color: '#a8a8c0', margin: 0, wordBreak: 'break-word', lineHeight: 1.4 }}>
                            {note.text}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quick Actions Card */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(232,16,42,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                border: '1px solid rgba(232,16,42,0.15)',
                borderRadius: 24,
                padding: '24px 28px'
              }}>
                <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.15rem', color: '#f0f0fa', margin: '0 0 6px' }}>
                  Quick Navigation
                </h2>
                <p style={{ fontSize: '0.8rem', color: '#6b6b85', marginBottom: 18 }}>
                  Instantly access core rooms and companion matching services.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <button
                    onClick={() => navigate('/dashboard')}
                    style={{
                      padding: '12px',
                      borderRadius: 12,
                      background: 'linear-gradient(135deg, #e8102a, #ff4b5e)',
                      border: 'none',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(232,16,42,0.2)',
                      transition: 'transform 150ms ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                  >
                    Match Lobby
                  </button>
                  <button
                    onClick={() => navigate('/search')}
                    style={{
                      padding: '12px',
                      borderRadius: 12,
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#f0f0fa',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      transition: 'all 150ms ease'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.transform = 'none'; }}
                  >
                    Search Catalog
                  </button>
                </div>
              </div>

            </div>

            {/* ── Right Column: Trending Statistics & Feed ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              
              {/* Stats Card */}
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 24,
                padding: '24px 28px'
              }}>
                {/* Tab like title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <PremiumIcon name="movie" size={20} color="#e8102a" />
                  <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.25rem', color: '#f0f0fa', margin: 0 }}>
                    Trending & Popular
                  </h2>
                </div>

                {/* Trending Movies Sub-Section */}
                <div style={{ marginBottom: 24 }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#e8102a', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>🔥</span> Trending Movies
                  </p>
                  {feed.trendingMovies.length === 0 ? (
                    <p style={{ color: '#4a4a60', fontSize: '0.85rem', margin: 0, fontStyle: 'italic' }}>No trending movies recorded.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {feed.trendingMovies.slice(0, 5).map((movie, idx) => (
                        <div key={idx} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          background: 'rgba(255,255,255,0.01)',
                          border: '1px solid rgba(255,255,255,0.03)',
                          borderRadius: 12
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ color: '#e8102a', fontWeight: 800, fontSize: '0.85rem' }}>#{idx+1}</span>
                            <span style={{ fontSize: '0.85rem', color: '#a8a8c0', fontWeight: 600 }}>{movie}</span>
                          </div>
                          <span style={{ fontSize: '0.7rem', background: 'rgba(232,16,42,0.1)', color: '#ff6b7a', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>
                            Active
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Popular Theatres Sub-Section */}
                <div>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ff4b5e', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>🏢</span> Popular Theatres
                  </p>
                  {feed.popularTheatres.length === 0 ? (
                    <p style={{ color: '#4a4a60', fontSize: '0.85rem', margin: 0, fontStyle: 'italic' }}>No theatre stats recorded.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {feed.popularTheatres.slice(0, 5).map((theatre, idx) => (
                        <div key={idx} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          background: 'rgba(255,255,255,0.01)',
                          border: '1px solid rgba(255,255,255,0.03)',
                          borderRadius: 12
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ color: '#ff4b5e', fontWeight: 800, fontSize: '0.85rem' }}>#{idx+1}</span>
                            <span style={{ fontSize: '0.85rem', color: '#a8a8c0', fontWeight: 600 }}>{theatre}</span>
                          </div>
                          <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.05)', color: '#6b6b85', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
                            Busy
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Recent Activity Card */}
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 24,
                padding: '24px 28px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <PremiumIcon name="clock" size={20} color="#e8102a" />
                  <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.25rem', color: '#f0f0fa', margin: 0 }}>
                    Recent Activity
                  </h2>
                </div>
                {feed.recentActivity.length === 0 ? (
                  <p style={{ color: '#6b6b85', fontSize: '0.875rem', margin: 0, fontStyle: 'italic' }}>No recent matchmaking activities.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 310, overflowY: 'auto', paddingRight: 4 }} className="custom-scroll">
                    {feed.recentActivity.map((activity, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        background: 'rgba(255,255,255,0.015)',
                        border: '1px solid rgba(255,255,255,0.03)',
                        borderRadius: 12,
                        fontSize: '0.82rem'
                      }}>
                        <span style={{ color: '#a8a8c0', fontWeight: 500 }}>{activity.message}</span>
                        <span style={{ color: '#4a4a60', fontSize: '0.75rem' }}>
                          {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .custom-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(232, 16, 42, 0.4);
        }
        
        @media (max-width: 768px) {
          .discover-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DiscoverPage;
