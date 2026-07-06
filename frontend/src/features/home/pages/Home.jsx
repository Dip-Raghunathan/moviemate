import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../../shared/components/Navbar';
import { PremiumIcon } from '../../../shared/components/icons/IconComponents';
import { useAuth } from '../../../core/contexts/AuthContext';

// ── Redesigned Landing Page Sections Data ───────────────────────────────────────
const WHY_CHOOSE_US = [
  { icon: 'movie', title: 'Match by Movie', desc: 'Find people watching the same movie, theatre, date and showtime.' },
  { icon: 'group', title: 'Solo & Group Matching', desc: 'Watch with one companion or join a movie group.' },
  { icon: 'lock', title: 'Privacy First', desc: 'Chat only starts after both users accept the match.' },
  { icon: 'user', title: 'Woman-Only Matching', desc: 'An optional feature for additional comfort and safety.' },
  { icon: 'message', title: 'Smart Introduction Cards', desc: 'Read a short introduction before entering a chat room.' },
  { icon: 'star', title: 'Watchlist & Discover', desc: 'Save movies you want to watch and discover what others are planning nearby.' }
];

const STEPS_HOW_IT_WORKS = [
  { step: '1', title: 'Select Plan', icon: 'ticket', text: 'Select your movie and theatre.' },
  { step: '2', title: 'Find Companion', icon: 'search', text: 'Find people with the same plan.' },
  { step: '3', title: 'Introduce', icon: 'message', text: 'Read their introduction card.' },
  { step: '4', title: 'Connect & Enjoy', icon: 'group', text: 'Accept, chat and enjoy your movie together.' }
];

const STEPS = [
  {
    number: '01',
    icon: 'ticket',
    title: 'Choose Your Show',
    text: 'Pick the movie, cinema, date, and showtime. We support any theater, anywhere.',
    gradient: 'linear-gradient(135deg, rgba(232,16,42,0.08), rgba(232,16,42,0.02))',
    border: 'rgba(232,16,42,0.25)',
    glow: 'rgba(232,16,42,0.2)',
    iconColor: '#ff6b7a',
    iconBg: 'rgba(232,16,42,0.1)'
  },
  {
    number: '02',
    icon: 'group',
    title: 'Set Your Preference',
    text: 'Solo companion or small group? Friendship match? Woman-only mode available.',
    gradient: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(59,130,246,0.02))',
    border: 'rgba(59,130,246,0.25)',
    glow: 'rgba(59,130,246,0.2)',
    iconColor: '#3b82f6',
    iconBg: 'rgba(59,130,246,0.1)'
  },
  {
    number: '03',
    icon: 'star',
    title: 'Get Matched Instantly',
    text: 'Our matching engine finds the perfect companions watching the same show. Then you chat.',
    gradient: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.02))',
    border: 'rgba(16,185,129,0.25)',
    glow: 'rgba(16,185,129,0.2)',
    iconColor: '#f5a623',
    iconBg: 'rgba(16,185,129,0.1)'
  },
];

