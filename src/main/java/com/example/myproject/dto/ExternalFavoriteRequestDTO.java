package com.example.myproject.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ExternalFavoriteRequestDTO {

    @NotBlank(message = "Track ID is required")
    @Size(max = 64)
    private String providerTrackId;

    @NotBlank(message = "Title is required")
    @Size(max = 255)
    private String title;

    @Size(max = 255)
    private String artist;

    @Size(max = 255)
    private String album;

    @Size(max = 1024)
    private String imageUrl;

    @NotBlank(message = "Audio URL is required")
    @Size(max = 1024)
    private String audioUrl;

    private Integer duration;

    @Size(max = 512)
    private String licenseCcUrl;

    @Size(max = 512)
    private String shareUrl;

    @Size(max = 32)
    private String language;

    public String getProviderTrackId() {
        return providerTrackId;
    }

    public void setProviderTrackId(String providerTrackId) {
        this.providerTrackId = providerTrackId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getArtist() {
        return artist;
    }

    public void setArtist(String artist) {
        this.artist = artist;
    }

    public String getAlbum() {
        return album;
    }

    public void setAlbum(String album) {
        this.album = album;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getAudioUrl() {
        return audioUrl;
    }

    public void setAudioUrl(String audioUrl) {
        this.audioUrl = audioUrl;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public String getLicenseCcUrl() {
        return licenseCcUrl;
    }

    public void setLicenseCcUrl(String licenseCcUrl) {
        this.licenseCcUrl = licenseCcUrl;
    }

    public String getShareUrl() {
        return shareUrl;
    }

    public void setShareUrl(String shareUrl) {
        this.shareUrl = shareUrl;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }
}
