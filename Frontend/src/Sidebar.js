import { useState } from "react";

const libraryItems = [
  {
    title: "Liked Songs",
    subtitle: "📌 Playlist • Your Favorites",
    mood: "Liked",
    image: null,
    gradient: "linear-gradient(135deg, #450af5, #c4efd9)",
    icon: "heart",
    accent: true
  },
  {
    title: "Happy Mix",
    subtitle: "Playlist",
    mood: "Happy",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=100&auto=format&fit=crop"
  },
  {
    title: "Workout Mix",
    subtitle: "Playlist",
    mood: "Workout",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=100&auto=format&fit=crop"
  },
  {
    title: "Chill Vibes",
    subtitle: "Playlist",
    mood: "Chill",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=100&auto=format&fit=crop"
  },
  {
    title: "Heartbroken",
    subtitle: "Playlist",
    mood: "Heartbroken",
    image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=100&auto=format&fit=crop"
  },
  {
    title: "Weekly Insights",
    subtitle: "AI Analytics",
    mood: "insights",
    gradient: "linear-gradient(135deg, #1c1c1c, #2a2a2a)",
    icon: "chart"
  }
];

export default function Sidebar({ setView, currentView, onMoodSelect }) {
  const [activeFilter, setActiveFilter] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [libraryQuery, setLibraryQuery] = useState("");

  const filters = ["Playlists", "Artists", "Albums"];

  const filteredItems = libraryItems.filter(item =>
    item.title.toLowerCase().includes(libraryQuery.toLowerCase())
  );

  const handleItemClick = (item) => {
    if (item.mood === "insights") {
      setView('insights');
    } else {
      onMoodSelect(item.mood);
      setView('dashboard');
    }
  };

  return (
    <div className="sidebar panel-container">
      <div className="library-header">
        <div className="library-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M1 20h3V7H1v13zm19-14v11h3V6h-3zM9 22h3V2H9v20zm5 0h3V11h-3v11z" />
          </svg>
          Your Library
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {/* Search inside library */}
          <button
            className="btn-icon"
            onClick={() => { setShowSearch(!showSearch); if (showSearch) setLibraryQuery(""); }}
            title="Search library"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
          {/* Upload button */}
          <button className="btn-icon" onClick={() => setView('add')} title="Upload Song">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>

      {/* Library filter pills */}
      <div className="library-filters">
        {filters.map(f => (
          <button
            key={f}
            className={`filter-pill ${activeFilter === f ? 'active' : ''}`}
            onClick={() => setActiveFilter(activeFilter === f ? null : f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Library search input */}
      {showSearch && (
        <div style={{ padding: '0 12px 8px 12px' }}>
          <input
            type="text"
            placeholder="Search in Your Library"
            value={libraryQuery}
            onChange={e => setLibraryQuery(e.target.value)}
            autoFocus
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              background: '#242424',
              color: 'var(--text-primary)',
              fontSize: '14px',
              outline: 'none'
            }}
          />
        </div>
      )}

      <div className="library-list">
        {filteredItems.map((item, i) => (
          <div
            key={i}
            className="library-item"
            onClick={() => handleItemClick(item)}
            title={`Play ${item.title}`}
          >
            {item.image ? (
              <img src={item.image} alt={item.title} className="library-item-img" />
            ) : (
              <div className="library-item-img" style={{ background: item.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </div>
            )}
            <div className="library-item-info">
              <span className="library-item-title" style={item.accent ? { color: 'var(--brand-accent)' } : {}}>
                {item.title}
              </span>
              <span className="library-item-subtitle">{item.subtitle}</span>
            </div>
          </div>
        ))}
        {filteredItems.length === 0 && (
          <p className="muted" style={{ padding: '16px', fontSize: '14px' }}>No playlists found.</p>
        )}
      </div>
    </div>
  );
}
