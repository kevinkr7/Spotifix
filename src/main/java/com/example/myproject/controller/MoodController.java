package com.example.myproject.controller;

import com.example.myproject.dto.MoodRecommendationResponse;
import com.example.myproject.model.UserMoodPreference;
import com.example.myproject.service.MoodRecommendationService;
import com.example.myproject.util.SessionUtil;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/mood")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class MoodController {

    private final MoodRecommendationService moodService;

    public MoodController(MoodRecommendationService moodService) {
        this.moodService = moodService;
    }

    @GetMapping("/preferences")
    public ResponseEntity<?> getPreferences(HttpSession session) {
        Long userId = SessionUtil.requireUserId(session);
        return ResponseEntity.ok(moodService.getPreferences(userId));
    }

    @PutMapping("/preferences")
    public ResponseEntity<?> updatePreferences(@RequestBody UserMoodPreference pref, HttpSession session) {
        Long userId = SessionUtil.requireUserId(session);
        return ResponseEntity.ok(moodService.updatePreferences(userId, pref));
    }

    @GetMapping("/recommendations")
    public ResponseEntity<?> getRecommendations(HttpSession session) {
        Long userId = SessionUtil.requireUserId(session);
        MoodRecommendationResponse response = moodService.getRecommendations(userId);
        return ResponseEntity.ok(response);
    }
}
