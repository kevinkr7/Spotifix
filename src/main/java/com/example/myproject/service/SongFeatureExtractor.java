package com.example.myproject.service;

import com.example.myproject.model.Music;
import org.springframework.stereotype.Service;

@Service
public class SongFeatureExtractor {
    
    public static class AudioFeatures {
        public int bpm;
        public double energy; // 0.0 to 1.0
        public int key; // 0 to 11
        public boolean measured;

        public AudioFeatures(int bpm, double energy, int key, boolean measured) {
            this.bpm = bpm;
            this.energy = energy;
            this.key = key;
            this.measured = measured;
        }

        public AudioFeatures(int bpm, double energy, int key) {
            this(bpm, energy, key, false);
        }
    }

    /**
     * Extracts audio features if available from track metadata.
     * Note: Full audio DSP / BPM detection requires dedicated audio processing libraries
     * (e.g. FFmpeg / TarsosDSP), which are omitted to avoid heavy native dependencies.
     * When real audio analysis is not available, standard default features are returned
     * with measured=false rather than fabricating fake measurements from string hashes.
     */
    public AudioFeatures extractFeatures(Music song) {
        if (song == null) {
            return new AudioFeatures(120, 0.5, 0, false);
        }
        // Standard neutral fallback (120 BPM, 0.5 energy, key 0, unmeasured)
        return new AudioFeatures(120, 0.5, 0, false);
    }
}
