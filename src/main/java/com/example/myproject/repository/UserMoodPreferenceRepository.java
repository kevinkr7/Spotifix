package com.example.myproject.repository;

import com.example.myproject.model.UserMoodPreference;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserMoodPreferenceRepository extends JpaRepository<UserMoodPreference, Long> {
    Optional<UserMoodPreference> findByUserId(Long userId);
}
