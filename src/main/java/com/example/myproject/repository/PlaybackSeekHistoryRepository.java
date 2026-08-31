package com.example.myproject.repository;

import com.example.myproject.model.PlaybackSeekHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PlaybackSeekHistoryRepository extends JpaRepository<PlaybackSeekHistory, Long> {
    List<PlaybackSeekHistory> findByUserId(Long userId);
}
