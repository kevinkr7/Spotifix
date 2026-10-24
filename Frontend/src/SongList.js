import { useEffect, useMemo, useState } from "react";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8081";

/* ── Per-mood visual identity ─────────────────────────────────────── */
const MOOD_META = {
  Happy: {
    color: "#e8a600",
    gradient: "linear-gradient(180deg, #5a3e00 0%, #121212 400px)",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop",
    label: "Happy Mix",
  },
  Workout: {
    color: "#22c55e",
    gradient: "linear-gradient(180deg, #003d1f 0%, #121212 400px)",
    cover: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop",
    label: "Workout Mix",
  },
  Chill: {
    color: "#22d3ee",
    gradient: "linear-gradient(180deg, #003545 0%, #121212 400px)",
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&auto=format&fit=crop",
    label: "Chill Vibes",
  },
  Heartbroken: {
    color: "#fb7185",
    gradient: "linear-gradient(180deg, #450020 0%, #121212 400px)",
    cover: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=400&auto=format&fit=crop",
    label: "Heartbroken",
  },
  Liked: {
    color: "#450af5",
    gradient: "linear-gradient(180deg, #450af5 0%, #121212 400px)",
    cover: "/logo.png",
    label: "Liked Songs",
  },
};

/* ── Helpers ──────────────────────────────────────────────────────── */
const fmtDur = (s) => {
  if (!s || isNaN(s)) return "--:--";
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
};

const TODAY = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

