import React, { useEffect, useRef, useState } from 'react';
import { AudioContextManager } from "./audio/AudioContextManager";
import { EqualizerEngine } from "./audio/EqualizerEngine";
import { KaraokeEngine } from "./audio/KaraokeEngine";
import { ReverseEngine } from "./audio/ReverseEngine";
import EqualizerPanel from "./components/EqualizerPanel";
import KaraokeView from "./components/KaraokeView";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

const resolveAudioUrl = (audioUrl) => {
  if (!audioUrl) return "";
  if (audioUrl.startsWith("http://") || audioUrl.startsWith("https://")) return audioUrl;
  return `${API_BASE}/uploads/${audioUrl}`;
};

export default function PlayerBar({ currentSong, isPlaying, setIsPlaying, playlist, onPrev, onNext, onToggleRightPanel, onSmartShuffle, isShuffling }) {
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const [progress, setProgress]       = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration]       = useState(0);
  const [volume, setVolume]           = useState(0.8);
  const [isMuted, setIsMuted]         = useState(false);
  const [repeatMode, setRepeatMode]   = useState(0); // 0 = off, 1 = all, 2 = one
  const [isLiked, setIsLiked]         = useState(false);
  const [isDragging, setIsDragging]   = useState(false);

  const [crossfadeData, setCrossfadeData] = useState(null);
  const [showCrossfadeTooltip, setShowCrossfadeTooltip] = useState(false);

  // Engines
  const [eqEngine, setEqEngine] = useState(null);
  const [karaokeEngine, setKaraokeEngine] = useState(null);
  const [reverseEngine, setReverseEngine] = useState(null);

  // UI State
  const [showEQ, setShowEQ] = useState(false);
  const [showKaraoke, setShowKaraoke] = useState(false);
  const [isReversed, setIsReversed] = useState(false);
  const [isReversing, setIsReversing] = useState(false);

  useEffect(() => {
    if (audioRef.current && isPlaying && !eqEngine) {
      const acm = AudioContextManager.getInstance();
      acm.resume();
      
      const eq = new EqualizerEngine();
      const karaoke = new KaraokeEngine();
      const rev = new ReverseEngine();
      
      const source = acm.attach(audioRef.current);
      if (source) {
        source.connect(karaoke.getInputNode());
        karaoke.getOutputNode().connect(eq.getInputNode());
        eq.getOutputNode().connect(acm.getContext().destination);
        rev.getOutputNode().connect(eq.getInputNode());

        setEqEngine(eq);
        setKaraokeEngine(karaoke);
        setReverseEngine(rev);
      }
    }
  }, [isPlaying, eqEngine]);

  const handleSkip = (seconds) => {
    if (audioRef.current && duration) {
      const oldTime = audioRef.current.currentTime;
      let newTime = oldTime + seconds;
      newTime = Math.max(0, Math.min(newTime, duration));
      audioRef.current.currentTime = newTime;
      
      if (currentSong) {
        fetch(`${API_BASE}/audio/player/seek?songId=${currentSong.id}&from=${oldTime}&to=${newTime}`, { method: 'POST', credentials: 'include' }).catch(console.error);
      }
    }
  };

  const toggleReverse = async () => {
    if (!reverseEngine || !currentSong) return;
    if (isReversed) {
      reverseEngine.stop();
      setIsReversed(false);
      if (isPlaying) audioRef.current.play();
    } else {
      setIsReversing(true);
      const audioUrl = resolveAudioUrl(currentSong.audio_url);
      const success = await reverseEngine.loadAndReverseTrack(audioUrl);
      setIsReversing(false);
      if (success) {
        audioRef.current.pause();
        reverseEngine.play(duration - audioRef.current.currentTime);
        setIsReversed(true);
        fetch(`${API_BASE}/audio/reverse/log?songId=${currentSong.id}&duration=0`, { method: 'POST', credentials: 'include' }).catch(console.error);
      }
    }
  };

  const toggleKaraoke = () => {
    if (karaokeEngine) {
      const newState = !showKaraoke;
      karaokeEngine.setKaraokeMode(newState);
      setShowKaraoke(newState);
    }
  };

  useEffect(() => {
    if (!currentSong || !playlist || playlist.length < 2) return;
    const currentIndex = playlist.findIndex(s => s.id === currentSong.id);
    if (currentIndex === -1 || currentIndex === playlist.length - 1) return;
    const nextSong = playlist[currentIndex + 1];
    
    fetch(`${API_BASE}/crossfade/analyze?fromSongId=${currentSong.id}&toSongId=${nextSong.id}`, { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => setCrossfadeData(d))
      .catch(console.error);
  }, [currentSong, playlist]);

  // ── Playback control ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(e => console.error("Playback failed:", e));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentSong]);

  // ── Volume ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // ── Time update ───────────────────────────────────────────────────────────
  const handleTimeUpdate = () => {
    if (!audioRef.current || isDragging) return;
    const ct  = audioRef.current.currentTime;
    const dur = audioRef.current.duration || 0;
    setCurrentTime(ct);
    setDuration(dur);
    setProgress(dur ? (ct / dur) * 100 : 0);
  };

  // ── Seekbar: click + drag ─────────────────────────────────────────────────
  const seekTo = (e) => {
    if (!audioRef.current || !duration) return;
    const bounds = progressRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - bounds.left) / bounds.width));
    audioRef.current.currentTime = pct * duration;
    setProgress(pct * 100);
  };

  const handleMouseDown = (e) => { setIsDragging(true); seekTo(e); };
  const handleMouseMove = (e) => { if (isDragging) seekTo(e); };
  const handleMouseUp   = ()  => setIsDragging(false);

  // ── Song ended ────────────────────────────────────────────────────────────
  const handleEnded = () => {
    if (repeatMode === 2) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else if (onNext) {
      onNext();
    } else {
      setIsPlaying(false);
    }
  };

  // ── Repeat cycle ──────────────────────────────────────────────────────────
  const cycleRepeat = () => setRepeatMode((repeatMode + 1) % 3);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const formatTime = (s) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const effectiveVolume = isMuted ? 0 : volume;

  const VolumeIcon = () => {
    if (effectiveVolume === 0) return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16.5 12A4.5 4.5 0 0 0 14 8.07V10.18l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
      </svg>
    );
    if (effectiveVolume < 0.5) return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.5 12A4.5 4.5 0 0 0 16 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5zm7-.17v6.34L9.83 13H7v-2h2.83L12 8.83z"/>
      </svg>
    );
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
      </svg>
    );
  };

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!currentSong) {
    return (
      <div className="player-bar">
        {/* Left placeholder */}
        <div className="player-left" />
        {/* Centre: ghost controls */}
        <div className="player-center">
          <div className="player-controls">
            <button className="pb-icon" disabled><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg></button>
            <button className="pb-icon" disabled><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg></button>
            <button className="play-pause-btn" disabled>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </button>
            <button className="pb-icon" disabled><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg></button>
            <button className="pb-icon" disabled><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg></button>
          </div>
          <div className="progress-container">
            <span className="pb-time">-:--</span>
            <div className="progress-bar-bg"><div className="progress-bar-fg" style={{width:'0%'}}/></div>
            <span className="pb-time">-:--</span>
          </div>
        </div>
        {/* Right placeholder */}
        <div className="player-right">
          {onToggleRightPanel && (
            <button className="pb-icon" onClick={onToggleRightPanel} title="Now Playing View">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-7-2h5V7h-5v10z"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  }

  const audioUrl = resolveAudioUrl(currentSong.audio_url);
  const imageUrl = currentSong.image_url;

  return (
    <div
      className="player-bar"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Hidden audio element */}
      {audioUrl && (
        <audio
          key={audioUrl}
          ref={audioRef}
          src={audioUrl}
          crossOrigin="anonymous"
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onLoadedMetadata={handleTimeUpdate}
        />
      )}

      {/* ══ LEFT ══ cover · title · artist · like ══════════════════════════ */}
      <div className="player-left">
        <div className="pb-cover-wrap">
          {imageUrl ? (
            <img src={imageUrl} alt="cover" className="pb-cover" />
          ) : (
            <div className="pb-cover pb-cover-placeholder">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--text-secondary)">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5z"/>
              </svg>
            </div>
          )}
        </div>

        <div className="pb-song-info">
          <span className="pb-title">{currentSong.title}</span>
          <span className="pb-artist">{currentSong.artist}</span>
        </div>

        {/* Verified / active indicator */}
        <svg className="pb-verified" width="16" height="16" viewBox="0 0 24 24" fill="#1ed760">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4.5-4.5 1.41-1.41L10 13.67l7.09-7.09 1.41 1.41L10 16.5z"/>
        </svg>

        {/* Heart / like */}
        <button
          className={`pb-icon ${isLiked ? 'pb-icon--active' : ''}`}
          onClick={() => setIsLiked(!isLiked)}
          title={isLiked ? "Remove from Liked Songs" : "Save to Liked Songs"}
        >
          <svg width="16" height="16" viewBox="0 0 24 24"
            fill={isLiked ? "var(--brand-accent)" : "none"}
            stroke={isLiked ? "var(--brand-accent)" : "currentColor"}
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>

      {/* ══ CENTRE ══ shuffle · prev · play · next · repeat + seekbar ════════ */}
      <div className="player-center">
        {/* Top: control buttons */}
        <div className="player-controls">
          {/* Shuffle */}
          <button
            className={`pb-icon ${isShuffling ? 'pb-icon--active' : ''}`}
            onClick={onSmartShuffle}
            title={isShuffling ? "Generating your perfect shuffle..." : "Smart Shuffle"}
            disabled={isShuffling}
            style={{ opacity: isShuffling ? 0.5 : 1 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
            </svg>
          </button>

          {/* Previous */}
          <button
            className="pb-icon"
            onClick={onPrev}
            disabled={!onPrev}
            style={{ opacity: onPrev ? 1 : 0.4 }}
            title="Previous"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
            </svg>
          </button>

          {/* Back 10s */}
          <button className="pb-icon" onClick={() => handleSkip(-10)} title="Rewind 10s">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
            </svg>
          </button>

          {/* Play / Pause */}
          <button className="pb-play" onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16"/>
                <rect x="14" y="4" width="4" height="16"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            )}
          </button>

          {/* Forward 10s */}
          <button className="pb-icon" onClick={() => handleSkip(10)} title="Fast Forward 10s">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h-2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/>
            </svg>
          </button>

          {/* Next */}
          <button
            className="pb-icon"
            onClick={onNext}
            disabled={!onNext}
            style={{ opacity: onNext ? 1 : 0.4 }}
            title="Next"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
            </svg>
          </button>

          {/* Repeat: 0=off 1=all 2=one */}
          <button
            className={`pb-icon ${repeatMode > 0 ? 'pb-icon--active' : ''}`}
            onClick={cycleRepeat}
            title={repeatMode === 0 ? "Enable repeat" : repeatMode === 1 ? "Enable repeat one" : "Disable repeat"}
            style={{ position: 'relative' }}
          >
            {repeatMode === 2 ? (
              /* Repeat-one icon */
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
              </svg>
            )}
            {repeatMode > 0 && <span className="pb-dot-indicator" />}
          </button>
        </div>

        {/* Bottom: seekbar */}
        <div className="progress-container">
          <span className="pb-time">{formatTime(currentTime)}</span>
          <div
            ref={progressRef}
            className="progress-bar-bg"
            onMouseDown={handleMouseDown}
          >
            <div className="progress-bar-fg" style={{ width: `${progress}%` }} />
            {/* Scrubber thumb shown on hover */}
            <div className="pb-scrubber" style={{ left: `${progress}%` }} />
          </div>
          <span className="pb-time">{formatTime(duration)}</span>
        </div>
      </div>

      {/* ══ RIGHT ══ lyrics · reverse · connect · volume · eq · fullscreen ═══ */}
      <div className="player-right">
        
        {/* EQ Button */}
        <button className="pb-icon" onClick={() => setShowEQ(true)} title="Equalizer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/>
          </svg>
        </button>

        {/* Reverse Button */}
        <button 
          className={`pb-icon ${isReversed ? 'pb-icon--active' : ''}`} 
          onClick={toggleReverse} 
          title="Reverse Playback"
          style={{ opacity: isReversing ? 0.5 : 1 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
          </svg>
        </button>

        {/* Karaoke Lyrics */}
        <button className={`pb-icon ${showKaraoke ? 'pb-icon--active' : ''}`} onClick={toggleKaraoke} title="Karaoke Mode">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        </button>

        {/* Connect device (decorative) */}
        <button className="pb-icon" title="Connect to a device">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M1 18v-2h2v-2H1v-2h4v8H1zm3 0h2v-8H4v8zm4-8v8h2v-3h2v-2h-2v-3h-2zm4 8h2v-8h-2v8zm4-8v8h4v-2h-2v-2h2v-2h-2v-2h2v-2h-4z"/>
          </svg>
        </button>

        {/* Smart Crossfade AI */}
        <div style={{ position: 'relative' }}>
          <button 
            className={`pb-icon ${crossfadeData ? 'pb-icon--active' : ''}`} 
            onMouseEnter={() => setShowCrossfadeTooltip(true)}
            onMouseLeave={() => setShowCrossfadeTooltip(false)}
            title="Smart Crossfade AI"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          </button>
          {showCrossfadeTooltip && crossfadeData && (
            <div style={{
              position: 'absolute', bottom: '30px', right: '-50px', width: '220px',
              background: '#242424', border: '1px solid #333', padding: '12px', borderRadius: '8px',
              color: 'var(--text-primary)', fontSize: '12px', zIndex: 100, boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
            }}>
              <strong style={{ color: 'var(--brand-accent)', display: 'block', marginBottom: '4px' }}>AI Smart Crossfade</strong>
              {crossfadeData.explanation}
              <br/>
              <span style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>Curve: {crossfadeData.curveType} ({crossfadeData.durationSeconds}s)</span>
            </div>
          )}
        </div>

        {/* Volume mute toggle + slider */}
        <button className="pb-icon" onClick={() => setIsMuted(!isMuted)} title={isMuted ? "Unmute" : "Mute"}>
          <VolumeIcon />
        </button>
        <div className="pb-volume-wrap">
          <input
            type="range"
            min="0" max="1" step="0.01"
            value={effectiveVolume}
            onChange={(e) => { const v = parseFloat(e.target.value); setVolume(v); setIsMuted(v === 0); }}
            className="pb-volume-slider"
          />
        </div>

        {/* Mini player (decorative) */}
        <button className="pb-icon" title="Mini player">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 11H5v2h14v-2z"/><path d="M3 3v18h18V3H3zm16 16H5V5h14v14z"/>
          </svg>
        </button>

        {/* Fullscreen (decorative) */}
        <button className="pb-icon" title="Full screen">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
          </svg>
        </button>

        {/* Toggle Right Panel */}
        {onToggleRightPanel && (
          <button className="pb-icon" onClick={onToggleRightPanel} title="Now Playing View">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-7-2h5V7h-5v10z"/>
            </svg>
          </button>
        )}
      </div>

      {showEQ && <EqualizerPanel eqEngine={eqEngine} onClose={() => setShowEQ(false)} />}
      {showKaraoke && <KaraokeView currentSong={currentSong} currentTime={currentTime} onClose={() => { setShowKaraoke(false); if (karaokeEngine) karaokeEngine.setKaraokeMode(false); }} />}
    </div>
  );
}
