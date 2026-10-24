import React, { useState, useRef, useEffect } from "react";

export default function TopBar({ setView, user, onLogout, onHome, onOpenLogin, onOpenSignup }) {
  const [showMenu, setShowMenu] = useState(false);
  const [query, setQuery] = useState("");
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim().length > 0) {
      setView('search');
    }
  };

  const handleHomeClick = () => {
    if (onHome) onHome();
    else setView('dashboard');
  };

  return (
    <header className="spotify-top-bar">
      {/* ── Left: Spotifix Icon + Home Circle ── */}
      <div className="spotify-top-left">
        <div className="spotify-logo-icon" onClick={handleHomeClick} title="Spotifix Home" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img 
            src="/logo.png" 
            alt="Spotifix" 
            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'contain' }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }} 
          />
          <span style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.5px', color: '#ffffff' }}>
            Spoti<span style={{ color: '#fb790d' }}>fix</span>
          </span>
        </div>

        <button className="spotify-home-circle" onClick={handleHomeClick} title="Home">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.5 3.247a1 1 0 0 0-1 0L4 7.577V20h5v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6h5V7.577l-7.5-4.33z"/>
          </svg>
        </button>

        {/* ── Center: Search Capsule ── */}
        <div className="spotify-search-capsule">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="search-icon">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="What do you want to play?"
            value={query}
            onChange={handleSearch}
            onFocus={() => setView('search')}
            className="spotify-search-input"
          />
          <div className="search-browse-divider"></div>
          <button className="search-browse-btn" onClick={() => setView('search')} title="Browse">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM17 7v6l5-3-5-3z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Right: Premium Links + Auth Actions (Image 3) ── */}
      <div className="spotify-top-right">
        <nav className="spotify-top-nav">
          <button className="nav-text-btn" onClick={() => setView('explore')} style={{ color: 'var(--brand-accent)', fontWeight: '700' }}>Explore</button>
          <button className="nav-text-btn" onClick={() => setView('dashboard')}>Premium</button>
          <button className="nav-text-btn" onClick={() => setView('insights')}>Insights</button>
          <button className="nav-text-btn" onClick={() => setView('add')}>Upload</button>
          <span className="top-nav-divider">|</span>
          <button className="nav-install-btn" onClick={() => alert("Spotifix Web Player is ready to stream!")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v8m-4-4 4 4 4-4"/>
            </svg>
            <span>Install App</span>
          </button>
        </nav>

        {/* Logged in or Logged out state */}
        {user ? (
          <div style={{ position: 'relative' }} ref={menuRef}>
            <button
              className="spotify-user-badge"
              onClick={() => setShowMenu(!showMenu)}
              title={user.username}
            >
              <div className="user-avatar-circle">
                {user.username.charAt(0).toUpperCase()}
              </div>
            </button>

            {showMenu && (
              <div className="spotify-profile-dropdown">
                <div className="dropdown-username">@{user.username}</div>
                <button onClick={() => { setView('profile'); setShowMenu(false); }}>Profile</button>
                <button onClick={() => { setView('add'); setShowMenu(false); }}>Upload Track</button>
                <button onClick={() => { setView('insights'); setShowMenu(false); }}>Weekly Insights</button>
                <div className="dropdown-divider"></div>
                <button className="dropdown-logout" onClick={onLogout}>Log out</button>
              </div>
            )}
          </div>
        ) : (
          <div className="spotify-auth-actions">
            <button 
              className="spotify-signup-btn" 
              onClick={onOpenSignup}
            >
              Sign up
            </button>
            <button 
              className="spotify-login-btn" 
              onClick={onOpenLogin}
            >
              Log in
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