/* ── Component ────────────────────────────────────────────────────── */
export default function SongList({ mood, currentSong, setCurrentSong, isPlaying, setIsPlaying, setPlaylist }) {
  const [songs, setSongs]       = useState([]);
  const [loading, setLoading]   = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [query, setQuery]       = useState("");
  const [isShuffle, setIsShuffle] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [sortMode, setSortMode] = useState("Custom"); // Custom, A-Z, Language
  const [draggedIdx, setDraggedIdx] = useState(null);

  const meta = MOOD_META[mood] || MOOD_META.Happy;

  /* Fetch favorites */
  useEffect(() => {
    fetch(`${API_BASE}/favorites`, { credentials: "include" })
      .then(r => r.ok ? r.json() : [])
      .then(d => setFavorites(Array.isArray(d) ? d.map(f => f.songId) : []))
      .catch(() => {});
  }, []);

  /* Fetch songs for this mood */
  useEffect(() => {
    if (!mood) return;
    setLoading(true);
    if (mood === 'Liked') {
      Promise.all([
        fetch(`${API_BASE}/songs`, { credentials: "include" }).then(r => r.ok ? r.json() : []),
        fetch(`${API_BASE}/favorites`, { credentials: "include" }).then(r => r.ok ? r.json() : [])
      ]).then(([songsData, favData]) => {
        const s = Array.isArray(songsData) ? songsData : songsData.songs || [];
        const fList = Array.isArray(favData) ? favData : [];
        
        // Create a map for fast lookup
        const songMap = {};
        s.forEach(song => songMap[song.id] = song);

        // Order songs according to favData sortOrder
        const orderedSongs = [];
        fList.forEach(f => {
          if (songMap[f.songId]) {
            orderedSongs.push(songMap[f.songId]);
          }
        });
        
        setSongs(orderedSongs);
        setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      fetch(`${API_BASE}/songs/mood/${encodeURIComponent(mood)}`, { credentials: "include" })
        .then(r => r.json())
        .then(d => {
          setSongs(Array.isArray(d) ? d : d.songs || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [mood]);

  const visibleSongs = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = [...songs];
    if (q) {
      result = result.filter(s => s.title?.toLowerCase().includes(q) || s.artist?.toLowerCase().includes(q));
    }
    
    if (sortMode === "A-Z") {
      result.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    } else if (sortMode === "Language") {
      result.sort((a, b) => (a.language || "").localeCompare(b.language || ""));
    }
    // "Custom" maintains the order in 'songs' array (which is backend ordered for Liked)

    return result;
  }, [songs, query, sortMode]);

  /* Keep parent playlist in sync */
  useEffect(() => {
    if (setPlaylist) setPlaylist(visibleSongs);
  }, [visibleSongs, setPlaylist]);

  const handleSongClick = (song) => {
    if (setPlaylist) setPlaylist(visibleSongs);
    if (currentSong?.id === song.id) setIsPlaying(!isPlaying);
    else { setCurrentSong(song); setIsPlaying(true); }
  };

  const playAll = () => {
    if (!visibleSongs.length) return;
    const list = isShuffle
      ? [...visibleSongs].sort(() => Math.random() - 0.5)
      : visibleSongs;
    if (setPlaylist) setPlaylist(list);
    setCurrentSong(list[0]);
    setIsPlaying(true);
  };

  const toggleFavorite = async (id, e) => {
    e.stopPropagation();
    if (!id) return;
    const isFav = favorites.includes(id);
    await fetch(`${API_BASE}/favorites/${id}`, {
      method: isFav ? "DELETE" : "POST",
      credentials: "include",
    }).catch(() => {});
    setFavorites(prev => isFav ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleDragStart = (e, index) => {
    if (mood !== "Liked" || sortMode !== "Custom" || query) return;
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnter = (e, index) => {
    if (mood !== "Liked" || sortMode !== "Custom" || query || draggedIdx === null || draggedIdx === index) return;
    const newSongs = [...songs];
    const draggedSong = newSongs[draggedIdx];
    newSongs.splice(draggedIdx, 1);
    newSongs.splice(index, 0, draggedSong);
    setDraggedIdx(index);
    setSongs(newSongs);
  };

  const handleDragEnd = () => {
    if (draggedIdx === null) return;
    setDraggedIdx(null);
    const orderRequests = songs.map((s, idx) => ({ songId: s.id, sortOrder: idx }));
    fetch(`${API_BASE}/favorites/order`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderRequests),
      credentials: "include"
    });
  };

  /* Total duration estimate */
  const totalMins = visibleSongs.length * 3; // rough 3 min avg
  const durStr = `about ${Math.floor(totalMins / 60)} hr ${totalMins % 60} min`;

  return (
    <div className="playlist-view">
      {/* ── HERO HEADER ──────────────────────────────────────────── */}
      <div className="playlist-hero" style={{ background: meta.gradient }}>
        <img 
          src={meta.cover || "/logo.png"} 
          alt={meta.label} 
          className="playlist-hero-cover"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/logo.png";
          }}
        />
        <div className="playlist-hero-info">
          <span className="playlist-hero-type">Public Playlist</span>
          <h1 className="playlist-hero-name" style={{ color: meta.color }}>{meta.label}</h1>
          <div className="playlist-hero-meta">
            <div className="playlist-hero-owner">
              <div className="playlist-owner-avatar">S</div>
              <span className="playlist-owner-name">Spotifix</span>
            </div>
            <span className="playlist-hero-details">
              &nbsp;• {visibleSongs.length} songs, {durStr}
            </span>
          </div>
        </div>
      </div>

      {/* ── ACTION BAR ───────────────────────────────────────────── */}
      <div className="playlist-action-bar" style={{ background: meta.gradient.replace('0%,', '100%,') }}>
        {/* Big green play */}
        <button className="pl-play-btn" onClick={playAll}>
          {isPlaying && currentSong && visibleSongs.some(s => s.id === currentSong.id) ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          )}
        </button>

        {/* Save / heart */}
        <button className="pl-action-icon" title="Save to library">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M12 8v8M8 12h8"/>
          </svg>
        </button>

        {/* Shuffle */}
        <button
          className={`pl-action-icon ${isShuffle ? 'pl-action-icon--active' : ''}`}
          onClick={() => setIsShuffle(!isShuffle)}
          title="Shuffle"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
          </svg>
        </button>

        {/* Download */}
        <button className="pl-action-icon" title="Download">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
          </svg>
        </button>

        {/* Add person */}
        <button className="pl-action-icon" title="Invite collaborators">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </button>

        {/* Mix pill */}
        <button className="pl-mix-pill" style={{ borderColor: meta.color, color: meta.color }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{marginRight:'6px'}}>
            <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z"/>
          </svg>
          Mix
        </button>

        {/* More */}
        <button className="pl-action-icon" title="More options">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
          </svg>
        </button>

        {/* Spacer */}
        <div style={{flex: 1}}/>

        {/* Sort Dropdown */}
        {mood === "Liked" && (
          <select 
            value={sortMode} 
            onChange={e => setSortMode(e.target.value)}
            style={{
              background: 'transparent',
              color: 'var(--text-secondary)',
              border: 'none',
              outline: 'none',
              marginRight: '12px',
              cursor: 'pointer',
              fontWeight: 700
            }}
          >
            <option value="Custom" style={{color: '#000'}}>Custom Order</option>
            <option value="A-Z" style={{color: '#000'}}>A-Z</option>
            <option value="Language" style={{color: '#000'}}>Language</option>
          </select>
        )}

        {/* Search in playlist */}
        <div style={{position:'relative'}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2"
            style={{position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)'}}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search in playlist"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="pl-search"
          />
        </div>

        {/* List view toggle */}
        <button className="pl-action-icon pl-list-btn" title="List view">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
          </svg>
          <span style={{marginLeft:'6px', fontSize:'13px', fontWeight:700}}>List</span>
        </button>
      </div>

      {/* ── TRACK TABLE ──────────────────────────────────────────── */}
      {loading && <p className="muted" style={{padding:'32px'}}>Loading tracks...</p>}

      {!loading && visibleSongs.length === 0 && (
        <p className="muted" style={{padding:'32px'}}>
          No songs found{query ? ` for "${query}"` : ` in ${mood}`}. Upload some tracks!
        </p>
      )}

      {visibleSongs.length > 0 && (
        <div className="pl-track-table">
          {/* Table header */}
          <div className="pl-track-header">
            <div className="pl-col-num">#</div>
            <div className="pl-col-title">Title</div>
            <div className="pl-col-album">Album</div>
            <div className="pl-col-date">Date added</div>
            <div className="pl-col-dur">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
              </svg>
            </div>
          </div>

          <div className="pl-track-divider" />

          {/* Track rows */}
          {visibleSongs.map((song, idx) => {
            const isThis = currentSong?.id === song.id;
            const isFav  = favorites.includes(song.id);
            const isHov  = hoveredRow === idx;

            return (
              <div
                key={song.id || idx}
                className={`pl-track-row ${isThis ? 'pl-track-row--playing' : ''} ${isHov ? 'pl-track-row--hovered' : ''}`}
                onClick={() => handleSongClick(song)}
                onMouseEnter={() => setHoveredRow(idx)}
                onMouseLeave={() => setHoveredRow(null)}
                draggable={mood === "Liked" && sortMode === "Custom" && !query}
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragEnter={(e) => handleDragEnter(e, idx)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                style={{ opacity: draggedIdx === idx ? 0.5 : 1 }}
              >
                {/* # / play icon */}
                <div className="pl-col-num">
                  {isHov || isThis ? (
                    <button
                      className="pl-row-play-btn"
                      onClick={e => { e.stopPropagation(); handleSongClick(song); }}
                    >
                      {isThis && isPlaying ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="5 3 19 12 5 21 5 3"/>
                        </svg>
                      )}
                    </button>
                  ) : (
                    <span style={{ color: isThis ? 'var(--brand-accent)' : 'var(--text-secondary)', fontSize:'14px' }}>
                      {idx + 1}
                    </span>
                  )}
                </div>

                {/* Thumbnail + title + artist */}
                <div className="pl-col-title">
                  <div className="pl-thumb-wrap">
                    {song.image_url ? (
                      <img 
                        src={song.image_url} 
                        alt={song.title} 
                        className="pl-thumb" 
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/logo.png";
                        }}
                      />
                    ) : (
                      <div className="pl-thumb pl-thumb-placeholder" style={{ background: meta.color + '33' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={meta.color}>
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5z"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="pl-title-group">
                    <span className="pl-song-title" style={{ color: isThis ? 'var(--brand-accent)' : 'var(--text-primary)' }}>
                      {song.title}
                    </span>
                    <span className="pl-song-artist">{song.artist}</span>
                  </div>
                </div>

                {/* Album / Language */}
                <div className="pl-col-album">
                  <span className="pl-album-text">{sortMode === "Language" ? (song.language || "Unknown") : `${song.mood} Mix`}</span>
                </div>

                {/* Date added */}
                <div className="pl-col-date">
                  <span className="pl-date-text">{TODAY}</span>
                </div>

                {/* Duration + heart */}
                <div className="pl-col-dur">
                  {/* Heart — visible on hover */}
                  <button
                    className={`btn-icon pl-heart ${isFav ? 'active' : ''} ${isHov || isFav ? 'pl-heart--visible' : ''}`}
                    onClick={e => toggleFavorite(song.id, e)}
                    title={isFav ? "Remove from Liked Songs" : "Save to Liked Songs"}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24"
                      fill={isFav ? "var(--brand-accent)" : "none"}
                      stroke={isFav ? "var(--brand-accent)" : "currentColor"}
                      strokeWidth="2"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </button>
                  <span className="pl-dur-text">{fmtDur(song.duration)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
