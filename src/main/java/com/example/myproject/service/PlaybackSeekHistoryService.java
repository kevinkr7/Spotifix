package com.example.myproject.service;

import com.example.myproject.model.PlaybackSeekHistory;
import com.example.myproject.repository.MusicRepository;
import com.example.myproject.repository.PlaybackSeekHistoryRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
public class PlaybackSeekHistoryService {

    private final PlaybackSeekHistoryRepository repo;
    private final MusicRepository musicRepository;

    public PlaybackSeekHistoryService(PlaybackSeekHistoryRepository repo, MusicRepository musicRepository) {
        this.repo = repo;
        this.musicRepository = musicRepository;
    }

    public void logSeek(Long userId, Long songId, double seekFrom, double seekTo) {
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required.");
        }
        if (songId == null || !musicRepository.existsByIdAndUserId(songId, userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Song not found in user library.");
        }
        if (seekFrom < 0.0 || seekTo < 0.0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Seek timestamps cannot be negative.");
        }

        PlaybackSeekHistory h = new PlaybackSeekHistory();
        h.setUserId(userId);
        h.setSongId(songId);
        h.setSeekFrom(seekFrom);
        h.setSeekTo(seekTo);
        h.setTimestamp(LocalDateTime.now());
        repo.save(h);
    }
}
