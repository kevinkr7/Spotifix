package com.example.myproject.service;

import com.example.myproject.model.PlaybackSeekHistory;
import com.example.myproject.repository.PlaybackSeekHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class PlaybackSeekHistoryService {
    @Autowired
    private PlaybackSeekHistoryRepository repo;

    public void logSeek(Long userId, int songId, double seekFrom, double seekTo) {
        PlaybackSeekHistory h = new PlaybackSeekHistory();
        h.setUserId(userId);
        h.setSongId(songId);
        h.setSeekFrom(seekFrom);
        h.setSeekTo(seekTo);
        h.setTimestamp(LocalDateTime.now());
        repo.save(h);
    }
}
