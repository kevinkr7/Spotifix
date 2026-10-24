package com.example.myproject.service;

import com.example.myproject.dto.CrossfadeResponse;
import com.example.myproject.model.CrossfadeSettings;
import com.example.myproject.model.Music;
import com.example.myproject.repository.CrossfadeSettingsRepository;
import com.example.myproject.repository.MusicRepository;
import org.springframework.stereotype.Service;

@Service
public class CrossfadeService {

    private final CrossfadeSettingsRepository settingsRepo;
    private final MusicRepository musicRepo;
    private final SongFeatureExtractor featureExtractor;

    public CrossfadeService(CrossfadeSettingsRepository settingsRepo,
                            MusicRepository musicRepo,
                            SongFeatureExtractor featureExtractor) {
        this.settingsRepo = settingsRepo;
        this.musicRepo = musicRepo;
        this.featureExtractor = featureExtractor;
    }

    public CrossfadeSettings getSettings(Long userId) {
        return settingsRepo.findByUserId(userId).orElseGet(() -> {
            CrossfadeSettings s = new CrossfadeSettings();
            s.setUserId(userId);
            s.setSmartCrossfadeEnabled(true);
            return settingsRepo.save(s);
        });
    }

    public CrossfadeSettings updateSettings(Long userId, CrossfadeSettings update) {
        CrossfadeSettings s = getSettings(userId);
        s.setSmartCrossfadeEnabled(update.isSmartCrossfadeEnabled());
        s.setManualCrossfadeDuration(update.getManualCrossfadeDuration());
        return settingsRepo.save(s);
    }

    public CrossfadeResponse analyzeTransition(Long userId, Long fromSongId, Long toSongId) {
        CrossfadeSettings s = getSettings(userId);

        if (!s.isSmartCrossfadeEnabled()) {
            double dur = s.getManualCrossfadeDuration() != null ? s.getManualCrossfadeDuration() : 0.0;
            return new CrossfadeResponse(dur, "None", "Smart Crossfade is disabled.");
        }

        // Validate track existence and user ownership to prevent cross-user data leaks
        Music from = musicRepo.findByIdAndUserId(fromSongId, userId).orElse(null);
        Music to = musicRepo.findByIdAndUserId(toSongId, userId).orElse(null);

        if (from == null || to == null) {
            return new CrossfadeResponse(0, "None", "One or both tracks were not found in your library.");
        }

        SongFeatureExtractor.AudioFeatures f1 = featureExtractor.extractFeatures(from);
        SongFeatureExtractor.AudioFeatures f2 = featureExtractor.extractFeatures(to);

        if (f1.measured && f2.measured) {
            int bpmDiff = Math.abs(f1.bpm - f2.bpm);
            double energyDiff = Math.abs(f1.energy - f2.energy);

            if (bpmDiff < 5) {
                return new CrossfadeResponse(6.0, "BeatMatch",
                        "Beat-matched blend applied since both songs have similar tempo (~" + f1.bpm + " BPM).");
            } else if (energyDiff > 0.4 && f2.energy > f1.energy) {
                return new CrossfadeResponse(1.5, "Exponential",
                        "Dynamic transition selected to match the energy shift.");
            } else if (energyDiff > 0.4 && f2.energy < f1.energy) {
                return new CrossfadeResponse(8.0, "SmoothFade",
                        "Extended smooth fade selected to lower the energy level.");
            }
        }

        // Standard smooth transition fallback
        double duration = s.getManualCrossfadeDuration() != null ? s.getManualCrossfadeDuration() : 4.0;
        return new CrossfadeResponse(duration, "Linear",
                String.format("Standard %.1f-second smooth transition applied.", duration));
    }
}
