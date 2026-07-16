import { useEffect, useState, useRef } from 'react';

export default function FeaturedMoviePromo({ campaign, onContinue }) {
  const { movieName, posterUrl, title, subtitle, ctaText, duration } = campaign;
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isDismissing, setIsDismissing] = useState(false);
  const [ripples, setRipples] = useState([]);
  const timerRef = useRef(null);
  const progressRef = useRef(null);

  // Countdown timer for auto-dismiss
  useEffect(() => {
    const startTime = Date.now();
    const endTime = startTime + duration * 1000;

    timerRef.current = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, (endTime - now) / 1000);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timerRef.current);
        handleDismiss();
      }
    }, 16); // 60fps update for smooth progress bar

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [duration]);

  const handleDismiss = () => {
    setIsDismissing(true);
    setTimeout(() => {
      onContinue();
    }, 400); // match fadeOut animation duration
  };

  const handleCtaClick = (e) => {
    // Generate ripple effect
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    const newRipple = {
      id: Date.now(),
      x,
      y,
      size
    };
    
    setRipples((prev) => [...prev, newRipple]);
    
    // Dismiss after short delay to let ripple animate
    setTimeout(() => {
      handleDismiss();
    }, 250);
  };

  // Clean up ripples after animation
  const onRippleEnd = (id) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  };

  const progressPercent = (timeLeft / duration) * 100;

  return (
    <div className={`promo-overlay ${isDismissing ? 'dismissing' : ''}`}>
      {/* Self-contained CSS injection for premium styling and custom animations */}
      <style>{`
        .promo-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background-color: #030307;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', sans-serif;
          overflow: hidden;
          opacity: 0;
          animation: overlayFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .promo-overlay.dismissing {
          animation: overlayFadeOut 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* Ambient Cinematic Glows */
        .glow-sphere-1 {
          position: absolute;
          top: -10%;
          left: -10%;
          width: 50vw;
          height: 50vw;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(232, 16, 42, 0.18) 0%, transparent 70%);
          filter: blur(80px);
          pointer-events: none;
          animation: floatGlow 8s ease-in-out infinite alternate;
        }

        .glow-sphere-2 {
          position: absolute;
          bottom: -10%;
          right: -10%;
          width: 60vw;
          height: 60vw;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(245, 166, 35, 0.12) 0%, transparent 70%);
          filter: blur(80px);
          pointer-events: none;
          animation: floatGlow 10s ease-in-out infinite alternate-reverse;
        }

        /* Main Glass container */
        .promo-card {
          width: 90%;
          max-width: 440px;
          max-height: 90vh;
          background: rgba(13, 13, 26, 0.65);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 28px;
          padding: 24px;
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.7), 
                      0 0 40px rgba(232, 16, 42, 0.04),
                      inset 0 0 20px rgba(255, 255, 255, 0.02);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          text-align: center;
          transform: scale(0.95) translateY(10px);
          opacity: 0;
          animation: cardEntrance 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s forwards;
          z-index: 10;
        }

        .promo-overlay.dismissing .promo-card {
          animation: cardExit 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* Top Tag */
        .promo-tag {
          font-family: 'Outfit', sans-serif;
          font-size: 0.75rem;
          font-weight: 800;
          color: #ff6b7a;
          background: rgba(232, 16, 42, 0.12);
          border: 1px solid rgba(232, 16, 42, 0.3);
          padding: 6px 14px;
          border-radius: 999px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* Responsive Poster Container */
        .poster-container {
          flex: 1;
          width: 100%;
          min-height: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          position: relative;
        }

        .poster-image {
          max-height: 42vh;
          aspect-ratio: 2/3;
          object-fit: cover;
          border-radius: 16px;
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.6),
                      0 0 30px rgba(232, 16, 42, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transform: scale(0.98);
          transition: transform 0.3s ease;
        }

        .poster-image:hover {
          transform: scale(1.02);
        }

        /* Text Details */
        .promo-title {
          font-family: 'Outfit', sans-serif;
          font-size: 1.8rem;
          font-weight: 900;
          line-height: 1.2;
          margin-bottom: 8px;
          background: linear-gradient(135deg, #f0f0fa 30%, #ff6b7a 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.02em;
        }

        .promo-subtitle {
          font-size: 0.875rem;
          color: #a8a8c0;
          line-height: 1.5;
          margin-bottom: 24px;
          max-width: 320px;
          text-wrap: balance;
        }

        /* Premium Interactive CTA Button */
        .promo-cta {
          position: relative;
          width: 100%;
          padding: 16px 28px;
          border-radius: 16px;
          font-family: 'Outfit', sans-serif;
          font-size: 1.05rem;
          font-weight: 800;
          color: #ffffff;
          background: linear-gradient(135deg, #e8102a 0%, #ff4b5e 50%, #f5a623 100%);
          background-size: 200% auto;
          border: none;
          outline: none;
          cursor: pointer;
          overflow: hidden;
          box-shadow: 0 0 16px rgba(232, 16, 42, 0.3), 
                      0 8px 24px rgba(232, 16, 42, 0.25);
          transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), 
                      box-shadow 0.2s ease,
                      background-position 0.5s ease;
          animation: pulseButton 2s infinite alternate, glowButton 2s infinite alternate;
        }

        .promo-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 24px rgba(232, 16, 42, 0.45), 
                      0 12px 32px rgba(232, 16, 42, 0.35);
          background-position: right center;
        }

        .promo-cta:active {
          transform: translateY(1px);
        }

        /* Ripple Tap Effect */
        .ripple-span {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.35);
          transform: scale(0);
          animation: rippleAnimation 0.6s ease-out;
          pointer-events: none;
        }

        /* Timer progress bar */
        .timer-container {
          width: 100%;
          margin-top: 18px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          align-items: center;
        }

        .progress-bar-bg {
          width: 60px;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 99px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: #ff6b7a;
          border-radius: 99px;
          width: 100%;
          transition: width 16ms linear;
        }

        .timer-text {
          font-size: 0.75rem;
          color: #6b6b85;
          letter-spacing: 0.05em;
        }

        /* Top-right Skip Button */
        .skip-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #a8a8c0;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 1.1rem;
        }

        .skip-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          color: #f0f0fa;
          transform: rotate(90deg);
        }

        /* Animations */
        @keyframes overlayFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes overlayFadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }

        @keyframes cardEntrance {
          from { 
            opacity: 0; 
            transform: scale(0.93) translateY(16px);
          }
          to { 
            opacity: 1; 
            transform: scale(1) translateY(0);
          }
        }

        @keyframes cardExit {
          from { 
            opacity: 1; 
            transform: scale(1) translateY(0);
          }
          to { 
            opacity: 0; 
            transform: scale(0.95) translateY(-12px);
          }
        }

        @keyframes floatGlow {
          from { transform: translateY(0) scale(1); }
          to { transform: translateY(-10px) scale(1.05); }
        }

        @keyframes pulseButton {
          0% { transform: scale(1); }
          100% { transform: scale(1.025); }
        }

        @keyframes glowButton {
          0% {
            box-shadow: 0 0 12px rgba(232, 16, 42, 0.25), 
                        0 4px 16px rgba(232, 16, 42, 0.2);
          }
          100% {
            box-shadow: 0 0 24px rgba(232, 16, 42, 0.5), 
                        0 8px 32px rgba(232, 16, 42, 0.35);
          }
        }

        @keyframes rippleAnimation {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }

        /* Media queries for premium mobile-first responsiveness */
        @media (max-height: 660px) {
          .promo-card {
            padding: 16px;
            gap: 10px;
          }
          .poster-image {
            max-height: 32vh;
          }
          .promo-title {
            font-size: 1.45rem;
          }
          .promo-subtitle {
            font-size: 0.8rem;
            margin-bottom: 12px;
          }
          .promo-cta {
            padding: 12px 20px;
            font-size: 0.95rem;
          }
          .promo-tag {
            padding: 4px 10px;
            margin-bottom: 8px;
          }
        }

        @media (min-width: 768px) {
          .promo-card {
            max-width: 480px;
            padding: 32px;
          }
          .poster-image {
            max-height: 48vh;
          }
          .promo-title {
            font-size: 2.1rem;
          }
          .promo-subtitle {
            font-size: 0.925rem;
            max-width: 360px;
          }
        }
      `}</style>

      {/* Decorative Blur Backgrounds */}
      <div className="glow-sphere-1"></div>
      <div className="glow-sphere-2"></div>

      {/* Main Promo Card */}
      <div className="promo-card">
        {/* Skip button in top-right */}
        <button className="skip-btn" onClick={handleDismiss} aria-label="Skip promotion">
          &times;
        </button>

        {/* Action Header */}
        <div className="promo-tag">
          🎬 Featured Movie
        </div>

        {/* Poster Wrapper */}
        <div className="poster-container">
          <img
            src={posterUrl}
            alt={`${movieName} Poster`}
            className="poster-image"
            draggable="false"
          />
        </div>

        {/* Text Area */}
        <h2 className="promo-title">{title}</h2>
        <p className="promo-subtitle">{subtitle}</p>

        {/* CTA Button with pulse/glow/ripple animations */}
        <button className="promo-cta" onClick={handleCtaClick}>
          {ctaText}
          {ripples.map((ripple) => (
            <span
              key={ripple.id}
              className="ripple-span"
              style={{
                width: ripple.size,
                height: ripple.size,
                left: ripple.x,
                top: ripple.y
              }}
              onAnimationEnd={() => onRippleEnd(ripple.id)}
            />
          ))}
        </button>

        {/* Progress Bar & Countdown Timer */}
        <div className="timer-container">
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              ref={progressRef}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="timer-text">
            Continuing in {Math.ceil(timeLeft)}s
          </div>
        </div>
      </div>
    </div>
  );
}
