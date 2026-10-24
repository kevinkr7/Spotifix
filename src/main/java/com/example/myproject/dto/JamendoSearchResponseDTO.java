package com.example.myproject.dto;

import java.util.ArrayList;
import java.util.List;

public class JamendoSearchResponseDTO {

    private boolean configured = true;
    private String message;
    private int total;
    private List<JamendoTrackDTO> tracks = new ArrayList<>();

    public JamendoSearchResponseDTO() {
    }

    public JamendoSearchResponseDTO(boolean configured, String message, int total, List<JamendoTrackDTO> tracks) {
        this.configured = configured;
        this.message = message;
        this.total = total;
        this.tracks = tracks != null ? tracks : new ArrayList<>();
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

    public List<JamendoTrackDTO> getTracks() {
        return tracks;
    }

    public void setTracks(List<JamendoTrackDTO> tracks) {
        this.tracks = tracks;
    }
}
