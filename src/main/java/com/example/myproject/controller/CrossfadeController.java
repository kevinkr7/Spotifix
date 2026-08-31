package com.example.myproject.controller;

import com.example.myproject.dto.CrossfadeResponse;
import com.example.myproject.model.AppUser;
import com.example.myproject.model.CrossfadeSettings;
import com.example.myproject.repository.AppUserRepository;
import com.example.myproject.service.CrossfadeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/crossfade")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class CrossfadeController {

    @Autowired
    private CrossfadeService crossfadeService;

    @Autowired
    private AppUserRepository userRepo;

    private AppUser getUser(Principal principal) {
        if (principal == null) return null;
        return userRepo.findByUsername(principal.getName()).orElse(null);
    }

    @GetMapping("/settings")
    public ResponseEntity<?> getSettings(Principal principal) {
        AppUser user = getUser(principal);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(crossfadeService.getSettings(user.getId()));
    }

    @PutMapping("/settings")
    public ResponseEntity<?> updateSettings(@RequestBody CrossfadeSettings settings, Principal principal) {
        AppUser user = getUser(principal);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(crossfadeService.updateSettings(user.getId(), settings));
    }

    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeTransition(
            @RequestParam int fromSongId,
            @RequestParam int toSongId,
            Principal principal) {
        AppUser user = getUser(principal);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        CrossfadeResponse res = crossfadeService.analyzeTransition(user.getId(), fromSongId, toSongId);
        return ResponseEntity.ok(res);
    }
}
