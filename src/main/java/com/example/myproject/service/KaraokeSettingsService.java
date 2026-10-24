package com.example.myproject.service;

import com.example.myproject.model.KaraokeSettings;
import com.example.myproject.repository.KaraokeSettingsRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class KaraokeSettingsService {

    private final KaraokeSettingsRepository repo;

    public KaraokeSettingsService(KaraokeSettingsRepository repo) {
        this.repo = repo;
    }

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
        if (update == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Settings payload is required.");
        }
        if (update.getVocalVolume() < 0.0 || update.getVocalVolume() > 1.0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vocal volume must be between 0.0 and 1.0.");
        }
        if (update.getBackingTrackVolume() < 0.0 || update.getBackingTrackVolume() > 1.0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Backing track volume must be between 0.0 and 1.0.");
        }
        if (update.getPlaybackSpeed() < 0.5 || update.getPlaybackSpeed() > 2.0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Playback speed must be between 0.5 and 2.0.");
        }

        KaraokeSettings s = getSettings(userId);
        s.setKaraokeModeEnabled(update.isKaraokeModeEnabled());
        s.setVocalVolume(update.getVocalVolume());
        s.setBackingTrackVolume(update.getBackingTrackVolume());
        s.setPlaybackSpeed(update.getPlaybackSpeed());
        return repo.save(s);
    }
}
