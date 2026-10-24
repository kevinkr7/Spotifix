import React, { useState } from "react";

const MOOD_PLAYLISTS = [
  {
    title: "Liked Songs",
    subtitle: "📌 Playlist • Your Favorites",
    mood: "Liked",
    gradient: "linear-gradient(135deg, #fb790d, #ff912b)",
    icon: "heart",
    accent: true
  },
  {
    title: "Happy",
    subtitle: "Vibe • Uplifting & Sunny",
    mood: "Happy",
    gradient: "linear-gradient(135deg, #fb790d, #f59e0b)",
    icon: "smile"
  },
  {
    title: "Sad",
    subtitle: "Vibe • Acoustic & Melancholy",
    mood: "Heartbroken",
    gradient: "linear-gradient(135deg, #ea580c, #c2410c)",
    icon: "cloud"
  },
  {
    title: "Chill",
    subtitle: "Vibe • Lo-Fi & Relaxation",
    mood: "Chill",
    gradient: "linear-gradient(135deg, #ffaa5a, #b45309)",
    icon: "coffee"
  },
  {
    title: "Workout",
    subtitle: "Vibe • Power & High Tempo",
    mood: "Workout",
    gradient: "linear-gradient(135deg, #fb790d, #e11d48)",
    icon: "zap"
  }
];

export default function Sidebar({ currentView, setView, onMoodSelect }) {
  const [activeMood, setActiveMood] = useState(null);

  const handleSelect = (item) => {
    setActiveMood(item.mood);
    if (onMoodSelect) onMoodSelect(item.mood);
    setView('dashboard');
  };

  return (
    <aside className="spotify-sidebar">
      {/* ── Library Card Container ── */}
      <div className="spotify-sidebar-card">
        {/* Header */}
        <div className="sidebar-library-header">
          <div className="library-title-group" onClick={() => setView('dashboard')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1zM15.5 2.134A1 1 0 0 0 14 3v18a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V6.464a1 1 0 0 0-.5-.866l-6-3.464zM9 2a1 1 0 0 0-1 1v18a1 1 0 1 0 2 0V3a1 1 0 0 0-1-1z"/>
            </svg>
            <span>Your Library</span>
          </div>

          <button 
            className="sidebar-plus-btn" 
            onClick={() => setView('add')}
            title="Upload Song or Extract Karaoke"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>

        {/* ── Liked Songs & Moods Section (Exact user requirement) ── */}
        <div className="sidebar-playlists-list">
          {/* ── YouTube Search Row ── */}
          <div 
            className={`sidebar-playlist-row ${currentView === 'search' ? 'active-row' : ''}`}
            onClick={() => { setActiveMood(null); setView('search'); }}
            style={{ marginBottom: '6px' }}
          >
            <div 
              className="playlist-row-icon" 
              style={{ 
                background: 'linear-gradient(135deg, #ff0000, #cc0000)', 
                color: '#ffffff',
                boxShadow: '0 2px 10px rgba(255, 0, 0, 0.4)'
              }}
            >
              ▶
            </div>
            <div className="playlist-row-meta">
              <span className="playlist-row-title" style={{ color: '#ffffff' }}>
                YouTube Search
              </span>
              <span className="playlist-row-sub">Millions of songs • Live</span>
            </div>
          </div>

          {/* ── Explore Free Music (Jamendo CC catalog) ── */}
          <div 
            className={`sidebar-playlist-row ${currentView === 'explore' ? 'active-row' : ''}`}
            onClick={() => { setActiveMood(null); setView('explore'); }}
            style={{ marginBottom: '10px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '10px' }}
          >
            <div 
              className="playlist-row-icon" 
              style={{ 
                background: 'linear-gradient(135deg, #fb790d, #ff5500)', 
                color: '#ffffff',
                boxShadow: '0 2px 10px rgba(251, 121, 13, 0.4)'
              }}
            >
              🌐
            </div>
            <div className="playlist-row-meta">
              <span className="playlist-row-title" style={{ color: 'var(--brand-accent)' }}>
                Explore Free Music
              </span>
              <span className="playlist-row-sub">Jamendo • Creative Commons</span>
            </div>
          </div>

          <div className="sidebar-section-label">FAVORITES & MOODS</div>
          
          {MOOD_PLAYLISTS.map((item, idx) => (
            <div 
              key={idx} 
              className={`sidebar-playlist-row ${activeMood === item.mood ? 'active-row' : ''}`}
              onClick={() => handleSelect(item)}
            >
              <div 
                className="playlist-row-icon" 
                style={{ 
                  background: item.gradient, 
                  color: '#ffffff',
                  boxShadow: item.accent ? '0 2px 10px rgba(251, 121, 13, 0.45)' : 'none'
                }}
              >
                {item.icon === "heart" ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#000000">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                ) : item.icon === "smile" ? (
                  "😊"
                ) : item.icon === "cloud" ? (
                  "🌧️"
                ) : item.icon === "coffee" ? (
                  "☕"
                ) : (
                  "⚡"
                )}
              </div>
              <div className="playlist-row-meta">
                <span className="playlist-row-title" style={item.accent ? { color: 'var(--brand-accent)' } : {}}>
                  {item.title}
                </span>
                <span className="playlist-row-sub">{item.subtitle}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Create Playlist Callout Box ── */}
        <div className="sidebar-callout-box">
          <h4 className="callout-title">Create your first playlist</h4>
          <p className="callout-subtitle">It's easy, we'll help you</p>
          <button className="callout-pill-btn" onClick={() => handleSelect(MOOD_PLAYLISTS[0])}>
            Create playlist
          </button>
        </div>

        {/* ── Extract Karaoke Callout Box ── */}
        <div className="sidebar-callout-box" style={{ background: 'rgba(251, 121, 13, 0.08)', border: '1px solid rgba(251, 121, 13, 0.25)' }}>
          <h4 className="callout-title" style={{ color: 'var(--brand-accent)' }}>🎤 Karaoke Extractor</h4>
          <p className="callout-subtitle">Remove vocals from any song to extract pure music backing</p>
          <button 
            className="callout-pill-btn" 
            onClick={() => setView('add')}
            style={{ background: 'var(--brand-accent)', color: '#ffffff' }}
          >
            Extract Karaoke
          </button>
        </div>
      </div>

      {/* ── Footer Policy Links ── */}
      <footer className="sidebar-footer">
        <div className="footer-links-grid">
          <a href="#legal">Legal</a>
          <a href="#safety">Safety & Privacy Center</a>
          <a href="#privacy">Privacy Policy</a>
          <a href="#cookies">Cookies</a>
          <a href="#about-ads">About Ads</a>
          <a href="#accessibility">Accessibility</a>
        </div>

        <button className="sidebar-lang-btn" onClick={() => alert("English")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
          <span>English</span>
        </button>
      </footer>
    </aside>
  );
}
