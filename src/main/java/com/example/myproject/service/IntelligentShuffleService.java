package com.example.myproject.service;

import com.example.myproject.model.Fav;
import com.example.myproject.model.Music;
import com.example.myproject.model.PlayHistory;
import com.example.myproject.repository.FavRepository;
import com.example.myproject.repository.MusicRepository;
import com.example.myproject.repository.PlayHistoryRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class IntelligentShuffleService {

    private final MusicRepository musicRepository;
    private final PlayHistoryRepository playHistoryRepository;
    private final FavRepository favRepository;

    public IntelligentShuffleService(MusicRepository musicRepository, PlayHistoryRepository playHistoryRepository, FavRepository favRepository) {
        this.musicRepository = musicRepository;
        this.playHistoryRepository = playHistoryRepository;
        this.favRepository = favRepository;
    }

    public List<Music> generateSmartShuffle(Long userId) {
        if (userId == null) {
            return Collections.emptyList();
        }

        List<Music> allSongs = musicRepository.findByUserId(userId);
        if (allSongs.isEmpty()) {
            return Collections.emptyList();
        }

        List<PlayHistory> history = playHistoryRepository.findByUserIdOrderByPlayedAtDesc(userId);
        Set<Long> favoriteSongIds = favRepository.findByUserId(userId).stream()
                .map(Fav::getSongId)
                .collect(Collectors.toSet());

        // Extract context from recent history (last 10 songs)
        List<PlayHistory> recentHistory = history.stream().limit(10).collect(Collectors.toList());
        Set<String> recentGenres = new HashSet<>();
        Set<String> recentArtists = new HashSet<>();
        Set<Long> recentlyPlayedIds = new HashSet<>();

        List<Long> recentSongIds = recentHistory.stream()
                .map(PlayHistory::getSongId)
                .distinct()
                .collect(Collectors.toList());

        Map<Long, Music> recentSongsMap = musicRepository.findAllById(recentSongIds).stream()
                .collect(Collectors.toMap(Music::getId, m -> m, (existing, replacement) -> existing));

        for (PlayHistory ph : recentHistory) {
            recentlyPlayedIds.add(ph.getSongId());
            Music m = recentSongsMap.get(ph.getSongId());
            if (m != null) {
                if (m.getGenre() != null) recentGenres.add(m.getGenre());
                if (m.getArtist() != null) recentArtists.add(m.getArtist());
            }
        }

        // Score each song
        Map<Music, Double> scores = new HashMap<>();
        Random random = new Random();

        for (Music song : allSongs) {
            double score = 0.0;

            // Penalty for recently played
            if (recentlyPlayedIds.contains(song.getId())) {
                score -= 50.0; // Big penalty
            }

            // Bonus for favorites
            if (favoriteSongIds.contains(song.getId())) {
                score += 20.0;
            }

            // Bonus for matching recent context
            if (song.getGenre() != null && recentGenres.contains(song.getGenre())) {
                score += 15.0;
            }
            if (song.getArtist() != null && recentArtists.contains(song.getArtist())) {
                score += 10.0;
            }

            // Add a small random factor to prevent the exact same sequence every time
            score += random.nextDouble() * 5.0;

            scores.put(song, score);
        }

        // Sort by score descending
        return scores.entrySet().stream()
                .sorted(Map.Entry.<Music, Double>comparingByValue().reversed())
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }
}
