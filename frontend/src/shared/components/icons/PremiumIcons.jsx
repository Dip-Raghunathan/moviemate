// Premium Icon System - Replaces all cartoon emojis with professional illustrations

// Movie/Cinema Icon
export const MovieIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="3" width="20" height="18" rx="2" stroke={color} strokeWidth="2"/>
    <path d="M2 7h20M7 3v18M17 3v18" stroke={color} strokeWidth="2"/>
  </svg>
);

// Location/Cinema Icon
export const LocationIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke={color} strokeWidth="2" fill="none"/>
    <circle cx="12" cy="9" r="2" stroke={color} strokeWidth="2"/>
  </svg>
);

// Star/Premium Icon
export const StarIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

// Diamond/Premium Tier Icon
export const DiamondIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2l5 9H7l5-9zm0 20L7 11h10L12 22z" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M7 11h10" stroke={color} strokeWidth="2"/>
  </svg>
);

// Crown/Premium Badge Icon
export const CrownIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2l3 8h8l-6.5 5 2.5 8-7-5.5-7 5.5 2.5-8-6.5-5h8l3-8z" stroke={color} strokeWidth="2" fill="none"/>
  </svg>
);

// Rocket/Fast Icon
export const RocketIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C12 2 6 7 6 12c0 3.31 2.69 6 6 6s6-2.69 6-6c0-5-6-10-6-10z" stroke={color} strokeWidth="2"/>
    <path d="M9 19l-2 3M15 19l2 3" stroke={color} strokeWidth="2"/>
    <circle cx="12" cy="10" r="2" stroke={color} strokeWidth="2"/>
  </svg>
);

// Popcorn/Entertainment Icon
export const PopcornIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="10" width="12" height="10" rx="1" stroke={color} strokeWidth="2"/>
    <circle cx="8" cy="7" r="2" stroke={color} strokeWidth="2"/>
    <circle cx="12" cy="5" r="2.5" stroke={color} strokeWidth="2"/>
    <circle cx="16" cy="7" r="2" stroke={color} strokeWidth="2"/>
    <path d="M6 10l-1 1M18 10l1 1" stroke={color} strokeWidth="2"/>
  </svg>
);

// Thumbs Up/Like Icon
export const ThumbsUpIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 9V5c0-1.1-.9-2-2-2-1 0-2 .9-2 2v4H5c-1.1 0-2 .9-2 2v7c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73V11c0-1.1-.9-2-2-2h-3z" stroke={color} strokeWidth="2" fill="none"/>
  </svg>
);

// Heart/Love Icon
export const HeartIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

// Laugh/Joy Icon
export const LaughIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2"/>
    <circle cx="9" cy="10" r="1.5" fill={color}/>
    <circle cx="15" cy="10" r="1.5" fill={color}/>
    <path d="M9 15c1 1 2 1.5 3 1.5s2-.5 3-1.5" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// Fire/Trending Icon
export const FireIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2s-2 3-2 5c0 2 1.5 3.5 2 5 .5-1.5 2-3 2-5 0-2-2-5-2-5zm0 14c-3 0-5-2.5-5-5h10c0 2.5-2 5-5 5z" stroke={color} strokeWidth="1.5" fill="none"/>
    <path d="M12 2c0 0 1 3 1 5-2-1-3-2-3-5 0-2 1-3 2-5z" stroke={color} strokeWidth="1.5" fill="none" opacity="0.6"/>
  </svg>
);

// Pin/Bookmark Icon
export const PinIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L3 7v7c0 6.35 4.87 12.11 11 12.98 6.13-.87 11-6.63 11-12.98V7l-9-5z" stroke={color} strokeWidth="2"/>
    <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2"/>
  </svg>
);

// Laugh Cry Icon
export const LaughCryIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2"/>
    <circle cx="9" cy="10" r="1.5" fill={color}/>
    <circle cx="15" cy="10" r="1.5" fill={color}/>
    <path d="M9 16c1 1.5 2 2 3 2s2-.5 3-2" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 18l-1 2M16 18l1 2" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// Surprised Icon
export const SurprisedIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2"/>
    <circle cx="9" cy="10" r="1.5" fill={color}/>
    <circle cx="15" cy="10" r="1.5" fill={color}/>
    <circle cx="12" cy="15" r="1.2" fill={color}/>
  </svg>
);

