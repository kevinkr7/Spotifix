package com.example.myproject.controller;

import com.example.myproject.dto.CrossfadeResponse;
import com.example.myproject.model.CrossfadeSettings;
import com.example.myproject.service.CrossfadeService;
import com.example.myproject.util.SessionUtil;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/crossfade")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class CrossfadeController {

    private final CrossfadeService crossfadeService;

    public CrossfadeController(CrossfadeService crossfadeService) {
        this.crossfadeService = crossfadeService;
    }

    @GetMapping("/settings")
    public ResponseEntity<?> getSettings(HttpSession session) {
        Long userId = SessionUtil.requireUserId(session);
        return ResponseEntity.ok(crossfadeService.getSettings(userId));
    }

    @PutMapping("/settings")
    public ResponseEntity<?> updateSettings(@RequestBody CrossfadeSettings settings, HttpSession session) {
        Long userId = SessionUtil.requireUserId(session);
        return ResponseEntity.ok(crossfadeService.updateSettings(userId, settings));
    }

    @GetMapping("/analyze")
    public ResponseEntity<?> analyzeTransition(
            @RequestParam Long fromSongId,
            @RequestParam Long toSongId,
            HttpSession session) {
        Long userId = SessionUtil.requireUserId(session);
        CrossfadeResponse res = crossfadeService.analyzeTransition(userId, fromSongId, toSongId);
        return ResponseEntity.ok(res);
    }
}
