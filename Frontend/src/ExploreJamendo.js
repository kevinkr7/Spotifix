import React, { useState, useEffect, useCallback } from "react";
import "./ExploreJamendo.css";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8081";

const LANGUAGES = [
  { label: "All Languages", code: "" },
  { label: "English", code: "en" },
  { label: "Hindi (हिंदी)", code: "hi" },
  { label: "Tamil (தமிழ்)", code: "ta" },
  { label: "Malayalam (മലയാളം)", code: "ml" }
];

const GENRES = [
  { label: "All", tag: "" },
  { label: "Acoustic", tag: "acoustic" },
  { label: "Chill", tag: "chill" },
  { label: "Electronic", tag: "electronic" },
  { label: "Rock", tag: "rock" },
  { label: "Classical", tag: "classical" },
  { label: "Pop", tag: "pop" },
  { label: "Ambient", tag: "ambient" }
];

export default function ExploreJamendo({
  currentSong,
  setCurrentSong,
  isPlaying,
  setIsPlaying,
  setPlaylist,
  user,
  onOpenLogin
}) {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [noticeMessage, setNoticeMessage] = useState(null);
  const [isConfigured, setIsConfigured] = useState(true);
  const [favoritedIds, setFavoritedIds] = useState(new Set());
  const [statusFeedback, setStatusFeedback] = useState(null);

  // Load user's external favorites if authenticated
  const loadUserFavorites = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/jamendo/favorites`, {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        const idSet = new Set(data.map((fav) => fav.providerTrackId));
        setFavoritedIds(idSet);
      }
    } catch (err) {
      // Ignored if unauthenticated or network error
    }
  }, []);

  useEffect(() => {
    loadUserFavorites();
  }, [loadUserFavorites]);

  // Fetch Jamendo tracks with search, language and genre filters
  const fetchTracks = useCallback(async () => {
    setLoading(true);
    setStatusFeedback(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append("query", searchQuery.trim());
      if (selectedLanguage) params.append("language", selectedLanguage);
      if (selectedGenre) params.append("tag", selectedGenre);
      params.append("limit", "24");

      const res = await fetch(`${API_BASE}/jamendo/tracks?${params.toString()}`, {
        credentials: "include"
      });

      if (res.ok) {
        const data = await res.json();
        setTracks(data.tracks || []);
        setIsConfigured(data.configured);
        setNoticeMessage(data.message);
      } else {
        setStatusFeedback("Failed to load tracks from Jamendo catalog.");
      }
    } catch (err) {
      console.error("Jamendo fetch error:", err);
      setStatusFeedback("Unable to reach the music catalog. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedLanguage, selectedGenre]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchTracks();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [fetchTracks]);

  // Handle Play
  const handlePlayTrack = (track) => {
    if (!track.audio_url) {
      setStatusFeedback("Stream for this track is currently unavailable.");
      return;
    }

    const playable = {
      ...track,
      isExternal: true,
      provider: "jamendo"
    };

    setCurrentSong(playable);
    if (setPlaylist) {
      setPlaylist(tracks.map((t) => ({ ...t, isExternal: true, provider: "jamendo" })));
    }
    setIsPlaying(true);

    // Record listening history
    fetch(`${API_BASE}/jamendo/history/${track.id}?title=${encodeURIComponent(track.title || "")}&artist=${encodeURIComponent(track.artist || "")}`, {
      method: "POST",
      credentials: "include"
    }).catch(() => {});
  };

  // Toggle Favorite
  const handleToggleFavorite = async (e, track) => {
    e.stopPropagation();
    const isFav = favoritedIds.has(track.id);

    try {
      if (isFav) {
        const res = await fetch(`${API_BASE}/jamendo/favorites/${track.id}`, {
          method: "DELETE",
          credentials: "include"
        });
        if (res.status === 401) {
          if (onOpenLogin) onOpenLogin();
          return;
        }
        if (res.ok) {
          setFavoritedIds((prev) => {
            const next = new Set(prev);
            next.delete(track.id);
            return next;
          });
        }
      } else {
        const payload = {
          providerTrackId: track.id,
          title: track.title,
          artist: track.artist,
          album: track.album,
          imageUrl: track.image_url,
          audioUrl: track.audio_url,
          duration: track.duration,
          licenseCcUrl: track.license_ccurl,
          shareUrl: track.share_url,
          language: track.language
        };

        const res = await fetch(`${API_BASE}/jamendo/favorites`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload)
        });

        if (res.status === 401) {
          if (onOpenLogin) onOpenLogin();
          return;
        }

        if (res.ok) {
          setFavoritedIds((prev) => new Set(prev).add(track.id));
        }
      }
    } catch (err) {
      console.error("Favorite toggle error:", err);
    }
  };

  const formatDuration = (sec) => {
    if (!sec || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="explore-container">
      {/* Hero Header */}
      <div className="explore-hero">
        <div className="explore-badge">
          <span>🌐</span> Free Catalog • Jamendo Music
        </div>
        <h1 className="explore-title">Explore Free Music</h1>
        <p className="explore-subtitle">
          Stream thousands of legal, independent tracks powered by Jamendo and licensed under Creative Commons. Filter by languages including Malayalam, Tamil, Hindi, and English.
        </p>
      </div>

      {/* Notice Banner */}
      {(!isConfigured || noticeMessage) && (
        <div className="explore-banner">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="explore-banner-icon">💡</span>
            <span>
              {noticeMessage ||
                "Jamendo Creative Commons open catalog is active. To enable your personal Jamendo developer key, configure JAMENDO_CLIENT_ID in your .env file."}
            </span>
          </div>
        </div>
      )}

      {/* Error/Status Banner */}
      {statusFeedback && (
        <div className="explore-banner" style={{ borderLeftColor: "#ef4444", background: "rgba(239, 68, 68, 0.1)" }}>
          <span>⚠️ {statusFeedback}</span>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="explore-controls">
        {/* Search Bar */}
        <div className="explore-search-row">
          <div className="explore-search-box">
            <svg
              className="explore-search-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Search free tracks, artists, or albums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="explore-search-input"
            />
          </div>
        </div>

        {/* Language Filters */}
        <div className="explore-filter-group">
          <span className="filter-label">Language:</span>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              className={`filter-pill ${selectedLanguage === lang.code ? "active" : ""}`}
              onClick={() => setSelectedLanguage(lang.code)}
            >
              {lang.label}
            </button>
          ))}
        </div>

        {/* Genre / Tag Filters */}
        <div className="explore-filter-group">
          <span className="filter-label">Genre:</span>
          {GENRES.map((g) => (
            <button
              key={g.tag}
              className={`filter-pill ${selectedGenre === g.tag ? "active" : ""}`}
              onClick={() => setSelectedGenre(g.tag)}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tracks Grid */}
      {loading ? (
        <div className="explore-empty-state">
          <div className="magical-spinner" style={{ margin: "0 auto 16px auto" }}></div>
          <div className="explore-empty-title">Loading music from Jamendo...</div>
        </div>
      ) : tracks.length === 0 ? (
        <div className="explore-empty-state">
          <div className="explore-empty-icon">🎵</div>
          <div className="explore-empty-title">No tracks found</div>
          <p className="explore-empty-desc">Try clearing your filters or searching for different keywords.</p>
        </div>
      ) : (
        <div className="explore-grid">
          {tracks.map((track) => {
            const isCurrentlyPlaying = currentSong?.id === track.id && isPlaying;
            const isFav = favoritedIds.has(track.id);
            const coverImage =
              track.image_url ||
              "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&auto=format&fit=crop";

            return (
              <div
                key={track.id}
                className={`explore-card ${isCurrentlyPlaying ? "playing" : ""}`}
                onClick={() => handlePlayTrack(track)}
              >
                <div className="explore-card-cover-wrap">
                  <img
                    src={coverImage}
                    alt={track.title}
                    className="explore-card-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&auto=format&fit=crop";
                    }}
                  />
                  <button
                    className="explore-play-overlay"
                    title={isCurrentlyPlaying ? "Pause" : "Play"}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isCurrentlyPlaying) {
                        setIsPlaying(false);
                      } else {
                        handlePlayTrack(track);
                      }
                    }}
                  >
                    {isCurrentlyPlaying ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="4" width="4" height="16"></rect>
                        <rect x="14" y="4" width="4" height="16"></rect>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                    )}
                  </button>
                </div>

                <div className="explore-card-info">
                  <div className="explore-card-title" title={track.title}>
                    {track.title}
                  </div>
                  <div className="explore-card-artist" title={track.artist}>
                    {track.artist}
                  </div>

                  <div className="explore-card-meta">
                    <span title="Source attribution">Jamendo • {formatDuration(track.duration)}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {track.license_ccurl && (
                        <a
                          href={track.license_ccurl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="explore-card-license"
                          title="View Creative Commons License"
                          onClick={(e) => e.stopPropagation()}
                        >
                          CC License
                        </a>
                      )}
                      <button
                        className={`explore-fav-btn ${isFav ? "is-fav" : ""}`}
                        title={isFav ? "Remove from favorites" : "Save to favorites"}
                        onClick={(e) => handleToggleFavorite(e, track)}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill={isFav ? "var(--brand-accent)" : "none"}
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
