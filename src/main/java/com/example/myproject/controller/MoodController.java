package com.example.myproject.controller;

import com.example.myproject.dto.MoodRecommendationResponse;
import com.example.myproject.model.AppUser;
import com.example.myproject.model.UserMoodPreference;
import com.example.myproject.repository.AppUserRepository;
import com.example.myproject.service.MoodRecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/mood")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class MoodController {

    @Autowired
    private MoodRecommendationService moodService;

    @Autowired
    private AppUserRepository userRepo;

    private AppUser getUser(Principal principal) {
        if (principal == null) return null;
        return userRepo.findByUsername(principal.getName()).orElse(null);
    }

    @GetMapping("/preferences")
    public ResponseEntity<?> getPreferences(Principal principal) {
        AppUser user = getUser(principal);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(moodService.getPreferences(user.getId()));
    }

    @PutMapping("/preferences")
    public ResponseEntity<?> updatePreferences(@RequestBody UserMoodPreference pref, Principal principal) {
        AppUser user = getUser(principal);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(moodService.updatePreferences(user.getId(), pref));
    }

    @GetMapping("/recommendations")
    public ResponseEntity<?> getRecommendations(Principal principal) {
        AppUser user = getUser(principal);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        MoodRecommendationResponse response = moodService.getRecommendations(user.getId());
        return ResponseEntity.ok(response);
    }
}
