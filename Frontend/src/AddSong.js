import { useState } from "react";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

export const AddSong = () => {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [mood, setMood] = useState("");
  const [genre, setGenre] = useState("");
  const [language, setLanguage] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("No file selected");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("artist", artist);
    formData.append("mood", mood);
    formData.append("genre", genre);
    formData.append("language", language);
    formData.append("lyrics", lyrics);
    if (file) formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE}/songs`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (response.ok) {
        setIsDone(true);
        setTitle("");
        setArtist("");
        setMood("");
        setGenre("");
        setLanguage("");
        setLyrics("");
        setFile(null);
        setFileName("No file selected");
        setTimeout(() => setIsDone(false), 3000);
      } else {
        alert("Upload failed. Please try again.");
      }
    } catch (error) {
      console.error("Error uploading song:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 style={{fontSize: '32px', marginBottom: '8px'}}>Post a New Track</h2>
      <p className="muted" style={{marginBottom: '32px'}}>Upload a song and make it discoverable to the community.</p>

      <form onSubmit={handleSubmit} className="upload-form">
        <div>
          <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold'}}>Song Name</label>
          <input
            type="text"
            placeholder="e.g. Blinding Lights"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        
        <div>
          <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold'}}>Artist</label>
          <input
            type="text"
            placeholder="e.g. The Weeknd"
            required
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
          />
        </div>

        <div>
          <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold'}}>Vibe / Mood</label>
          <select
            required
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              outline: 'none'
            }}
          >
            <option value="" disabled style={{color: '#000'}}>-- Select a Mood --</option>
            <option value="Happy" style={{color: '#000'}}>Happy</option>
            <option value="Heartbroken" style={{color: '#000'}}>Heartbroken</option>
            <option value="Chill" style={{color: '#000'}}>Chill</option>
            <option value="Workout" style={{color: '#000'}}>Workout</option>
          </select>
        </div>

        <div>
          <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold'}}>Genre</label>
          <input
            type="text"
            placeholder="e.g. Pop, Synthwave"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
          />
        </div>

        <div>
          <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold'}}>Language</label>
          <input
            type="text"
            placeholder="e.g. English, Spanish"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          />
        </div>

        <div>
          <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold'}}>Lyrics</label>
          <textarea
            placeholder="Enter lyrics here..."
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              minHeight: '100px',
              resize: 'vertical'
            }}
          />
        </div>

        <div>
          <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold'}}>Audio File</label>
          <label style={{
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            cursor: 'pointer',
            padding: '12px',
            border: '1px dashed var(--border)',
            borderRadius: '4px',
            backgroundColor: 'rgba(255,255,255,0.05)'
          }}>
            <span className="btn-primary" style={{padding: '8px 16px', fontSize: '14px', borderRadius: '4px'}}>Choose File</span>
            <input
              type="file"
              accept="audio/*"
              required
              style={{display: 'none'}}
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];
                setFile(selectedFile);
                setFileName(selectedFile?.name || "No file selected");
              }}
            />
            <span className="muted">{fileName}</span>
          </label>
        </div>

        <div style={{display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px'}}>
          <button className="btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Uploading..." : "Upload Song"}
          </button>
          {isDone && <span style={{color: 'var(--brand-accent)', fontWeight: 'bold'}}>Successfully uploaded!</span>}
        </div>
      </form>
    </div>
  );
};