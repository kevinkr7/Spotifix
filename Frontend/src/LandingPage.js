import React, { useState } from "react";
import ThreeHeroBackground from "./ThreeHeroBackground";
import AuthPage from "./AuthPage";
import "./LandingPage.css";

export default function LandingPage({ onAuthSuccess }) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("register"); // 'login' or 'register'

  const handleOpenAuth = (mode = "register") => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleCloseAuth = () => {
    setShowAuthModal(false);
  };

  return (
    <div className="landing-root">
      {/* 3D Animated Background */}
      <div className="landing-bg-canvas">
        <ThreeHeroBackground />
      </div>

      {/* Ambient background glow */}
      <div className="ambient-radial-glow"></div>

      {/* Navigation */}
      <header className="landing-nav">
        <div className="nav-logo">
          <div className="nav-logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M8 12a4 4 0 0 1 8 0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M6 9a7 7 0 0 1 12 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
              <circle cx="12" cy="15" r="1.5" fill="currentColor" />
            </svg>
          </div>
          <span className="brand-text">Spoti<span className="brand-accent-text">fix</span></span>
          <span className="pro-badge">PRO</span>
        </div>

        <nav className="nav-links">
          <a href="#features">Superpowers</a>
          <a href="#comparison">Why Spotifix</a>
          <a href="#studio">Studio Audio</a>
        </nav>

        <div className="nav-actions">
          <button className="btn-nav-ghost" onClick={() => handleOpenAuth("login")}>
            Sign In
          </button>
          <button className="btn-nav-primary" onClick={() => handleOpenAuth("register")}>
            Get Started Free
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">
          <span className="badge-pulse"></span>
          <span>Next-Gen Audio Experience • Beyond Regular Streaming</span>
        </div>

        <h1 className="hero-headline">
          Sound Re-engineered.<br />
          <span className="hero-gradient-text">Studio Control in Every Beat.</span>
        </h1>

        <p className="hero-subline">
          Everything you love about music, supercharged with features Spotify doesn't have:
          a 10-band hardware EQ, live vocal-cancellation Karaoke mode, instant reverse audio, and AI mood intelligence.
        </p>

        <div className="hero-cta-group">
          <button className="btn-hero-primary" onClick={() => handleOpenAuth("register")}>
            <span>Start Listening Now</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button className="btn-hero-secondary" onClick={() => handleOpenAuth("login")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            <span>Try Web Player</span>
          </button>
        </div>

        {/* Hero Interactive Studio Deck Mockup */}
        <div className="hero-mockup-wrapper">
          <div className="hero-mockup-card">
            <div className="mockup-header">
              <div className="window-dots">
                <span className="dot dot-red"></span>
                <span className="dot dot-yellow"></span>
                <span className="dot dot-green"></span>
              </div>
              <div className="mockup-title">Spotifix Studio Deck — Master Output</div>
              <div className="mockup-chip">24-bit • 96kHz Lossless</div>
            </div>

            <div className="mockup-body">
              <div className="deck-track-info">
                <div className="deck-artwork">
                  <div className="vinyl-groove"></div>
                  <div className="vinyl-core"></div>
                </div>
                <div className="deck-meta">
                  <div className="track-title">Midnight Resonance</div>
                  <div className="track-artist">Spotifix AI & Master Audio</div>
                  <div className="track-badges">
                    <span className="tag-mood">Chill Vibes</span>
                    <span className="tag-feature">EQ Active</span>
                    <span className="tag-feature">Karaoke Ready</span>
                  </div>
                </div>
              </div>

              {/* Visualizer Bars */}
              <div className="deck-visualizer">
                {[45, 60, 85, 95, 70, 50, 75, 90, 65, 80, 55, 40, 70, 85, 90, 60, 75, 50, 65, 80].map((h, i) => (
                  <div key={i} className="eq-bar" style={{ height: `${h}%`, animationDelay: `${i * 0.05}s` }}></div>
                ))}
              </div>

              {/* Superpowers Bar */}
              <div className="deck-features-bar">
                <div className="feature-pill active">
                  <span className="pill-dot"></span>
                  <span>10-Band EQ (+3.5dB Bass)</span>
                </div>
                <div className="feature-pill active">
                  <span className="pill-dot"></span>
                  <span>Vocal Suppression Mode</span>
                </div>
                <div className="feature-pill">
                  <span>Reverse Buffer Engine</span>
                </div>
                <div className="feature-pill">
                  <span>AI Smart Shuffle</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Superpowers Feature Grid */}
      <section id="features" className="features-section">
        <div className="section-header">
          <h2 className="section-title">Built-In Superpowers</h2>
          <p className="section-subtitle">Features Spotify forgot to build. All running locally in your browser.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper eq-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="21" x2="4" y2="14" />
                <line x1="4" y1="10" x2="4" y2="3" />
                <line x1="12" y1="21" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12" y2="3" />
                <line x1="20" y1="21" x2="20" y2="16" />
                <line x1="20" y1="12" x2="20" y2="3" />
                <circle cx="4" cy="12" r="2" fill="currentColor" />
                <circle cx="12" cy="10" r="2" fill="currentColor" />
                <circle cx="20" cy="14" r="2" fill="currentColor" />
              </svg>
            </div>
            <h3 className="feature-card-title">10-Band Hardware-Grade EQ</h3>
            <p className="feature-card-desc">
              Full parametric control from 32Hz to 16kHz with dynamic bass boost knob and 6 master presets.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper karaoke-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </div>
            <h3 className="feature-card-title">Real-Time Karaoke Mode</h3>
            <p className="feature-card-desc">
              Instant center-channel vocal phase inversion paired with synchronized auto-scrolling lyrics. Sing along to any track.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper reverse-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11 19 2 12 11 5 11 19" fill="currentColor" />
                <polygon points="22 19 13 12 22 5 22 19" fill="currentColor" />
              </svg>
            </div>
            <h3 className="feature-card-title">Reverse Audio Streamer</h3>
            <p className="feature-card-desc">
              Sample and flip any song backward in real-time. Uncover secret backmasking tracks and experimental beats.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper ai-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            </div>
            <h3 className="feature-card-title">AI Mood Engine & Smart Shuffle</h3>
            <p className="feature-card-desc">
              Intelligent sentiment detection organizes tracks by vibes (Chill, Happy, Workout, Heartbroken) with custom algorithmic shuffle.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section id="comparison" className="comparison-section">
        <div className="section-header">
          <h2 className="section-title">Why Spotifix Outperforms Spotify</h2>
          <p className="section-subtitle">Built for true audiophiles, musicians, and everyday music lovers.</p>
        </div>

        <div className="comparison-table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Feature Capability</th>
                <th className="highlight-col">Spotifix Pro</th>
                <th>Spotify Web Player</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>10-Band Graphic Equalizer</td>
                <td className="highlight-col check">✓ Built-in (Web Audio)</td>
                <td className="cross">✗ Not Available</td>
              </tr>
              <tr>
                <td>Dynamic Bass Boost Control</td>
                <td className="highlight-col check">✓ 0 to +10 dB Knob</td>
                <td className="cross">✗ Not Available</td>
              </tr>
              <tr>
                <td>Live Vocal Suppression / Karaoke</td>
                <td className="highlight-col check">✓ Center Phase Canceller</td>
                <td className="cross">✗ Lyrics Only, No Isolation</td>
              </tr>
              <tr>
                <td>Instant Reverse Audio Engine</td>
                <td className="highlight-col check">✓ Real-time WebAudio Buffer</td>
                <td className="cross">✗ Not Available</td>
              </tr>
              <tr>
                <td>AI Mood-Based Smart Shuffle</td>
                <td className="highlight-col check">✓ Real-time Sentiment Match</td>
                <td className="neutral">~ Standard Random</td>
              </tr>
              <tr>
                <td>Personal Track Uploads</td>
                <td className="highlight-col check">✓ Direct Lossless Upload</td>
                <td className="neutral">~ Complex Local Files Sync</td>
              </tr>
              <tr>
                <td>Distraction-Free Minimalist UI</td>
                <td className="highlight-col check">✓ 100% Music, Zero Ads</td>
                <td className="cross">✗ Cluttered with Ads & Podcasts</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="cta-banner">
        <div className="cta-card">
          <h2>Ready for a Better Sound Experience?</h2>
          <p>Join Spotifix today. Start listening with studio superpowers.</p>
          <button className="btn-hero-primary" onClick={() => handleOpenAuth("register")}>
            Launch Spotifix Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="brand-text">Spoti<span className="brand-accent-text">fix</span></span>
            <p>Next-generation music streaming experience.</p>
          </div>
          <div className="footer-meta">
            © {new Date().getFullYear()} Spotifix. Precision crafted for pure sound.
          </div>
        </div>
      </footer>

      {/* Smooth Modal for Sign In / Sign Up */}
      {showAuthModal && (
        <div className="auth-modal-overlay" onClick={handleCloseAuth}>
          <div className="auth-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={handleCloseAuth} aria-label="Close">
              &times;
            </button>
            <AuthPage
              initialMode={authMode}
              onAuthSuccess={(data) => {
                setShowAuthModal(false);
                onAuthSuccess(data);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
