package com.example.myproject.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "external_track_favorites", uniqueConstraints = {
        @UniqueConstraint(name = "uk_ext_fav_user_provider_track", columnNames = {"user_id", "provider", "provider_track_id"})
}, indexes = {
        @Index(name = "idx_ext_fav_user_created", columnList = "user_id, created_at")
})
public class ExternalTrackFavorite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "provider", nullable = false, length = 32)
    private String provider = "jamendo";

    @Column(name = "provider_track_id", nullable = false, length = 64)
    private String providerTrackId;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "artist", length = 255)
    private String artist;

    @Column(name = "album", length = 255)
    private String album;

    @Column(name = "image_url", length = 1024)
    private String imageUrl;

    @Column(name = "audio_url", length = 1024, nullable = false)
    private String audioUrl;

    @Column(name = "duration")
    private Integer duration;

    @Column(name = "license_ccurl", length = 512)
    private String licenseCcUrl;

    @Column(name = "share_url", length = 512)
    private String shareUrl;

    @Column(name = "language", length = 32)
    private String language;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

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

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
