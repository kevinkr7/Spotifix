package com.example.myproject.controller;

import com.example.myproject.model.EqualizerPreset;
import com.example.myproject.model.KaraokeSettings;
import com.example.myproject.service.*;
import com.example.myproject.util.SessionUtil;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/audio")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AudioExperienceController {

    private final EqualizerService eqService;
    private final KaraokeSettingsService karaokeService;
    private final LyricsService lyricsService;
    private final PlaybackSeekHistoryService seekService;
    private final ReversePlaybackService reverseService;

    public AudioExperienceController(EqualizerService eqService,
                                     KaraokeSettingsService karaokeService,
                                     LyricsService lyricsService,
                                     PlaybackSeekHistoryService seekService,
                                     ReversePlaybackService reverseService) {
        this.eqService = eqService;
        this.karaokeService = karaokeService;
        this.lyricsService = lyricsService;
        this.seekService = seekService;
        this.reverseService = reverseService;
    }

    // --- Equalizer ---
    @GetMapping("/equalizer/presets")
    public ResponseEntity<?> getPresets(HttpSession session) {
        Long userId = SessionUtil.requireUserId(session);
        return ResponseEntity.ok(eqService.getPresets(userId));
    }

    @PostMapping("/equalizer/presets")
    public ResponseEntity<?> savePreset(@RequestBody EqualizerPreset preset, HttpSession session) {
        Long userId = SessionUtil.requireUserId(session);
        return ResponseEntity.ok(eqService.savePreset(preset, userId));
    }

    @DeleteMapping("/equalizer/presets/{id}")
    public ResponseEntity<?> deletePreset(@PathVariable Long id, HttpSession session) {
        Long userId = SessionUtil.requireUserId(session);
        eqService.deletePreset(id, userId);
        return ResponseEntity.ok().build();
    }

    // --- Karaoke ---
    @GetMapping("/karaoke/lyrics/{songId}")
    public ResponseEntity<?> getLyrics(@PathVariable Long songId, HttpSession session) {
        Long userId = SessionUtil.requireUserId(session);
        return ResponseEntity.ok(lyricsService.getLyrics(songId, userId));
    }

    @GetMapping("/karaoke/settings")
    public ResponseEntity<?> getKaraokeSettings(HttpSession session) {
        Long userId = SessionUtil.requireUserId(session);
        return ResponseEntity.ok(karaokeService.getSettings(userId));
    }

    @PutMapping("/karaoke/settings")
    public ResponseEntity<?> updateKaraokeSettings(@RequestBody KaraokeSettings settings, HttpSession session) {
        Long userId = SessionUtil.requireUserId(session);
        return ResponseEntity.ok(karaokeService.updateSettings(userId, settings));
    }

    // --- Seek History ---
    @PostMapping("/player/seek")
    public ResponseEntity<?> logSeek(@RequestParam Long songId,
                                     @RequestParam double from,
                                     @RequestParam double to,
                                     HttpSession session) {
        Long userId = SessionUtil.requireUserId(session);
        seekService.logSeek(userId, songId, from, to);
        return ResponseEntity.ok().build();
    }

    // --- Reverse Logs ---
    @PostMapping("/reverse/log")
    public ResponseEntity<?> logReverse(@RequestParam Long songId,
                                        @RequestParam double duration,
                                        HttpSession session) {
        Long userId = SessionUtil.requireUserId(session);
        reverseService.logReversePlayback(userId, songId, duration);
        return ResponseEntity.ok().build();
    }
}
