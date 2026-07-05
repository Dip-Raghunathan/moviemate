import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../../shared/components/Navbar';
import { useAuth } from '../../../core/contexts/AuthContext';
import * as userService from '../../../services/userService';
import * as eventService from '../../../services/eventService';
import Toggle from '../../../shared/components/ui/Toggle';
import Avatar from '../../../shared/components/ui/Avatar';
import Badge from '../../../shared/components/ui/Badge';
import Skeleton from '../../../shared/components/ui/Skeleton';
import * as socialService from '../../../services/socialService';
import * as engagementService from '../../../services/engagementService';
import * as reviewService from '../../../services/reviewService';
import { PremiumIcon } from '../../../shared/components/icons/IconComponents';

const GENRE_ICONS = {
  Action: 'fire', Comedy: 'comedy', Drama: 'drama', Horror: 'horror',
  Romance: 'romance', 'Sci-Fi': 'rocket', Thriller: 'thriller', Animation: 'animation',
  Anime: 'anime', Indie: 'movie',
};

// ── Achievement system ────────────────────────────────────────────────────────
const ACHIEVEMENTS = [
  { icon: 'movie', name: 'First Match',      desc: 'Found your first companion',     unlocked: true  },
  { icon: 'group', name: 'Social Butterfly', desc: 'Completed 5 group matches',      unlocked: true  },
  { icon: 'star', name: 'Film Critic',      desc: 'Attended 10+ movies',            unlocked: false },
  { icon: 'fire', name: 'Streak Master',   desc: 'Matched 7 days in a row',        unlocked: false },
  { icon: 'drama', name: 'Genre Explorer',   desc: 'Tried 6+ different genres',      unlocked: false },
  { icon: 'diamond', name: 'Elite Member',     desc: 'Upgrade to PhilixMate Pro',     unlocked: false },
];

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon, value, label }) => (
  <div style={{
    padding: '20px 24px', borderRadius: 16,
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    textAlign: 'center', transition: 'all 200ms ease',
  }}
    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.transform = 'none'; }}
  >
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
      <PremiumIcon name={icon} size={24} color="#e8102a" />
    </div>
    <p style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.75rem', color: '#f0f0fa', letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</p>
    <p style={{ fontSize: '0.78rem', color: '#6b6b85', marginTop: 4, fontWeight: 500 }}>{label}</p>
  </div>
);

// ── Section Header ────────────────────────────────────────────────────────────
const SH = ({ title, subtitle }) => (
  <div style={{ marginBottom: 20 }}>
    <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.125rem', color: '#f0f0fa', letterSpacing: '-0.02em', marginBottom: 4 }}>{title}</h2>
    {subtitle && <p style={{ fontSize: '0.8125rem', color: '#6b6b85' }}>{subtitle}</p>}
  </div>
);

