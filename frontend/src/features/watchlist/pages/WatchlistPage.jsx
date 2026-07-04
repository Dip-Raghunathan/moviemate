import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../shared/components/Navbar';
import * as watchlistService from '../../../services/watchlistService';
import { PremiumIcon } from '../../../shared/components/icons/IconComponents';

const WatchlistPage = () => {
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add Movie Form States
  const [newMovieName, setNewMovieName] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Search Filter State
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch watchlist items on mount
  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      const res = await watchlistService.getWatchlist();
      setWatchlist(res.watchlist || []);
    } catch (err) {
      console.error('Failed to load watchlist:', err);
      setError('Failed to load watchlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  // Fetch suggestions as user types
  useEffect(() => {
    if (newMovieName.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await watchlistService.getSuggestions(newMovieName);
        setSuggestions(res.suggestions || []);
      } catch (err) {
        console.error('Failed to load suggestions:', err);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [newMovieName]);

  const handleSaveMovie = async (e) => {
    if (e) e.preventDefault();
    if (!newMovieName.trim()) return;

    setError('');
    setSuccess('');

    try {
      const res = await watchlistService.saveMovie(newMovieName.trim());
      setWatchlist(prev => [res.watchlist, ...prev]);
      setSuccess(`"${newMovieName.trim()}" added to your watchlist!`);
      setNewMovieName('');
      setSuggestions([]);
      setShowSuggestions(false);
    } catch (err) {
      console.error('Failed to save movie:', err);
      if (err.response?.data?.errorCode === 'ALREADY_ADDED' || err.message === 'Already Added') {
        setError('Already Added');
      } else {
        setError(err.response?.data?.message || 'Failed to add movie.');
      }
    }
  };

  const handleRemoveMovie = async (id, title) => {
    setError('');
    setSuccess('');
    try {
      await watchlistService.deleteMovie(id);
      setWatchlist(prev => prev.filter(item => item._id !== id));
      setSuccess(`Removed "${title}" from watchlist.`);
    } catch (err) {
      console.error('Failed to remove movie:', err);
      setError('Failed to remove movie from watchlist.');
    }
  };

  const handleFindCompanion = (movieName) => {
    navigate('/dashboard', { state: { movie: movieName } });
  };

  const filteredWatchlist = watchlist.filter(item =>
    item.movieName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: '#05050a', color: '#f0f0fa', paddingTop: 100, paddingBottom: 60 }}>
      <Navbar />
      
      <div className="section-container" style={{ maxWidth: 1000, margin: '0 auto', padding: '0 20px' }}>
        
        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: 40, animation: 'fadeIn 0.5s ease-out' }}>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '2.5rem', background: 'linear-gradient(135deg, #f0f0fa 0%, #a8a8c0 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0, letterSpacing: '-0.03em' }}>
            🍿 My Watchlist
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#6b6b85', marginTop: 8, fontWeight: 500 }}>
            Keep track of the movies you want to experience and find matching show companions.
          </p>
        </div>

        {/* Message Banner Alerts */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '16px', borderRadius: 14,
            background: 'rgba(232,16,42,0.1)',
            border: '1px solid rgba(232,16,42,0.25)',
            color: '#ff6b7a',
            fontWeight: 600,
            fontSize: '0.9rem',
            marginBottom: 24,
            animation: 'slideDown 0.3s ease-out'
          }}>
            <PremiumIcon name="cross" size={18} color="#ff6b7a" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '16px', borderRadius: 14,
            background: 'rgba(52,211,153,0.1)',
            border: '1px solid rgba(52,211,153,0.25)',
            color: '#34d399',
            fontWeight: 600,
            fontSize: '0.9rem',
            marginBottom: 24,
            animation: 'slideDown 0.3s ease-out'
          }}>
            <PremiumIcon name="check" size={18} color="#34d399" />
            <span>{success}</span>
          </div>
        )}

        {/* Add Movie Form & Search */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 24,
          marginBottom: 40,
          animation: 'slideUp 0.5s ease-out both'
        }}>
          
          {/* Form to Add Movie */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 24,
            padding: 24,
            position: 'relative'
          }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.25rem', color: '#f0f0fa', margin: '0 0 16px' }}>
              Add to Watchlist
            </h2>
            <form onSubmit={handleSaveMovie} style={{ position: 'relative' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Enter movie name (e.g. Coolie)..."
                  value={newMovieName}
                  onChange={(e) => {
                    setNewMovieName(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: 14,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    color: '#f0f0fa',
                    fontSize: '0.9rem',
                    transition: 'all 200ms ease',
                    outline: 'none'
                  }}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0,
                    right: 0,
                    background: 'rgba(13,13,26,0.98)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 14,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    zIndex: 10,
                    maxHeight: 200,
                    overflowY: 'auto'
                  }}>
                    {suggestions.map((sug, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setNewMovieName(sug);
                          setSuggestions([]);
                          setShowSuggestions(false);
                        }}
                        style={{
                          padding: '12px 16px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          color: '#a8a8c0',
                          borderBottom: idx === suggestions.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)',
                          transition: 'all 150ms ease'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#f0f0fa'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#a8a8c0'; }}
                      >
                        {sug}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!newMovieName.trim()}
                style={{
                  width: '100%',
                  marginTop: 16,
                  padding: '14px',
                  borderRadius: 14,
                  background: newMovieName.trim() ? 'linear-gradient(135deg, #e8102a, #ff4b5e)' : 'rgba(255,255,255,0.03)',
                  border: 'none',
                  color: newMovieName.trim() ? 'white' : '#4a4a60',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: newMovieName.trim() ? 'pointer' : 'not-allowed',
                  boxShadow: newMovieName.trim() ? '0 8px 24px rgba(232,16,42,0.3)' : 'none',
                  transition: 'all 200ms ease'
                }}
                onMouseEnter={e => { if (newMovieName.trim()) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
              >
                Save Movie
              </button>
            </form>
          </div>

          {/* Search Filter input */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 24,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.25rem', color: '#f0f0fa', margin: '0 0 12px' }}>
              Search Watchlist
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#6b6b85', marginBottom: 16 }}>
              Filter through your list of saved titles instantly.
            </p>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search by movie name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: 14,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  color: '#f0f0fa',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

        </div>

        {/* Watchlist Cards Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div className="spinner" style={{ margin: '0 auto 16px', width: 40, height: 40, border: '3px solid rgba(232,16,42,0.1)', borderTopColor: '#e8102a', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: '#6b6b85', fontSize: '0.9rem' }}>Loading saved movies...</p>
          </div>
        ) : filteredWatchlist.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 24px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px dashed rgba(255,255,255,0.08)',
            borderRadius: 24,
            animation: 'fadeIn 0.5s ease-out'
          }}>
            <p style={{ fontSize: '1.1rem', color: '#a8a8c0', fontWeight: 600, margin: 0 }}>
              {searchQuery ? 'No matching movies found' : 'Your watchlist is empty'}
            </p>
            <p style={{ fontSize: '0.85rem', color: '#6b6b85', marginTop: 6, margin: 0 }}>
              {searchQuery ? 'Try matching a different title' : 'Start adding movies above to plan your theater visits.'}
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 20,
            animation: 'fadeIn 0.5s ease-out'
          }}>
            {filteredWatchlist.map((item) => (
              <div
                key={item._id}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 20,
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: 180,
                  transition: 'all 200ms ease',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'none'; }}
              >
                <div>
                  <h3 style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 800,
                    fontSize: '1.25rem',
                    color: '#f0f0fa',
                    margin: '0 0 6px',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.2
                  }}>
                    {item.movieName}
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: '#6b6b85', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <PremiumIcon name="calendar" size={14} color="#6b6b85" />
                    Added on {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                  <button
                    onClick={() => handleFindCompanion(item.movieName)}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: 12,
                      background: 'linear-gradient(135deg, #e8102a, #ff4b5e)',
                      border: 'none',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(232,16,42,0.2)',
                      transition: 'all 150ms ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                  >
                    Find Companion
                  </button>

                  <button
                    onClick={() => handleRemoveMovie(item._id, item.movieName)}
                    title="Remove Movie"
                    style={{
                      padding: '10px 12px',
                      borderRadius: 12,
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#a8a8c0',
                      cursor: 'pointer',
                      transition: 'all 150ms ease'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ff6b7a'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#a8a8c0'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                  >
                    <PremiumIcon name="cross" size={14} color="currentColor" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
      
      {/* Autocomplete CSS Keyframes */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default WatchlistPage;
