package com.example.myproject;

import com.example.myproject.dto.FavOrderRequest;
import com.example.myproject.model.Fav;
import com.example.myproject.repository.FavRepository;
import com.example.myproject.repository.MusicRepository;
import com.example.myproject.util.SessionUtil;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/favorites")
public class FavController {

    private final FavRepository favRepository;
    private final MusicRepository musicRepository;

    public FavController(FavRepository favRepository, MusicRepository musicRepository) {
        this.favRepository = favRepository;
        this.musicRepository = musicRepository;
    }

    @GetMapping
    public List<Fav> getFavorites(HttpSession session) {
        Long userId = SessionUtil.requireUserId(session);
        return favRepository.findByUserIdOrderBySortOrderAsc(userId);
    }

    @PostMapping("/{songId}")
    public Fav addFavorite(@PathVariable Long songId, HttpSession session) {
        Long userId = SessionUtil.requireUserId(session);

        if (!musicRepository.existsByIdAndUserId(songId, userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Song not found.");
        }

        return favRepository.findByUserIdAndSongId(userId, songId)
                .orElseGet(() -> {
                    Fav favorite = new Fav();
                    favorite.setSongId(songId);
                    favorite.setUserId(userId);
                    favorite.setSortOrder(Integer.MAX_VALUE); // Default to end of list
                    return favRepository.save(favorite);
                });
    }

    @Transactional
    @PatchMapping("/order")
    public void updateOrder(@RequestBody List<FavOrderRequest> orderRequests, HttpSession session) {
        Long userId = SessionUtil.requireUserId(session);
        if (orderRequests == null || orderRequests.isEmpty()) {
            return;
        }

        for (FavOrderRequest request : orderRequests) {
            if (request.getSongId() != null) {
                favRepository.findByUserIdAndSongId(userId, request.getSongId())
                        .ifPresent(fav -> {
                            fav.setSortOrder(request.getSortOrder());
                            favRepository.save(fav);
                        });
            }
        }
    }

    @Transactional
    @DeleteMapping("/{songId}")
    public void deleteFavorite(@PathVariable Long songId, HttpSession session) {
        Long userId = SessionUtil.requireUserId(session);
        favRepository.deleteByUserIdAndSongId(userId, songId);
    }
}

