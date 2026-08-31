import { useState, useEffect } from "react";
import MoodDashboard from "./MoodDashboard";
import { AddSong } from "./AddSong";
import SearchView from "./SearchView";
import ProfilePage from "./ProfilePage";
import Sidebar from "./Sidebar";
import PlayerBar from "./PlayerBar";
import TopBar from "./TopBar";
import RightPanel from "./RightPanel";
import WeeklyInsights from "./WeeklyInsights";

function MoodSelectorPage({ onSelect }) {
  const [isBuffering, setIsBuffering] = useState(false);
  
  const moods = [
    { id: "Happy", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop" },
    { id: "Heartbroken", image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=400&auto=format&fit=crop" },
    { id: "Chill", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&auto=format&fit=crop" },
    { id: "Workout", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop" }
  ];

  const handleClick = (mood) => {
    setIsBuffering(true);
    setTimeout(() => {
      onSelect(mood);
    }, 2000);
  };

  if (isBuffering) {
    return (
      <div className="buffering-screen">
        <div className="magical-spinner"></div>
        <div className="buffering-text">Analyzing your vibes...</div>
      </div>
    );
  }

  return (
    <div className="mood-selector-page">
      <h2 className="mood-selector-title">What's your mood today?</h2>
      <div className="mood-circle-grid">
        {moods.map((m) => (
          <button
            key={m.id}
            className="mood-circle-btn"
            style={{ backgroundImage: `url(${m.image})` }}
            onClick={() => handleClick(m.id)}
          >
            <div className="mood-circle-overlay">
              <span className="mood-circle-text">{m.id}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function HomePage({ user, onLogout }) {
  const [view, setView] = useState("dashboard");

  // Global Player State
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlist, setPlaylist] = useState([]); // full list for prev/next
  const [selectedMood, setSelectedMood] = useState(null); // for sidebar clicks

  // UI state
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [homeKey, setHomeKey] = useState(0);
  const [isShuffling, setIsShuffling] = useState(false);

  const currentIndex = playlist.findIndex(s => s.id === currentSong?.id);

  // Track play history
  useEffect(() => {
    if (currentSong?.id) {
      fetch(`${process.env.REACT_APP_API_BASE_URL || "http://localhost:8080"}/history/${currentSong.id}`, {
        method: 'POST',
        credentials: 'include'
      }).catch(console.error);
    }
  }, [currentSong?.id]);

  const handleSmartShuffle = async () => {
    setIsShuffling(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL || "http://localhost:8080"}/shuffle/intelligent`, {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        const smartPlaylist = await res.json();
        if (smartPlaylist.length > 0) {
          setPlaylist(smartPlaylist);
          setCurrentSong(smartPlaylist[0]);
          setIsPlaying(true);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsShuffling(false);
    }
  };

  const handleNext = () => {
    if (playlist.length === 0) return;
    const nextIndex = (currentIndex + 1) % playlist.length;
    setCurrentSong(playlist[nextIndex]);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    if (playlist.length === 0) return;
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    setCurrentSong(playlist[prevIndex]);
    setIsPlaying(true);
  };

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    setView('dashboard');
  };

  const handleHomeClick = () => {
    setView('dashboard');
    setSelectedMood(null);
    setHomeKey(prev => prev + 1);
  };

  return (
    <div className={`app-shell ${!showRightPanel ? 'right-panel-hidden' : ''}`}>
      <TopBar setView={setView} user={user} onLogout={onLogout} onHome={handleHomeClick} />

      <Sidebar currentView={view} setView={setView} onMoodSelect={handleMoodSelect} />

      <main className="main-view panel-container">
        <div className="main-content">
          {view === "dashboard" && (
            <MoodDashboard
              key={homeKey}
              currentSong={currentSong}
              setCurrentSong={setCurrentSong}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              setPlaylist={setPlaylist}
              initialMood={selectedMood}
              clearInitialMood={() => setSelectedMood(null)}
            />
          )}
          {view === "add" && <AddSong />}
          {view === "profile" && (
            <ProfilePage
              user={user}
              onPlaylistClick={(label) => {
                setSelectedMood(label.replace(' Mix', '').replace(' Vibes', ''));
                setView('dashboard');
              }}
            />
          )}
          {view === "search" && (
            <SearchView
              currentSong={currentSong}
              setCurrentSong={setCurrentSong}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              setPlaylist={setPlaylist}
            />
          )}
          {view === "mood-selector" && (
            <MoodSelectorPage
              onSelect={(mood) => {
                setSelectedMood(mood);
                setHomeKey(prev => prev + 1);
                setView('dashboard');
              }}
            />
          )}
          {view === "insights" && <WeeklyInsights />}
        </div>
      </main>

      <div className="right-panel-container" style={{ gridArea: 'right-panel', overflow: 'hidden', padding: 0, margin: 0 }}>
        <RightPanel 
          currentSong={currentSong} 
          isPlaying={isPlaying} 
          setIsPlaying={setIsPlaying} 
          onClose={() => setShowRightPanel(false)}
        />
      </div>

      <PlayerBar
        currentSong={currentSong}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        playlist={playlist}
        onNext={playlist.length > 1 ? handleNext : null}
        onPrev={playlist.length > 1 ? handlePrev : null}
        onToggleRightPanel={() => setShowRightPanel(!showRightPanel)}
        onSmartShuffle={handleSmartShuffle}
        isShuffling={isShuffling}
      />
    </div>
  );
}
