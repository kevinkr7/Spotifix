package com.example.myproject.service;

import com.example.myproject.model.Music;
import org.springframework.stereotype.Service;

@Service
public class SongFeatureExtractor {
    
    public static class AudioFeatures {
        public int bpm;
        public double energy; // 0.0 to 1.0
        public int key; // 0 to 11
        
        public AudioFeatures(int bpm, double energy, int key) {
            this.bpm = bpm;
            this.energy = energy;
            this.key = key;
        }
    }

    // Deterministic mock generation based on hash
    public AudioFeatures extractFeatures(Music song) {
        if (song == null || song.getTitle() == null) return new AudioFeatures(120, 0.5, 0);
        
        int hash = Math.abs(song.getTitle().hashCode() + (song.getArtist() != null ? song.getArtist().hashCode() : 0));
        
        int bpm = 70 + (hash % 100); // 70 to 169 BPM
        double energy = (double) ((hash % 100) + 1) / 100.0; // 0.01 to 1.0
        int key = hash % 12; // 0 to 11

        return new AudioFeatures(bpm, energy, key);
    }
}
