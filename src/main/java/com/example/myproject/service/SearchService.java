package com.example.myproject.service;

import com.example.myproject.dto.SearchResultDTO;
import com.example.myproject.model.Music;
import com.example.myproject.repository.MusicRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SearchService {

    private final MusicRepository musicRepository;

    public SearchService(MusicRepository musicRepository) {
        this.musicRepository = musicRepository;
    }

    public List<SearchResultDTO> search(String query) {
        return search(query, null);
    }

    public List<SearchResultDTO> search(String query, Long userId) {
        if (query == null || query.trim().isEmpty() || userId == null) {
            return new ArrayList<>();
        }

        String q = query.toLowerCase().trim();
        List<Music> allMusic = musicRepository.findByUserId(userId);
        List<SearchResultDTO> results = new ArrayList<>();

        for (Music music : allMusic) {
            double score = 0;
            String reason = "";

            if (music.getTitle() != null && music.getTitle().toLowerCase().contains(q)) {
                score += 50;
                reason = "Matched Title";
            } else if (music.getArtist() != null && music.getArtist().toLowerCase().contains(q)) {
                score += 40;
                reason = "Matched Artist";
            } else if (music.getGenre() != null && music.getGenre().toLowerCase().contains(q)) {
                score += 30;
                reason = "Matched Genre";
            } else if (music.getMood() != null && music.getMood().toLowerCase().contains(q)) {
                score += 25;
                reason = "Matched Mood";
            } else if (music.getLanguage() != null && music.getLanguage().toLowerCase().contains(q)) {
                score += 20;
                reason = "Matched Language";
            } else if (music.getLyrics() != null && music.getLyrics().toLowerCase().contains(q)) {
                score += 15;
                reason = "Matched Lyrics: '..." + extractSnippet(music.getLyrics(), q) + "...'";
            }

            if (score > 0) {
                results.add(new SearchResultDTO(music, score, reason));
            }
        }

        // Sort by confidence score descending
        return results.stream()
                .sorted(Comparator.comparingDouble(SearchResultDTO::getConfidenceScore).reversed())
                .collect(Collectors.toList());
    }

    private String extractSnippet(String lyrics, String query) {
        int index = lyrics.toLowerCase().indexOf(query);
        if (index == -1) return query;
        int start = Math.max(0, index - 20);
        int end = Math.min(lyrics.length(), index + query.length() + 20);
        return lyrics.substring(start, end).replace("\n", " ").trim();
    }
}
