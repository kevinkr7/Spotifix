package com.example.myproject.repository;

import com.example.myproject.model.KaraokeSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface KaraokeSettingsRepository extends JpaRepository<KaraokeSettings, Long> {
    Optional<KaraokeSettings> findByUserId(Long userId);
}
