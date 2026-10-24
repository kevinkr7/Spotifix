import React, { useEffect, useState } from "react";
import SongList from "./SongList";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8081";

// Default Trending Songs (from Image 3)
const defaultTrending = [
  {
    id: 101,
    title: "Moth To A Flame (with The Weeknd)",
    artist: "Swedish House Mafia, The Weeknd",
    image: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=300&auto=format&fit=crop",
    mood: "Chill",
    explicit: false
  },
  {
    id: 102,
    title: "São Paulo (feat. Anitta)",
    artist: "The Weeknd, Anitta",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=300&auto=format&fit=crop",
    mood: "Happy",
    explicit: true
  },
  {
    id: 103,
    title: "Solar Eclipse (feat. Don Toliver)",
    artist: "Drake, Don Toliver",
    image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=300&auto=format&fit=crop",
    mood: "Workout",
    explicit: true
  },
  {
    id: 104,
    title: "Love Me Harder",
    artist: "Ariana Grande, The Weeknd",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=300&auto=format&fit=crop",
    mood: "Happy",
    explicit: false
  },
  {
    id: 105,
    title: "Draw You Out - From The Hunger Games",
    artist: "Noah Kahan, The Hunger Games",
    image: "/logo.png",
    mood: "Heartbroken",
    explicit: false
  },
  {
    id: 106,
    title: "STORM",
    artist: "Yung Lean",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=300&auto=format&fit=crop",
    mood: "Chill",
    explicit: true
  }
];

// Default Popular Artists (from Image 3)
const popularArtists = [
  { name: "The Weeknd", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop" },
  { name: "Drake", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop" },
  { name: "Ariana Grande", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop" },
  { name: "Billie Eilish", image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop" },
  { name: "Post Malone", image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop" },
  { name: "Taylor Swift", image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=200&auto=format&fit=crop" }
];

export default function MoodDashboard({ currentSong, setCurrentSong, isPlaying, setIsPlaying, setPlaylist, initialMood, clearInitialMood }) {
  const [mood, setMood] = useState(null);
  const [userSongs, setUserSongs] = useState([]);

  useEffect(() => {
    // Fetch any songs already uploaded in user's library
    fetch(`${API_BASE}/songs`, { credentials: "include" })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setUserSongs(data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (initialMood) {
      setMood(initialMood);
      if (clearInitialMood) clearInitialMood();
    }
  }, [initialMood, clearInitialMood]);

  const handlePlaySong = (song, queue) => {
    setPlaylist(queue);
    setCurrentSong(song);
    setIsPlaying(true);
  };

  if (mood) {
    return (
      <div style={{ padding: '8px' }}>
        <button 
          className="spotify-back-btn" 
          onClick={() => setMood(null)}
          title="Back"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>
        <SongList
          mood={mood}
          currentSong={currentSong}
          setCurrentSong={setCurrentSong}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          setPlaylist={setPlaylist}
        />
      </div>
    );
  }

  const allTrending = [...userSongs, ...defaultTrending];

  return (
    <div className="spotify-main-content">
      {/* ── Section 1: Trending songs (Image 3) ── */}
      <section className="spotify-shelf-section">
        <div className="shelf-header">
          <h2 className="shelf-title">Trending songs</h2>
          <span className="shelf-show-all" onClick={() => setMood("Happy")}>Show all</span>
        </div>

        <div className="spotify-cards-grid">
          {allTrending.slice(0, 6).map((item, idx) => (
            <div 
              key={item.id || idx} 
              className="spotify-track-card"
              onClick={() => handlePlaySong(item, allTrending)}
            >
              <div className="card-artwork-wrap">
                <img 
                  src={item.image_url || item.image || "/logo.png"} 
                  alt={item.title} 
                  className="card-artwork-img"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/logo.png";
                  }}
                />
                {/* Spotify floating green play button */}
                <button 
                  className="card-play-button" 
                  onClick={(e) => { e.stopPropagation(); handlePlaySong(item, allTrending); }}
                  title="Play"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="black">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </button>
              </div>

              <div className="card-info">
                <h3 className="card-track-title">{item.title}</h3>
                <div className="card-track-subtitle">
                  {item.explicit && <span className="explicit-badge">E</span>}
                  <span>{item.artist}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 2: Popular artists (Image 3) ── */}
      <section className="spotify-shelf-section" style={{ marginTop: '36px' }}>
        <div className="shelf-header">
          <h2 className="shelf-title">Popular artists</h2>
          <span className="shelf-show-all">Show all</span>
        </div>

        <div className="spotify-cards-grid">
          {popularArtists.map((artist, idx) => (
            <div 
              key={idx} 
              className="spotify-artist-card"
              onClick={() => setMood("Happy")}
            >
              <div className="artist-artwork-wrap">
                <img 
                  src={artist.image} 
                  alt={artist.name} 
                  className="artist-artwork-img"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/logo.png";
                  }}
                />
                <button 
                  className="card-play-button" 
                  onClick={(e) => { e.stopPropagation(); setMood("Happy"); }}
                  title="Play Artist"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="black">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </button>
              </div>

              <div className="card-info">
                <h3 className="card-artist-name">{artist.name}</h3>
                <span className="card-artist-sub">Artist</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 3: Vibe Playlists ── */}
      <section className="spotify-shelf-section" style={{ marginTop: '36px', marginBottom: '24px' }}>
        <div className="shelf-header">
          <h2 className="shelf-title">Featured Mood Playlists</h2>
          <span className="shelf-show-all" onClick={() => setMood("Chill")}>Show all</span>
        </div>

        <div className="spotify-cards-grid">
          {[
            { label: "Today's Top Hits", desc: "Jung Kook is on top of the Hottest 50!", img: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=300", mood: "Happy" },
            { label: "RapCaviar", desc: "New music from Drake, Lil Yachty, and more.", img: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=300", mood: "Workout" },
            { label: "All Out 2010s", desc: "The biggest songs of the 2010s.", img: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=300", mood: "Chill" },
            { label: "Rock Classics", desc: "Rock legends & epic anthems.", img: "/logo.png", mood: "Heartbroken" }
          ].map((pl, idx) => (
            <div 
              key={idx} 
              className="spotify-track-card"
              onClick={() => setMood(pl.mood)}
            >
              <div className="card-artwork-wrap">
                <img 
                  src={pl.img || "/logo.png"} 
                  alt={pl.label} 
                  className="card-artwork-img"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/logo.png";
                  }}
                />
                <button className="card-play-button" title="Play">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="black">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </button>
              </div>
              <div className="card-info">
                <h3 className="card-track-title">{pl.label}</h3>
                <span className="card-track-subtitle">{pl.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
