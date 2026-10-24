package com.example.myproject.service;

import com.example.myproject.model.ReversePlaybackLog;
import com.example.myproject.repository.MusicRepository;
import com.example.myproject.repository.ReversePlaybackLogRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
public class ReversePlaybackService {

    private final ReversePlaybackLogRepository repo;
    private final MusicRepository musicRepository;

    public ReversePlaybackService(ReversePlaybackLogRepository repo, MusicRepository musicRepository) {
        this.repo = repo;
        this.musicRepository = musicRepository;
    }

    public void logReversePlayback(Long userId, Long songId, double durationInReverse) {
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required.");
        }
        if (songId == null || !musicRepository.existsByIdAndUserId(songId, userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Song not found in user library.");
        }
        if (durationInReverse <= 0.0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Duration in reverse must be greater than zero.");
        }

        ReversePlaybackLog l = new ReversePlaybackLog();
        l.setUserId(userId);
        l.setSongId(songId);
        l.setDurationInReverse(durationInReverse);
        l.setTimestamp(LocalDateTime.now());
        repo.save(l);
    }
}
