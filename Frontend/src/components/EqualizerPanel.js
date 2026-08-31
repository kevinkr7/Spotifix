import React, { useState, useEffect } from 'react';
import './EqualizerPanel.css';

export default function EqualizerPanel({ eqEngine, onClose }) {
  const [enabled, setEnabled] = useState(true);
  const [gains, setGains] = useState(Array(10).fill(0));
  const [bass, setBass] = useState(0);

  useEffect(() => {
    if (eqEngine) {
      eqEngine.setEnabled(enabled);
    }
  }, [enabled, eqEngine]);

  const handleGainChange = (index, val) => {
    const newGains = [...gains];
    newGains[index] = parseFloat(val);
    setGains(newGains);
    if (eqEngine) eqEngine.setBandGain(index, parseFloat(val));
  };

  const handleBassChange = (val) => {
    const b = parseFloat(val);
    setBass(b);
    if (eqEngine) eqEngine.setBassBoost(b);
  };

  const freqs = ["32", "64", "125", "250", "500", "1k", "2k", "4k", "8k", "16k"];

  return (
    <div className="eq-modal-overlay" onClick={onClose}>
      <div className="eq-modal" onClick={e => e.stopPropagation()}>
        <div className="eq-header">
          <h2>Professional Equalizer</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="eq-controls">
          <label className="eq-toggle">
            <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} />
            Enable Equalizer
          </label>
        </div>

        <div className="eq-sliders" style={{ opacity: enabled ? 1 : 0.5, pointerEvents: enabled ? 'auto' : 'none' }}>
          {gains.map((gain, i) => (
            <div key={i} className="eq-band">
              <span className="eq-val">{gain > 0 ? '+' : ''}{gain.toFixed(1)}</span>
              <input 
                type="range" 
                min="-12" max="12" step="0.5" 
                value={gain} 
                onChange={(e) => handleGainChange(i, e.target.value)} 
                className="vertical-slider"
              />
              <span className="eq-freq">{freqs[i]}</span>
            </div>
          ))}
        </div>

        <div className="eq-effects" style={{ opacity: enabled ? 1 : 0.5, pointerEvents: enabled ? 'auto' : 'none' }}>
          <h3>Audio Effects</h3>
          <div className="effect-slider">
            <label>Bass Boost</label>
            <input 
              type="range" 
              min="0" max="20" step="1" 
              value={bass} 
              onChange={(e) => handleBassChange(e.target.value)} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
