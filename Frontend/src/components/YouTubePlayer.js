import React, { useEffect, useRef, useState } from "react";
import "./YouTubePlayer.css";

export default function YouTubePlayer({ currentSong, isPlaying, setIsPlaying, onEnded }) {
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const [isApiReady, setIsApiReady] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [playerError, setPlayerError] = useState(null);

  // Check if current track is a YouTube song
  const isYouTube = currentSong && (currentSong.provider === "youtube" || !!currentSong.videoId);
  const videoId = currentSong?.videoId;

  // 1. Dynamically load YouTube IFrame API script once
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setIsApiReady(true);
      return;
    }

    // Check if script tag is already injected
    const existingScript = document.getElementById("spotifix-yt-api-script");
    if (!existingScript) {
      const tag = document.createElement("script");
      tag.id = "spotifix-yt-api-script";
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (previousCallback) previousCallback();
      setIsApiReady(true);
    };
  }, []);

  // 2. Initialize or update YouTube Player when videoId or isApiReady changes
  useEffect(() => {
    if (!isApiReady || !isYouTube || !videoId) {
      return;
    }

    setPlayerError(null);

    if (!playerRef.current) {
      // Create new player
      try {
        playerRef.current = new window.YT.Player("spotifix-yt-player-target", {
          videoId: videoId,
          playerVars: {
            autoplay: 1,
            controls: 1,
            modestbranding: 1,
            rel: 0,
            enablejsapi: 1,
            origin: window.location.origin
          },
          events: {
            onReady: (event) => {
              if (isPlaying) {
                event.target.playVideo();
              }
            },
            onStateChange: (event) => {
              // 1 = PLAYING, 2 = PAUSED, 0 = ENDED
              if (event.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true);
              } else if (event.data === window.YT.PlayerState.PAUSED) {
                setIsPlaying(false);
              } else if (event.data === window.YT.PlayerState.ENDED) {
                if (onEnded) onEnded();
              }
            },
            onError: (event) => {
              console.warn("YouTube Player error event:", event.data);
              setPlayerError("Video unavailable or embedding restricted.");
              setIsPlaying(false);
            }
          }
        });
      } catch (err) {
        console.error("Failed to initialize YT.Player:", err);
      }
    } else {
      // Player already exists; load new video
      try {
        if (typeof playerRef.current.loadVideoById === "function") {
          playerRef.current.loadVideoById(videoId);
          if (isPlaying) {
            playerRef.current.playVideo();
          }
        }
      } catch (err) {
        console.error("Failed to load video on existing player:", err);
      }
    }
  }, [isApiReady, isYouTube, videoId]); // eslint-disable-line react-hooks/exhaustive-deps

  // 3. Sync Spotifix isPlaying state with YouTube Player
  useEffect(() => {
    if (!playerRef.current || !isYouTube) return;
    try {
      if (typeof playerRef.current.getPlayerState === "function") {
        const state = playerRef.current.getPlayerState();
        if (isPlaying && state !== window.YT.PlayerState.PLAYING) {
          playerRef.current.playVideo();
        } else if (!isPlaying && state === window.YT.PlayerState.PLAYING) {
          playerRef.current.pauseVideo();
        }
      }
    } catch (err) {
      // Ignore if player not fully ready
    }
  }, [isPlaying, isYouTube]);

  // 4. Progress polling interval (updates PlayerBar seekbar)
  useEffect(() => {
    if (!isYouTube || !isPlaying) return;

    const interval = setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === "function") {
        try {
          const ct = playerRef.current.getCurrentTime() || 0;
          const dur = playerRef.current.getDuration() || 0;
          const pct = dur > 0 ? (ct / dur) * 100 : 0;
          window.dispatchEvent(
            new CustomEvent("spotifix:yt:timeupdate", {
              detail: { currentTime: ct, duration: dur, progress: pct }
            })
          );
        } catch (e) {
          // ignore
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isYouTube, isPlaying]);

  // 5. Listen to seek & volume events from PlayerBar
  useEffect(() => {
    const handleSeek = (e) => {
      const targetTime = e.detail?.time;
      if (playerRef.current && typeof playerRef.current.seekTo === "function" && targetTime !== undefined) {
        playerRef.current.seekTo(targetTime, true);
      }
    };

    const handleVolume = (e) => {
      const targetVol = e.detail?.volume; // 0 to 1
      if (playerRef.current && typeof playerRef.current.setVolume === "function" && targetVol !== undefined) {
        playerRef.current.setVolume(Math.round(targetVol * 100));
      }
    };

    const handlePlayCommand = () => {
      if (playerRef.current && typeof playerRef.current.playVideo === "function") {
        playerRef.current.playVideo();
      }
    };

    const handlePauseCommand = () => {
      if (playerRef.current && typeof playerRef.current.pauseVideo === "function") {
        playerRef.current.pauseVideo();
      }
    };

    window.addEventListener("spotifix:yt:seek", handleSeek);
    window.addEventListener("spotifix:yt:volume", handleVolume);
    window.addEventListener("spotifix:yt:play", handlePlayCommand);
    window.addEventListener("spotifix:yt:pause", handlePauseCommand);

    return () => {
      window.removeEventListener("spotifix:yt:seek", handleSeek);
      window.removeEventListener("spotifix:yt:volume", handleVolume);
      window.removeEventListener("spotifix:yt:play", handlePlayCommand);
      window.removeEventListener("spotifix:yt:pause", handlePauseCommand);
    };
  }, []);

  // If not currently a YouTube track, render nothing
  if (!isYouTube) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`spotifix-yt-container ${isMinimized ? "minimized" : ""}`}
      title={isMinimized ? "Click to expand YouTube Player" : ""}
    >
      <div className="spotifix-yt-header">
        <div className="spotifix-yt-badge">
          <svg width="16" height="12" viewBox="0 0 24 18" fill="#ff0000">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          <span>YouTube Player</span>
        </div>
        <div className="spotifix-yt-controls-header">
          <button
            className="spotifix-yt-btn"
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? "▲" : "▼"}
          </button>
        </div>
      </div>

      <div
        className="spotifix-yt-iframe-wrap"
        style={{ display: isMinimized ? "none" : "block" }}
      >
        <div id="spotifix-yt-player-target"></div>
      </div>

      {!isMinimized && (
        <div className="spotifix-yt-footer">
          <div className="spotifix-yt-title">{currentSong.title}</div>
          <div className="spotifix-yt-channel">{currentSong.artist || currentSong.channelTitle}</div>
          {playerError && (
            <div style={{ color: "#fb7185", fontSize: "11px", marginTop: "4px" }}>
              {playerError}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
