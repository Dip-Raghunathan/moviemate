import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../../shared/components/Navbar';
import { useAuth } from '../../../core/contexts/AuthContext';
import * as roomService from '../../../services/roomService';
import * as feedService from '../../../services/feedService';
import * as engagementService from '../../../services/engagementService';
import * as reviewService from '../../../services/reviewService';
import Toggle from '../../../shared/components/ui/Toggle';
import Spinner from '../../../shared/components/ui/Spinner';
import Badge from '../../../shared/components/ui/Badge';
import ActivityFeed from '../../feed/components/ActivityFeed';
import { PremiumIcon } from '../../../shared/components/icons/IconComponents';

const GENRE_ICONS = {
  Action: 'fire', Comedy: 'comedy', Drama: 'drama', Horror: 'horror',
  Romance: 'romance', 'Sci-Fi': 'rocket', Thriller: 'thriller', Animation: 'animation',
  Anime: 'anime', Indie: 'movie',
};

const CITIES = [
  { value: 'Delhi', label: 'Delhi' },
  { value: 'Mumbai', label: 'Mumbai' },
  { value: 'Bangalore', label: 'Bangalore' },
  { value: 'Hyderabad', label: 'Hyderabad' },
  { value: 'Chennai', label: 'Chennai' },
  { value: 'Guwahati', label: 'Guwahati' },
  { value: 'Vizag', label: 'Vizag' },
  { value: 'Kochi', label: 'Kochi' },
  { value: 'Trivandrum', label: 'Trivandrum' },
  { value: 'Thrisur', label: 'Thrisur' },
  { value: 'Mangalore', label: 'Mangalore' },
  { value: 'Mysore', label: 'Mysore' },
  { value: 'Pune', label: 'Pune' },
  { value: 'Kolkata', label: 'Kolkata' },
  { value: 'Ahmedabad', label: 'Ahmedabad' },
  { value: 'Lucknow', label: 'Lucknow' },
];

