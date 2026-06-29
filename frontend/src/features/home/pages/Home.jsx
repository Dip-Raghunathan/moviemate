import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../../shared/components/Navbar';
import { PremiumIcon } from '../../../shared/components/icons/IconComponents';

// ── Static data ───────────────────────────────────────────────────────────────
const STEPS = [
  {
    number: '01',
    icon: 'ticket',
    title: 'Choose Your Show',
    text: 'Pick the movie, cinema, date, and showtime. We support any theater, anywhere.',
    gradient: 'linear-gradient(135deg, rgba(232,16,42,0.2), rgba(232,16,42,0.05))',
    glow: 'rgba(232,16,42,0.3)',
  },
  {
    number: '02',
    icon: 'group',
    title: 'Set Your Preference',
    text: 'Solo companion or small group? Friendship or a date? Women-only mode available.',
    gradient: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(59,130,246,0.05))',
    glow: 'rgba(59,130,246,0.3)',
  },
  {
    number: '03',
    icon: 'star',
    title: 'Get Matched Instantly',
    text: 'Our matching engine finds the perfect companions watching the same show. Then you chat.',
    gradient: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.05))',
    glow: 'rgba(16,185,129,0.3)',
  },
];

const TESTIMONIALS = [
  {
    quote: 'PhilixMate completely transformed my weekends. Found an amazing group to watch Dune 2 with — we still meet every month!',
    name: 'Sarah Johnson',
    role: 'Film Enthusiast',
    initials: 'SJ',
    gradient: 'linear-gradient(135deg,#e8102a,#ff5f6a)',
    stars: 5,
  },
  {
    quote: 'I travel constantly for work and hate going to theaters alone. The solo match feature is genuinely life-changing.',
    name: 'Marcus T.',
    role: 'Frequent Traveler',
    initials: 'MT',
    gradient: 'linear-gradient(135deg,#3b82f6,#6366f1)',
    stars: 5,
  },
  {
    quote: 'The UI is absolutely stunning and finding a match is instantaneous. This feels like a premium Netflix feature.',
    name: 'Priya Kapoor',
    role: 'UX Designer',
    initials: 'PK',
    gradient: 'linear-gradient(135deg,#10b981,#06b6d4)',
    stars: 5,
  },
];

const GENRES = [
  { icon: 'fire', name: 'Action' },
  { icon: 'comedy', name: 'Comedy' },
  { icon: 'drama', name: 'Drama' },
  { icon: 'horror', name: 'Horror' },
  { icon: 'romance', name: 'Romance' },
  { icon: 'rocket', name: 'Sci-Fi' },
  { icon: 'thriller', name: 'Thriller' },
  { icon: 'anime', name: 'Anime' },
  { icon: 'marvel', name: 'Marvel' },
  { icon: 'movie', name: 'Indie' },
];

const STATS = [
  { value: '50K+',  label: 'Active Users',     icon: 'group' },
  { value: '200K+', label: 'Matches Made',      icon: 'star' },
  { value: '120+',  label: 'Cities Worldwide',  icon: 'globe' },
  { value: '4.9',   label: 'Average Rating',    icon: 'star' },
];

