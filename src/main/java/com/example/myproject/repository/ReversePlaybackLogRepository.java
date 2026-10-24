package com.example.myproject.repository;

import com.example.myproject.model.ReversePlaybackLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReversePlaybackLogRepository extends JpaRepository<ReversePlaybackLog, Long> {
}