const THEATRES_BY_CITY = {
  Delhi: [
    "PVR Select Citywalk (Saket)",
    "PVR Plaza (Connaught Place)",
    "PVR Director's Cut (Ambience Mall Vasant Kunj)",
    "PVR Rivoli (Connaught Place)",
    "PVR ECX Chanakya (Chanakyapuri)",
    "PVR Priya (Vasant Vihar)",
    "PVR Naraina",
    "PVR Vikaspuri",
    "PVR Shalimar Bagh",
    "INOX Nehru Place",
    "INOX Epicuria (Nehru Place)",
    "INOX Janak Place",
    "Cinepolis Savitri (Greater Kailash)",
    "Cinepolis DLF Avenue (Saket)",
    "Cinepolis Unity One (Janakpuri)",
    "Cinepolis Fun Cinema (Moti Nagar)",
    "Delite Cinema (Asaf Ali Road)",
    "Amba Cinema (Shakti Nagar)",
    "Liberty Cinema (Karol Bagh)",
    "M2K Cinemas (Rohini)"
  ],
  Mumbai: [
    "PVR Icon Infiniti Mall (Andheri)",
    "PVR Phoenix (Lower Parel)",
    "PVR ECX Oberoi Mall (Goregaon)",
    "PVR Juhu (Dynamix Mall)",
    "PVR Citi Mall (Andheri)",
    "PVR Milap (Kandivali)",
    "INOX Atria Mall (Worli)",
    "INOX CR2 (Nariman Point)",
    "INOX Nakshatra Mall (Dadar)",
    "INOX Metro (Marine Lines)",
    "INOX Neelyog (Ghatkopar)",
    "Cinepolis Viviana Mall (Thane)",
    "Cinepolis Magnet Mall (Bhandup)",
    "Regal Cinema (Colaba)",
    "Eros Cinema (Churchgate)",
    "Maratha Mandir (Mumbai Central)",
    "Plaza Cinema (Dadar)",
    "Gaiety Galaxy (Bandra)",
    "Mukta A2 Cinemas (Goregaon)",
    "Carnival Cinemas (Metro Inox)"
  ],
  Bangalore: [
    "PVR Forum Mall (Koramangala)",
    "PVR Orion Mall (Rajajinagar)",
    "PVR Phoenix Marketcity (Whitefield)",
    "PVR Vega City Mall (Bannerghatta Road)",
    "PVR Arena Mall (Mahadevapura)",
    "PVR MSR Regalia Elements Mall (Thanisandra)",
    "INOX Garuda Mall (Magrath Road)",
    "INOX Mantri Square (Malleshwaram)",
    "INOX Forum Value Mall (Whitefield)",
    "INOX Lido Mall (Ulsoor)",
    "Cinepolis Royal Meenakshi Mall (Bannerghatta Road)",
    "Cinepolis ETA Mall (Binny Pete)",
    "Cinepolis Nexus Shantiniketan (Whitefield)",
    "Urvashi Theatre (Lalbagh Road)",
    "Rex Theatre (Brigade Road)",
    "Lavanya Theatre (Ulsoor)",
    "Vaibhav Theatre (Sanjay Nagar)",
    "Gopalan Cinemas (Banashankari)",
    "Gopalan Cinemas (Arcade Mall)",
    "Srinivasa Theatre (Koramangala)"
  ],
  Hyderabad: [
    "Prasad Multiplex (Prasads)",
    "AMB Cinemas (Gachibowli)",
    "PVR Forum Sujana Mall (Kukatpally)",
    "PVR Icon Next Galleria Mall (Panjagutta)",
    "PVR Next Galleria Mall (Irrum Manzil)",
    "PVR Musarambagh",
    "INOX GVK One Mall (Banjara Hills)",
    "INOX Maheshwari Parmeshwari Mall (Kachiguda)",
    "INOX GSM Mall (Miyapur)",
    "Cinepolis Manjeera Mall (Kukatpally)",
    "Cinepolis CCPL Mall (Malkajgiri)",
    "Sudharshan 35MM (RTC X Roads)",
    "Devi 70MM (RTC X Roads)",
    "Sandhya 70MM (RTC X Roads)",
    "Asian Lakshman 35MM (Abids)",
    "Asian Radhika Multiplex (ECIL)",
    "Asian Shiva Ganga (Dilsukhnagar)",
    "Bramharamba Theatre (Kukatpally)",
    "Arjun Theatre (Kukatpally)",
    "Gokul Theatre (Erradgadda)"
  ],
  Chennai: [
    "SPI Cinemas Sathyam (Royapettah)",
    "SPI Cinemas Escape (Express Avenue)",
    "SPI Cinemas Palazzo (Forum Vijaya Mall)",
    "PVR VR Mall (Anna Nagar)",
    "PVR Grand Galada (Pallavaram)",
    "PVR Heritage Mall (Velachery)",
    "INOX Marina Mall (OMR)",
    "INOX National (Arkot Road)",
    "Cinepolis Seasons Mall (Koyambedu)",
    "Luxe Cinemas (Phoenix Marketcity Velachery)",
    "AGS Cinemas (T. Nagar)",
    "AGS Cinemas (Alapakkam)",
    "AGS Cinemas (Navalur)",
    "Albert Theatre (Egmore)",
    "Devi Cineplex (Mount Road)",
    "Abirami Mega Mall (Purasawalkam)",
    "Udhayam Complex (Ashok Nagar)",
    "Kasi Talkies (Ashok Nagar)",
    "Vettri Theatres (Chromepet)",
    "Rohini Silver Screens (Koyambedu)"
  ],
  Guwahati: [
    "PVR Guwahati (Cygnett Inn Repose)",
    "INOX City Centre Mall",
    "INOX Aurus Mall",
    "INOX NCS Square Mall",
    "Cinepolis Dona Planet (GS Road)",
    "Anuradha Cineplex (Bamunimaidan)"
  ],
  Vizag: [
    "INOX CMR Mall (Maddilapalem)",
    "INOX Varun Beach (Beach Road)",
    "INOX Chitralaya (Suryabagh)",
    "Cinepolis VIP Chitralaya Mall (Ram Nagar)",
    "Jagadamba Theatre (Jagadamba Junction)",
    "Melody Theatre (Jagadamba Junction)",
    "Sarat Theatre (Jagadamba Junction)",
    "Ramadevi Theatre (Maddilapalem)",
    "Kanya Theatre (Gajuwaka)",
    "Mohini Theatre (Gajuwaka)",
    "Venkateswara Theatre (Gajuwaka)",
    "Sangam Theatre (Suryabagh)",
    "Leelamahal Theatre (Daba Gardens)"
  ],
  Kochi: [
    "PVR Lulu Mall (Edappally)",
    "PVR Oberon Mall (Edappally)",
    "Cinepolis Centre Square Mall (MG Road)",
    "Shenoys Theatre (MG Road)",
    "Kavitha Theatre (MG Road)",
    "EVM Cinema (Kadavanthra)",
    "EVM Kavitha Theatre",
    "Padma Theatre (MG Road)",
    "Sridhar Cinema (Shanmugham Road)",
    "Saritha Savitha Sangeetha Complex",
    "Majid Cinema (Aluva)",
    "Zeenath Theatre (Aluva)"
  ],
  Trivandrum: [
    "Ariesplex SL Cinemas (Thampanoor)",
    "PVR Mall of Travancore (Chackai)",
    "Kairali Sree Nila Complex (Thampanoor)",
    "New Theatre (Thampanoor)",
    "Ajanta Theatre (East Fort)",
    "Sree Padmanabha Theatre (East Fort)",
    "Dhanya Remya Theatre Complex (Ayurveda College)",
    "Athulya Theatre (Pappanamcode)",
    "Kalabhavan Theatre (Vazhuthacaud)"
  ],
  Thrisur: [
    "INOX Sobha City Mall",
    "Ragam Theatre",
    "Ramadas Theatre",
    "Girija Theatre",
    "Sapna Theatre",
    "Elite Theatre",
    "Bindhu Theatre",
    "Jose Theatre",
    "Kairali Sree Theatre Complex"
  ],
  Mangalore: [
    "Cinepolis City Centre Mall",
    "PVR Forum Fiza Mall",
    "Big Cinemas (Bharat Mall)",
    "Balaji Theatre",
    "Suchitra Theatre",
    "Prabhath Theatre",
    "Jyothi Theatre",
    "Ramakanthi Theatre"
  ],
  Mysore: [
    "DRC Cinemas (Habibullah Road)",
    "INOX Mall of Mysore",
    "Skyline Cinemas",
    "Woodland Theatre",
    "Sangam Theatre",
    "Prabha Theatre",
    "Olympia Theatre",
    "Rajkamal Theatre",
    "Uma Theatre",
    "Padma Theatre"
  ],
  Pune: [
    "E-Square Multiplex (University Road)",
    "INOX Bund Garden",
    "INOX Amanora Town Centre (Hadapsar)",
    "INOX Elpro City Square (Chinchwad)",
    "PVR Phoenix Marketcity (Viman Nagar)",
    "PVR Pavilion Mall (SB Road)",
    "PVR Kumar Pacific Mall (Shankarshet Road)",
    "Cinepolis Westend Mall (Aundh)",
    "Cinepolis Seasons Mall (Magarpatta)",
    "City Pride (Kothrud)",
    "City Pride (Satara Road)",
    "Mangala Multiplex (Shivajinagar)",
    "Victory Theatre (Camp)",
    "Rahul Talkies (Shivajinagar)",
    "Apollo Theatre (Rasta Peth)"
  ],
  Kolkata: [
    "INOX Forum Mall (Elgin Road)",
    "INOX Quest Mall (Ballygunge)",
    "INOX City Centre (Salt Lake)",
    "INOX South City Mall (Jadavpur)",
    "PVR Mani Square (EM Bypass)",
    "PVR Diamond Plaza (Jessore Road)",
    "Cinepolis Acropolis Mall (Kasba)",
    "Cinepolis Lake Mall (Rashbehari)",
    "Priya Cinema (Rashbehari Avenue)",
    "Star Theatre (Bidhan Sarani)",
    "Paradise Cinema (Bentinck Street)",
    "Roxy Cinema (Esplanade)",
    "Globe Cinema (New Market)",
    "Nandan (A J C Bose Road)"
  ],
  Ahmedabad: [
    "PVR Acropolis Mall",
    "PVR Motera",
    "INOX Himalaya Mall",
    "INOX Kadi",
    "Cinepolis Alpha One Mall",
    "Cinepolis Nexus Ahmedabad One",
    "Wide Angle Cinema (S G Highway)",
    "Sunset Drive-In Cinema",
    "Connaught Place Cinema",
    "Devi Multiplex",
    "Rajhans Cinemas",
    "SB Multiplex"
  ],
  Lucknow: [
    "INOX Palassio Mall",
    "INOX River Side Mall",
    "INOX Umrao Mall",
    "PVR Saharaganj Mall",
    "PVR Singapore Mall",
    "PVR Lulu Mall",
    "Cinepolis One Awadh Center",
    "Wave Cinemas",
    "Fun Republic Mall",
    "Pratibha Theatre",
    "Novelty Cinema (Lalbagh)",
    "Novelty Cinema (Aliganj)"
  ]
};

const getNext7Days = () => {
  const dates = [];
  const today = new Date();
  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const formattedVal = `${yyyy}-${mm}-${dd}`;
    
    let label = d.toLocaleDateString('en-US', options);
    if (i === 0) label = `Today (${label})`;
    else if (i === 1) label = `Tomorrow (${label})`;
    
    dates.push({ value: formattedVal, label });
  }
  return dates;
};

// ── Field Input ───────────────────────────────────────────────────────────────
const Field = ({ label, icon, children }) => (
  <div>
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', fontWeight: 700, color: '#6b6b85', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
      {icon && <PremiumIcon name={icon} size={16} color="#6b6b85" />}
      {label}
    </label>
    {children}
  </div>
);

