import React, { useState, useRef } from "react";
import "./AddSong.css";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8081";

// Allowed extensions matching backend MusicController: Set.of(".mp3", ".wav", ".ogg", ".flac", ".m4a", ".aac")
const ALLOWED_EXTENSIONS = [".mp3", ".wav", ".ogg", ".flac", ".m4a", ".aac"];
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const AddSong = ({ onUploadSuccess, onNavigateToLibrary }) => {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [mood, setMood] = useState("Happy");
  const [genre, setGenre] = useState("");
  const [language, setLanguage] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedSong, setUploadedSong] = useState(null);
  const [submitError, setSubmitError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);
  const dropzoneRef = useRef(null);
  const titleInputRef = useRef(null);

  // ── Karaoke Extractor Tool State ──
  const [isKaraokeMode, setIsKaraokeMode] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const audioPreviewRef = useRef(null);
  const audioContextRef = useRef(null);
  const karaokeNodeRef = useRef(null);

  const validateAndSetFile = (selectedFile) => {
    setFileError("");
    setSubmitError("");
    if (!selectedFile) return;

    const name = selectedFile.name || "";
    const dotIndex = name.lastIndexOf(".");
    const ext = dotIndex !== -1 ? name.substring(dotIndex).toLowerCase() : "";

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setFileError(`Unsupported format "${ext || 'unknown'}". Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`);
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setFileError(`File size (${formatFileSize(selectedFile.size)}) exceeds the 20MB limit.`);
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    if (selectedFile.size === 0) {
      setFileError("Selected file is empty (0 bytes).");
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    setFile(selectedFile);

    // Auto-populate title if empty
    if (!title) {
      const cleanName = name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
      setTitle(cleanName);
    }

    // Revoke old preview object URL if any
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
  };

  const handleClearFile = (e) => {
    if (e) e.stopPropagation();
    setFile(null);
    setFileError("");
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setIsKaraokeMode(false);
  };

  const toggleVocalRemovalPreview = () => {
    const nextState = !isKaraokeMode;
    setIsKaraokeMode(nextState);

    if (audioPreviewRef.current) {
      if (!audioContextRef.current) {
        try {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          const ctx = new AudioContext();
          const source = ctx.createMediaElementSource(audioPreviewRef.current);

          const splitter = ctx.createChannelSplitter(2);
          const merger = ctx.createChannelMerger(2);
          const inverter = ctx.createGain();
          inverter.gain.value = -1;
          const summer = ctx.createGain();

          const bypassGain = ctx.createGain();
          const karaokeGain = ctx.createGain();

          source.connect(bypassGain);
          bypassGain.connect(ctx.destination);

          source.connect(splitter);
          splitter.connect(summer, 0);
          splitter.connect(inverter, 1);
          inverter.connect(summer);

          summer.connect(merger, 0, 0);
          summer.connect(merger, 0, 1);
          merger.connect(karaokeGain);
          karaokeGain.connect(ctx.destination);

          audioContextRef.current = ctx;
          karaokeNodeRef.current = { bypassGain, karaokeGain };
        } catch (e) {
          console.warn("AudioContext init error", e);
        }
      }

      if (karaokeNodeRef.current && audioContextRef.current) {
        const t = audioContextRef.current.currentTime;
        if (nextState) {
          karaokeNodeRef.current.bypassGain.gain.setValueAtTime(0, t);
          karaokeNodeRef.current.karaokeGain.gain.setValueAtTime(1, t);
        } else {
          karaokeNodeRef.current.bypassGain.gain.setValueAtTime(1, t);
          karaokeNodeRef.current.karaokeGain.gain.setValueAtTime(0, t);
        }
      }
    }
  };

  const handleSubmit = (event) => {
    if (event) event.preventDefault();
    setSubmitError("");
    setFileError("");

    if (!file) {
      const msg = "Please choose an audio file to upload before submitting.";
      setFileError(msg);
      setSubmitError(msg);
      if (dropzoneRef.current) {
        dropzoneRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    if (!title.trim()) {
      setSubmitError("Please enter a song title.");
      if (titleInputRef.current) {
        titleInputRef.current.focus();
      }
      return;
    }

    if (!artist.trim()) {
      setSubmitError("Please enter an artist name.");
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    const submissionTitle = isKaraokeMode && !title.toLowerCase().includes("karaoke")
      ? `${title} (Karaoke Instrumental)`
      : title.trim();

    const submissionGenre = isKaraokeMode
      ? (genre ? `${genre}, Karaoke Instrumental` : "Karaoke Instrumental")
      : genre.trim();

    const formData = new FormData();
    formData.append("title", submissionTitle);
    formData.append("artist", artist.trim() || "Spotifix Artist");
    formData.append("mood", mood);
    formData.append("genre", submissionGenre);
    formData.append("language", language.trim());
    formData.append("lyrics", lyrics.trim());
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE}/songs`);
    xhr.withCredentials = true;

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        setUploadProgress(percent);
      }
    };

    xhr.onload = () => {
      setIsSubmitting(false);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const savedSong = JSON.parse(xhr.responseText);
          setUploadedSong(savedSong);
        } catch {
          setUploadedSong({ title: submissionTitle, artist: artist || "Spotifix Artist" });
        }

        // Notify parent to refresh library
        if (typeof onUploadSuccess === "function") {
          onUploadSuccess();
        }

        // Reset inputs
        setTitle("");
        setArtist("");
        setMood("Happy");
        setGenre("");
        setLanguage("");
        setLyrics("");
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }
        setIsKaraokeMode(false);
      } else {
        let errorMsg = "Upload failed.";
        try {
          const errData = JSON.parse(xhr.responseText);
          errorMsg = errData.message || errorMsg;
        } catch {
          if (xhr.status === 401) {
            errorMsg = "Authentication required. Please log in to upload songs to your library.";
          } else if (xhr.status === 413) {
            errorMsg = "File size exceeds the 20MB limit.";
          } else if (xhr.status === 400) {
            errorMsg = "Invalid file or parameters. Ensure the file has a valid audio signature.";
          }
        }
        setSubmitError(errorMsg);
      }
    };

    xhr.onerror = () => {
      setIsSubmitting(false);
      setSubmitError("Network error: Could not reach the Spotifix backend on port 8081.");
    };

    xhr.send(formData);
  };

  const getFileExtensionBadge = (filename) => {
    if (!filename) return "AUDIO";
    const dot = filename.lastIndexOf(".");
    return dot !== -1 ? filename.substring(dot + 1).toUpperCase() : "AUDIO";
  };

  return (
    <div className="add-song-container">
      {/* Header */}
      <div>
        <span className="add-song-badge">SPOTIFIX STUDIO</span>
        <h1 className="add-song-title">Add Song & Upload Audio</h1>
        <p className="add-song-subtitle">
          Upload songs to your personal Spotifix library. Supports MP3, WAV, FLAC, M4A, OGG, and AAC up to 20MB.
        </p>
      </div>

      {/* Success Notification Banner */}
      {uploadedSong && (
        <div className="add-song-alert add-song-alert-success">
          <svg className="alert-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "4px" }}>
              Track Uploaded Successfully!
            </div>
            <div>
              &ldquo;{uploadedSong.title}&rdquo; is now stored and ready to stream in your library.
            </div>
            <div className="alert-actions">
              {onNavigateToLibrary && (
                <button
                  type="button"
                  className="alert-btn"
                  onClick={() => onNavigateToLibrary()}
                >
                  View in Library
                </button>
              )}
              <button
                type="button"
                className="alert-btn alert-btn-secondary"
                onClick={() => setUploadedSong(null)}
              >
                Upload Another Track
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Notification Banner */}
      {(submitError || fileError) && (
        <div className="add-song-alert add-song-alert-error">
          <svg className="alert-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, marginBottom: "2px" }}>Upload Issue</div>
            <div>{fileError || submitError}</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".mp3,.wav,.ogg,.flac,.m4a,.aac,audio/*"
          style={{ display: "none" }}
          onChange={(e) => validateAndSetFile(e.target.files?.[0])}
        />

        {/* ── Audio Drag & Drop / File Selection Zone ── */}
        <div
          ref={dropzoneRef}
          className={`add-song-dropzone ${isDragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const dropped = e.dataTransfer.files?.[0];
            if (dropped) validateAndSetFile(dropped);
          }}
        >
          {!file ? (
            <>
              <div className="dropzone-icon-circle">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
              </div>
              <div className="dropzone-prompt">Drag &amp; drop your audio track here</div>
              <div className="dropzone-subtext">
                Supported: <strong>MP3, WAV, FLAC, M4A, OGG, AAC</strong> (Max 20MB)
              </div>
              {/* Prominent, Visible Choose Audio File Button */}
              <button
                type="button"
                className="btn-choose-file"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                Choose Audio File
              </button>
            </>
          ) : (
            /* Selected File Info Card */
            <div className="selected-file-card">
              <div className="file-info-left">
                <div className="file-icon-badge">
                  {getFileExtensionBadge(file.name)}
                </div>
                <div className="file-details">
                  <div className="file-name-text" title={file.name}>
                    {file.name}
                  </div>
                  <div className="file-meta-text">
                    <span className="file-size-tag">{formatFileSize(file.size)}</span>
                    <span>•</span>
                    <span className="file-status-valid">✓ Ready to upload</span>
                  </div>
                </div>
              </div>

              <div className="file-actions-right">
                <button
                  type="button"
                  className="btn-change-file"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                >
                  Change File
                </button>
                <button
                  type="button"
                  className="btn-remove-file"
                  title="Remove selected file"
                  onClick={handleClearFile}
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Upload Progress Bar */}
          {isSubmitting && (
            <div className="upload-progress-container">
              <div className="progress-header">
                <span>Uploading track...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            </div>
          )}
        </div>

        {/* ── KARAOKE & VOCAL REMOVER EXTRACTOR TOOL ── */}
        {file && (
          <div style={{
            background: "#1c1c1c",
            border: "1px solid rgba(251, 121, 13, 0.3)",
            borderRadius: "10px",
            padding: "20px 24px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "12px" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: "800", letterSpacing: "1px", color: "var(--brand-accent)", textTransform: "uppercase" }}>
                  STUDIO EXTRACTOR
                </span>
                <h3 style={{ fontSize: "17px", fontWeight: "700", color: "#ffffff", margin: "2px 0 0 0" }}>
                  Karaoke Instrumental Extractor (Vocal Remover)
                </h3>
              </div>

              <button
                type="button"
                onClick={toggleVocalRemovalPreview}
                style={{
                  background: isKaraokeMode ? "var(--brand-accent)" : "transparent",
                  color: isKaraokeMode ? "#000000" : "var(--brand-accent)",
                  border: "1px solid var(--brand-accent)",
                  borderRadius: "500px",
                  padding: "8px 20px",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s ease"
                }}
              >
                <span>{isKaraokeMode ? "✓ Karaoke Extracted (Vocals Cut)" : "⚡ Extract Karaoke Instrumental"}</span>
              </button>
            </div>

            <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "0 0 14px 0" }}>
              {isKaraokeMode
                ? "Center-panned vocal frequencies are attenuated using stereo phase cancellation. The track will be uploaded with Karaoke tags."
                : "Original track with vocals intact. Click the button above to test real-time vocal suppression in the preview player."}
            </p>

            {previewUrl && (
              <div style={{ background: "#111111", padding: "10px 14px", borderRadius: "6px" }}>
                <audio
                  ref={audioPreviewRef}
                  src={previewUrl}
                  controls
                  style={{ width: "100%", height: "36px" }}
                />
              </div>
            )}
          </div>
        )}

        {/* ── Metadata Form Grid ── */}
        <div className="add-song-grid">
          <div className="add-song-field">
            <label className="add-song-label">Song Title *</label>
            <input
              ref={titleInputRef}
              type="text"
              placeholder="e.g. Starboy"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="add-song-input"
            />
          </div>

          <div className="add-song-field">
            <label className="add-song-label">Artist Name *</label>
            <input
              type="text"
              placeholder="e.g. The Weeknd"
              required
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="add-song-input"
            />
          </div>

          <div className="add-song-field">
            <label className="add-song-label">Genre</label>
            <input
              type="text"
              placeholder="e.g. Pop, R&amp;B, Rock, EDM"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="add-song-input"
            />
          </div>

          <div className="add-song-field">
            <label className="add-song-label">Language</label>
            <input
              type="text"
              placeholder="e.g. English, Spanish, Hindi"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="add-song-input"
            />
          </div>
        </div>

        {/* ── Mood / Vibe Category Selector ── */}
        <div className="add-song-field">
          <label className="add-song-label">Mood / Vibe Category *</label>
          <div className="mood-pill-group">
            {[
              { id: "Happy", icon: "😊" },
              { id: "Heartbroken", label: "Sad", icon: "🌧️" },
              { id: "Chill", icon: "☕" },
              { id: "Workout", icon: "⚡" }
            ].map((m) => (
              <button
                type="button"
                key={m.id}
                onClick={() => setMood(m.id)}
                className={`mood-pill ${mood === m.id ? "active" : ""}`}
              >
                <span>{m.icon}</span>
                <span>{m.label || m.id}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Lyrics Field ── */}
        <div className="add-song-field">
          <label className="add-song-label">Lyrics (Optional - for Synced Karaoke Display)</label>
          <textarea
            placeholder="Paste song lyrics or LRC timestamps here..."
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            className="add-song-textarea"
            style={{ minHeight: "90px", resize: "vertical" }}
          />
        </div>

        {/* ── Action Bar with Clear, Prominent "Upload Song" Button ── */}
        <div className="add-song-action-bar">
          <div className="upload-hints">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <span>Tracks are securely stored in your personal account library.</span>
          </div>

          {/* Prominent Visible Orange Upload Song Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-upload-submit"
            title={isSubmitting ? `Uploading track (${uploadProgress}%)...` : "Upload song to Spotifix"}
          >
            {isSubmitting ? (
              <>
                <div className="spinner"></div>
                <span>Uploading ({uploadProgress}%)...</span>
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <span>Upload Song</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
