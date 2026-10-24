package com.example.myproject.dto;

import java.util.Map;

public class WeeklyInsightResponse {
    private Map<String, Double> moodDistribution;
    private String favoriteGenre;
    private String favoriteArtist;
    private String favoriteLanguage;
    private double listeningHours;
    private int longestStreak;
    private String topDiscovery;
    private String suggestions;

    public Map<String, Double> getMoodDistribution() {
        return moodDistribution;
    }

    public void setMoodDistribution(Map<String, Double> moodDistribution) {
        this.moodDistribution = moodDistribution;
    }

    public String getFavoriteGenre() {
        return favoriteGenre;
    }

    public void setFavoriteGenre(String favoriteGenre) {
        this.favoriteGenre = favoriteGenre;
    }

    public String getFavoriteArtist() {
        return favoriteArtist;
    }

    public void setFavoriteArtist(String favoriteArtist) {
        this.favoriteArtist = favoriteArtist;
    }

    public String getFavoriteLanguage() {
        return favoriteLanguage;
    }

    public void setFavoriteLanguage(String favoriteLanguage) {
        this.favoriteLanguage = favoriteLanguage;
    }

    public double getListeningHours() {
        return listeningHours;
    }

    public void setListeningHours(double listeningHours) {
        this.listeningHours = listeningHours;
    }

    public int getLongestStreak() {
        return longestStreak;
    }

    public void setLongestStreak(int longestStreak) {
        this.longestStreak = longestStreak;
    }

    public String getTopDiscovery() {
        return topDiscovery;
    }

    public void setTopDiscovery(String topDiscovery) {
        this.topDiscovery = topDiscovery;
    }

    public String getSuggestions() {
        return suggestions;
    }

    public void setSuggestions(String suggestions) {
        this.suggestions = suggestions;
    }
}