// ── Segment Control ───────────────────────────────────────────────────────────
const SegmentControl = ({ options, value, onChange }) => (
  <div style={{ display: 'flex', gap: 8 }}>
    {options.map(opt => {
      const active = value === opt.value;
      return (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          style={{
            flex: 1, padding: '11px 12px',
            borderRadius: 12,
            border: `1px solid ${active ? 'rgba(232,16,42,0.5)' : 'rgba(255,255,255,0.1)'}`,
            background: active ? 'rgba(232,16,42,0.15)' : 'rgba(255,255,255,0.04)',
            color: active ? '#ff6b7a' : '#6b6b85',
            fontSize: '0.875rem', fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 200ms ease',
            boxShadow: active ? '0 0 16px rgba(232,16,42,0.2)' : 'none',
          }}
          onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#a8a8c0'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; }}}
          onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#6b6b85'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}}
        >
          {opt.icon && <span style={{ marginRight: 6 }}>{opt.icon}</span>}
          {opt.label}
        </button>
      );
    })}
  </div>
);

// ── Ticket Preview ────────────────────────────────────────────────────────────
const TicketPreview = ({ form, matchType, intent, womenOnly, showWomenOnly }) => {
  const hasData = form.movie || form.cinema;
  return (
    <div style={{
      position: 'relative',
      background: 'linear-gradient(145deg, rgba(232,16,42,0.12) 0%, rgba(14,14,28,0.98) 40%, rgba(245,166,35,0.06) 100%)',
      border: '1px solid rgba(232,16,42,0.25)',
      borderRadius: 24,
      padding: '0',
      overflow: 'hidden',
      boxShadow: '0 8px 40px rgba(0,0,0,0.5), inset 0 0 40px rgba(232,16,42,0.04)',
    }}>
      {/* Shimmer overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.02) 50%, transparent 60%)', backgroundSize: '200% 100%', animation: 'shimmer 4s ease-in-out infinite', pointerEvents: 'none' }} aria-hidden="true" />

      {/* Ticket top */}
      <div style={{ padding: '28px 28px 20px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1rem', color: '#e8102a', letterSpacing: '-0.01em' }}>
            PhilixMate
          </span>
          <span style={{ fontSize: '0.7rem', color: '#4a4a60', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            ADMISSION TICKET
          </span>
        </div>

        {/* Movie title */}
        <h3 style={{
          fontFamily: 'Outfit,sans-serif', fontWeight: 900,
          fontSize: hasData ? (form.movie?.length > 20 ? '1.4rem' : '1.8rem') : '1.8rem',
          color: form.movie ? '#f0f0fa' : 'rgba(240,240,250,0.2)',
          letterSpacing: '-0.03em', lineHeight: 1.1,
          marginBottom: 6, transition: 'all 300ms ease',
        }}>
          {form.movie || 'Your Movie'}
        </h3>
        <p style={{ color: form.cinema ? '#a8a8c0' : 'rgba(168,168,192,0.3)', fontSize: '0.9rem', transition: 'all 300ms ease', display: 'flex', alignItems: 'center', gap: 6 }}>
          <PremiumIcon name="location" size={16} color="currentColor" />
          {form.cinema || 'Cinema Hall'}
        </p>
      </div>

      {/* Perforated divider */}
      <div style={{ display: 'flex', alignItems: 'center', margin: '0 0', position: 'relative', padding: '0 -12px' }}>
        <div style={{ position: 'absolute', left: -14, width: 28, height: 28, borderRadius: '50%', background: '#0d0d1a' }} />
        <div style={{ flex: 1, height: 1, backgroundImage: 'repeating-linear-gradient(to right, rgba(255,255,255,0.12) 0, rgba(255,255,255,0.12) 6px, transparent 6px, transparent 12px)', margin: '0 14px' }} />
        <div style={{ position: 'absolute', right: -14, width: 28, height: 28, borderRadius: '50%', background: '#0d0d1a' }} />
      </div>

      {/* Ticket details */}
      <div style={{ padding: '20px 28px 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px', marginBottom: 20 }}>
          {[
            { label: 'DATE',       val: form.date || '—',             icon: 'calendar' },
            { label: 'SHOW TIMING', val: form.showTiming || '—',      icon: 'clock' },
            { label: 'MATCH TYPE', val: matchType === 'solo' ? 'Solo (2)' : 'Group (4)', icon: matchType === 'solo' ? 'user' : 'group' },
            { label: 'INTENT',     val: 'Friendship',                 icon: 'movie' },
          ].map(({ label, val, icon }) => (
            <div key={label}>
              <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#4a4a60', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>{label}</p>
              <p style={{ fontSize: '0.9rem', fontWeight: 700, color: val === '—' ? '#35354a' : '#f0f0fa', transition: 'all 200ms ease', display: 'flex', alignItems: 'center', gap: 6 }}>
                <PremiumIcon name={icon} size={16} color="currentColor" /> {val}
              </p>
            </div>
          ))}
        </div>

        {showWomenOnly && womenOnly && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'rgba(232,16,42,0.1)', borderRadius: 8, marginBottom: 16 }}>
            <PremiumIcon name="user" size={16} color="#ff6b7a" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ff6b7a' }}>Women-Only Safety Mode</span>
          </div>
        )}

        {/* Barcode */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginTop: 8 }}>
          <div style={{ display: 'flex', gap: 1.5, height: 32 }}>
            {Array.from({ length: 42 }, (_, i) => (
              <div key={i} style={{
                width: i % 3 === 0 ? 3 : 1.5,
                height: i % 5 === 0 ? '100%' : `${60 + Math.sin(i) * 30}%`,
                background: 'rgba(255,255,255,0.15)',
                borderRadius: 1,
                alignSelf: 'flex-end',
              }} />
            ))}
          </div>
          <p style={{ fontSize: '0.6rem', color: '#4a4a60', letterSpacing: '0.2em', fontFamily: 'JetBrains Mono, monospace', fontWeight: 500 }}>
            MMX-{Math.random().toString(36).slice(2,6).toUpperCase()}-2026
          </p>
        </div>
      </div>
    </div>
  );
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();

  const todayVal = (() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  })();

  const queryParams = new URLSearchParams(window.location.search);
  const movieParam = queryParams.get('movie') || '';

  const [selectedCity, setSelectedCity] = useState(localStorage.getItem('selected_city') || user?.city || 'Delhi');
  const [form,      setForm]      = useState({
    movie: movieParam || state?.movie || '',
    cinema: THEATRES_BY_CITY[localStorage.getItem('selected_city') || user?.city || 'Delhi']?.[0] || '',
    city: localStorage.getItem('selected_city') || user?.city || 'Delhi',
    date: todayVal,
    showTiming: 'Evening Show'
  });
  const [matchType, setMatchType] = useState('solo');
  const [intent,    setIntent]    = useState('friendship');
  const [womenOnly, setWomenOnly] = useState(false);
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [cinemaDropdownOpen, setCinemaDropdownOpen] = useState(false);
  const [unreviewedRoom, setUnreviewedRoom] = useState(null);
  const [reviewRating, setReviewRating] = useState(10);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [showIntroDialog, setShowIntroDialog] = useState(false);
  const [introText, setIntroText] = useState('');
  const [targetRoomToJoin, setTargetRoomToJoin] = useState(null);
  const [pendingCitySwitch, setPendingCitySwitch] = useState(null);

  const [recommendations, setRecommendations] = useState(null);
  const [stats, setStats] = useState(null);
  const [recLoading, setRecLoading] = useState(true);

  const [vacantRooms, setVacantRooms] = useState([]);
  const [vacantLoading, setVacantLoading] = useState(true);
  const [activeRoom, setActiveRoom] = useState(null);

  const fetchIntelAndVacant = async () => {
    try {
      const recRes = await feedService.getPersonalizedRecommendations();
      if (recRes.data) {
        setRecommendations(recRes.data);
      }
      const statsRes = await engagementService.getEngagementStats();
      if (statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard intelligence elements:', err);
    } finally {
      setRecLoading(false);
    }

    try {
      const myRoomRes = await roomService.getMyRoom();
      if (myRoomRes.room) {
        setActiveRoom(myRoomRes.room);
        setUnreviewedRoom(null);
      } else {
        setActiveRoom(null);
        const unreviewedRes = await roomService.getUnreviewedRoom();
        if (unreviewedRes.room) {
          setUnreviewedRoom(unreviewedRes.room);
        } else {
          setUnreviewedRoom(null);
        }
      }
    } catch (err) {
      console.error('Failed to load active room:', err);
    }

    await fetchVacantRoomsOnly(selectedCity);
  };

  const fetchVacantRoomsOnly = async (city) => {
    setVacantLoading(true);
    try {
      const vRes = await roomService.getVacantRooms(city);
      if (vRes.rooms) {
        setVacantRooms(vRes.rooms);
      } else {
        setVacantRooms([]);
      }
    } catch (err) {
      console.error('Failed to load vacant match sessions:', err);
      setVacantRooms([]);
    } finally {
      setVacantLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) {
      setReviewError('Please write a short sentence about your experience.');
      return;
    }
    setSubmittingReview(true);
    setReviewError('');
    try {
      await reviewService.createReview({
        movie: unreviewedRoom.movie,
        rating: reviewRating,
        text: reviewText.trim()
      });
      setReviewText('');
      setUnreviewedRoom(null);
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Could not submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
    fetchIntelAndVacant();

    const params = new URLSearchParams(window.location.search);
    const joinRoomId = params.get('joinRoom');
    if (joinRoomId) {
      handleJoinVacantRoom(joinRoomId);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    fetchVacantRoomsOnly(selectedCity);
  }, [selectedCity]);

  const isFemale = user?.gender === 'female';
  const showWomenOnlyToggle = isFemale && matchType === 'solo';
  const hasActiveRoomInSelectedCity = activeRoom && activeRoom.city && activeRoom.city.toLowerCase() === selectedCity.toLowerCase();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'city') {
      if (activeRoom) {
        setPendingCitySwitch(value);
        return;
      }
      setSelectedCity(value);
      localStorage.setItem('selected_city', value);
      setForm(f => ({
        ...f,
        city: value,
        cinema: THEATRES_BY_CITY[value]?.[0] || ''
      }));
      return;
    }
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleConfirmCitySwitch = async () => {
    if (!pendingCitySwitch) return;
    const targetCity = pendingCitySwitch;
    setPendingCitySwitch(null);
    setLoading(true);
    try {
      if (activeRoom) {
        await roomService.leaveRoom(activeRoom.id || activeRoom._id);
      }
      setActiveRoom(null);
      setSelectedCity(targetCity);
      localStorage.setItem('selected_city', targetCity);
      setForm(f => ({
        ...f,
        city: targetCity,
        cinema: THEATRES_BY_CITY[targetCity]?.[0] || ''
      }));
      await fetchVacantRoomsOnly(targetCity);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to switch city.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelCitySwitch = () => {
    setPendingCitySwitch(null);
    if (activeRoom) {
      setForm(f => ({
        ...f,
        city: activeRoom.city || selectedCity
      }));
    }
  };

  const handleMatchTypeChange = (type) => {
    setMatchType(type);
  };

  const handleStartMatch = () => {
    setError('');
    if (!form.movie || !form.cinema || !form.city || !form.date || !form.showTiming) {
      setError('Please fill in all show details before finding a match.');
      return;
    }
    setTargetRoomToJoin(null);
    setIntroText('');
    setShowIntroDialog(true);
  };

  const handleJoinVacantRoom = (roomId) => {
    setError('');
    setTargetRoomToJoin(roomId);
    setIntroText('');
    setShowIntroDialog(true);
  };

  const proceedWithIntro = async (isSkipped) => {
    setShowIntroDialog(false);
    const defaultIntro = `Hi, I'm ${user?.name || 'User'}. Excited to watch this movie together.`;
    const finalIntro = isSkipped ? defaultIntro : (introText.trim() || defaultIntro);
    
    setLoading(true);
    try {
      if (targetRoomToJoin) {
        await roomService.joinRoom(targetRoomToJoin, finalIntro);
        navigate('/matching', { state: { roomId: targetRoomToJoin } });
      } else {
        const res = await roomService.startMatch({
          movie: form.movie,
          cinema: form.cinema,
          city: form.city,
          date: form.date,
          showTiming: form.showTiming,
          matchType,
          intent: 'friendship',
          womenOnly: showWomenOnlyToggle ? womenOnly : false,
          introduction: finalIntro
        });
        const room = res.room;
        navigate('/matching', { state: { roomId: room.id || room._id } });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start matching. Please try again.');
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px',
    background: 'rgba(0,0,0,0.4)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12, color: '#f0f0fa',
    fontSize: '0.9375rem', fontFamily: 'Inter,sans-serif',
    outline: 'none',
    transition: 'all 200ms ease',
  };

  const selectStyle = {
    ...inputStyle,
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b6b85' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 14px center',
    backgroundSize: '16px',
    paddingRight: '36px',
    cursor: 'pointer',
  };

  const inputFocusHandlers = {
    onFocus: e => { e.target.style.borderColor = '#e8102a'; e.target.style.boxShadow = '0 0 0 3px rgba(232,16,42,0.15)'; e.target.style.background = 'rgba(0,0,0,0.55)'; },
    onBlur:  e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; e.target.style.background = 'rgba(0,0,0,0.4)'; },
  };

  return (
    <div style={{ background: '#05050a', minHeight: '100vh', color: '#f0f0fa' }}>
      <Navbar />

      {/* Background ambient */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }} aria-hidden="true">
        <div style={{ position: 'absolute', top: '20%', left: '5%', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(232,16,42,0.06) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '5%', width: 500, height: 400, background: 'radial-gradient(ellipse, rgba(59,130,246,0.04) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <div className="section-container" style={{ paddingTop: 104, paddingBottom: 64, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 36, animation: 'slideUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards' }}>
          <div>
            <p style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.12em', color: '#e8102a', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <PremiumIcon name="movie" size={18} color="#e8102a" />
              Ready to match?
            </p>
            <h1 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: 'clamp(1.75rem,4vw,2.5rem)', color: '#f0f0fa', letterSpacing: '-0.03em', margin: 0 }}>
              Find Your Perfect Cinema Companion
            </h1>
            {user && (
              <p style={{ color: '#6b6b85', fontSize: '0.9375rem', marginTop: 8, margin: '8px 0 0' }}>
                Welcome back, <span style={{ color: '#a8a8c0', fontWeight: 600 }}>{user.name?.split(' ')[0]}</span>. Let's find your match.
              </p>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.04)', padding: '8px 16px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#6b6b85', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Your City:</span>
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                localStorage.setItem('selected_city', e.target.value);
                setForm(f => ({ ...f, city: e.target.value }));
              }}
              style={{
                background: 'transparent',
                backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ff6b7a' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0px center',
                backgroundSize: '12px',
                paddingRight: '16px',
                appearance: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                border: 'none',
                color: '#ff6b7a',
                fontSize: '0.9rem',
                fontWeight: 700,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {CITIES.map(c => (
                <option key={c.value} value={c.value} style={{ background: '#0d0d1a', color: '#f0f0fa' }}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Active room card relocated to Live Open Matches lobby below */}

        {/* Unreviewed Expired Room Prompt */}
        {unreviewedRoom && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(232,16,42,0.08) 0%, rgba(255,255,255,0.01) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(232,16,42,0.2)',
            borderRadius: 24,
            padding: '24px 28px',
            marginBottom: 32,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            animation: 'slideUp 0.5s ease-out',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: '1.4rem' }}>⭐</span>
              <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.25rem', color: '#f0f0fa', margin: 0 }}>
                Rate Your Movie Companion Experience
              </h2>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#a8a8c0', lineHeight: 1.5, marginBottom: 18 }}>
              Your movie watch session for <span style={{ color: '#f0f0fa', fontWeight: 600 }}>{unreviewedRoom.movie}</span> at <span style={{ color: '#f0f0fa', fontWeight: 600 }}>{unreviewedRoom.cinema}</span> has completed. How did it go? Rate your experience:
            </p>

            <form onSubmit={handleReviewSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setReviewRating(rating)}
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 10,
                          border: '1px solid',
                          borderColor: reviewRating === rating ? '#e8102a' : 'rgba(255,255,255,0.1)',
                          background: reviewRating === rating ? 'rgba(232,16,42,0.2)' : 'rgba(0,0,0,0.3)',
                          color: reviewRating === rating ? '#f0f0fa' : '#6b6b85',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 200ms ease'
                        }}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ position: 'relative' }}>
                  <textarea
                    rows="2"
                    placeholder="Tell us about the meetup (e.g. Great conversation, theater was awesome!)..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 12,
                      color: '#f0f0fa',
                      fontSize: '0.875rem',
                      fontFamily: 'Inter,sans-serif',
                      outline: 'none',
                      resize: 'none'
                    }}
                  />
                </div>

                {reviewError && (
                  <p style={{ color: '#ff6b7a', fontSize: '0.8rem', margin: '4px 0 0' }}>{reviewError}</p>
                )}

                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    style={{
                      padding: '10px 20px',
                      borderRadius: 12,
                      background: 'linear-gradient(135deg, #e8102a, #ff4b5e)',
                      border: 'none',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      transition: 'all 200ms ease'
                    }}
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      setSubmittingReview(true);
                      try {
                        await reviewService.createReview({
                          movie: unreviewedRoom.movie,
                          rating: 10,
                          text: 'Great meetup experience!'
                        });
                        setUnreviewedRoom(null);
                      } catch {
                        setUnreviewedRoom(null);
                      } finally {
                        setSubmittingReview(false);
                      }
                    }}
                    style={{
                      padding: '10px 20px',
                      borderRadius: 12,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#a8a8c0',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      transition: 'all 200ms ease'
                    }}
                  >
                    Skip
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(285px, 1fr))', gap: 24, alignItems: 'start' }}>
          {/* ── Left: Form ── */}
          <div
            style={{
              background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.09)', borderRadius: 24,
              padding: '28px',
              boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
              animation: 'slideUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s both',
            }}
          >
            <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.25rem', color: '#f0f0fa', marginBottom: 24, letterSpacing: '-0.02em' }}>
              Show Details
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <Field label="Movie" icon="movie">
                <input name="movie" placeholder="e.g. Dune: Part Two" value={form.movie} onChange={handleChange} style={inputStyle} {...inputFocusHandlers} />
              </Field>
              <Field label="Cinema" icon="location">
                <div style={{ position: 'relative' }}>
                  <input
                    name="cinema"
                    placeholder="Select or type cinema name..."
                    value={form.cinema}
                    onChange={(e) => {
                      handleChange(e);
                      setCinemaDropdownOpen(true);
                    }}
                    onFocus={() => setCinemaDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setCinemaDropdownOpen(false), 200)}
                    style={{ ...inputStyle, paddingRight: 40 }}
                    {...inputFocusHandlers}
                  />
                  {/* Dropdown Toggle Arrow */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCinemaDropdownOpen(prev => !prev);
                    }}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#6b6b85',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 4,
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transition: 'transform 200ms ease', transform: cinemaDropdownOpen ? 'rotate(180deg)' : 'none' }}>
                      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>

                  {/* Custom Suggestions Dropdown */}
                  {cinemaDropdownOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 6px)',
                        left: 0,
                        right: 0,
                        background: 'rgba(13,13,26,0.98)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 14,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                        zIndex: 100,
                        maxHeight: 200,
                        overflowY: 'auto',
                      }}
                      onMouseDown={(e) => e.preventDefault()} // Keeps click action active on blur
                    >
                      {(() => {
                        const allTheatres = THEATRES_BY_CITY[form.city] || [];
                        const filtered = allTheatres.filter(t =>
                          t.toLowerCase().includes(form.cinema.toLowerCase())
                        );

                        if (filtered.length === 0) {
                          return (
                            <div style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#6b6b85', fontStyle: 'italic' }}>
                              No matching theatres. Press enter to add custom.
                            </div>
                          );
                        }

                        return filtered.map((t) => (
                          <div
                            key={t}
                            onClick={() => {
                              setForm(prev => ({ ...prev, cinema: t }));
                              setCinemaDropdownOpen(false);
                            }}
                            style={{
                              padding: '12px 16px',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              color: '#a8a8c0',
                              borderBottom: '1px solid rgba(255,255,255,0.04)',
                              transition: 'all 150ms ease',
                              textAlign: 'left',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#f0f0fa'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#a8a8c0'; }}
                          >
                            {t}
                          </div>
                        ));
                      })()}
                    </div>
                  )}
                </div>
              </Field>
              <Field label="City" icon="location">
                <select
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  style={selectStyle}
                  {...inputFocusHandlers}
                >
                  {CITIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Date" icon="calendar">
                  <select
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    style={selectStyle}
                    {...inputFocusHandlers}
                  >
                    <option value="">Select Date</option>
                    {getNext7Days().map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Show Timing" icon="clock">
                  <select
                    name="showTiming"
                    value={form.showTiming}
                    onChange={handleChange}
                    style={selectStyle}
                    {...inputFocusHandlers}
                  >
                    <option value="Morning Show">Morning Show</option>
                    <option value="Afternoon Show">Afternoon Show</option>
                    <option value="Evening Show">Evening Show</option>
                    <option value="Night Show">Night Show</option>
                  </select>
                </Field>
              </div>

              <Field label="Match Type" icon="group">
                <SegmentControl
                  value={matchType}
                  onChange={handleMatchTypeChange}
                  options={[
                    { value: 'solo',  label: 'Solo Match',  icon: <PremiumIcon name="user" size={16} /> },
                    { value: 'group', label: 'Group (4)',   icon: <PremiumIcon name="group" size={16} /> },
                  ]}
                />
                {matchType === 'group' && (
                  <p style={{ fontSize: '0.78rem', color: '#4a4a60', marginTop: 8, lineHeight: 1.5 }}>
                    Group rooms seat 4 — mixed genders, friendship only.
                  </p>
                )}
              </Field>

              {/* Women-only toggle */}
              {showWomenOnlyToggle && (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 16px', borderRadius: 14,
                  background: womenOnly ? 'rgba(232,16,42,0.08)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${womenOnly ? 'rgba(232,16,42,0.25)' : 'rgba(255,255,255,0.08)'}`,
                  transition: 'all 300ms ease',
                }}>
                  <div style={{ paddingRight: 12 }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f0f0fa', marginBottom: 3 }}>Women-only matching</p>
                    <p style={{ fontSize: '0.78rem', color: '#6b6b85', lineHeight: 1.4 }}>Match me with other woman for a comfortable experience</p>
                  </div>
                  <Toggle checked={womenOnly} onChange={setWomenOnly} label="Women-only matching" />
                </div>
              )}

              {/* Error */}
              {error && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12, padding: '12px 14px' }}>
                  <PremiumIcon name="warning" size={16} color="#f87171" />
                  <p style={{ color: '#f87171', fontSize: '0.875rem', lineHeight: 1.4 }}>{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                id="find-match-btn"
                type="button"
                className="btn btn-primary"
                onClick={handleStartMatch}
                disabled={loading}
                style={{ width: '100%', padding: '14px', borderRadius: 14, fontWeight: 700, fontSize: '1rem', marginTop: 4 }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    <Spinner size="sm" color="white" /> Finding matches...
                  </span>
                ) : 'Find My Match'}
              </button>
            </div>
          </div>

          {/* ── Right: Ticket Preview ── */}
          <div style={{ animation: 'slideUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.2s both' }}>
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em', color: '#6b6b85', textTransform: 'uppercase', marginBottom: 4 }}>Your Ticket Preview</p>
              <p style={{ fontSize: '0.8125rem', color: '#4a4a60' }}>Updates as you fill in the details above.</p>
            </div>
            <TicketPreview
              form={form}
              matchType={matchType}
              intent={intent}
              womenOnly={womenOnly}
              showWomenOnly={showWomenOnlyToggle}
            />
          </div>

          {/* ── Rightmost: Activity Feed ── */}
          <div style={{ animation: 'slideUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.3s both' }}>
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em', color: '#6b6b85', textTransform: 'uppercase', marginBottom: 4 }}>Social Activity & Stream</p>
              <p style={{ fontSize: '0.8125rem', color: '#4a4a60' }}>See what the community is up to.</p>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24,
              padding: '24px',
              boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
              maxHeight: 500,
              overflowY: 'auto'
            }} className="premium-scrollbar">
              <ActivityFeed />
            </div>
          </div>
        </div>

        {/* ── Vacant Matching Sessions Lobby ── */}
        <div style={{ marginTop: 40, animation: 'slideUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.32s both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <PremiumIcon name="group" size={24} color="#e8102a" />
            <div>
              <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#f0f0fa', letterSpacing: '-0.02em', margin: 0 }}>
                Live Open Match Sessions
              </h2>
              <p style={{ fontSize: '0.8125rem', color: '#6b6b85', margin: '2px 0 0' }}>
                Join an active vacant session directly and meet other cinema-goers.
              </p>
            </div>
          </div>

          {vacantLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0', background: 'rgba(255,255,255,0.02)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
              <Spinner size="md" color="#e8102a" />
            </div>
          ) : (vacantRooms.length === 0 && !hasActiveRoomInSelectedCity) ? (
            <div style={{ padding: '32px 24px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ color: '#6b6b85', fontSize: '0.9rem', margin: 0 }}>
                No active vacant sessions currently. Use the form above to start a session!
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(285px, 1fr))', gap: 24 }}>
              {hasActiveRoomInSelectedCity && (
                <div
                  style={{
                    background: 'linear-gradient(135deg, rgba(232,16,42,0.15) 0%, rgba(8,8,16,0.65) 100%)',
                    border: '1px solid rgba(232,16,42,0.3)',
                    borderRadius: 24,
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    transition: 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px) scale(1.01)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(232,16,42,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)'; }}
                >
                  <div>
                    {/* Header: Movie & Type */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 16 }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f0f0fa', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.3 }}>
                        {activeRoom.movie}
                      </h3>
                      <Badge variant="glow" style={{ background: 'rgba(232,16,42,0.15)', color: '#ff6b7a' }}>
                        Your Session
                      </Badge>
                    </div>

                    {/* Cinema & Timing */}
                    <p style={{ fontSize: '0.85rem', color: '#a8a8c0', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <PremiumIcon name="location" size={14} color="#ff6b7a" />
                      {activeRoom.cinema} ({activeRoom.city})
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#6b6b85', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <PremiumIcon name="calendar" size={14} color="#6b6b85" />
                      {activeRoom.date} @ {activeRoom.showTiming}
                    </p>

                    {/* Members List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b6b85', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Members ({activeRoom.members?.length || 0} / {activeRoom.capacity}):
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {activeRoom.members?.map((m, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              fontSize: '0.85rem',
                              color: '#a8a8c0'
                            }}
                          >
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff6b7a' }} />
                            <span style={{ fontWeight: 600 }}>{m.name || 'User'}</span>
                            <span style={{ color: '#6b6b85' }}>({m.age || 'N/A'} yrs)</span>
                            {m.isHost && (
                              <span style={{
                                fontSize: '0.65rem',
                                padding: '1px 6px',
                                borderRadius: 4,
                                background: 'rgba(245,166,35,0.12)',
                                color: '#f5a623',
                                border: '1px solid rgba(245,166,35,0.25)',
                                fontWeight: 700
                              }}>Host</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <button
                      onClick={() => navigate(`/chat/${activeRoom.id || activeRoom._id}`)}
                      style={{
                        padding: '12px 16px',
                        background: 'linear-gradient(135deg, #e8102a, #ff3a4a)',
                        border: 'none', borderRadius: 12,
                        color: 'white', fontWeight: 700, fontSize: '0.85rem',
                        cursor: 'pointer', transition: 'all 200ms ease',
                        boxShadow: '0 4px 16px rgba(232,16,42,0.3)',
                        textAlign: 'center',
                        textDecoration: 'none'
                      }}
                      onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                      onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                    >
                      Enter Chat Room
                    </button>
                    <button
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to leave this group completely?')) {
                          try {
                            await roomService.leaveRoom(activeRoom.id || activeRoom._id);
                            setActiveRoom(null);
                            fetchVacantRoomsOnly(selectedCity);
                          } catch (err) {
                            alert(err.response?.data?.message || 'Failed to leave group.');
                          }
                        }
                      }}
                      style={{
                        padding: '10px 16px',
                        background: 'transparent',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: 12,
                        color: '#f87171', fontWeight: 600, fontSize: '0.85rem',
                        cursor: 'pointer', transition: 'all 200ms ease',
                        textAlign: 'center'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      Leave Group Completely
                    </button>
                  </div>
                </div>
              )}

              {vacantRooms.map((room) => (
                <div
                  key={room.id}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 24,
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    transition: 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(232,16,42,0.3)'; e.currentTarget.style.transform = 'translateY(-6px) scale(1.01)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(232,16,42,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)'; }}
                >
                  <div>
                    {/* Header: Movie & Type */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 16 }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f0f0fa', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.3 }}>
                        {room.movie}
                      </h3>
                      <Badge variant={room.matchType === 'solo' ? 'verified' : 'primary'}>
                        {room.matchType === 'solo' ? 'Solo' : 'Group'}
                      </Badge>
                    </div>

                    {/* Cinema & Timing */}
                    <p style={{ fontSize: '0.85rem', color: '#a8a8c0', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <PremiumIcon name="location" size={14} color="#6b6b85" />
                      {room.cinema}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#6b6b85', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <PremiumIcon name="calendar" size={14} color="#6b6b85" />
                      {room.date} @ {room.showTiming}
                    </p>

                    {/* Members List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b6b85', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Members ({room.members?.length || 0} / {room.capacity}):
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {room.members?.map((m, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              fontSize: '0.85rem',
                              color: '#a8a8c0'
                            }}
                          >
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff6b7a' }} />
                            <span style={{ fontWeight: 600 }}>{m.name || 'User'}</span>
                            <span style={{ color: '#6b6b85' }}>({m.age || 'N/A'} yrs)</span>
                            {m.isHost && (
                              <span style={{
                                fontSize: '0.65rem',
                                padding: '1px 6px',
                                borderRadius: 4,
                                background: 'rgba(245,166,35,0.12)',
                                color: '#f5a623',
                                border: '1px solid rgba(245,166,35,0.25)',
                                fontWeight: 700
                              }}>Host</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Join Button */}
                  <button
                    type="button"
                    onClick={() => handleJoinVacantRoom(room.id)}
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: 12,
                      background: 'rgba(232,16,42,0.1)',
                      border: '1px solid rgba(232,16,42,0.25)',
                      color: '#ff6b7a',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#e8102a'; e.currentTarget.style.color = 'white'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(232,16,42,0.1)'; e.currentTarget.style.color = '#ff6b7a'; }}
                  >
                    Join Session
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Intelligence & Personalization Section ── */}
        <div style={{ marginTop: 48, animation: 'slideUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.35s both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <PremiumIcon name="star" size={24} color="#f5a623" />
            <div>
              <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#f0f0fa', letterSpacing: '-0.02em', margin: 0 }}>
                Personalized Recommendation Desk
              </h2>
              <p style={{ fontSize: '0.8125rem', color: '#6b6b85', margin: '2px 0 0' }}>
                Intelligent content-based recommendations and viewing analytics.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, alignItems: 'start' }}>
            
            {/* Recommendations Panels */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              {/* AI picks */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '24px' }}>
                <h3 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#f0f0fa', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <PremiumIcon name="bot" size={20} color="#ff6b7a" /> AI Movie Picks
                  <span style={{ fontSize: '0.72rem', fontWeight: 500, padding: '2px 8px', borderRadius: 9999, background: 'rgba(232,16,42,0.1)', color: '#ff6b7a', border: '1px solid rgba(232,16,42,0.2)' }}>Explainable</span>
                </h3>

                {recLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}><Spinner size="md" color="#e8102a" /></div>
                ) : !recommendations?.aiPicks?.length ? (
                  <p style={{ color: '#6b6b85', fontSize: '0.875rem' }}>No picks generated yet. Enable personalization in your profile!</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {recommendations.aiPicks.map((m, idx) => (
                      <div key={idx} style={{ padding: '12px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f0f0fa', margin: '0 0 4px' }}>{m.title}</h4>
                          <p style={{ fontSize: '0.76rem', color: '#a8a8c0', margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.3 }}>{m.description}</p>
                          <span style={{ fontSize: '0.72rem', color: '#e8102a', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <PremiumIcon name="lightbulb" size={12} color="#e8102a" /> {m.explanation}
                          </span>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f5a623', background: 'rgba(245,166,35,0.1)', padding: '2px 6px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <PremiumIcon name="star" size={12} color="#f5a623" /> {m.rating}
                          </span>
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8, justifyContent: 'flex-end' }}>
                            {m.genres?.slice(0, 2).map(g => (
                              <span key={g} style={{ fontSize: '0.65rem', color: '#6b6b85', background: 'rgba(255,255,255,0.05)', padding: '1px 5px', borderRadius: 4 }}>{g}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Trending Nearby */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '24px' }}>
                <h3 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#f0f0fa', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <PremiumIcon name="fire" size={22} color="#e8102a" />
                  Trending Nearby
                </h3>

                {recLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}><Spinner size="md" color="#e8102a" /></div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {recommendations?.trendingNearby?.map((m, idx) => (
                      <div key={idx} style={{ padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f0f0fa' }}>{m.title}</h4>
                          <span style={{ fontSize: '0.72rem', color: '#ff6b7a', fontWeight: 700 }}>{m.streaming}</span>
                        </div>
                        <p style={{ fontSize: '0.74rem', color: '#6b6b85', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <PremiumIcon name="location" size={14} color="#6b6b85" />
                          {m.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Friend watched */}
              {recommendations?.friendWatched?.length > 0 && (
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '24px' }}>
                  <h3 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#f0f0fa', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <PremiumIcon name="group" size={20} color="#3b82f6" /> Because Your Friend Watched
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {recommendations.friendWatched.map((m, idx) => (
                      <div key={idx} style={{ padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f0f0fa' }}>{m.title}</h4>
                          <span style={{ fontSize: '0.75rem', color: '#f5a623', fontWeight: 800 }}>{m.rating}/10</span>
                        </div>
                        <p style={{ fontSize: '0.74rem', color: '#6b6b85', margin: 0 }}>{m.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Stats and Suggestions Panels */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              {/* Watch Stats */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '24px' }}>
                <h3 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#f0f0fa', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <PremiumIcon name="motion" size={20} color="#a8a8c0" /> My Watch Stats & Analytics
                </h3>

                {stats?.analytics ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <span style={{ fontSize: '0.7rem', color: '#6b6b85', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Watched this Month</span>
                        <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f0f0fa', margin: '4px 0 0' }}>{stats.analytics.moviesWatchedThisMonth}</p>
                      </div>
                      <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <span style={{ fontSize: '0.7rem', color: '#6b6b85', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Viewing Pattern</span>
                        <p style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f0f0fa', margin: '6px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stats.analytics.viewingPattern}</p>
                      </div>
                    </div>

                    {/* Genre progress bars */}
                    {stats.analytics.favoriteGenres?.length > 0 && (
                      <div>
                        <span style={{ fontSize: '0.7rem', color: '#6b6b85', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em', display: 'block', marginBottom: 10 }}>Favorite Genres Breakdown</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {stats.analytics.favoriteGenres.map((g, idx) => (
                            <div key={idx}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 4 }}>
                                <span style={{ color: '#a8a8c0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <PremiumIcon name={GENRE_ICONS[g.genre] || 'movie'} size={14} color="#a8a8c0" />
                                  {g.genre}
                                </span>
                                <span style={{ color: '#6b6b85' }}>{g.percentage}%</span>
                              </div>
                              <div style={{ width: '100%', height: 6, borderRadius: 9999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                                <div style={{ width: `${g.percentage}%`, height: '100%', background: 'linear-gradient(90deg, #e8102a 0%, #ff4b5e 100%)', borderRadius: 9999 }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ padding: '12px 14px', borderRadius: 14, background: 'rgba(232,16,42,0.05)', border: '1px solid rgba(232,16,42,0.15)', marginTop: 8 }}>
                      <span style={{ fontSize: '0.7rem', color: '#ff6b7a', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>Year in Review</span>
                      <p style={{ fontSize: '0.8rem', color: '#a8a8c0', margin: 0, lineHeight: 1.45 }}>{stats.analytics.yearInReviewSummary}</p>
                    </div>

                  </div>
                ) : (
                  <p style={{ color: '#6b6b85', fontSize: '0.875rem' }}>No viewing statistics generated yet.</p>
                )}
              </div>

              {/* Communities You May Like */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '24px' }}>
                <h3 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#f0f0fa', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <PremiumIcon name="message" size={20} color="#3b82f6" /> Clubs You May Like
                </h3>

                {recLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}><Spinner size="md" color="#e8102a" /></div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {recommendations?.suggestedCommunities?.map((c, idx) => (
                      <div key={idx} style={{ padding: '12px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img 
                          src={c.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=random`} 
                          alt={c.name} 
                          style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} 
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f0f0fa', margin: '0 0 2px' }}>{c.name}</h4>
                          <p style={{ fontSize: '0.74rem', color: '#6b6b85', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.description}</p>
                          <span style={{ fontSize: '0.7rem', color: '#3b82f6', fontWeight: 600 }}>{c.explanation}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Events This Weekend */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '24px' }}>
                <h3 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#f0f0fa', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <PremiumIcon name="calendar" size={20} color="#10b981" /> Suggested Watch Meetups
                </h3>

                {recLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}><Spinner size="md" color="#e8102a" /></div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {recommendations?.suggestedEvents?.map((e, idx) => (
                      <div key={idx} style={{ padding: '12px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f0f0fa' }}>{e.title}</h4>
                          <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700 }}>Host: {e.organizer}</span>
                        </div>
                        <p style={{ fontSize: '0.74rem', color: '#a8a8c0', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <PremiumIcon name="movie" size={14} color="#a8a8c0" />
                          {e.movie} @ {e.theatre}
                        </p>
                        <span style={{ fontSize: '0.7rem', color: '#6b6b85', fontWeight: 500 }}>{e.explanation}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </div>

      {showIntroDialog && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5,5,10,0.85)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            width: '100%',
            maxWidth: 440,
            background: 'linear-gradient(135deg, rgba(232,16,42,0.06) 0%, rgba(255,255,255,0.03) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 24,
            padding: 32,
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
            textAlign: 'center',
            animation: 'scaleIn 0.3s cubic-bezier(0.16,1,0.3,1) forwards'
          }}>
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: '2.5rem' }}>👋</span>
            </div>
            <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#f0f0fa', marginBottom: 8 }}>
              Introduce Yourself
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#6b6b85', lineHeight: 1.5, marginBottom: 24 }}>
              Tell your companion a bit about yourself before matching. This will be shown when you connect!
            </p>

            <div style={{ position: 'relative', marginBottom: 20 }}>
              <textarea
                rows="3"
                maxLength={100}
                placeholder={`Hi, I'm ${user?.name || 'User'}. Big fan of action movies. Excited to watch this together!`}
                value={introText}
                onChange={(e) => setIntroText(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  color: '#f0f0fa',
                  fontSize: '0.9rem',
                  fontFamily: 'Inter,sans-serif',
                  outline: 'none',
                  resize: 'none'
                }}
              />
              <span style={{
                position: 'absolute',
                bottom: 8,
                right: 12,
                fontSize: '0.72rem',
                color: introText.length >= 90 ? '#ff6b7a' : '#4a4a60'
              }}>
                {introText.length}/100
              </span>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                onClick={() => proceedWithIntro(true)}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#a8a8c0',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 200ms ease'
                }}
              >
                Skip
              </button>
              <button
                type="button"
                onClick={() => proceedWithIntro(false)}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #e8102a, #ff4b5e)',
                  border: 'none',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 200ms ease'
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* City Switch Warning Modal */}
      {pendingCitySwitch && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5,5,10,0.85)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            width: '100%',
            maxWidth: 460,
            background: 'linear-gradient(135deg, rgba(232,16,42,0.06) 0%, rgba(255,255,255,0.03) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 24,
            padding: 32,
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚠️</div>
            <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.3rem', color: '#f0f0fa', marginBottom: 12 }}>
              Switching matching city?
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#a8a8c0', lineHeight: 1.5, marginBottom: 24 }}>
              You are switching from <strong style={{ color: '#ff6b7a' }}>{selectedCity}</strong> to <strong style={{ color: '#ff6b7a' }}>{pendingCitySwitch}</strong>. Your current room belongs to <strong style={{ color: '#ff6b7a' }}>{selectedCity}</strong>. Switching cities will leave your current room.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                onClick={handleCancelCitySwitch}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#a8a8c0',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 200ms ease'
                }}
              >
                Stay in {selectedCity}
              </button>
              <button
                type="button"
                onClick={handleConfirmCitySwitch}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #e8102a, #ff4b5e)',
                  border: 'none',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 200ms ease'
                }}
              >
                Switch City
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
