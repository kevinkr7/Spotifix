package com.example.myproject.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class CrossfadeSettings {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private boolean smartCrossfadeEnabled = true;
    
    // Optional manual override for crossfade duration in seconds
    private Double manualCrossfadeDuration;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public boolean isSmartCrossfadeEnabled() {
        return smartCrossfadeEnabled;
    }

    public void setSmartCrossfadeEnabled(boolean smartCrossfadeEnabled) {
        this.smartCrossfadeEnabled = smartCrossfadeEnabled;
    }

    public Double getManualCrossfadeDuration() {
        return manualCrossfadeDuration;
    }

    public void setManualCrossfadeDuration(Double manualCrossfadeDuration) {
        this.manualCrossfadeDuration = manualCrossfadeDuration;
    }
}
