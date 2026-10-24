package com.example.myproject.repository;

import com.example.myproject.model.EqualizerPreset;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EqualizerPresetRepository extends JpaRepository<EqualizerPreset, Long> {
    List<EqualizerPreset> findByUserIdOrUserIdIsNull(Long userId);
    List<EqualizerPreset> findByUserId(Long userId);
}