// ── Profile ───────────────────────────────────────────────────────────────────
const BANNERS = {
  crimson: 'linear-gradient(135deg, rgba(232,16,42,0.15) 0%, rgba(14,14,28,0.98) 50%, rgba(245,166,35,0.06) 100%)',
  cyberpunk: 'linear-gradient(135deg, rgba(0,240,255,0.15) 0%, rgba(14,14,28,0.98) 50%, rgba(255,0,127,0.06) 100%)',
  forest: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(14,14,28,0.98) 50%, rgba(5,150,105,0.06) 100%)',
  classic: 'linear-gradient(135deg, rgba(30,30,56,0.2) 0%, rgba(13,13,26,0.98) 50%, rgba(46,46,78,0.1) 100%)',
};

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const { id: urlUserId } = useParams();
  const navigate = useNavigate();
  const isOwnProfile = !urlUserId || urlUserId === user?.id || urlUserId === user?._id;

  const [profileUser, setProfileUser] = useState(null);
  const [hostedEvents, setHostedEvents] = useState([]);
  const [hostedEventsLoading, setHostedEventsLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingPublicProfile, setLoadingPublicProfile] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  const [engagement, setEngagement] = useState({
    xp: 0,
    level: 1,
    nextLevelXp: 500,
    progressPercent: 0,
    watchStreak: 0,
    streakMultiplier: 1.0,
  });

  const [followData, setFollowData] = useState({
    followingCount: 0,
    followerCount: 0,
  });

  const [journal, setJournal] = useState([]);
  const [bannerStyle, setBannerStyle] = useState('crimson');

  useEffect(() => {
    if (!user) return;
    
    if (isOwnProfile) {
      const loadProfileData = async () => {
        try {
          const engRes = await engagementService.getEngagementStats();
          if (engRes.data) {
            setEngagement(engRes.data);
          }
          const followRes = await socialService.getFollowCounts();
          if (followRes.data) {
            setFollowData({
              followingCount: followRes.data.followingCount || 0,
              followerCount: followRes.data.followerCount || 0,
            });
          }
          const journalRes = await reviewService.getUserReviews();
          if (journalRes.data) {
            setJournal(journalRes.data);
          }
          const evts = await eventService.getEvents(null, user.id || user._id);
          setHostedEvents(evts.data || evts || []);
        } catch (err) {
          console.error('Failed to load profile details:', err);
        }
      };
      loadProfileData();
    } else {
      const loadPublicProfileData = async () => {
        setLoadingPublicProfile(true);
        setHostedEventsLoading(true);
        try {
          const pUser = await userService.getPublicProfile(urlUserId);
          setProfileUser(pUser);
          setIsFollowing(!!pUser.isFollowing);
          
          setFollowData({
            followingCount: pUser.followingCount || 0,
            followerCount: pUser.followerCount || 0,
          });

          const evts = await eventService.getEvents(null, urlUserId);
          setHostedEvents(evts.data || evts || []);
        } catch (err) {
          console.error('Failed to load public profile details:', err);
        } finally {
          setLoadingPublicProfile(false);
          setHostedEventsLoading(false);
        }
      };
      loadPublicProfileData();
    }
  }, [user, urlUserId, isOwnProfile]);

  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        await socialService.unfollowUser(urlUserId);
        setIsFollowing(false);
        setFollowData(prev => ({ ...prev, followerCount: Math.max(0, prev.followerCount - 1) }));
      } else {
        await socialService.followUser(urlUserId);
        setIsFollowing(true);
        setFollowData(prev => ({ ...prev, followerCount: prev.followerCount + 1 }));
      }
    } catch (err) {
      console.error('Failed to toggle follow status:', err);
    }
  };

  const handleToggleWomenOnly = async () => {
    setSaving(true);
    try {
      const updated = await userService.updateProfile({ womenOnlyMode: !user.womenOnlyMode });
      updateUser(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // fail silently
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePrivacy = async (field) => {
    setSaving(true);
    try {
      const currentPrivacy = user.privacy || {
        disablePersonalization: false,
        hideWatchHistory: false,
        hideOnlineStatus: false,
        optOutTraining: false,
      };
      const updatedPrivacy = {
        ...currentPrivacy,
        [field]: !currentPrivacy[field]
      };
      const updated = await userService.updateProfile({ privacy: updatedPrivacy });
      updateUser(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to update privacy settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you absolutely sure you want to permanently delete your account? This action is irreversible.')) {
      return;
    }
    try {
      setSaving(true);
      await userService.deleteAccount();
      logout();
      navigate('/');
    } catch (err) {
      console.error('Failed to delete account:', err);
      alert('Failed to delete account. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div style={{ background: '#05050a', minHeight: '100vh' }}>
        <Navbar />
        <div className="section-container" style={{ paddingTop: 104 }}>
          <Skeleton height={200} style={{ marginBottom: 24, borderRadius: 24 }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 16, marginBottom: 32 }}>
            {[1,2,3,4].map(i => <Skeleton key={i} height={100} style={{ borderRadius: 16 }} />)}
          </div>
        </div>
      </div>
    );
  }

  if (!isOwnProfile && loadingPublicProfile) {
    return (
      <div style={{ background: '#05050a', minHeight: '100vh' }}>
        <Navbar />
        <div className="section-container" style={{ paddingTop: 104 }}>
          <Skeleton height={200} style={{ marginBottom: 24, borderRadius: 24 }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 16, marginBottom: 32 }}>
            {[1,2,3,4].map(i => <Skeleton key={i} height={100} style={{ borderRadius: 16 }} />)}
          </div>
        </div>
      </div>
    );
  }

  if (!isOwnProfile && !profileUser) {
    return (
      <div style={{ background: '#05050a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Navbar />
        <div className="text-center py-20">
          <PremiumIcon name="alert" size={48} color="#e8102a" style={{ margin: '0 auto 16px' }} />
          <p style={{ marginTop: 12, color: '#a8a8c0' }}>Could not load profile details or user not found.</p>
        </div>
      </div>
    );
  }

  const activeUser = isOwnProfile ? user : profileUser;
  const joinDate = activeUser.createdAt ? new Date(activeUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Early Member';

  return (
    <div style={{ background: '#05050a', minHeight: '100vh', color: '#f0f0fa' }}>
      <Navbar />

      {/* Ambient */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }} aria-hidden="true">
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 400, background: 'radial-gradient(ellipse, rgba(232,16,42,0.07) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <div className="section-container" style={{ paddingTop: 96, paddingBottom: 64, position: 'relative', zIndex: 1 }}>

        {/* ── Hero Profile Card ── */}
        <div
          style={{
            background: BANNERS[bannerStyle],
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 28, padding: '36px 32px',
            marginBottom: 24, position: 'relative', overflow: 'hidden',
            boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
            animation: 'slideUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards',
          }}
        >
          {/* Background shimmer */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.015) 50%, transparent 60%)', backgroundSize: '200% 100%', animation: 'shimmer 4s ease-in-out infinite', pointerEvents: 'none' }} aria-hidden="true" />

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap', position: 'relative' }}>
            {/* Avatar */}
            <Avatar name={activeUser.name} size="3xl" ring={activeUser.isPro} />

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
                <h1 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 900, fontSize: 'clamp(1.5rem,4vw,2.25rem)', color: '#f0f0fa', letterSpacing: '-0.03em', margin: 0 }}>
                  {activeUser.name}
                </h1>
                <Badge variant="glow" style={{ color: '#00f0ff', borderColor: 'rgba(0,240,255,0.3)', background: 'rgba(0,240,255,0.1)' }}>Verified</Badge>
                {activeUser.isPro ? (
                  <Badge variant="pro" />
                ) : isOwnProfile ? (
                  <Link
                    to="/upgrade"
                    style={{
                      padding: '3px 10px',
                      borderRadius: 6,
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      background: 'linear-gradient(135deg,#f5a623,#e8102a)',
                      color: 'white',
                      textDecoration: 'none',
                      boxShadow: '0 2px 10px rgba(232,16,42,0.3)',
                      transition: 'all 200ms ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                  >
                    ⭐ Upgrade to Pro
                  </Link>
                ) : null}
                <Badge variant="outline" style={{ borderColor: 'rgba(255,255,255,0.15)', color: '#a8a8c0' }}>Level {engagement.level}</Badge>

                {/* Follow Button */}
                {!isOwnProfile && (
                  <button
                    onClick={handleFollowToggle}
                    style={{
                      padding: '8px 20px',
                      borderRadius: 12,
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      background: isFollowing ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #e8102a, #ff4b5e)',
                      border: isFollowing ? '1px solid rgba(255,255,255,0.1)' : 'none',
                      color: 'white',
                      cursor: 'pointer',
                      boxShadow: isFollowing ? 'none' : '0 4px 16px rgba(232,16,42,0.35)',
                      transition: 'all 200ms ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <PremiumIcon name={isFollowing ? 'check' : 'user'} size={14} color="white" />
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
                {isOwnProfile && (
                  <span style={{ fontSize: '0.875rem', color: '#6b6b85', display: 'flex', alignItems: 'center', gap: 5, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                    <PremiumIcon name="message" size={14} color="#6b6b85" /> {activeUser.email}
                  </span>
                )}
                <span style={{ fontSize: '0.875rem', color: '#6b6b85', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <PremiumIcon name="calendar" size={14} color="#6b6b85" /> Member since {joinDate}
                </span>
                <span style={{ fontSize: '0.875rem', color: '#6b6b85', display: 'flex', alignItems: 'center', gap: 5, textTransform: 'capitalize' }}>
                  <PremiumIcon name="user" size={14} color="#6b6b85" /> {activeUser.gender} · Age {activeUser.age}
                </span>
              </div>

              {/* Genre tags */}
              {activeUser.favoriteGenres?.length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {activeUser.favoriteGenres.map(g => (
                    <span key={g} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 12px', borderRadius: 9999, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.8rem', fontWeight: 600, color: '#a8a8c0' }}>
                      <PremiumIcon name={GENRE_ICONS[g] || 'movie'} size={14} color="#a8a8c0" /> {g}
                    </span>
                  ))}
                </div>
              )}

              {/* XP Progress Bar */}
              <div style={{ marginTop: 24, maxWidth: 500 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#a8a8c0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>XP Progress</span>
                  <span style={{ fontSize: '0.75rem', color: '#6b6b85', fontWeight: 500 }}>{engagement.xp} / {engagement.nextLevelXp} XP ({engagement.progressPercent}%)</span>
                </div>
                <div style={{ width: '100%', height: 8, borderRadius: 9999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <div style={{ width: `${engagement.progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, #e8102a 0%, #ff4b5e 100%)', borderRadius: 9999, transition: 'width 800ms cubic-bezier(0.16,1,0.3,1)' }} />
                </div>
              </div>

              {/* Banner Theme Customizable Selector */}
              {isOwnProfile && (
                <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b6b85', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Banner Theme:</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {Object.keys(BANNERS).map(theme => (
                      <button
                        key={theme}
                        onClick={() => setBannerStyle(theme)}
                        style={{
                          padding: '3px 10px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700,
                          textTransform: 'capitalize', cursor: 'pointer',
                          background: bannerStyle === theme ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${bannerStyle === theme ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)'}`,
                          color: bannerStyle === theme ? '#f0f0fa' : '#a8a8c0',
                          transition: 'all 200ms ease'
                        }}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 16, marginBottom: 24, animation: 'slideUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s both' }}>
          <StatCard icon="movie" value={activeUser.moviesAttended ?? 0} label="Movies Attended" />
          <StatCard icon="group" value={followData.followerCount} label="Followers" />
          <StatCard icon="star" value={followData.followingCount} label="Following" />
          <StatCard icon="fire" value={`${engagement.watchStreak} Days`} label="XP Watch Streak" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 24, alignItems: 'start' }}>
          {/* ── Left column ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'slideUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.15s both' }}>

            {isOwnProfile && (
              <>
                {/* Preferences */}
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 24, padding: '24px' }}>
                  <SH title="Preferences" subtitle="Manage your matching preferences" />

                  {activeUser.gender === 'female' && (
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '16px', borderRadius: 14,
                      background: activeUser.womenOnlyMode ? 'rgba(232,16,42,0.08)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${activeUser.womenOnlyMode ? 'rgba(232,16,42,0.2)' : 'rgba(255,255,255,0.08)'}`,
                      transition: 'all 300ms ease',
                    }}>
                      <div style={{ flex: 1, marginRight: 16 }}>
                        <p style={{ fontWeight: 700, color: '#f0f0fa', fontSize: '0.9rem', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <PremiumIcon name="user" size={16} color="#ff6b7a" /> Default women-only matching
                        </p>
                        <p style={{ fontSize: '0.78rem', color: '#6b6b85', lineHeight: 1.5 }}>
                          Friendship matches (solo or group) will only place you in all-women rooms by default.
                          You can override this per match.
                        </p>
                      </div>
                      <Toggle checked={activeUser.womenOnlyMode} onChange={handleToggleWomenOnly} disabled={saving} label="Women-only matching" />
                    </div>
                  )}

                  {saved && (
                    <p style={{ fontSize: '0.8rem', color: '#34d399', marginTop: 10, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <PremiumIcon name="check" size={14} color="#34d399" /> Preferences saved
                    </p>
                  )}
                </div>

                {/* Privacy Settings */}
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 24, padding: '24px' }}>
                  <SH title="Privacy Settings" subtitle="Control your visibility and personalization" />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 12 }}>
                    
                    {/* Disable Personalization */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ marginRight: 16 }}>
                        <p style={{ fontWeight: 700, color: '#f0f0fa', fontSize: '0.88rem', marginBottom: 2 }}>Disable Personalization</p>
                        <p style={{ fontSize: '0.74rem', color: '#6b6b85', lineHeight: 1.4 }}>
                          Opt-out of custom recommendations. Fallback to general popular picks.
                        </p>
                      </div>
                      <Toggle checked={activeUser.privacy?.disablePersonalization || false} onChange={() => handleTogglePrivacy('disablePersonalization')} disabled={saving} label="Disable Personalization" />
                    </div>

                    {/* Hide Watch History */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ marginRight: 16 }}>
                        <p style={{ fontWeight: 700, color: '#f0f0fa', fontSize: '0.88rem', marginBottom: 2 }}>Hide Watch History</p>
                        <p style={{ fontSize: '0.74rem', color: '#6b6b85', lineHeight: 1.4 }}>
                          Do not display your watch history and stats to other users.
                        </p>
                      </div>
                      <Toggle checked={activeUser.privacy?.hideWatchHistory || false} onChange={() => handleTogglePrivacy('hideWatchHistory')} disabled={saving} label="Hide Watch History" />
                    </div>

                    {/* Hide Online Status */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ marginRight: 16 }}>
                        <p style={{ fontWeight: 700, color: '#f0f0fa', fontSize: '0.88rem', marginBottom: 2 }}>Hide Online Status</p>
                        <p style={{ fontSize: '0.74rem', color: '#6b6b85', lineHeight: 1.4 }}>
                          Appear offline to friends and members in communities.
                        </p>
                      </div>
                      <Toggle checked={activeUser.privacy?.hideOnlineStatus || false} onChange={() => handleTogglePrivacy('hideOnlineStatus')} disabled={saving} label="Hide Online Status" />
                    </div>

                    {/* Opt-out of AI Training */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ marginRight: 16 }}>
                        <p style={{ fontWeight: 700, color: '#f0f0fa', fontSize: '0.88rem', marginBottom: 2 }}>Opt-out of Training</p>
                        <p style={{ fontSize: '0.74rem', color: '#6b6b85', lineHeight: 1.4 }}>
                          Do not use your watch activity to train recommendation models.
                        </p>
                      </div>
                      <Toggle checked={activeUser.privacy?.optOutTraining || false} onChange={() => handleTogglePrivacy('optOutTraining')} disabled={saving} label="Opt-out of Training" />
                    </div>

                  </div>
                </div>

                {/* Danger Zone */}
                <div style={{ background: 'rgba(239,68,68,0.02)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 24, padding: '24px' }}>
                  <SH title="Danger Zone" subtitle="Irreversible account actions" />
                  <p style={{ fontSize: '0.76rem', color: '#6b6b85', lineHeight: 1.4, marginBottom: 16 }}>
                    Permanently delete your PhilixMate account. This will instantly delete your profile, active matches, and saved watchlist items. This action cannot be undone.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: 14,
                      background: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.25)',
                      color: '#f87171',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      cursor: 'pointer',
