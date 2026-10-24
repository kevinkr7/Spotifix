import React, { useEffect, useState } from "react";
import "./WeeklyInsights.css";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8081";

export default function WeeklyInsights() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await fetch(`${API_BASE}/analytics/weekly`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setInsights(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Generating your Weekly Audio Intelligence Report...
      </div>
    );
  }

  if (!insights) {
    return (
      <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        No weekly insight history recorded yet. Start streaming songs to build your profile!
      </div>
    );
  }

  const moods = Object.entries(insights.moodDistribution || {}).sort((a, b) => b[1] - a[1]);

  return (
    <div className="insights-container" style={{ padding: '16px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '1px', color: 'var(--brand-accent)', textTransform: 'uppercase' }}>
          Personalized Audio Intelligence
        </span>
        <h1 style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-1px', margin: '4px 0 8px 0', color: '#ffffff' }}>
          Weekly Listening Pulse
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', margin: 0 }}>
          Your acoustic imprint, time spent in flow, and algorithmic mood breakdown.
        </p>
      </div>

      {/* Top 4 Key Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div className="insight-card" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '24px', borderRadius: '16px', backdropFilter: 'blur(20px)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
            Listening Time
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--brand-accent)', letterSpacing: '-0.5px' }}>
            {insights.listeningHours} <span style={{ fontSize: '16px', fontWeight: '600' }}>Hours</span>
          </div>
        </div>
        
        <div className="insight-card" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '24px', borderRadius: '16px', backdropFilter: 'blur(20px)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
            Top Genre
          </div>
          <div style={{ fontSize: '30px', fontWeight: '800', color: '#f59e0b', letterSpacing: '-0.5px' }}>
            {insights.favoriteGenre || "Eclectic"}
          </div>
        </div>
        
        <div className="insight-card" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '24px', borderRadius: '16px', backdropFilter: 'blur(20px)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
            Top Artist
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#34d399', letterSpacing: '-0.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {insights.favoriteArtist || "Discovering"}
          </div>
        </div>

        <div className="insight-card" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '24px', borderRadius: '16px', backdropFilter: 'blur(20px)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
            Streak Record
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#22d3ee', letterSpacing: '-0.5px' }}>
            {insights.longestStreak} <span style={{ fontSize: '16px', fontWeight: '600' }}>Days</span>
          </div>
        </div>
      </div>

      {/* Mood Distribution & AI Narrative */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Mood Distribution */}
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '28px', borderRadius: '18px', backdropFilter: 'blur(20px)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px', letterSpacing: '-0.3px', color: '#ffffff' }}>
            Mood Distribution
          </h2>
          {moods.length > 0 ? moods.map(([mName, pct], i) => (
            <div key={i} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>
                <span style={{ color: '#ffffff' }}>{mName}</span>
                <span style={{ color: 'var(--brand-accent)' }}>{Math.round(pct * 100)}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${pct * 100}%`, 
                  height: '100%', 
                  background: 'linear-gradient(90deg, var(--brand-accent), #ff9436)',
                  borderRadius: '9999px'
                }}></div>
              </div>
            </div>
          )) : (
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Keep listening to calibrate mood distribution.</p>
          )}
        </div>

        {/* AI Suggestions */}
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(251, 121, 13, 0.12) 0%, rgba(139, 92, 246, 0.1) 100%)', 
          border: '1px solid rgba(251, 121, 13, 0.25)', 
          padding: '28px', 
          borderRadius: '18px', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center',
          backdropFilter: 'blur(20px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--brand-accent)', boxShadow: '0 0 10px var(--brand-accent)' }}></span>
            <span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '1px', color: 'var(--brand-accent)', textTransform: 'uppercase' }}>
              Spotifix AI Companion
            </span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '14px', color: '#ffffff', letterSpacing: '-0.3px' }}>
            Weekly Sonic Reflection
          </h2>
          <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#e5e7eb', margin: 0 }}>
            {insights.suggestions || "Your sound profile shows a balanced mix between high-energy focus and evening lo-fi recovery. Try testing our 10-Band EQ presets on your favorite tracks!"}
          </p>
        </div>
      </div>
    </div>
  );
}
