package com.example.myproject.repository;

import com.example.myproject.model.ExternalPlayHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExternalPlayHistoryRepository extends JpaRepository<ExternalPlayHistory, Long> {

    List<ExternalPlayHistory> findByUserIdOrderByPlayedAtDesc(Long userId);
}
