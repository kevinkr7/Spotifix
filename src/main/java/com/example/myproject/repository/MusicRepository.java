package com.example.myproject.repository;

import com.example.myproject.model.Music;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MusicRepository extends JpaRepository<Music, Long> {
    List<Music> findByMoodAndUserId(String mood, Long userId);
    List<Music> findByUserId(Long userId);
    Optional<Music> findByIdAndUserId(Long id, Long userId);
    boolean existsByIdAndUserId(Long id, Long userId);
    List<Music> findByIdInAndUserId(List<Long> ids, Long userId);
}
