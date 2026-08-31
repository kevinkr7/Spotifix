import { useState } from "react";

export default function TopBar({ setView, user, onLogout, onHome }) {
  const [showMenu, setShowMenu] = useState(false);
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    const val = e.target.value;
    setQuery(val);
    // Pass query up if we add global search; for now navigate to search view
    if (val.trim().length > 0) {
      setView('search');
    }
  };

  const handleHomeClick = () => {
    if (onHome) onHome();
    else setView('dashboard');
  };

  return (
    <div className="top-bar">
      <div className="top-bar-left">
        <img
          src="/logo.png"
          alt="Spotifix logo"
          style={{ height: '36px', width: '36px', objectFit: 'contain', marginRight: '8px', borderRadius: '4px', cursor: 'pointer' }}
          onClick={handleHomeClick}
        />

        <button className="home-btn" onClick={handleHomeClick} title="Home">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </button>
      </div>

      <div className="top-bar-center">
        <div className="search-input-wrapper">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="What do you want to play?"
            value={query}
            onChange={handleSearch}
            onFocus={() => setView('search')}
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setView('dashboard'); }}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '18px' }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="top-bar-right">
        <button className="mood-prompt-btn" onClick={() => setView('mood-selector')}>
          What's your mood today?
        </button>
      
        <button className="install-app-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <polyline points="8 12 12 16 16 12"></polyline>
            <line x1="12" y1="8" x2="12" y2="16"></line>
          </svg>
          Install App
        </button>

        {/* User avatar with dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            className="user-avatar"
            title={user?.username || 'User'}
            onClick={() => setShowMenu(!showMenu)}
          >
            {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
          </button>
          {showMenu && (
            <div
              style={{
                position: 'absolute',
                top: '42px',
                right: 0,
                background: '#282828',
                borderRadius: '8px',
                padding: '8px',
                minWidth: '160px',
                zIndex: 200,
                boxShadow: '0 16px 48px rgba(0,0,0,0.6)'
              }}
            >
              <div style={{ padding: '8px 12px', fontSize: '14px', color: 'var(--text-secondary)', borderBottom: '1px solid #404040', marginBottom: '4px' }}>
                @{user?.username}
              </div>
              <button
                onClick={() => { setView('profile'); setShowMenu(false); }}
                style={{ width: '100%', padding: '10px 12px', background: 'none', border: 'none', color: 'var(--text-primary)', textAlign: 'left', cursor: 'pointer', borderRadius: '4px', fontSize: '14px' }}
                onMouseEnter={e => e.target.style.background = '#3a3a3a'}
                onMouseLeave={e => e.target.style.background = 'none'}
              >
                Profile
              </button>
              <button
                onClick={() => { setView('add'); setShowMenu(false); }}
                style={{ width: '100%', padding: '10px 12px', background: 'none', border: 'none', color: 'var(--text-primary)', textAlign: 'left', cursor: 'pointer', borderRadius: '4px', fontSize: '14px' }}
                onMouseEnter={e => e.target.style.background = '#3a3a3a'}
                onMouseLeave={e => e.target.style.background = 'none'}
              >
                Upload Song
              </button>
              <button
                onClick={onLogout}
                style={{ width: '100%', padding: '10px 12px', background: 'none', border: 'none', color: 'var(--text-primary)', textAlign: 'left', cursor: 'pointer', borderRadius: '4px', fontSize: '14px' }}
                onMouseEnter={e => e.target.style.background = '#3a3a3a'}
                onMouseLeave={e => e.target.style.background = 'none'}
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
