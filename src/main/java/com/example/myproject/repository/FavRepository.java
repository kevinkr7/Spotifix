package com.example.myproject.repository;

import com.example.myproject.model.Fav;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FavRepository extends JpaRepository<Fav, Long> {
    List<Fav> findByUserId(Long userId);
    List<Fav> findByUserIdOrderBySortOrderAsc(Long userId);
    Optional<Fav> findByUserIdAndSongId(Long userId, Long songId);
    void deleteByUserIdAndSongId(Long userId, Long songId);
}
