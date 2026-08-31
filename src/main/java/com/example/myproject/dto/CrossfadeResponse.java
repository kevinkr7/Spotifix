package com.example.myproject.dto;

public class CrossfadeResponse {
    private double durationSeconds;
    private String curveType; // e.g., "Linear", "Exponential", "BeatMatch"
    private String explanation;

    public CrossfadeResponse(double durationSeconds, String curveType, String explanation) {
        this.durationSeconds = durationSeconds;
        this.curveType = curveType;
        this.explanation = explanation;
    }

    public double getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(double durationSeconds) { this.durationSeconds = durationSeconds; }

    public String getCurveType() { return curveType; }
    public void setCurveType(String curveType) { this.curveType = curveType; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
}
