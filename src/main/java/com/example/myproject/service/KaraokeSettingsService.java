package com.example.myproject.service;

import com.example.myproject.model.KaraokeSettings;
import com.example.myproject.repository.KaraokeSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class KaraokeSettingsService {

    @Autowired
    private KaraokeSettingsRepository repo;

    public KaraokeSettings getSettings(Long userId) {
        return repo.findByUserId(userId).orElseGet(() -> {
            KaraokeSettings s = new KaraokeSettings();
            s.setUserId(userId);
            s.setKaraokeModeEnabled(false);
            s.setVocalVolume(0.0);
            s.setBackingTrackVolume(1.0);
            s.setPlaybackSpeed(1.0);
            return repo.save(s);
        });
    }

    public KaraokeSettings updateSettings(Long userId, KaraokeSettings update) {
        KaraokeSettings s = getSettings(userId);
        s.setKaraokeModeEnabled(update.isKaraokeModeEnabled());
        s.setVocalVolume(update.getVocalVolume());
        s.setBackingTrackVolume(update.getBackingTrackVolume());
        s.setPlaybackSpeed(update.getPlaybackSpeed());
        return repo.save(s);
    }
}
