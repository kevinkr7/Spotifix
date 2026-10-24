import { useEffect, useState } from "react";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8081";

// Mood-coloured playlist cards to show under "Public Playlists"
const PUBLIC_PLAYLISTS = [
  { label: "Happy Mix",      color: "#f59e0b", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=200&auto=format&fit=crop" },
  { label: "Workout Mix",   color: "#34d399", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=200&auto=format&fit=crop" },
  { label: "Chill Vibes",   color: "#22d3ee", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=200&auto=format&fit=crop" },
  { label: "Heartbroken",   color: "#fb7185", image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=200&auto=format&fit=crop" },
];

export default function ProfilePage({ user, onPlaylistClick }) {
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [favRes] = await Promise.all([
          fetch(`${API_BASE}/favorites`, { credentials: "include" }),
        ]);
        if (favRes.ok) {
          const favData = await favRes.json();
          setFavoriteCount(Array.isArray(favData) ? favData.length : 0);
        }
      } catch (e) {
        console.error("Profile stats fetch error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const initial = user?.username ? user.username.charAt(0).toUpperCase() : "U";
  const username = user?.username || "User";

  return (
    <div className="profile-page">
      {/* ── Hero banner ── */}
      <div className="profile-hero">
        {/* Animated gradient banner */}
        <div className="profile-banner" />

        {/* Avatar */}
        <div className="profile-avatar-wrap">
          <div className="profile-avatar">{initial}</div>
        </div>

        {/* Meta */}
        <div className="profile-meta">
          <span className="profile-label">Profile</span>
          <h1 className="profile-name">{username}</h1>
          <div className="profile-stats">
            <span>
              <strong>{PUBLIC_PLAYLISTS.length}</strong> Public Playlists
            </span>
            <span className="profile-dot">•</span>
            <span>
              {loading ? "–" : <strong style={{ color: "var(--brand-accent)" }}>{favoriteCount}</strong>} Liked Songs
            </span>
            <span className="profile-dot">•</span>
            <span className="profile-email">{user?.email || ""}</span>
          </div>
        </div>
      </div>

      {/* ── Action row ── */}
      <div className="profile-actions">
        <button className="profile-follow-btn">Following</button>
        <button className="btn-icon profile-more-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
          </svg>
        </button>
      </div>

      {/* ── Public Playlists ── */}
      <div className="profile-section">
        <h2 className="profile-section-title">Public Playlists</h2>
        <div className="profile-playlist-grid">
          {PUBLIC_PLAYLISTS.map((pl, i) => (
            <div
              key={i}
              className="profile-playlist-card"
              onClick={() => onPlaylistClick && onPlaylistClick(pl.label)}
            >
              <div className="profile-playlist-img-wrap">
                <img
                  src={pl.image}
                  alt={pl.label}
                  className="profile-playlist-img"
                />
                {/* Play button overlay */}
                <div className="profile-card-play">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="black">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
              </div>
              <p className="profile-playlist-name">{pl.label}</p>
              <p className="profile-playlist-sub muted">Playlist</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
