package com.example.myproject.controller;

import com.example.myproject.dto.YouTubeSearchResponseDTO;
import com.example.myproject.service.YouTubeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/youtube")
public class YouTubeController {

    private final YouTubeService youtubeService;

    public YouTubeController(YouTubeService youtubeService) {
        this.youtubeService = youtubeService;
    }

    /**
     * Search songs through the official YouTube Data API v3.
     * Accessible publicly; API key and requests are handled exclusively on the backend.
     */
    @GetMapping("/search")
    public ResponseEntity<YouTubeSearchResponseDTO> searchSongs(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String language,
            @RequestParam(required = false, defaultValue = "15") Integer maxResults) {

        YouTubeSearchResponseDTO response = youtubeService.searchSongs(query, language, maxResults);
        return ResponseEntity.ok(response);
    }
}
