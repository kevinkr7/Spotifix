import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8081";

const MOODS = [
  { name: "Happy", color: "#e8a600", desc: "Uplifting & energetic" },
  { name: "Workout", color: "#22c55e", desc: "High tempo, pump-up beats" },
  { name: "Chill", color: "#22d3ee", desc: "Lo-Fi, ambient relaxation" },
  { name: "Heartbroken", color: "#fb7185", desc: "Acoustic, emotional & slow" }
];

const YOUTUBE_LANGUAGES = [
  { label: "All Languages", code: "" },
  { label: "Malayalam (മലയാളം)", code: "ml" },
  { label: "Tamil (தமிழ்)", code: "ta" },
  { label: "Hindi (हिंदी)", code: "hi" },
  { label: "English", code: "en" }
];

const YOUTUBE_GENRES = [
  { label: "Trending Hits", query: "trending top music" },
  { label: "Acoustic & Lo-Fi", query: "acoustic lofi relaxing songs" },
  { label: "Classical Melodies", query: "classical melody instrumental" },
  { label: "Workout Beats", query: "gym workout motivation beats" },
  { label: "Chill Vibes", query: "chill indie songs vibes" }
];

export default function SearchView({ currentSong, setCurrentSong, isPlaying, setIsPlaying, setPlaylist }) {
  // Mode switcher: 'youtube' (YouTube Music Search) or 'local' (Local Library & AI Search)
  const [searchMode, setSearchMode] = useState("youtube");

  // ── YouTube Search State ──────────────────────────────────────────────────
  const [ytQuery, setYtQuery] = useState("");
  const [debouncedYtQuery, setDebouncedYtQuery] = useState("");
  const [ytLanguage, setYtLanguage] = useState("");
  const [ytResults, setYtResults] = useState([]);
  const [ytLoading, setYtLoading] = useState(false);
  const [ytConfigured, setYtConfigured] = useState(true);
  const [ytMessage, setYtMessage] = useState(null);
  const ytCacheRef = useRef(new Map());

  // ── Local / AI Search State ───────────────────────────────────────────────
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [allSongs, setAllSongs] = useState([]);
  const [aiResults, setAiResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");

  // Debounce YouTube query (400ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedYtQuery(ytQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [ytQuery]);

  // Debounce Local query (400ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);
    return () => clearTimeout(handler);
  }, [query]);

  // Fetch YouTube search results with client-side cache
  const fetchYouTubeSearch = useCallback(async (searchStr, lang) => {
    const cacheKey = `${searchStr.trim().toLowerCase()}::${lang}`;
    if (ytCacheRef.current.has(cacheKey)) {
      const cached = ytCacheRef.current.get(cacheKey);
      setYtResults(cached.tracks);
      setYtConfigured(cached.configured);
      setYtMessage(cached.message);
      return;
    }

    setYtLoading(true);
    setYtMessage(null);

    try {
      const params = new URLSearchParams();
      if (searchStr.trim()) params.append("query", searchStr.trim());
      if (lang) params.append("language", lang);
      params.append("maxResults", "20");

      const res = await fetch(`${API_BASE}/youtube/search?${params.toString()}`, {
        credentials: "include"
      });

      if (res.ok) {
        const data = await res.json();
        const tracks = data.tracks || [];
        setYtResults(tracks);
        setYtConfigured(data.configured);
        setYtMessage(data.message);

        // Store in client cache
        ytCacheRef.current.set(cacheKey, {
          tracks,
          configured: data.configured,
          message: data.message
        });
      } else {
        setYtMessage("Unable to fetch YouTube results. Showing available tracks.");
      }
    } catch (err) {
      console.error("YouTube search error:", err);
      setYtMessage("Network connection issue. Please check your backend.");
    } finally {
      setYtLoading(false);
    }
  }, []);

  // Trigger YouTube fetch on query or language change
  useEffect(() => {
    if (searchMode === "youtube") {
      fetchYouTubeSearch(debouncedYtQuery, ytLanguage);
    }
  }, [debouncedYtQuery, ytLanguage, searchMode, fetchYouTubeSearch]);

  // Fetch AI results when debounced local query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setAiResults([]);
      return;
    }
    const fetchAiSearch = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/search/ai?q=${encodeURIComponent(debouncedQuery)}`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setAiResults(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAiSearch();
  }, [debouncedQuery]);

  // Load all local songs across moods on mount
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const results = await Promise.all(
          MOODS.map(m =>
            fetch(`${API_BASE}/songs/mood/${encodeURIComponent(m.name)}`, { credentials: "include" })
              .then(r => r.json())
              .then(d => (Array.isArray(d) ? d : d.songs || []))
          )
        );
        setAllSongs(results.flat());
      } catch (e) {
        console.error("Search fetch error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Filter local songs based on search and active filter
  const filteredLocal = useMemo(() => {
    let sourceList = debouncedQuery.trim()
      ? aiResults
      : allSongs.map(s => ({ music: s, matchedReason: null }));

    if (activeFilter !== "All") {
      sourceList = sourceList.filter(item => item.music?.mood === activeFilter);
    }

    return sourceList;
  }, [debouncedQuery, aiResults, allSongs, activeFilter]);

  const handlePlayLocal = (item) => {
    const song = item.music;
    const fullQueue = filteredLocal.map(f => f.music);
    setPlaylist(fullQueue);
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const handlePlayYouTube = (track) => {
    setPlaylist(ytResults);
    setCurrentSong(track);
    setIsPlaying(true);
  };

  const formatPublishDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateStr.substring(0, 10);
    }
  };

  return (
    <div style={{ maxWidth: '1040px', margin: '0 auto', padding: '16px' }}>
      {/* Header and Mode Navigation */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '1px', color: searchMode === 'youtube' ? '#ff4d4d' : 'var(--brand-accent)', textTransform: 'uppercase' }}>
              {searchMode === 'youtube' ? "Official YouTube Music Engine" : "Intelligent Library Matching"}
            </span>
            <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px', margin: '4px 0 0 0', color: '#ffffff' }}>
              Search & Discover Music
            </h1>
          </div>

          {/* Mode Switcher Tabs */}
          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '9999px', padding: '4px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <button
              onClick={() => setSearchMode("youtube")}
              style={{
                background: searchMode === "youtube" ? 'linear-gradient(135deg, #ff0000, #cc0000)' : 'transparent',
                color: '#ffffff',
                border: 'none',
                borderRadius: '9999px',
                padding: '8px 18px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                boxShadow: searchMode === "youtube" ? '0 2px 10px rgba(255, 0, 0, 0.4)' : 'none'
              }}
            >
              <svg width="14" height="10" viewBox="0 0 24 18" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              YouTube Music
            </button>
            <button
              onClick={() => setSearchMode("local")}
              style={{
                background: searchMode === "local" ? 'var(--brand-accent)' : 'transparent',
                color: searchMode === "local" ? '#000000' : '#ffffff',
                border: 'none',
                borderRadius: '9999px',
                padding: '8px 18px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              ⚡ Library & AI
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── YOUTUBE MUSIC SEARCH VIEW ───────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {searchMode === "youtube" && (
        <div>
          {/* YouTube Search Bar */}
          <div style={{ position: 'relative', width: '100%', marginBottom: '16px' }}>
            <svg 
              width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
              style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Search millions of songs, artists, soundtracks on YouTube..."
              value={ytQuery}
              onChange={(e) => setYtQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '16px 20px 16px 52px',
                borderRadius: '9999px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                color: '#ffffff',
                fontSize: '16px',
                outline: 'none',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => { e.target.style.borderColor = '#ff4d4d'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)'; }}
            />
            {ytQuery && (
              <button
                onClick={() => setYtQuery("")}
                style={{
                  position: 'absolute',
                  right: '18px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Language Choices: Malayalam, Tamil, Hindi, English */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', marginRight: '4px' }}>
              Languages:
            </span>
            {YOUTUBE_LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => setYtLanguage(l.code)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '13px',
                  fontWeight: ytLanguage === l.code ? '700' : '500',
                  border: ytLanguage === l.code ? '1px solid #ff4d4d' : '1px solid rgba(255, 255, 255, 0.12)',
                  background: ytLanguage === l.code ? 'rgba(255, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  color: ytLanguage === l.code ? '#ffffff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Quick-Genre / Trending Chips when search input is empty */}
          {!ytQuery.trim() && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
              {YOUTUBE_GENRES.map((g) => (
                <button
                  key={g.label}
                  onClick={() => setYtQuery(g.query)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'; }}
                >
                  {g.label}
                </button>
              ))}
            </div>
          )}

          {/* Notice Banner */}
          {!ytConfigured && (
            <div style={{
              background: 'rgba(234, 88, 12, 0.15)',
              border: '1px solid rgba(234, 88, 12, 0.4)',
              borderRadius: '8px',
              padding: '12px 16px',
              color: '#fdba74',
              fontSize: '13px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span>⚠️</span>
              <span>YouTube API Key is not configured in .env. Showing featured curated songs. Add YOUTUBE_API_KEY to .env to enable live search.</span>
            </div>
          )}

          {ytMessage && (
            <div style={{
              background: 'rgba(59, 130, 246, 0.12)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              padding: '10px 14px',
              color: '#93c5fd',
              fontSize: '12px',
              marginBottom: '16px'
            }}>
              ℹ️ {ytMessage}
            </div>
          )}

          {/* Disclaimer (Requirement 6 compliance) */}
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '16px', opacity: 0.8 }}>
            🎵 Songs stream via official YouTube IFrame Player. Results are matched using YouTube relevance search algorithms; provider does not guarantee strict language metadata.
          </div>

          {/* Loading Indicator */}
          {ytLoading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0', gap: '12px', color: 'var(--text-secondary)' }}>
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                borderTopColor: '#ff0000',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }}></div>
              <span>Searching real songs on YouTube...</span>
            </div>
          )}

          {/* Empty Results */}
          {!ytLoading && ytResults.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-secondary)' }}>
              <p style={{ fontSize: '16px', marginBottom: '8px' }}>No YouTube songs found for "{ytQuery}".</p>
              <p style={{ fontSize: '13px' }}>Try searching by song name, artist, movie soundtrack, or genre.</p>
            </div>
          )}

          {/* Results List */}
          {!ytLoading && ytResults.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.3px', margin: 0 }}>
                  {ytQuery.trim() ? `Search Results for "${ytQuery}"` : "Trending Songs on YouTube"}
                </h2>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {ytResults.length} tracks found
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {ytResults.map((track, idx) => {
                  const isCurrent = currentSong?.videoId === track.videoId;
                  return (
                    <div
                      key={track.videoId || idx}
                      onClick={() => handlePlayYouTube(track)}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '40px 64px 1fr 140px 100px',
                        alignItems: 'center',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: isCurrent ? 'rgba(255, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                        border: isCurrent ? '1px solid rgba(255, 0, 0, 0.3)' : '1px solid transparent',
                        cursor: 'pointer',
                        transition: 'all 0.18s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isCurrent) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isCurrent) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                      }}
                    >
                      {/* Play Number / Icon */}
                      <div style={{ color: isCurrent ? '#ff4d4d' : 'var(--text-secondary)', fontSize: '14px', fontWeight: '700' }}>
                        {isCurrent && isPlaying ? "▶" : idx + 1}
                      </div>

                      {/* Video Thumbnail */}
                      <div style={{ width: '48px', height: '48px', position: 'relative', borderRadius: '6px', overflow: 'hidden' }}>
                        <img
                          src={track.thumbnailUrl || track.image_url}
                          alt={track.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>

                      {/* Title & Channel */}
                      <div style={{ paddingRight: '16px', overflow: 'hidden' }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '700',
                          color: isCurrent ? '#ff4d4d' : '#ffffff',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          marginBottom: '3px'
                        }}>
                          {track.title}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{track.channelTitle || track.artist}</span>
                          <span style={{ fontSize: '9px', background: '#ff0000', color: '#ffffff', padding: '1px 5px', borderRadius: '3px', fontWeight: '800' }}>
                            YOUTUBE
                          </span>
                        </div>
                      </div>

                      {/* Publication Date */}
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {formatPublishDate(track.publishedAt)}
                      </div>

                      {/* Actions: Direct link & Play */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
                        <a
                          href={track.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          title="Open on YouTube"
                          style={{ color: 'var(--text-secondary)', fontSize: '12px', textDecoration: 'none' }}
                        >
                          ↗
                        </a>
                        <button
                          style={{
                            background: isCurrent ? '#ff0000' : 'rgba(255, 255, 255, 0.1)',
                            border: 'none',
                            borderRadius: '9999px',
                            color: '#ffffff',
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          {isCurrent && isPlaying ? "Pause" : "Play"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── LOCAL LIBRARY & AI SEARCH VIEW ──────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {searchMode === "local" && (
        <div>
          {/* Local Search Bar */}
          <div style={{ position: 'relative', width: '100%', marginBottom: '20px' }}>
            <svg 
              width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
              style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Type lyrics, genre, emotion, or song title in your library..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px 14px 48px',
                borderRadius: '9999px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text-primary)',
                fontSize: '15px',
                outline: 'none',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
              }}
            />
          </div>

          {/* Mood filter pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
            {["All", ...MOODS.map(m => m.name)].map(f => (
              <button
                key={f}
                className={`filter-pill ${activeFilter === f ? 'active' : ''}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          {/* When no query typed, show Browse Cards */}
          {!query.trim() && (
            <div style={{ marginBottom: '36px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '16px', letterSpacing: '-0.3px' }}>
                Browse Categories
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {MOODS.map(m => (
                  <div
                    key={m.name}
                    onClick={() => { setQuery(m.name); setActiveFilter(m.name); }}
                    style={{
                      background: `linear-gradient(135deg, ${m.color}22 0%, rgba(18, 20, 28, 0.9) 100%)`,
                      border: `1px solid ${m.color}44`,
                      borderRadius: '16px',
                      padding: '24px 20px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ fontSize: '20px', fontWeight: '800', color: m.color, marginBottom: '6px' }}>
                      {m.name}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {m.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading && <p style={{ color: 'var(--text-secondary)', padding: '24px 0', textAlign: 'center' }}>Searching with AI matching...</p>}

          {!loading && query && filteredLocal.length === 0 && (
            <p style={{ color: 'var(--text-secondary)', padding: '32px 0', textAlign: 'center' }}>
              No matching tracks found for "{query}".
            </p>
          )}

          {/* Local results list */}
          {filteredLocal.length > 0 && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '14px', letterSpacing: '-0.3px' }}>
                {query.trim() ? "Search Results" : "All Library Tracks"}
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {filteredLocal.map((item, idx) => {
                  const song = item.music;
                  const isThis = currentSong?.id === song.id;
                  return (
                    <div
                      key={song.id || idx}
                      className={`pl-track-row ${isThis ? 'pl-track-row--playing' : ''}`}
                      onClick={() => handlePlayLocal(item)}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '40px 1fr 140px 80px',
                        alignItems: 'center',
                        padding: '10px 16px',
                        borderRadius: '10px',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ color: isThis ? 'var(--brand-accent)' : 'var(--text-secondary)', fontSize: '13px', fontWeight: '700' }}>
                        {isThis && isPlaying ? "▶" : idx + 1}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: isThis ? 'var(--brand-accent)' : '#ffffff' }}>
                          {song.title}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span>{song.artist}</span>
                          {item.matchedReason && (
                            <span style={{ fontSize: '11px', color: 'var(--brand-accent)', background: 'rgba(251, 121, 13, 0.1)', padding: '1px 6px', borderRadius: '4px' }}>
                              {item.matchedReason}
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.06)', color: 'var(--text-secondary)' }}>
                          {song.mood}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        Play
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
