import React, { useEffect, useState, useRef } from 'react';
import './KaraokeView.css';

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8081";

export default function KaraokeView({ currentSong, currentTime, onClose }) {
  const [lyrics, setLyrics] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    if (currentSong) {
      fetch(`${API_BASE}/audio/karaoke/lyrics/${currentSong.id}`, { credentials: 'include' })
        .then(res => res.ok ? res.json() : [])
        .then(data => setLyrics(data))
        .catch(console.error);
    }
  }, [currentSong]);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Find active line
  let activeIndex = -1;
  for (let i = 0; i < lyrics.length; i++) {
    if (currentTime >= lyrics[i].time && (!lyrics[i+1] || currentTime < lyrics[i+1].time)) {
      activeIndex = i;
      break;
    }
  }

  useEffect(() => {
    if (activeIndex !== -1 && containerRef.current) {
      const activeElement = containerRef.current.children[activeIndex];
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeIndex]);

  return (
    <div className="karaoke-fullscreen">
      {/* Background ambient lighting */}
      <div className="karaoke-ambient-glow"></div>

      {/* Header bar */}
      <div className="karaoke-topbar">
        <div className="karaoke-track-meta">
          <div className="karaoke-vocal-status">
            <span className="vocal-status-pulse"></span>
            <span>Center-Channel Vocal Attenuation Active</span>
          </div>
          <h2 className="karaoke-song-title">{currentSong?.title || "Now Playing"}</h2>
          <span className="karaoke-song-artist">{currentSong?.artist || "Spotifix Stream"}</span>
        </div>

        <button className="karaoke-close" onClick={onClose} title="Exit Karaoke (Esc)">
          <span>Exit Karaoke</span>
          <span className="esc-hint">Esc</span>
        </button>
      </div>
      
      {/* Dynamic scrolling lyric stream */}
      <div className="karaoke-lyrics-container" ref={containerRef}>
        {lyrics.map((line, i) => (
          <div 
            key={i} 
            className={`karaoke-line ${i === activeIndex ? 'active' : ''} ${i < activeIndex ? 'passed' : ''}`}
          >
            {line.text}
          </div>
        ))}
        {lyrics.length === 0 && (
          <div className="karaoke-placeholder">
            <div className="mic-wave-icon">🎤</div>
            <p>Sing along! Vocal suppression is active.</p>
            <span className="subtext">Enjoy pure instrumental backing.</span>
          </div>
        )}
      </div>
    </div>
  );
}
