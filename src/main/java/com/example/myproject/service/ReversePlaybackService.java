package com.example.myproject.service;

import com.example.myproject.model.ReversePlaybackLog;
import com.example.myproject.repository.ReversePlaybackLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ReversePlaybackService {
    @Autowired
    private ReversePlaybackLogRepository repo;

    public void logReversePlayback(Long userId, int songId, double durationInReverse) {
        ReversePlaybackLog l = new ReversePlaybackLog();
        l.setUserId(userId);
        l.setSongId(songId);
        l.setDurationInReverse(durationInReverse);
        l.setTimestamp(LocalDateTime.now());
        repo.save(l);
    }
}
