import { useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import * as userService from '../services/userService';

const comingSoon = [
  { icon: '🛡️', title: 'ID Verification', text: 'Get a verified badge by uploading a valid ID for safer matching.' },
  { icon: '⭐', title: 'User Ratings', text: 'Rate your companions post-movie to build community trust.' },
];

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [saving, setSaving] = useState(false);

  const handleToggleWomenOnly = async () => {
    setSaving(true);
    try {
      const updated = await userService.updateProfile({ womenOnlyMode: !user.womenOnlyMode });
      updateUser(updated);
    } catch {
      // fail silently, the toggle simply won't visually update
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div>
      <Navbar />
      <div className="container mx-auto max-w-[1200px] px-5 pt-32 pb-12 animate-fade-in">
        <div className="glass-card flex flex-col md:flex-row items-center gap-5 mb-10 text-center md:text-left">
          <div className="min-w-[100px] h-[100px] rounded-full bg-gradient-to-br from-primary-red to-[#ff4b4b] flex items-center justify-center text-3xl font-bold">
            {user.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-1">
              {user.name}{' '}
              {user.isPro && (
                <span className="bg-primary-red px-2 py-1 rounded text-xs ml-2 align-middle">PRO</span>
              )}
            </h2>
            <p className="text-text-muted">
              Age: {user.age} | Gender: <span className="capitalize">{user.gender}</span>
            </p>
            <p>Favorite Genres: {user.favoriteGenres?.length ? user.favoriteGenres.join(', ') : 'None set'}</p>
            <p>
              Movies Attended: <strong>{user.moviesAttended}</strong>
            </p>
          </div>
        </div>

        {/* Women-only safety preference - only shown for female accounts */}
        {user.gender === 'female' && (
          <div className="glass-card mb-10 flex items-center justify-between border-primary-red/30">
            <div className="text-left pr-4">
              <p className="font-medium">👩 Default to women-only matching</p>
              <p className="text-xs text-text-muted mt-1">
                When enabled, Friendship matches (Solo or Group) will only place you in rooms with other women by
                default. You can still override this per match on the Dashboard.
              </p>
            </div>
            <button
              role="switch"
              aria-checked={user.womenOnlyMode}
              onClick={handleToggleWomenOnly}
              disabled={saving}
              className={`w-12 h-7 rounded-full flex items-center px-1 transition-colors shrink-0 ${
                user.womenOnlyMode ? 'bg-primary-red justify-end' : 'bg-white/20 justify-start'
              }`}
            >
              <span className="w-5 h-5 bg-white rounded-full block" />
            </button>
          </div>
        )}

        <h3 className="mb-5 text-xl font-semibold">Coming Soon to MovieMate</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {comingSoon.map((f) => (
            <div key={f.title} className="glass-card border border-dashed border-white/10 opacity-60">
              <h4 className="text-primary-red font-semibold">
                {f.icon} {f.title}
              </h4>
              <p className="text-text-muted text-sm mt-2">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
