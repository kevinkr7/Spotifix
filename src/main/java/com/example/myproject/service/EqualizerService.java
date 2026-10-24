package com.example.myproject.service;

import com.example.myproject.model.EqualizerPreset;
import com.example.myproject.repository.EqualizerPresetRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class EqualizerService {

    private final EqualizerPresetRepository repo;

    public EqualizerService(EqualizerPresetRepository repo) {
        this.repo = repo;
    }

    public List<EqualizerPreset> getPresets(Long userId) {
        return repo.findByUserIdOrUserIdIsNull(userId);
    }

    public EqualizerPreset savePreset(EqualizerPreset preset, Long userId) {
        if (preset == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Preset is required.");
        }

        if (preset.getName() == null || preset.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Preset name is required.");
        }

        // Validate parameter ranges if provided
        if (preset.getBassBoost() != null && (preset.getBassBoost() < 0.0 || preset.getBassBoost() > 1.0)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bass boost must be between 0.0 and 1.0.");
        }
        if (preset.getReverb() != null && (preset.getReverb() < 0.0 || preset.getReverb() > 1.0)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reverb must be between 0.0 and 1.0.");
        }
        if (preset.getPitchShift() != null && (preset.getPitchShift() < 0.5 || preset.getPitchShift() > 2.0)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pitch shift must be between 0.5 and 2.0.");
        }

        // Prevent IDOR: Verify ownership if updating an existing preset
        if (preset.getId() != null) {
            EqualizerPreset existing = repo.findById(preset.getId()).orElse(null);
            if (existing != null && (existing.getUserId() == null || !existing.getUserId().equals(userId))) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot modify system presets or presets owned by another user.");
            }
        }

        preset.setUserId(userId);
        return repo.save(preset);
    }

    public void deletePreset(Long presetId, Long userId) {
        EqualizerPreset p = repo.findById(presetId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Preset not found."));

        if (p.getUserId() == null || !p.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot delete this preset.");
        }

        repo.delete(p);
    }
}