// Cool Icon
export const CoolIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2"/>
    <rect x="7" y="9" width="3" height="2" rx="1" fill={color}/>
    <rect x="14" y="9" width="3" height="2" rx="1" fill={color}/>
    <path d="M9 16c1 1 2 1.5 3 1.5s2-.5 3-1.5" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// Love Eyes Icon
export const LoveEyesIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2"/>
    <path d="M8 10c.5-1 1-1.5 1-1.5M16 10c-.5-1-1-1.5-1-1.5" stroke={color} strokeWidth="2" fill={color}/>
    <path d="M8 10l.5-.5m0 0l.5.5M16 10l-.5-.5m0 0l-.5.5" stroke={color} strokeWidth="1.5" fill={color}/>
    <path d="M9 16c1 1 2 1.5 3 1.5s2-.5 3-1.5" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// Thumbs Down Icon
export const ThumbsDownIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 15v4c0 1.1.9 2 2 2 1 0 2-.9 2-2v-4h7c1.1 0 2-.9 2-2v-7c0-1.1-.9-2-2-2h-9c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h3z" stroke={color} strokeWidth="2" fill="none"/>
  </svg>
);

// Comedy Icon
export const ComedyIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2"/>
    <circle cx="9" cy="10" r="1.5" fill={color}/>
    <circle cx="15" cy="10" r="1.5" fill={color}/>
    <path d="M8 16c1.5 2 2.5 3 4 3s2.5-1 4-3" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// Sci-Fi/Tech Icon
export const SciFiIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2l3 5h5v10c0 2-2 4-4 4H8c-2 0-4-2-4-4V7h5l3-5z" stroke={color} strokeWidth="2" fill="none"/>
    <circle cx="12" cy="12" r="2" stroke={color} strokeWidth="2"/>
  </svg>
);

// Drama/Theater Icon
export const DramaIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 12c0 5.52 4.48 10 10 10s10-4.48 10-10S17.52 2 12 2 2 6.48 2 12z" stroke={color} strokeWidth="2"/>
    <path d="M8 8l4 4 4-4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 16l4-4 4 4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// Horror Icon
export const HorrorIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2"/>
    <circle cx="9" cy="10" r="2" fill={color}/>
    <circle cx="15" cy="10" r="2" fill={color}/>
    <path d="M8 16l1-2 1 2M15 16l1-2 1 2" stroke={color} strokeWidth="2"/>
  </svg>
);

// Romance Icon
export const RomanceIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

// Thriller Icon
export const ThrillerIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6l2-6z" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M12 8v8" stroke={color} strokeWidth="1.5"/>
  </svg>
);

// Animation Icon
export const AnimationIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="8" height="8" rx="1" stroke={color} strokeWidth="2"/>
    <rect x="14" y="2" width="8" height="8" rx="1" stroke={color} strokeWidth="2"/>
    <rect x="2" y="14" width="8" height="8" rx="1" stroke={color} strokeWidth="2"/>
    <rect x="14" y="14" width="8" height="8" rx="1" stroke={color} strokeWidth="2"/>
    <circle cx="6" cy="6" r="1.5" fill={color}/>
    <circle cx="18" cy="18" r="1.5" fill={color}/>
  </svg>
);

// Anime Icon
export const AnimeIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2"/>
    <path d="M8 9l2 2 4-4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 17c2 0 4-1 4-3" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// Video/Camcorder Icon
export const VideoIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="4" width="16" height="12" rx="2" stroke={color} strokeWidth="2"/>
    <path d="M18 8l4-3v10l-4-3V8z" fill={color}/>
  </svg>
);

// Indie Icon
export const IndieIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2"/>
    <path d="M10 9h1v6h-1M13 9h1v6h-1M16 9h1v2h-1M7 15h10" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// Verified Badge Icon
export const VerifiedIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke={color} strokeWidth="2"/>
    <path d="M10 15l-3-3 1-1 2 2 5-5 1 1-6 6z" fill={color}/>
  </svg>
);

// New SVG Icon Components
export const UserIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const GroupIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const CalendarIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="16" y1="2" x2="16" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="8" y1="2" x2="8" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="3" y1="10" x2="21" y2="10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const ClockIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="12 6 12 12 16 14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const KeyIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3M15.5 7.5L19 4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const EyeIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const MotionIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 18h-6M18 12h-8M18 6H8" />
  </svg>
);

