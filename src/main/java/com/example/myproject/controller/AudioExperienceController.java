package com.example.myproject.controller;

import com.example.myproject.model.AppUser;
import com.example.myproject.model.EqualizerPreset;
import com.example.myproject.model.KaraokeSettings;
import com.example.myproject.repository.AppUserRepository;
import com.example.myproject.service.EqualizerService;
import com.example.myproject.service.KaraokeSettingsService;
import com.example.myproject.service.LyricsService;
import com.example.myproject.service.PlaybackSeekHistoryService;
import com.example.myproject.service.ReversePlaybackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/audio")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AudioExperienceController {

    @Autowired private AppUserRepository userRepo;
    @Autowired private EqualizerService eqService;
    @Autowired private KaraokeSettingsService karaokeService;
    @Autowired private LyricsService lyricsService;
    @Autowired private PlaybackSeekHistoryService seekService;
    @Autowired private ReversePlaybackService reverseService;

    private AppUser getUser(Principal principal) {
        if (principal == null) return null;
        return userRepo.findByUsername(principal.getName()).orElse(null);
    }

    // --- Equalizer ---
    @GetMapping("/equalizer/presets")
    public ResponseEntity<?> getPresets(Principal principal) {
        AppUser user = getUser(principal);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(eqService.getPresets(user.getId()));
    }

    @PostMapping("/equalizer/presets")
    public ResponseEntity<?> savePreset(@RequestBody EqualizerPreset preset, Principal principal) {
        AppUser user = getUser(principal);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(eqService.savePreset(preset, user.getId()));
    }

    @DeleteMapping("/equalizer/presets/{id}")
    public ResponseEntity<?> deletePreset(@PathVariable Long id, Principal principal) {
        AppUser user = getUser(principal);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        eqService.deletePreset(id, user.getId());
        return ResponseEntity.ok().build();
    }

    // --- Karaoke ---
    @GetMapping("/karaoke/lyrics/{songId}")
    public ResponseEntity<?> getLyrics(@PathVariable int songId) {
        return ResponseEntity.ok(lyricsService.getLyrics(songId));
    }

    @GetMapping("/karaoke/settings")
    public ResponseEntity<?> getKaraokeSettings(Principal principal) {
        AppUser user = getUser(principal);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(karaokeService.getSettings(user.getId()));
    }

    @PutMapping("/karaoke/settings")
    public ResponseEntity<?> updateKaraokeSettings(@RequestBody KaraokeSettings settings, Principal principal) {
        AppUser user = getUser(principal);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(karaokeService.updateSettings(user.getId(), settings));
    }

    // --- Seek History ---
    @PostMapping("/player/seek")
    public ResponseEntity<?> logSeek(@RequestParam int songId, @RequestParam double from, @RequestParam double to, Principal principal) {
        AppUser user = getUser(principal);
        if (user != null) {
            seekService.logSeek(user.getId(), songId, from, to);
        }
        return ResponseEntity.ok().build();
    }

    // --- Reverse Logs ---
    @PostMapping("/reverse/log")
    public ResponseEntity<?> logReverse(@RequestParam int songId, @RequestParam double duration, Principal principal) {
        AppUser user = getUser(principal);
        if (user != null) {
            reverseService.logReversePlayback(user.getId(), songId, duration);
        }
        return ResponseEntity.ok().build();
    }
}
