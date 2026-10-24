package com.example.myproject.service;

import com.example.myproject.model.Music;
import com.example.myproject.repository.MusicRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class LyricsService {

    private static final Pattern LRC_PATTERN = Pattern.compile("^\\[(\\d{1,2}):(\\d{2}(?:\\.\\d{1,3})?)\\](.*)$");

    private final MusicRepository musicRepository;

    public LyricsService(MusicRepository musicRepository) {
        this.musicRepository = musicRepository;
    }

    public static class LyricLine {
        public double time;
        public String text;

        public LyricLine(double time, String text) {
            this.time = time;
            this.text = text;
        }

        public double getTime() {
            return time;
        }

        public String getText() {
            return text;
        }
    }

    public List<LyricLine> getLyrics(Long songId, Long userId) {
        if (songId == null || userId == null) {
            return Collections.emptyList();
        }

        Music song = musicRepository.findByIdAndUserId(songId, userId).orElse(null);
        if (song == null || song.getLyrics() == null || song.getLyrics().isBlank()) {
            return Collections.emptyList();
        }

        return parseLyrics(song.getLyrics());
    }

    /**
     * @deprecated Use {@link #getLyrics(Long, Long)} to enforce user data isolation.
     * This method does not verify user ownership and is retained only for backward compatibility.
     */
    @Deprecated
    public List<LyricLine> getLyrics(Long songId) {
        if (songId == null) {
            return Collections.emptyList();
        }

        Music song = musicRepository.findById(songId).orElse(null);
        if (song == null || song.getLyrics() == null || song.getLyrics().isBlank()) {
            return Collections.emptyList();
        }

        return parseLyrics(song.getLyrics());
    }

    private List<LyricLine> parseLyrics(String rawLyrics) {
        List<LyricLine> lines = new ArrayList<>();
        String[] split = rawLyrics.split("\\r?\\n");
        double currentTime = 0.0;

        for (String rawLine : split) {
            String trimmed = rawLine.trim();
            if (trimmed.isEmpty()) {
                continue;
            }

            Matcher matcher = LRC_PATTERN.matcher(trimmed);
            if (matcher.matches()) {
                try {
                    double minutes = Double.parseDouble(matcher.group(1));
                    double seconds = Double.parseDouble(matcher.group(2));
                    double timestamp = (minutes * 60.0) + seconds;
                    String lyricText = matcher.group(3).trim();
                    lines.add(new LyricLine(timestamp, lyricText));
                } catch (NumberFormatException ignored) {
                    lines.add(new LyricLine(currentTime, trimmed));
                    currentTime += 4.0;
                }
            } else {
                lines.add(new LyricLine(currentTime, trimmed));
                currentTime += 4.0;
            }
        }

        return lines;
    }
}
