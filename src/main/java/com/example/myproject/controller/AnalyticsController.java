package com.example.myproject.controller;

import com.example.myproject.service.ListeningAnalyticsService;
import com.example.myproject.util.SessionUtil;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/analytics")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AnalyticsController {

    private final ListeningAnalyticsService analyticsService;

    public AnalyticsController(ListeningAnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/weekly")
    public ResponseEntity<?> getWeeklyInsights(HttpSession session) {
        Long userId = SessionUtil.requireUserId(session);
        return ResponseEntity.ok(analyticsService.getWeeklyInsights(userId));
    }
}
