package com.example.myproject.controller;

import com.example.myproject.model.AppUser;
import com.example.myproject.repository.AppUserRepository;
import com.example.myproject.service.ListeningAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/analytics")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AnalyticsController {

    @Autowired
    private ListeningAnalyticsService analyticsService;

    @Autowired
    private AppUserRepository userRepo;

    private AppUser getUser(Principal principal) {
        if (principal == null) return null;
        return userRepo.findByUsername(principal.getName()).orElse(null);
    }

    @GetMapping("/weekly")
    public ResponseEntity<?> getWeeklyInsights(Principal principal) {
        AppUser user = getUser(principal);
        if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(analyticsService.getWeeklyInsights(user.getId()));
    }
}
