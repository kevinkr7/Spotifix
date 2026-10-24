package com.example.myproject.repository;

import com.example.myproject.model.CrossfadeSettings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CrossfadeSettingsRepository extends JpaRepository<CrossfadeSettings, Long> {
    Optional<CrossfadeSettings> findByUserId(Long userId);
}
