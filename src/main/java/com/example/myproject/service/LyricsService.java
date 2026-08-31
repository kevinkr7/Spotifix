package com.example.myproject.service;

import org.springframework.stereotype.Service;
import java.util.Arrays;
import java.util.List;

@Service
public class LyricsService {

    public static class LyricLine {
        public double time;
        public String text;

        public LyricLine(double time, String text) {
            this.time = time;
            this.text = text;
        }
    }

    public List<LyricLine> getLyrics(int songId) {
        // Mock data for karaoke
        return Arrays.asList(
            new LyricLine(2.0, "Yeah, let's go"),
            new LyricLine(5.5, "I've been waiting for this moment"),
            new LyricLine(8.0, "To shine so bright"),
            new LyricLine(11.5, "Like a star in the darkest night"),
            new LyricLine(16.0, "Ooooh yeah!"),
            new LyricLine(20.0, "Don't let me down"),
            new LyricLine(24.0, "We are going to the top of the town")
        );
    }
}
