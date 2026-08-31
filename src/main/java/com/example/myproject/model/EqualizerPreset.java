package com.example.myproject.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;

@Entity
public class EqualizerPreset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId; // null for system defaults
    
    private String name;

    @Column(columnDefinition = "JSON")
    private String bandsJson; // Store [band1, band2, ...] array as JSON string
    
    private Double bassBoost; // 0.0 to 1.0
    private Double reverb; // 0.0 to 1.0
    private Double pitchShift; // 0.5 to 2.0
    
    public EqualizerPreset() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getBandsJson() { return bandsJson; }
    public void setBandsJson(String bandsJson) { this.bandsJson = bandsJson; }

    public Double getBassBoost() { return bassBoost; }
    public void setBassBoost(Double bassBoost) { this.bassBoost = bassBoost; }

    public Double getReverb() { return reverb; }
    public void setReverb(Double reverb) { this.reverb = reverb; }

    public Double getPitchShift() { return pitchShift; }
    public void setPitchShift(Double pitchShift) { this.pitchShift = pitchShift; }
}
