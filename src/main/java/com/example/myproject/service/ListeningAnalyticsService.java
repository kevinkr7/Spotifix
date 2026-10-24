package com.example.myproject.service;

import com.example.myproject.dto.WeeklyInsightResponse;
import com.example.myproject.model.Music;
import com.example.myproject.model.PlayHistory;
import com.example.myproject.repository.MusicRepository;
import com.example.myproject.repository.PlayHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ListeningAnalyticsService {

    private final PlayHistoryRepository historyRepo;
    private final MusicRepository musicRepo;

    public ListeningAnalyticsService(PlayHistoryRepository historyRepo, MusicRepository musicRepo) {
        this.historyRepo = historyRepo;
        this.musicRepo = musicRepo;
    }

    public WeeklyInsightResponse getWeeklyInsights(Long userId) {
        if (userId == null) {
            WeeklyInsightResponse empty = new WeeklyInsightResponse();
            empty.setSuggestions("Login required.");
            empty.setMoodDistribution(Collections.emptyMap());
            return empty;
        }

        // Query only the last 7 days directly from database
        LocalDateTime oneWeekAgo = LocalDateTime.now().minusDays(7);
        List<PlayHistory> weeklyHistory = historyRepo.findByUserIdAndPlayedAtAfterOrderByPlayedAtDesc(userId, oneWeekAgo);

        WeeklyInsightResponse res = new WeeklyInsightResponse();

        if (weeklyHistory.isEmpty()) {
            res.setSuggestions("Listen to more music this week to get insights!");
            res.setMoodDistribution(new HashMap<>());
            res.setListeningHours(0);
            return res;
        }

        List<Long> songIds = weeklyHistory.stream()
                .map(PlayHistory::getSongId)
                .distinct()
                .collect(Collectors.toList());

        Map<Long, Music> songMap = musicRepo.findAllById(songIds).stream()
                .collect(Collectors.toMap(Music::getId, m -> m, (existing, replacement) -> existing));

        Map<String, Integer> moodCount = new HashMap<>();
        Map<String, Integer> genreCount = new HashMap<>();
        Map<String, Integer> artistCount = new HashMap<>();
        Map<String, Integer> languageCount = new HashMap<>();

        double[] totalDurationSeconds = new double[1];
        Set<java.time.LocalDate> uniqueDays = new HashSet<>();

        for (PlayHistory h : weeklyHistory) {
            if (h.getPlayedAt() != null) {
                uniqueDays.add(h.getPlayedAt().toLocalDate());
            }
            Music song = songMap.get(h.getSongId());
            if (song != null) {
                if (song.getMood() != null) moodCount.put(song.getMood(), moodCount.getOrDefault(song.getMood(), 0) + 1);
                if (song.getGenre() != null) genreCount.put(song.getGenre(), genreCount.getOrDefault(song.getGenre(), 0) + 1);
                if (song.getArtist() != null) artistCount.put(song.getArtist(), artistCount.getOrDefault(song.getArtist(), 0) + 1);
                if (song.getLanguage() != null) languageCount.put(song.getLanguage(), languageCount.getOrDefault(song.getLanguage(), 0) + 1);

                // Approximate 3 minutes (180s) average duration per track
                totalDurationSeconds[0] += 180;
            }
        }

        res.setListeningHours(Math.round((totalDurationSeconds[0] / 3600.0) * 10.0) / 10.0);
        res.setLongestStreak(uniqueDays.size());

        if (!genreCount.isEmpty()) res.setFavoriteGenre(Collections.max(genreCount.entrySet(), Map.Entry.comparingByValue()).getKey());
        if (!artistCount.isEmpty()) res.setFavoriteArtist(Collections.max(artistCount.entrySet(), Map.Entry.comparingByValue()).getKey());
        if (!languageCount.isEmpty()) res.setFavoriteLanguage(Collections.max(languageCount.entrySet(), Map.Entry.comparingByValue()).getKey());

        Map<String, Double> moodDist = new HashMap<>();
        int totalMoods = moodCount.values().stream().mapToInt(Integer::intValue).sum();
        if (totalMoods > 0) {
            for (Map.Entry<String, Integer> entry : moodCount.entrySet()) {
                moodDist.put(entry.getKey(), (double) entry.getValue() / totalMoods);
            }
        }
        res.setMoodDistribution(moodDist);

        if (res.getFavoriteGenre() != null) {
            res.setSuggestions("You've been loving " + res.getFavoriteGenre() + " music this week. We have great new playlists waiting for you!");
        } else {
            res.setSuggestions("Keep exploring new music!");
        }

        return res;
    }
}