const BUILT_FOR_LOVERS = [
  { icon: 'popcorn', title: 'No More Watching Alone', desc: 'Meet people who already have the same movie plan.' },
  { icon: 'movie', title: 'Movie-First Matching', desc: 'Matches are based on movie, theatre and showtime—not random profiles.' },
  { icon: 'group', title: 'Growing Community', desc: 'Every new member helps create more movie experiences.' },
  { icon: 'rocket', title: 'Just Getting Started', desc: 'PhilixMate is growing, and every early user helps shape the future of the platform.' }
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
  const { user } = useAuth();

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
            Solo companion or group match — your call.
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
              onClick={() => navigate(user ? '/dashboard' : '/signup')}
              style={{ borderRadius: 9999, minWidth: 180 }}
            >
              Start Matching Free
            </button>
            <button
              className="btn btn-secondary btn-lg"
              onClick={() => document.getElementById('why-choose-us')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ borderRadius: 9999 }}
            >
              Learn More
            </button>
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

      {/* ═══ SECTION 1: WHY CHOOSE US ════════════════════════════════════ */}
      <section id="why-choose-us" style={{ padding: '100px 0', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="section-container">
          <SectionHeader
            eyebrow="✨ Why Choose PhilixMate?"
            title="Everything you need to find the perfect movie companion—all in one place."
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {WHY_CHOOSE_US.map((item, i) => {
              const ref = useReveal();
              return (
                <div key={i} ref={ref} className="reveal" style={{ animationDelay: `${i * 80}ms` }}>
                  <div
                    className="glass-card glass-card-hover"
                    style={{
                      height: '100%',
                      padding: '32px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 16,
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '24px',
                      transition: 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    <div style={{
                      width: 48, height: 48, borderRadius: 14,
                      background: 'rgba(232,16,42,0.1)',
                      border: '1px solid rgba(232,16,42,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <PremiumIcon name={item.icon} size={24} color="#ff6b7a" />
                    </div>
                    <h3 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.2rem', color: '#f0f0fa', margin: 0 }}>
                      {item.title}
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: '#6b6b85', lineHeight: 1.55, margin: 0 }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 2: THREE STEPS MATCH ══════════════════════════════════ */}
      <section style={{ padding: '100px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="section-container">
          <SectionHeader
            eyebrow="SIMPLE & INSTANT"
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
                      border: `1px solid ${step.border}`,
                      borderRadius: 24,
                      padding: 32,
                      height: '100%',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'transform 300ms cubic-bezier(0.16,1,0.3,1), box-shadow 300ms ease, border-color 300ms ease',
                      cursor: 'default',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-6px)';
                      e.currentTarget.style.boxShadow = `0 16px 40px ${step.glow}25`;
                      e.currentTarget.style.borderColor = step.iconColor;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = step.border;
                    }}
                  >
                    {/* Step number watermark */}
                    <div style={{
                      position: 'absolute', top: 12, right: 24,
                      fontFamily: 'Outfit,sans-serif', fontWeight: 900,
                      fontSize: '5rem', color: 'rgba(255,255,255,0.025)',
                      lineHeight: 1, userSelect: 'none', pointerEvents: 'none',
                    }} aria-hidden="true">
                      {step.number}
                    </div>

                    <div style={{
                      width: 48, height: 48, borderRadius: 14,
                      background: step.iconBg,
                      border: `1px solid ${step.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: 20,
                    }}>
                      <PremiumIcon name={step.icon} size={20} color={step.iconColor} />
                    </div>
                    <h3 style={{
                      fontFamily: 'Outfit,sans-serif', fontWeight: 800,
                      fontSize: '1.25rem', color: '#f0f0fa',
                      marginBottom: 12, letterSpacing: '-0.02em',
                    }}>
                      {step.title}
                    </h3>
                    <p style={{ color: '#6b6b85', lineHeight: 1.6, fontSize: '0.9rem', margin: 0 }}>
                      {step.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 3: HOW IT WORKS ════════════════════════════════════ */}
      <section style={{ padding: '100px 0', background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="section-container">
          <SectionHeader
            eyebrow="🎯 How PhilixMate Works"
            title="Get matched and chat in four simple steps"
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 900, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24, alignItems: 'center', position: 'relative' }}>
              {STEPS_HOW_IT_WORKS.map((step, i) => {
                const ref = useReveal();
                return (
                  <div key={i} ref={ref} className="reveal" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', animationDelay: `${i * 100}ms` }}>
                    <div style={{
                      width: 64, height: 64, borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(232,16,42,0.15) 0%, rgba(255,255,255,0.02) 100%)',
                      border: '1px solid rgba(232,16,42,0.25)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.5rem', fontWeight: 800, color: '#ff6b7a',
                      marginBottom: 16,
                      boxShadow: '0 8px 24px rgba(232,16,42,0.08)'
                    }}>
                      <PremiumIcon name={step.icon} size={24} color="#ff6b7a" />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#e8102a', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Step {step.step}</span>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f0f0fa', marginBottom: 8 }}>{step.title}</h4>
                    <p style={{ fontSize: '0.82rem', color: '#6b6b85', lineHeight: 1.4, margin: 0 }}>{step.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 3: BUILT FOR MOVIE LOVERS ══════════════════════════════ */}
      <section style={{ padding: '100px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="section-container">
          <SectionHeader
            eyebrow="❤️ Built for Movie Lovers"
            title="Designed around cinema, not swipe profiles"
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {BUILT_FOR_LOVERS.map((item, i) => {
              const ref = useReveal();
              return (
                <div key={i} ref={ref} className="reveal" style={{ animationDelay: `${i * 100}ms` }}>
                  <div
                    style={{
                      height: '100%',
                      padding: '28px',
                      background: 'rgba(255,255,255,0.015)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '24px',
                      transition: 'all 300ms ease',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'rgba(232,16,42,0.25)';
                      e.currentTarget.style.background = 'rgba(232,16,42,0.02)';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.015)';
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                      <PremiumIcon name={item.icon} size={20} color="#ff6b7a" />
                      <h3 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.05rem', color: '#f0f0fa', margin: 0 }}>
                        {item.title}
                      </h3>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#6b6b85', lineHeight: 1.5, margin: 0 }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 4: CTA SECTION ══════════════════════════════════════ */}
      <section style={{ padding: '100px 0' }}>
        <div className="section-container">
          {(() => {
            const ref = useReveal();
            return (
              <div ref={ref} className="reveal" style={{
                background: 'linear-gradient(135deg, rgba(232,16,42,0.08) 0%, rgba(20,20,40,0.9) 50%, rgba(59,130,246,0.04) 100%)',
                border: '1px solid rgba(232,16,42,0.2)',
                borderRadius: 28,
                padding: '72px 32px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 600, height: 400,
                  background: 'radial-gradient(ellipse, rgba(232,16,42,0.15) 0%, transparent 70%)',
                  filter: 'blur(60px)', pointerEvents: 'none',
                }} aria-hidden="true" />

                <div style={{ position: 'relative', zIndex: 1 }}>
                  <h2 style={{
                    fontFamily: 'Outfit,sans-serif',
                    fontWeight: 900,
                    fontSize: 'clamp(2rem, 4vw, 3rem)',
                    color: '#f0f0fa',
                    letterSpacing: '-0.03em',
                    marginBottom: 8
                  }}>
                    Ready for Your Next Movie?
                  </h2>
                  <p style={{ color: '#6b6b85', fontSize: '1rem', maxWidth: 480, margin: '0 auto 32px', lineHeight: 1.6 }}>
                    Find someone who shares your excitement for the same film.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button
                      id="cta-find-match-btn"
                      className="btn btn-primary btn-xl"
                      onClick={() => navigate(user ? '/dashboard' : '/signup')}
                      style={{
                        borderRadius: 9999,
                        padding: '14px 36px',
                        fontWeight: 700,
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        boxShadow: '0 8px 32px rgba(232,16,42,0.2)'
                      }}
                    >
                      🎬 Find My Match
                    </button>
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
            {[
      {name: 'Privacy Policy', path: '/privacy-policy'},
      {name : 'Contact Us', path : '/contact-us'},
      {name: 'Help Center', path:'/help-center'}].map(item=> (<a
                                                                key={item.name}
                                                                href={item.path}
                                                                style={{fontSize: 'o.8125rem', color: '#4a4a60', transition: 'color 150ms ease'}}
                                                                onMouseEnter={e => e.currentTarget.style.color='#a8a8c0'}
                                                                onMouseLeave={e => e.currentTarget.style.color='#4a4a60'}>
        {item.name}
      </a>))}
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
