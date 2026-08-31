package com.example.myproject.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class KaraokeSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private boolean karaokeModeEnabled;
    private double vocalVolume; // 0.0 (muted) to 1.0 (full)
    private double backingTrackVolume;
    private double playbackSpeed; // 0.5 to 2.0

    public KaraokeSettings() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public boolean isKaraokeModeEnabled() { return karaokeModeEnabled; }
    public void setKaraokeModeEnabled(boolean karaokeModeEnabled) { this.karaokeModeEnabled = karaokeModeEnabled; }

    public double getVocalVolume() { return vocalVolume; }
    public void setVocalVolume(double vocalVolume) { this.vocalVolume = vocalVolume; }

    public double getBackingTrackVolume() { return backingTrackVolume; }
    public void setBackingTrackVolume(double backingTrackVolume) { this.backingTrackVolume = backingTrackVolume; }

    public double getPlaybackSpeed() { return playbackSpeed; }
    public void setPlaybackSpeed(double playbackSpeed) { this.playbackSpeed = playbackSpeed; }
}
