package com.example.myproject.repository;

import com.example.myproject.model.ExternalTrackFavorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExternalTrackFavoriteRepository extends JpaRepository<ExternalTrackFavorite, Long> {

    List<ExternalTrackFavorite> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<ExternalTrackFavorite> findByUserIdAndProviderAndProviderTrackId(Long userId, String provider, String providerTrackId);

    boolean existsByUserIdAndProviderAndProviderTrackId(Long userId, String provider, String providerTrackId);

    void deleteByUserIdAndProviderAndProviderTrackId(Long userId, String provider, String providerTrackId);
}
