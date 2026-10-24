package com.example.myproject.dto;

import com.example.myproject.model.Music;

public class SearchResultDTO {
    private Music music;
    private double confidenceScore;
    private String matchedReason;

    public SearchResultDTO() {}

    public SearchResultDTO(Music music, double confidenceScore, String matchedReason) {
        this.music = music;
        this.confidenceScore = confidenceScore;
        this.matchedReason = matchedReason;
    }

    public Music getMusic() {
        return music;
    }

    public void setMusic(Music music) {
        this.music = music;
    }

    public double getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(double confidenceScore) {
        this.confidenceScore = confidenceScore;
    }

    public String getMatchedReason() {
        return matchedReason;
    }

    public void setMatchedReason(String matchedReason) {
        this.matchedReason = matchedReason;
    }
}
