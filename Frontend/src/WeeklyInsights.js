import React, { useEffect, useState } from "react";
import "./WeeklyInsights.css"; // We'll add some inline styles or css later

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

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

  if (loading) return <div className="insights-container">Loading your weekly insights...</div>;
  if (!insights) return <div className="insights-container">Could not load insights.</div>;

  const moods = Object.entries(insights.moodDistribution || {}).sort((a, b) => b[1] - a[1]);

  return (
    <div className="insights-container" style={{ padding: '24px', color: 'var(--text-primary)' }}>
      <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>Your Weekly Insights</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>A look back at what moved you this week.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div className="insight-card" style={{ background: '#1c1c1c', padding: '24px', borderRadius: '12px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>Listening Time</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--brand-accent)' }}>{insights.listeningHours} Hours</div>
        </div>
        
        <div className="insight-card" style={{ background: '#1c1c1c', padding: '24px', borderRadius: '12px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>Favorite Genre</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#f59e0b' }}>{insights.favoriteGenre || "None"}</div>
        </div>
        
        <div className="insight-card" style={{ background: '#1c1c1c', padding: '24px', borderRadius: '12px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>Favorite Artist</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#34d399' }}>{insights.favoriteArtist || "None"}</div>
        </div>

        <div className="insight-card" style={{ background: '#1c1c1c', padding: '24px', borderRadius: '12px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>Longest Streak</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#22d3ee' }}>{insights.longestStreak} Days</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div style={{ background: '#1c1c1c', padding: '24px', borderRadius: '12px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Mood Distribution</h2>
          {moods.length > 0 ? moods.map(([mood, pct], i) => (
            <div key={i} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>{mood}</span>
                <span>{Math.round(pct * 100)}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#333', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${pct * 100}%`, height: '100%', background: 'var(--brand-accent)' }}></div>
              </div>
            </div>
          )) : <p style={{ color: 'var(--text-secondary)' }}>No mood data available.</p>}
        </div>

        <div style={{ background: 'linear-gradient(135deg, #1c1c1c, #2a2a2a)', padding: '24px', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--brand-accent)' }}>AI Suggestions</h2>
          <p style={{ fontSize: '18px', lineHeight: '1.5' }}>
            {insights.suggestions}
          </p>
        </div>
      </div>
    </div>
  );
}
