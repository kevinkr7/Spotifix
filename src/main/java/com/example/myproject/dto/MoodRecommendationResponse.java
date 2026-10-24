package com.example.myproject.dto;

import com.example.myproject.model.Music;
import java.util.List;

public class MoodRecommendationResponse {
    private String currentMood;
    private String explanation;
    private List<Music> recommendations;

    public MoodRecommendationResponse() {}

    public MoodRecommendationResponse(String currentMood, String explanation, List<Music> recommendations) {
        this.currentMood = currentMood;
        this.explanation = explanation;
        this.recommendations = recommendations;
    }

    public String getCurrentMood() { return currentMood; }
    public void setCurrentMood(String currentMood) { this.currentMood = currentMood; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public List<Music> getRecommendations() { return recommendations; }
    public void setRecommendations(List<Music> recommendations) { this.recommendations = recommendations; }
}
