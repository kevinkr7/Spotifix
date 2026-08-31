package com.example.myproject.service;

import com.example.myproject.model.EqualizerPreset;
import com.example.myproject.repository.EqualizerPresetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EqualizerService {

    @Autowired
    private EqualizerPresetRepository repo;

    public List<EqualizerPreset> getPresets(Long userId) {
        return repo.findByUserIdOrUserIdIsNull(userId);
    }

    public EqualizerPreset savePreset(EqualizerPreset preset, Long userId) {
        preset.setUserId(userId);
        return repo.save(preset);
    }

    public void deletePreset(Long presetId, Long userId) {
        EqualizerPreset p = repo.findById(presetId).orElse(null);
        if (p != null && p.getUserId() != null && p.getUserId().equals(userId)) {
            repo.delete(p);
        }
    }
}
