import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import * as roomService from '../services/roomService';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    movie: 'Obsession',
    cinema: 'Devgn CineX',
    date: '2026-06-20',
    time: '19:30',
  });
  const [matchType, setMatchType] = useState('solo'); // 'solo' | 'group'
  const [intent, setIntent] = useState('friendship'); // 'friendship' | 'date' - only used when solo
  const [womenOnly, setWomenOnly] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isFemale = user?.gender === 'female';
  // Women-only toggle only makes sense for friendship intent (date is already
  // opposite-gender by definition), and only for female users.
  const showWomenOnlyToggle = isFemale && intent === 'friendship';

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleMatchTypeChange = (type) => {
    setMatchType(type);
    if (type === 'group') {
      // Group is always friendship per spec - no date option in groups
      setIntent('friendship');
    }
  };

  const handleStartMatch = async () => {
    setError('');
    if (!form.movie || !form.cinema || !form.date || !form.time) {
      setError('Please fill in all show details first.');
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
      navigate('/matching', { state: { roomId: room.id } });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start matching. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container mx-auto max-w-[1200px] px-5 pt-32 pb-12">
        <h2 className="mb-8 text-3xl font-semibold">Find a Match</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Form */}
          <div className="glass-card">
            <h3 className="mb-5 text-xl font-semibold">Enter Show Details</h3>

            <div className="mb-5 text-left">
              <label className="block mb-2 text-text-muted text-sm">Movie Name</label>
              <input name="movie" className="form-input" value={form.movie} onChange={handleChange} />
            </div>
            <div className="mb-5 text-left">
              <label className="block mb-2 text-text-muted text-sm">Cinema Hall</label>
              <input name="cinema" className="form-input" value={form.cinema} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="text-left">
                <label className="block mb-2 text-text-muted text-sm">Date</label>
                <input type="date" name="date" className="form-input" value={form.date} onChange={handleChange} />
              </div>
              <div className="text-left">
                <label className="block mb-2 text-text-muted text-sm">Show Time</label>
                <input type="time" name="time" className="form-input" value={form.time} onChange={handleChange} />
              </div>
            </div>

            {/* Match type */}
            <div className="mb-5">
              <label className="block mb-2 text-text-muted text-sm">Match Type</label>
              <div className="flex gap-3">
                <button
                  className={`flex-1 py-3 rounded-lg border font-medium transition-colors ${
                    matchType === 'solo' ? 'bg-primary-red border-primary-red' : 'border-white/20 text-text-muted'
                  }`}
                  onClick={() => handleMatchTypeChange('solo')}
                >
                  Solo Match (2)
                </button>
                <button
                  className={`flex-1 py-3 rounded-lg border font-medium transition-colors ${
                    matchType === 'group' ? 'bg-primary-red border-primary-red' : 'border-white/20 text-text-muted'
                  }`}
                  onClick={() => handleMatchTypeChange('group')}
                >
                  Group Match (4)
                </button>
              </div>
            </div>

            {/* Intent - only for solo */}
            {matchType === 'solo' && (
              <div className="mb-5">
                <label className="block mb-2 text-text-muted text-sm">What are you looking for?</label>
                <div className="flex gap-3">
                  <button
                    className={`flex-1 py-3 rounded-lg border font-medium transition-colors ${
                      intent === 'friendship' ? 'bg-white/10 border-white' : 'border-white/20 text-text-muted'
                    }`}
                    onClick={() => setIntent('friendship')}
                  >
                    🎬 Friendship
                  </button>
                  <button
                    className={`flex-1 py-3 rounded-lg border font-medium transition-colors ${
                      intent === 'date' ? 'bg-white/10 border-white' : 'border-white/20 text-text-muted'
                    }`}
                    onClick={() => setIntent('date')}
                  >
                    💕 Date
                  </button>
                </div>
                {intent === 'date' && (
                  <p className="text-xs text-text-muted mt-2">
                    You'll be matched 1-on-1 with someone of the opposite gender.
                  </p>
                )}
              </div>
            )}

            {matchType === 'group' && (
              <p className="text-xs text-text-muted mb-5">
                Group rooms are friendship-only movie buddies — mixed genders welcome.
              </p>
            )}

            {/* Women-only safety toggle */}
            {showWomenOnlyToggle && (
              <div className="mb-5 flex items-center justify-between glass-card !p-4 border-primary-red/30">
                <div className="text-left pr-4">
                  <p className="font-medium text-sm">👩 Women-only matching</p>
                  <p className="text-xs text-text-muted mt-1">Only match me with other women, for safety.</p>
                </div>
                <button
                  role="switch"
                  aria-checked={womenOnly}
                  onClick={() => setWomenOnly(!womenOnly)}
                  className={`w-12 h-7 rounded-full flex items-center px-1 transition-colors shrink-0 ${
                    womenOnly ? 'bg-primary-red justify-end' : 'bg-white/20 justify-start'
                  }`}
                >
                  <span className="w-5 h-5 bg-white rounded-full block" />
                </button>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 mb-4 text-left">
                {error}
              </div>
            )}

            <button className="btn-primary w-full mt-2" onClick={handleStartMatch} disabled={loading}>
              {loading ? 'Starting...' : 'Find My Match'}
            </button>
          </div>

          {/* Right: Preview */}
          <div className="glass-card border-l-4 border-primary-red">
            <h3 className="mb-5 text-text-muted text-lg">Your Ticket Preview</h3>
            <div className="flex justify-between border-b border-white/10 pb-2 mb-3">
              <span>Movie:</span> <strong>{form.movie || '--'}</strong>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2 mb-3">
              <span>Cinema:</span> <strong>{form.cinema || '--'}</strong>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2 mb-3">
              <span>Date:</span> <strong>{form.date || '--'}</strong>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2 mb-3">
              <span>Time:</span> <strong>{form.time || '--'}</strong>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2 mb-3">
              <span>Match Type:</span> <strong className="capitalize">{matchType}</strong>
            </div>
            {matchType === 'solo' && (
              <div className="flex justify-between border-b border-white/10 pb-2 mb-3">
                <span>Looking for:</span> <strong className="capitalize">{intent}</strong>
              </div>
            )}
            {showWomenOnlyToggle && womenOnly && (
              <div className="flex justify-between pb-2">
                <span>Safety Mode:</span> <strong className="text-primary-red">Women Only</strong>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
