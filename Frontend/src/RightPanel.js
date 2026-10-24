import { useState, useEffect } from 'react';

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8081";

export default function RightPanel({ currentSong, isPlaying, setIsPlaying, onClose }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  useEffect(() => {
    if (!currentSong?.id) {
      setIsFavorite(false);
      return;
    }
    if (currentSong.isExternal) {
      fetch(`${API_BASE}/jamendo/favorites/${currentSong.id}/check`, { credentials: "include" })
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d) setIsFavorite(!!d.isFavorite); })
        .catch(() => {});
    }
  }, [currentSong?.id, currentSong?.isExternal]);

  const toggleFavorite = async () => {
    if (!currentSong?.id || favLoading) return;
    setFavLoading(true);
    try {
      if (currentSong.isExternal) {
        if (isFavorite) {
          const res = await fetch(`${API_BASE}/jamendo/favorites/${currentSong.id}`, {
            method: "DELETE",
            credentials: "include"
          });
          if (res.ok) setIsFavorite(false);
        } else {
          const res = await fetch(`${API_BASE}/jamendo/favorites`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              providerTrackId: currentSong.id,
              title: currentSong.title,
              artist: currentSong.artist,
              album: currentSong.album,
              imageUrl: currentSong.image_url,
              audioUrl: currentSong.audio_url,
              duration: currentSong.duration,
              licenseCcUrl: currentSong.license_ccurl,
              shareUrl: currentSong.share_url,
              language: currentSong.language
            })
          });
          if (res.ok) setIsFavorite(true);
        }
      } else {
        const res = await fetch(`${API_BASE}/favorites/${currentSong.id}`, {
          method: isFavorite ? "DELETE" : "POST",
          credentials: "include"
        });
        if (res.ok) setIsFavorite(!isFavorite);
      }
    } catch (e) {
      console.error("Favorite failed:", e);
    } finally {
      setFavLoading(false);
    }
  };

  if (!currentSong) {
    return (
      <div className="right-panel panel-container">
        <div className="right-panel-header">
          <span>Now Playing</span>
          {onClose && (
            <button className="btn-icon" onClick={onClose} title="Close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
        <div className="right-panel-cover" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="var(--text-secondary)">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-7.5c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
          </svg>
        </div>
        <p className="muted" style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px' }}>
          Select a track to see details
        </p>
      </div>
    );
  }

  const imageUrl = currentSong.image_url ||
    'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400&auto=format&fit=crop';

  return (
    <div className="right-panel panel-container">
      <div className="right-panel-header">
        <span style={{ fontWeight: 700, fontSize: '14px' }}>Now Playing</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-icon" onClick={() => setIsPlaying(!isPlaying)} title={isPlaying ? "Pause" : "Play"}>
            {isPlaying ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16"></rect>
                <rect x="14" y="4" width="4" height="16"></rect>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            )}
          </button>
          {onClose && (
            <button className="btn-icon" onClick={onClose} title="Close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
      </div>

      <img src={imageUrl} alt="Album cover" className="right-panel-cover" />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="right-panel-title">{currentSong.title}</div>
          <div className="right-panel-artist">{currentSong.artist}</div>
        </div>
        {/* Heart icon — wired to real favorites API */}
        <button
          className="btn-icon"
          onClick={toggleFavorite}
          disabled={favLoading}
          title={isFavorite ? "Remove from Liked Songs" : "Save to Liked Songs"}
          style={{ marginTop: '8px' }}
        >
          <svg
            width="24" height="24"
            viewBox="0 0 24 24"
            fill={isFavorite ? "var(--brand-accent)" : "none"}
            stroke={isFavorite ? "var(--brand-accent)" : "currentColor"}
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      </div>

      {currentSong.provider === 'youtube' ? (
        <div className="right-panel-section" style={{ marginTop: '12px' }}>
          <h3 style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.1em' }}>Provider & Attribution</h3>
          <p style={{ fontSize: '13px', color: '#ff0000', fontWeight: '700', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>YouTube Official Embed</span>
          </p>
          {currentSong.youtubeUrl && (
            <a 
              href={currentSong.youtubeUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#888888', fontSize: '12px', textDecoration: 'underline', display: 'inline-block', marginTop: '4px' }}
            >
              Watch on YouTube ↗
            </a>
          )}
        </div>
      ) : currentSong.isExternal && (
        <div className="right-panel-section" style={{ marginTop: '12px' }}>
          <h3 style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.1em' }}>Catalog & License</h3>
          <p style={{ fontSize: '13px', color: 'var(--brand-accent)', fontWeight: '600', marginTop: '4px' }}>Jamendo Music (Creative Commons)</p>
          {currentSong.license_ccurl && (
            <a 
              href={currentSong.license_ccurl} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#888888', fontSize: '12px', textDecoration: 'underline', display: 'inline-block', marginTop: '4px' }}
            >
              View License Details ↗
            </a>
          )}
        </div>
      )}

      {currentSong.mood && (
        <div className="right-panel-section">
          <h3 style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.1em' }}>Mood</h3>
          <p style={{ fontSize: '16px', fontWeight: '600', marginTop: '6px' }}>{currentSong.mood}</p>
        </div>
      )}

      <div className="right-panel-section" style={{ marginTop: '12px' }}>
        <h3 style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.1em' }}>Artist</h3>
        <p style={{ fontSize: '16px', fontWeight: '600', marginTop: '6px' }}>{currentSong.artist}</p>
      </div>
    </div>
  );
}