// ── Particle Stars Background ─────────────────────────────────────────────────
const Stars = () => {
  const stars = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    delay: Math.random() * 4,
    duration: Math.random() * 3 + 2,
  }));
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }} aria-hidden="true">
      {stars.map(s => (
        <div
          key={s.id}
          style={{
            position: 'absolute',
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            borderRadius: '50%',
            background: 'white',
            opacity: 0.5,
            animation: `pulse ${s.duration}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
};

// ── Scroll Reveal Hook ────────────────────────────────────────────────────────
const useReveal = () => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); } },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
};

// ── Section Header ────────────────────────────────────────────────────────────
const SectionHeader = ({ eyebrow, title, subtitle }) => {
  const ref = useReveal();
  return (
    <div ref={ref} className="reveal text-center" style={{ marginBottom: 56 }}>
      {eyebrow && (
        <p style={{
          fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.14em',
          color: '#e8102a', textTransform: 'uppercase', marginBottom: 12,
        }}>
          {eyebrow}
        </p>
      )}
      <h2 style={{
        fontFamily: 'Outfit, sans-serif', fontWeight: 800,
        fontSize: 'clamp(2rem, 4vw, 3rem)',
        color: '#f0f0fa', letterSpacing: '-0.03em', marginBottom: 16,
      }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{ fontSize: '1.0625rem', color: '#6b6b85', maxWidth: 520, margin: '0 auto', lineHeight: 1.65 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

// ── Main Home Component ───────────────────────────────────────────────────────
const Home = () => {
  const navigate = useNavigate();
  const [activeGenre, setActiveGenre] = useState(null);

  return (
    <div style={{ background: '#05050a', minHeight: '100vh', color: '#f0f0fa' }}>
      <Navbar />

      {/* ═══ HERO ═══════════════════════════════════════════════════════════ */}
      <header
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          paddingTop: 72,
        }}
      >
        {/* Background */}
        <div style={{ position: 'absolute', inset: 0 }}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: "url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1920&q=80')",
            backgroundSize: 'cover', backgroundPosition: 'center',
            filter: 'brightness(0.25)',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, #05050a 0%, rgba(5,5,10,0.6) 40%, rgba(5,5,10,0.3) 100%)',
          }} />
          {/* Cinematic glow */}
          <div style={{
            position: 'absolute', bottom: '20%', left: '50%', transform: 'translateX(-50%)',
            width: 600, height: 300,
            background: 'radial-gradient(ellipse, rgba(232,16,42,0.2) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }} aria-hidden="true" />
          <Stars />
        </div>

        {/* Hero content */}
        <div
          className="section-container"
          style={{ position: 'relative', zIndex: 2, textAlign: 'center', paddingTop: 40, paddingBottom: 80 }}
        >
          {/* Eyebrow tag */}
          <div
            className="fade-in anim-fwd"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 16px', borderRadius: 9999,
              background: 'rgba(232,16,42,0.12)', border: '1px solid rgba(232,16,42,0.25)',
              marginBottom: 28, animation: 'fadeIn 0.7s ease forwards',
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#e8102a', animation: 'ping 1.5s ease infinite' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em', color: '#ff6b7a', textTransform: 'uppercase' }}>
              The World's Most Intelligent Movie Companion
            </span>
          </div>

          {/* Main headline */}
          <h1
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 900,
              fontSize: 'clamp(2.8rem, 7vw, 6rem)',
              letterSpacing: '-0.04em',
              lineHeight: 1.0,
              marginBottom: 24,
              animation: 'slideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s both',
            }}
          >
            Never Watch Movies
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #e8102a 0%, #ff6b7a 50%, #f5a623 100%)',
              WebkitBackgroundClip: 'text', backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Alone Again
            </span>
          </h1>

          {/* Sub */}
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: '#a8a8c0',
            maxWidth: 560,
            margin: '0 auto 40px',
            lineHeight: 1.7,
            animation: 'slideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.25s both',
          }}>
            Match with film lovers watching the same movie at the same cinema.
            Solo companion, group match, or a movie date — your call.
          </p>

          {/* CTAs */}
          <div
            style={{
              display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap',
              animation: 'slideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.4s both',
            }}
          >
            <button
              id="hero-get-started"
              className="btn btn-primary btn-lg"
              onClick={() => navigate('/signup')}
              style={{ borderRadius: 9999, minWidth: 180 }}
            >
              Start Matching Free
            </button>
            <button
              className="btn btn-secondary btn-lg"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ borderRadius: 9999 }}
            >
              See How It Works
            </button>
          </div>

          {/* Trust indicators */}
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24,
            marginTop: 52, flexWrap: 'wrap',
            animation: 'fadeIn 1s ease 0.6s both',
          }}>
            {[
              { val: '50K+', label: 'Users' },
              { val: '200K+', label: 'Matches' },
              { val: '4.9 ★', label: 'Rating' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.4rem', color: '#f0f0fa', letterSpacing: '-0.02em' }}>{s.val}</p>
                <p style={{ fontSize: '0.78rem', color: '#6b6b85', fontWeight: 500 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          color: '#4a4a60', animation: 'float 2s ease-in-out infinite', zIndex: 2,
        }} aria-hidden="true">
          <p style={{ fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>Scroll</p>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M4 9l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </header>

      {/* ═══ STATS BAR ══════════════════════════════════════════════════════ */}
      <div style={{ background: 'rgba(255,255,255,0.03)', borderTop: '1px solid rgba(255,255,255,0.07)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="section-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 0 }}>
            {STATS.map((s, i) => (
              <div key={i} style={{
                padding: '28px 24px', textAlign: 'center',
                borderRight: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 4, display: 'flex', justifyContent: 'center' }} aria-hidden="true">
                  <PremiumIcon name={s.icon} size={32} color="#f5a623" />
                </div>
                <p style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.75rem', color: '#f0f0fa', letterSpacing: '-0.03em', lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: '0.8125rem', color: '#6b6b85', marginTop: 4, fontWeight: 500 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ HOW IT WORKS ══════════════════════════════════════════════════ */}
      <section id="how-it-works" style={{ padding: '100px 0' }}>
        <div className="section-container">
          <SectionHeader
            eyebrow="Simple & Instant"
            title="Three steps to your perfect cinema match"
            subtitle="From choosing your show to chatting with your match — the whole process takes under a minute."
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {STEPS.map((step, i) => {
              const ref = useReveal();
              return (
                <div
                  key={i}
                  ref={ref}
                  className="reveal"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div
                    style={{
                      background: step.gradient,
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 24,
                      padding: 32,
                      height: '100%',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'transform 300ms cubic-bezier(0.16,1,0.3,1), box-shadow 300ms ease',
                      cursor: 'default',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = `0 12px 40px ${step.glow}30`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {/* Step number watermark */}
                    <div style={{
                      position: 'absolute', top: -10, right: 20,
                      fontFamily: 'Outfit,sans-serif', fontWeight: 900,
                      fontSize: '5rem', color: 'rgba(255,255,255,0.04)',
                      lineHeight: 1, userSelect: 'none', pointerEvents: 'none',
                    }} aria-hidden="true">
                      {step.number}
                    </div>

                    <div style={{
                      width: 56, height: 56, borderRadius: 16,
                      background: 'rgba(255,255,255,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.75rem', marginBottom: 20,
                    }}>
                      <PremiumIcon name={step.icon} size={32} color="#f5a623" />
                    </div>
                    <h3 style={{
                      fontFamily: 'Outfit,sans-serif', fontWeight: 700,
                      fontSize: '1.25rem', color: '#f0f0fa',
                      marginBottom: 10, letterSpacing: '-0.02em',
                    }}>
                      {step.title}
                    </h3>
                    <p style={{ color: '#6b6b85', lineHeight: 1.65, fontSize: '0.9375rem' }}>
                      {step.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ GENRE EXPLORER ════════════════════════════════════════════════ */}
      <section style={{ padding: '80px 0', background: 'rgba(255,255,255,0.015)' }}>
        <div className="section-container">
          <SectionHeader
            eyebrow="For Every Fan"
            title="Whatever you love, we've got a match for you"
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
            {GENRES.map((g, i) => {
              const isActive = activeGenre === g.name;
              return (
                <button
                  key={i}
                  onClick={() => setActiveGenre(isActive ? null : g.name)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 20px', borderRadius: 9999,
                    border: `1px solid ${isActive ? 'rgba(232,16,42,0.5)' : 'rgba(255,255,255,0.1)'}`,
                    background: isActive ? 'rgba(232,16,42,0.15)' : 'rgba(255,255,255,0.04)',
                    color: isActive ? '#ff6b7a' : '#a8a8c0',
                    fontSize: '0.9rem', fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 200ms ease',
                    boxShadow: isActive ? '0 0 16px rgba(232,16,42,0.25)' : 'none',
                  }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#f0f0fa'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; }}}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#a8a8c0'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}}
                >
                  <PremiumIcon name={g.icon} size={18} color="currentColor" />
                  {g.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ══════════════════════════════════════════════════ */}
      <section style={{ padding: '100px 0' }}>
        <div className="section-container">
          <SectionHeader
            eyebrow="Loved by thousands"
            title="Real people. Real movie magic."
            subtitle="Join over 50,000 film lovers who've found their perfect cinema companion."
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {TESTIMONIALS.map((t, i) => {
              const ref = useReveal();
              return (
                <div
                  key={i}
                  ref={ref}
                  className="reveal"
                  style={{ animationDelay: `${i * 120}ms` }}
                >
                  <div
                    className="glass-card glass-card-hover"
                    style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}
                  >
                    {/* Stars */}
                    <div style={{ display: 'flex', gap: 3 }}>
                      {Array.from({ length: t.stars }).map((_, si) => (
                        <span key={si} style={{ color: '#f5a623', fontSize: '0.875rem' }}>★</span>
                      ))}
                    </div>

                    {/* Quote */}
                    <p style={{ color: '#a8a8c0', lineHeight: 1.7, fontSize: '0.9375rem', flex: 1, fontStyle: 'italic' }}>
                      "{t.quote}"
                    </p>

                    {/* Author */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%',
                        background: t.gradient,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.875rem', fontWeight: 700, color: 'white',
                        flexShrink: 0,
                      }}>
                        {t.initials}
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, color: '#f0f0fa', fontSize: '0.9rem' }}>{t.name}</p>
                        <p style={{ fontSize: '0.78rem', color: '#6b6b85' }}>{t.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ CTA SECTION ══════════════════════════════════════════════════ */}
      <section style={{ padding: '100px 0' }}>
        <div className="section-container">
          {(() => {
            const ref = useReveal();
            return (
              <div ref={ref} className="reveal" style={{
                background: 'linear-gradient(135deg, rgba(232,16,42,0.12) 0%, rgba(20,20,40,0.9) 50%, rgba(59,130,246,0.06) 100%)',
                border: '1px solid rgba(232,16,42,0.2)',
                borderRadius: 28,
                padding: 'clamp(40px, 8vw, 72px)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Background glow */}
                <div style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 600, height: 400,
                  background: 'radial-gradient(ellipse, rgba(232,16,42,0.18) 0%, transparent 70%)',
                  filter: 'blur(60px)', pointerEvents: 'none',
                }} aria-hidden="true" />

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <p style={{
                    fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.14em',
                    color: '#e8102a', textTransform: 'uppercase', marginBottom: 16,
                    display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center'
                  }}>
                    <PremiumIcon name="popcorn" size={20} color="#e8102a" />
                    Your Movie Companion Awaits
                  </p>
                  <h2 style={{
                    fontFamily: 'Outfit,sans-serif', fontWeight: 900,
                    fontSize: 'clamp(2rem, 4vw, 3rem)',
                    color: '#f0f0fa', letterSpacing: '-0.03em', marginBottom: 16,
                  }}>
                    Ready to grab your popcorn?
                  </h2>
                  <p style={{ color: '#6b6b85', fontSize: '1.0625rem', maxWidth: 480, margin: '0 auto 36px', lineHeight: 1.65 }}>
                    Join PhilixMate today. Free forever, no credit card required.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <button
                      id="cta-join-btn"
                      className="btn btn-primary btn-xl"
                      onClick={() => navigate('/signup')}
                      style={{ borderRadius: 9999 }}
                    >
                      Join PhilixMate — It's Free
                    </button>
                    <Link
                      to="/login"
                      className="btn btn-secondary btn-xl"
                      style={{ borderRadius: 9999, textDecoration: 'none' }}
                    >
                      Sign In
                    </Link>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* ═══ FOOTER ══════════════════════════════════════════════════════ */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '48px 0',
        background: 'rgba(0,0,0,0.3)',
      }}>
        <div className="section-container" style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.125rem', color: '#4a4a60' }}>PhilixMate</span>
          </div>
          <p style={{ color: '#4a4a60', fontSize: '0.8125rem', marginBottom: 20 }}>
            The World's Most Intelligent Movie Companion Platform
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap', marginBottom: 24 }}>
            {['Privacy Policy', 'Terms of Service', 'Contact Us', 'Help Center'].map(item => (
              <a key={item} href="#" style={{ fontSize: '0.8125rem', color: '#4a4a60', transition: 'color 150ms ease' }}
                onMouseEnter={e => e.currentTarget.style.color = '#a8a8c0'}
                onMouseLeave={e => e.currentTarget.style.color = '#4a4a60'}>
                {item}
              </a>
            ))}
          </div>
          <p style={{ color: '#35354a', fontSize: '0.75rem' }}>
            © 2026 PhilixMate. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
