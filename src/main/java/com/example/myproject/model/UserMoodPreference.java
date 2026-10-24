package com.example.myproject.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class UserMoodPreference {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    
    // Explicitly set mood, e.g. "Happy", "Chill"
    private String explicitMood;
    
    // Whether to track mood passively
    private boolean passiveTrackingEnabled = true;

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

    public String getExplicitMood() {
        return explicitMood;
    }

    public void setExplicitMood(String explicitMood) {
        this.explicitMood = explicitMood;
    }

    public boolean isPassiveTrackingEnabled() {
        return passiveTrackingEnabled;
    }

    public void setPassiveTrackingEnabled(boolean passiveTrackingEnabled) {
        this.passiveTrackingEnabled = passiveTrackingEnabled;
    }
}
