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
const StatCard = ({ icon, value, label, isMobile }) => (
  <div style={{
    padding: isMobile ? '16px 12px' : '20px 24px', borderRadius: 16,
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    textAlign: 'center', transition: 'all 200ms ease',
  }}
    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.transform = 'none'; }}
  >
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
      <PremiumIcon name={icon} size={isMobile ? 20 : 24} color="#e8102a" />
    </div>
    <p style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: isMobile ? '1.5rem' : '1.75rem', color: '#f0f0fa', letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</p>
    <p style={{ fontSize: isMobile ? '0.7rem' : '0.78rem', color: '#6b6b85', marginTop: 4, fontWeight: 500 }}>{label}</p>
  </div>
);

// ── Section Header ────────────────────────────────────────────────────────────
const SH = ({ title, subtitle, isMobile }) => (
  <div style={{ marginBottom: isMobile ? 16 : 20 }}>
    <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: isMobile ? '1rem' : '1.125rem', color: '#f0f0fa', letterSpacing: '-0.02em', marginBottom: 4 }}>{title}</h2>
    {subtitle && <p style={{ fontSize: isMobile ? '0.75rem' : '0.8125rem', color: '#6b6b85' }}>{subtitle}</p>}
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

  // Responsive state
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = width < 768;

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
        <div className="section-container" style={{ paddingTop: isMobile ? 80 : 104, paddingLeft: isMobile ? 16 : 24, paddingRight: isMobile ? 16 : 24 }}>
          <Skeleton height={isMobile ? 160 : 200} style={{ marginBottom: 24, borderRadius: 24 }} />
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
        <div className="section-container" style={{ paddingTop: isMobile ? 80 : 104, paddingLeft: isMobile ? 16 : 24, paddingRight: isMobile ? 16 : 24 }}>
          <Skeleton height={isMobile ? 160 : 200} style={{ marginBottom: 24, borderRadius: 24 }} />
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
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: 800
