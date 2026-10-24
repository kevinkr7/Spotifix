package com.example.myproject.repository;

import com.example.myproject.model.PlayHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface PlayHistoryRepository extends JpaRepository<PlayHistory, Long> {
    List<PlayHistory> findByUserIdOrderByPlayedAtDesc(Long userId);
    List<PlayHistory> findByUserIdAndPlayedAtAfterOrderByPlayedAtDesc(Long userId, LocalDateTime playedAt);
}
