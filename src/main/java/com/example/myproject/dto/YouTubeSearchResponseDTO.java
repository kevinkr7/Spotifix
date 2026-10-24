package com.example.myproject.dto;

import java.util.ArrayList;
import java.util.List;

public class YouTubeSearchResponseDTO {

    private boolean configured;
    private String message;
    private int total;
    private List<YouTubeTrackDTO> tracks = new ArrayList<>();

    public YouTubeSearchResponseDTO() {
    }

    public YouTubeSearchResponseDTO(boolean configured, String message, int total, List<YouTubeTrackDTO> tracks) {
        this.configured = configured;
        this.message = message;
        this.total = total;
        if (tracks != null) {
            this.tracks = tracks;
        }
    }

    public boolean isConfigured() {
        return configured;
    }

    public void setConfigured(boolean configured) {
        this.configured = configured;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public int getTotal() {
        return total;
    }

    public void setTotal(int total) {
        this.total = total;
    }

    public List<YouTubeTrackDTO> getTracks() {
        return tracks;
    }

    public void setTracks(List<YouTubeTrackDTO> tracks) {
        this.tracks = tracks != null ? tracks : new ArrayList<>();
    }
}
