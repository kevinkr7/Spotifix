import { useEffect, useState } from "react";
import SongList from "./SongList";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

const recentPlaylists = [
  { label: "Liked Songs", image: "linear-gradient(135deg, #450af5, #c4efd9)", value: "Liked" },
  { label: "Workout Mix", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=100&auto=format&fit=crop", value: "Workout" },
  { label: "Chill Vibes", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=100&auto=format&fit=crop", value: "Chill" },
  { label: "Heartbroken", image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=100&auto=format&fit=crop", value: "Heartbroken" },
  { label: "Green Day", image: "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f9af?q=80&w=100&auto=format&fit=crop", value: "Happy" },
  { label: "Skrillex Mix", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=100&auto=format&fit=crop", value: "Workout" },
  { label: "Late Night", image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=100&auto=format&fit=crop", value: "Chill" },
  { label: "Sad Indie", image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=100&auto=format&fit=crop", value: "Heartbroken" }
];

const dailyMixes = [
  { label: "Daily Mix 1", desc: "Ariana Grande, Maroon 5, Lady Gaga and more", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=200&auto=format&fit=crop", value: "Happy" },
  { label: "Daily Mix 2", desc: "A.R. Rahman, Hiphop Tamizha, Harris Jayaraj", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=200&auto=format&fit=crop", value: "Chill" },
  { label: "Daily Mix 3", desc: "Justin Bieber, Celine Dion, Avril Lavigne", image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=200&auto=format&fit=crop", value: "Heartbroken" },
  { label: "Daily Mix 4", desc: "Gopi Sundar, Benny Dayal", image: "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f9af?q=80&w=200&auto=format&fit=crop", value: "Workout" },
  { label: "Discover Weekly", desc: "New music updated every Monday.", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=200&auto=format&fit=crop", value: "Chill" }
];

export default function MoodDashboard({ currentSong, setCurrentSong, isPlaying, setIsPlaying, setPlaylist, initialMood, clearInitialMood }) {
  const [mood, setMood] = useState(null); // Used for drill down view
  const [activeFilter, setActiveFilter] = useState("All");

  const [aiMoodData, setAiMoodData] = useState(null);
  const [explicitMood, setExplicitMood] = useState("Happy");
  const [loading, setLoading] = useState(true);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/mood/recommendations`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setAiMoodData(data);
        if (data.currentMood) setExplicitMood(data.currentMood);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleMoodSelect = async (m) => {
    setExplicitMood(m);
    try {
      await fetch(`${API_BASE}/mood/preferences`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ explicitMood: m, passiveTrackingEnabled: true }),
        credentials: "include"
      });
      fetchRecommendations();
    } catch (e) {
      console.error(e);
    }
  };

  // If sidebar passed a mood, jump directly to that song list
  useEffect(() => {
    if (initialMood) {
      setMood(initialMood);
      if (clearInitialMood) clearInitialMood();
    }
  }, [initialMood, clearInitialMood]);

  if (mood) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <button className="home-btn" onClick={() => setMood(null)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5"></path>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <h2 style={{ margin: 0, fontSize: '32px' }}>{mood} Tracks</h2>
        </div>
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

  return (
    <div>
      <div className="main-filters">
        {["All", "Music", "Podcasts"].map(f => (
          <button
            key={f}
            className={`filter-pill ${activeFilter === f ? 'active' : ''}`}
            onClick={() => setActiveFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div style={{ margin: '24px 0', background: 'linear-gradient(135deg, #1c1c1c, #333)', padding: '24px', borderRadius: '12px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>How are you feeling?</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {["Happy", "Calm", "Sad", "Angry", "Motivated", "Relaxed", "Romantic", "Excited"].map(m => (
            <button
              key={m}
              onClick={() => handleMoodSelect(m)}
              style={{
                background: explicitMood === m ? 'var(--brand-accent)' : '#242424',
                color: explicitMood === m ? '#000' : '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '32px', color: 'var(--text-secondary)' }}>Loading AI recommendations...</div>
      ) : aiMoodData && (
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h2 style={{ fontSize: '28px', margin: 0 }}>Recommended for You</h2>
          </div>
          <p style={{ color: 'var(--brand-accent)', fontSize: '14px', marginBottom: '24px' }}>
            {aiMoodData.explanation}
          </p>

          <div className="mix-grid">
            {aiMoodData.recommendations && aiMoodData.recommendations.slice(0,5).map((song, i) => (
              <div key={i} className="mix-card" onClick={() => {
                setPlaylist(aiMoodData.recommendations);
                setCurrentSong(song);
                setIsPlaying(true);
              }}>
                <img src={song.image_url || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=200"} alt={song.title} className="mix-card-img" />
                <h3>{song.title}</h3>
                <p>{song.artist}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="section-header">
        <h2>Your Playlists</h2>
      </div>
      
      <div className="recent-grid">
        {recentPlaylists.map((item, i) => (
          <div key={i} className="recent-card" onClick={() => setMood(item.value)}>
            {item.image.startsWith('http') ? (
              <img src={item.image} alt={item.label} className="recent-card-img" />
            ) : (
              <div className="recent-card-img" style={{ background: item.image, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </div>
            )}
            <span className="recent-card-title">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="section-header">
        <h2>Made For You</h2>
        <span className="show-all" onClick={() => setMood("Happy")}>Show all</span>
      </div>

      <div className="mix-grid">
        {dailyMixes.map((mix, i) => (
          <div key={i} className="mix-card" onClick={() => setMood(mix.value)}>
            <img src={mix.image} alt={mix.label} className="mix-card-img" />
            <h3>{mix.label}</h3>
            <p>{mix.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
