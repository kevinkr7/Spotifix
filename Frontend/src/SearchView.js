import { useEffect, useMemo, useState } from "react";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

const MOODS = ["Happy", "Workout", "Chill", "Heartbroken"];

export default function SearchView({ currentSong, setCurrentSong, isPlaying, setIsPlaying, setPlaylist }) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [allSongs, setAllSongs] = useState([]);
  const [aiResults, setAiResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");

  // Debounce query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(handler);
  }, [query]);

  // Fetch AI results when debounced query changes
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

  // Load all songs across moods on mount
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const results = await Promise.all(
          MOODS.map(m =>
            fetch(`${API_BASE}/songs/mood/${encodeURIComponent(m)}`, { credentials: "include" })
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

  const filtered = useMemo(() => {
    if (debouncedQuery.trim()) {
      // Use AI results
      let results = aiResults;
      if (activeFilter !== "All") {
        results = results.filter(r => r.music?.mood === activeFilter);
      }
      return results; // It's an array of SearchResultDTO
    }

    // Default local behavior
    let songs = allSongs;
    if (activeFilter !== "All") {
      songs = songs.filter(s => s.mood === activeFilter);
    }
    return songs.map(s => ({ music: s, confidenceScore: 0, matchedReason: '' }));
  }, [allSongs, aiResults, debouncedQuery, activeFilter]);

  const handlePlay = (item) => {
    const song = item.music;
    setPlaylist(filtered.map(f => f.music));
    if (currentSong?.id === song.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '16px' }}>Search</h2>

      {/* Search input */}
      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}>
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          autoFocus
          type="text"
          placeholder="Artists, songs, or podcasts"
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '480px',
            padding: '14px 14px 14px 44px',
            borderRadius: '8px',
            border: 'none',
            background: '#242424',
            color: 'var(--text-primary)',
            fontSize: '16px',
            outline: 'none'
          }}
        />
      </div>

      {/* Mood filter pills */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {["All", ...MOODS].map(f => (
          <button
            key={f}
            className={`filter-pill ${activeFilter === f ? 'active' : ''}`}
            onClick={() => setActiveFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {loading && <p className="muted">Searching...</p>}

      {!loading && filtered.length === 0 && (
        <p className="muted">No results found for "{query}". Try a different search.</p>
      )}

      {/* Results list */}
      {filtered.length > 0 && (
        <div>
          <div className="song-list-header">
            <div>#</div>
            <div>Title</div>
            <div>Mood</div>
            <div></div>
          </div>
          {filtered.map((item, idx) => {
            const song = item.music;
            const isThis = currentSong?.id === song.id;
            return (
              <div
                key={song.id || idx}
                className={`song-row ${isThis ? 'playing' : ''}`}
                onClick={() => handlePlay(item)}
                style={{ cursor: 'pointer' }}
              >
                <div className="song-index">
                  {isThis && isPlaying ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--brand-accent)">
                      <rect x="6" y="4" width="4" height="16"></rect>
                      <rect x="14" y="4" width="4" height="16"></rect>
                    </svg>
                  ) : idx + 1}
                </div>
                <div className="song-title-artist">
                  <span className="song-title">{song.title}</span>
                  <span className="song-artist">{song.artist}</span>
                  {item.matchedReason && <span style={{fontSize: '11px', color: 'var(--brand-accent)', marginTop: '4px'}}>{item.matchedReason}</span>}
                </div>
                <div className="song-album">{song.mood}</div>
                <div></div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
