import React, { useState, useEffect } from 'react';
import './EqualizerPanel.css';

const PRESETS = {
  "Flat": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  "Bass Boost": [5.5, 4.5, 3.5, 2.0, 0, 0, 0, 0, 1.0, 1.5],
  "Vocal Clarity": [-2.0, -1.0, 0, 2.0, 4.0, 3.5, 2.0, 1.0, 0, -1.0],
  "Electronic / EDM": [4.5, 3.5, 1.0, 0, -1.0, 1.5, 3.0, 4.0, 4.5, 5.0],
  "Rock / Metal": [4.0, 2.5, -1.0, -2.0, 1.0, 2.5, 4.0, 4.5, 3.5, 3.0],
  "Acoustic / Warm": [2.5, 2.0, 1.0, 1.5, 2.0, 2.0, 1.5, 1.0, 2.0, 2.5]
};

export default function EqualizerPanel({ eqEngine, onClose }) {
  const [enabled, setEnabled] = useState(true);
  const [gains, setGains] = useState(Array(10).fill(0));
  const [bass, setBass] = useState(0);
  const [activePreset, setActivePreset] = useState("Flat");

  useEffect(() => {
    if (eqEngine) {
      eqEngine.setEnabled(enabled);
    }
  }, [enabled, eqEngine]);

  const handleGainChange = (index, val) => {
    const num = parseFloat(val);
    const newGains = [...gains];
    newGains[index] = num;
    setGains(newGains);
    setActivePreset("Custom");
    if (eqEngine) eqEngine.setBandGain(index, num);
  };

  const handleBassChange = (val) => {
    const b = parseFloat(val);
    setBass(b);
    if (eqEngine) eqEngine.setBassBoost(b);
  };

  const applyPreset = (name) => {
    const presetGains = PRESETS[name];
    if (!presetGains) return;
    setGains([...presetGains]);
    setActivePreset(name);
    if (eqEngine) {
      presetGains.forEach((g, idx) => eqEngine.setBandGain(idx, g));
    }
  };

  const handleReset = () => {
    applyPreset("Flat");
    handleBassChange(0);
  };

  const freqs = ["32Hz", "64Hz", "125Hz", "250Hz", "500Hz", "1kHz", "2kHz", "4kHz", "8kHz", "16kHz"];

  return (
    <div className="eq-modal-overlay" onClick={onClose}>
      <div className="eq-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="eq-header">
          <div className="eq-header-left">
            <div className="eq-led-indicator" style={{ background: enabled ? '#10b981' : '#6b7280' }}></div>
            <div>
              <h2 className="eq-title">Studio Equalizer Pro</h2>
              <span className="eq-subtext">10-Band Linear Phase Parametric EQ</span>
            </div>
          </div>
          <div className="eq-header-actions">
            <button className="eq-reset-btn" onClick={handleReset} title="Reset to Flat">
              Reset
            </button>
            <button className="close-btn" onClick={onClose} aria-label="Close">&times;</button>
          </div>
        </div>

        {/* Master Power Toggle & Presets */}
        <div className="eq-toolbar">
          <label className="eq-toggle-switch">
            <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} />
            <span className="slider-switch"></span>
            <span className="toggle-label">{enabled ? "DSP Active" : "Bypassed"}</span>
          </label>

          <div className="eq-presets-wrap">
            {Object.keys(PRESETS).map((pName) => (
              <button
                key={pName}
                className={`preset-chip ${activePreset === pName ? 'active' : ''}`}
                onClick={() => applyPreset(pName)}
              >
                {pName}
              </button>
            ))}
          </div>
        </div>

        {/* 10 Faders Area */}
        <div className="eq-board-container" style={{ opacity: enabled ? 1 : 0.45, pointerEvents: enabled ? 'auto' : 'none' }}>
          <div className="eq-grid-lines">
            <span className="grid-label">+12dB</span>
            <span className="grid-label">0dB</span>
            <span className="grid-label">-12dB</span>
          </div>

          <div className="eq-faders-track">
            {gains.map((gain, i) => (
              <div key={i} className="eq-band-channel">
                <span className={`eq-db-badge ${gain > 0 ? 'boost' : gain < 0 ? 'cut' : ''}`}>
                  {gain > 0 ? `+${gain.toFixed(1)}` : gain.toFixed(1)}
                </span>
                
                <div className="fader-track-groove">
                  <input 
                    type="range" 
                    min="-12" max="12" step="0.5" 
                    value={gain} 
                    onChange={(e) => handleGainChange(i, e.target.value)} 
                    className="vertical-slider"
                  />
                </div>

                <span className="eq-freq-badge">{freqs[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bass Boost & Dynamic Enhancer */}
        <div className="eq-master-effects" style={{ opacity: enabled ? 1 : 0.45, pointerEvents: enabled ? 'auto' : 'none' }}>
          <div className="effect-module">
            <div className="module-info">
              <span className="module-title">Sub-Bass Drive</span>
              <span className="module-val">+{bass.toFixed(1)} dB</span>
            </div>
            <input 
              type="range" 
              min="0" max="15" step="0.5" 
              value={bass} 
              onChange={(e) => handleBassChange(e.target.value)}
              className="bass-slider"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