export const LockIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 11V7a5 5 0 0110 0v4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const BotIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="11" width="18" height="10" rx="2" stroke={color} strokeWidth="2"/>
    <path d="M12 2v2M8 5h8M6 14v2M18 14v2M9 16h6" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <circle cx="8.5" cy="14.5" r="1" fill={color}/>
    <circle cx="15.5" cy="14.5" r="1" fill={color}/>
  </svg>
);

export const WarningIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="12" y1="9" x2="12" y2="13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="12" y1="17" x2="12.01" y2="17" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const CheckIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polyline points="20 6 9 17 4 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const CrossIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="18" y1="6" x2="6" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="6" y1="6" x2="18" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const BellIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const MessageIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const AppleIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20.39c-2.48 0-6.19-1.92-6.19-7 0-4.88 3.52-6.9 5.86-6.9 1.15 0 2.21.43 2.74.87.53-.44 1.59-.87 2.74-.87 2.34 0 5.86 2.02 5.86 6.9 0 5.08-3.71 7-6.19 7-.52 0-1.25-.13-1.8-.4-.56.27-1.29.4-1.8.4zM12 6.5C12.5 5 14 4.5 14 4.5s-1.5 0-2.5 1.5C11 7 11 8.5 11 8.5s1 0 1-2z"/>
  </svg>
);

export const PhoneIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
    <line x1="12" y1="18" x2="12.01" y2="18" />
  </svg>
);

export const LinuxIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a4 4 0 00-4 4v3a4 4 0 008 0V6a4 4 0 00-4-4z"/>
    <path d="M4 18h16a2 2 0 002-2v-4a2 2 0 00-2-2H4a2 2 0 00-2 2v4a2 2 0 002 2z"/>
    <circle cx="9" cy="14" r="1"/>
    <circle cx="15" cy="14" r="1"/>
  </svg>
);

export const LaptopIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="2" y1="20" x2="22" y2="20" />
    <line x1="12" y1="20" x2="12" y2="17" />
  </svg>
);

export const GlobeIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
  </svg>
);

export const LightbulbIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 006 8c0 1 .5 2.2 1.5 3.5.8.8 1.3 1.5 1.5 2.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 18h6M10 22h4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const TicketIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 8.5V6a2 2 0 012-2h12a2 2 0 012 2v2.5a1.5 1.5 0 000 3v2.5a2 2 0 01-2 2H6a2 2 0 01-2-2v-2.5a1.5 1.5 0 000-3z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 17V7M15 17V7" stroke={color} strokeWidth="2" strokeDasharray="2 2"/>
  </svg>
);

export const SearchIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 21l-4.35-4.35" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Icon mapping for easy usage
export const NAME_TO_ICON_MAP = {
  'movie': MovieIcon,
  'location': LocationIcon,
  'star': StarIcon,
  'diamond': DiamondIcon,
  'crown': CrownIcon,
  'rocket': RocketIcon,
  'popcorn': PopcornIcon,
  'thumbsup': ThumbsUpIcon,
  'heart': HeartIcon,
  'laugh': LaughIcon,
  'fire': FireIcon,
  'pin': PinIcon,
  'laughcry': LaughCryIcon,
  'surprised': SurprisedIcon,
  'cool': CoolIcon,
  'loveeyes': LoveEyesIcon,
  'thumbsdown': ThumbsDownIcon,
  'comedy': ComedyIcon,
  'drama': DramaIcon,
  'horror': HorrorIcon,
  'romance': RomanceIcon,
  'thriller': ThrillerIcon,
  'animation': AnimationIcon,
  'anime': AnimeIcon,
  'video': VideoIcon,
  'indie': IndieIcon,
  'verified': VerifiedIcon,
  'user': UserIcon,
  'group': GroupIcon,
  'calendar': CalendarIcon,
  'clock': ClockIcon,
  'key': KeyIcon,
  'eye': EyeIcon,
  'motion': MotionIcon,
  'lock': LockIcon,
  'bot': BotIcon,
  'warning': WarningIcon,
  'check': CheckIcon,
  'cross': CrossIcon,
  'bell': BellIcon,
  'message': MessageIcon,
  'apple': AppleIcon,
  'phone': PhoneIcon,
  'linux': LinuxIcon,
  'laptop': LaptopIcon,
  'globe': GlobeIcon,
  'lightbulb': LightbulbIcon,
  'ticket': TicketIcon,
  'search': SearchIcon
};

export default NAME_TO_ICON_MAP;
