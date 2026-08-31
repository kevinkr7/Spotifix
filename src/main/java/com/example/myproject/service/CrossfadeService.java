package com.example.myproject.service;

import com.example.myproject.dto.CrossfadeResponse;
import com.example.myproject.model.CrossfadeSettings;
import com.example.myproject.model.Music;
import com.example.myproject.repository.CrossfadeSettingsRepository;
import com.example.myproject.repository.MusicRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CrossfadeService {

    @Autowired
    private CrossfadeSettingsRepository settingsRepo;

    @Autowired
    private MusicRepository musicRepo;

    @Autowired
    private SongFeatureExtractor featureExtractor;

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

    public CrossfadeResponse analyzeTransition(Long userId, int fromSongId, int toSongId) {
        CrossfadeSettings s = getSettings(userId);
        
        if (!s.isSmartCrossfadeEnabled()) {
            double dur = s.getManualCrossfadeDuration() != null ? s.getManualCrossfadeDuration() : 0.0;
            return new CrossfadeResponse(dur, "None", "Smart Crossfade is disabled.");
        }

        Music from = musicRepo.findById(fromSongId).orElse(null);
        Music to = musicRepo.findById(toSongId).orElse(null);

        if (from == null || to == null) {
            return new CrossfadeResponse(0, "None", "Could not analyze missing songs.");
        }

        SongFeatureExtractor.AudioFeatures f1 = featureExtractor.extractFeatures(from);
        SongFeatureExtractor.AudioFeatures f2 = featureExtractor.extractFeatures(to);

        // Transition Logic
        double duration = 4.0;
        String curve = "Linear";
        String explanation = "AI selected a standard transition.";

        int bpmDiff = Math.abs(f1.bpm - f2.bpm);
        double energyDiff = Math.abs(f1.energy - f2.energy);

        if (bpmDiff < 5) {
            duration = 6.0;
            curve = "BeatMatch";
            explanation = "AI selected a 6.0-second beat-matched blend since both songs have similar tempo (~" + f1.bpm + " BPM).";
        } else if (energyDiff > 0.4 && f2.energy > f1.energy) {
            // Low energy to high energy transition -> short explosive transition
            duration = 1.5;
            curve = "Exponential";
            explanation = "AI selected a quick 1.5-second transition to match the sudden energy shift.";
        } else if (energyDiff > 0.4 && f2.energy < f1.energy) {
            // High to low -> long fade
            duration = 8.0;
            curve = "SmoothFade";
            explanation = "AI selected an 8.0-second smooth fade to gracefully drop the energy level.";
        } else {
            duration = 3.2 + (f1.energy * 2.0); // roughly 3.2 to 5.2s
            curve = "Linear";
            explanation = String.format("AI selected a %.1f-second smooth transition based on tempo and energy.", duration);
        }

        return new CrossfadeResponse(duration, curve, explanation);
    }
}
