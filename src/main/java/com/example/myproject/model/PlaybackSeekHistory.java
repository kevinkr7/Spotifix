package com.example.myproject.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.time.LocalDateTime;

@Entity
public class PlaybackSeekHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Long songId;
    private double seekFrom;
    private double seekTo;
    
    private LocalDateTime timestamp;

    public PlaybackSeekHistory() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getSongId() { return songId; }
    public void setSongId(Long songId) { this.songId = songId; }

    public double getSeekFrom() { return seekFrom; }
    public void setSeekFrom(double seekFrom) { this.seekFrom = seekFrom; }

    public double getSeekTo() { return seekTo; }
    public void setSeekTo(double seekTo) { this.seekTo = seekTo; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
