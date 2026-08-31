import React, { useEffect, useState, useRef } from 'react';
import './KaraokeView.css';

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

export default function KaraokeView({ currentSong, currentTime, onClose }) {
  const [lyrics, setLyrics] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    if (currentSong) {
      fetch(`${API_BASE}/audio/karaoke/lyrics/${currentSong.id}`)
        .then(res => res.json())
        .then(data => setLyrics(data))
        .catch(console.error);
    }
  }, [currentSong]);

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
      <button className="karaoke-close" onClick={onClose}>&times; Exit Karaoke</button>
      
      <div className="karaoke-lyrics-container" ref={containerRef}>
        {lyrics.map((line, i) => (
          <div key={i} className={`karaoke-line ${i === activeIndex ? 'active' : ''} ${i < activeIndex ? 'passed' : ''}`}>
            {line.text}
          </div>
        ))}
        {lyrics.length === 0 && <div className="karaoke-line">Loading lyrics...</div>}
      </div>
    </div>
  );
}
