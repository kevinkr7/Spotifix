package com.example.myproject;

import com.example.myproject.dto.ExternalFavoriteRequestDTO;
import com.example.myproject.dto.JamendoSearchResponseDTO;
import com.example.myproject.dto.JamendoTrackDTO;
import com.example.myproject.model.ExternalPlayHistory;
import com.example.myproject.model.ExternalTrackFavorite;
import com.example.myproject.service.JamendoService;
import com.example.myproject.util.SessionUtil;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/jamendo")
public class JamendoController {

    private final JamendoService jamendoService;

    public JamendoController(JamendoService jamendoService) {
        this.jamendoService = jamendoService;
    }

    /**
     * Search and discover Creative Commons tracks from Jamendo catalog.
     * Publicly accessible, supports search query, language filters (ml, ta, hi, en), tag filters, pagination.
     */
    @GetMapping("/tracks")
    public ResponseEntity<JamendoSearchResponseDTO> searchTracks(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false, defaultValue = "20") Integer limit,
            @RequestParam(required = false, defaultValue = "0") Integer offset) {

        JamendoSearchResponseDTO response = jamendoService.searchTracks(query, language, tag, limit, offset);
        return ResponseEntity.ok(response);
    }

    /**
     * Retrieve a specific track by its Jamendo provider track ID.
     */
    @GetMapping("/tracks/{id}")
    public ResponseEntity<JamendoTrackDTO> getTrackById(@PathVariable String id) {
        JamendoTrackDTO track = jamendoService.getTrackById(id);
        return ResponseEntity.ok(track);
    }

    /**
     * Get all external favorite tracks for the authenticated user.
     */
    @GetMapping("/favorites")
    public ResponseEntity<List<ExternalTrackFavorite>> getFavorites(HttpSession session) {
        Long userId = SessionUtil.requireUserId(session);
        List<ExternalTrackFavorite> favorites = jamendoService.getFavorites(userId);
        return ResponseEntity.ok(favorites);
    }

    /**
     * Add an external track to the authenticated user's favorites.
     */
    @PostMapping("/favorites")
    public ResponseEntity<ExternalTrackFavorite> addFavorite(
            @Valid @RequestBody ExternalFavoriteRequestDTO request,
            HttpSession session) {

        Long userId = SessionUtil.requireUserId(session);
        ExternalTrackFavorite saved = jamendoService.addFavorite(userId, request);
        return ResponseEntity.ok(saved);
    }

    /**
     * Remove an external track from the authenticated user's favorites.
     */
    @DeleteMapping("/favorites/{providerTrackId}")
    public ResponseEntity<Void> removeFavorite(
            @PathVariable String providerTrackId,
            HttpSession session) {

        Long userId = SessionUtil.requireUserId(session);
        jamendoService.deleteFavorite(userId, providerTrackId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Check if a specific external track is favorited by the authenticated user.
     */
    @GetMapping("/favorites/{providerTrackId}/check")
    public ResponseEntity<Map<String, Boolean>> isFavorite(
            @PathVariable String providerTrackId,
            HttpSession session) {

        Long userId = SessionUtil.requireUserId(session);
        boolean isFav = jamendoService.isFavorite(userId, providerTrackId);
        return ResponseEntity.ok(Map.of("isFavorite", isFav));
    }

    /**
     * Record listening history for an external track.
     */
    @PostMapping("/history/{providerTrackId}")
    public ResponseEntity<Void> recordPlayHistory(
            @PathVariable String providerTrackId,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String artist,
            HttpSession session) {

        Long userId = SessionUtil.requireUserId(session);
        jamendoService.recordPlayHistory(userId, providerTrackId, title, artist);
        return ResponseEntity.ok().build();
    }

    /**
     * Get external listening history for the authenticated user.
     */
    @GetMapping("/history")
    public ResponseEntity<List<ExternalPlayHistory>> getHistory(HttpSession session) {
        Long userId = SessionUtil.requireUserId(session);
        List<ExternalPlayHistory> history = jamendoService.getPlayHistory(userId);
        return ResponseEntity.ok(history);
    }
}
