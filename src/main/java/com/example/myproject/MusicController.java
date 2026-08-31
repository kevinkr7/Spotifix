package com.example.myproject;

import com.example.myproject.model.Music;
import com.example.myproject.repository.MusicRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;

import com.example.myproject.dto.SearchResultDTO;
import com.example.myproject.service.SearchService;
import com.example.myproject.service.IntelligentShuffleService;
import com.example.myproject.model.PlayHistory;
import com.example.myproject.repository.PlayHistoryRepository;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
public class MusicController {

    private final MusicRepository musicRepository;
    private final SearchService searchService;
    private final IntelligentShuffleService intelligentShuffleService;
    private final PlayHistoryRepository playHistoryRepository;

    public MusicController(MusicRepository musicRepository, SearchService searchService, IntelligentShuffleService intelligentShuffleService, PlayHistoryRepository playHistoryRepository) {
        this.musicRepository = musicRepository;
        this.searchService = searchService;
        this.intelligentShuffleService = intelligentShuffleService;
        this.playHistoryRepository = playHistoryRepository;
    }

    @GetMapping("/songs")
    public List<Music> displayAllSongs(HttpSession session){
        return musicRepository.findByUserId(getUserId(session));
    }

    @PostMapping("/songs")
    public Music addSong(@ModelAttribute Music music,
                         @RequestParam("file") MultipartFile file,
                         HttpSession session) {

        try {
            String uploadDir = "uploads/";
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String fileName = file.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);

            Files.write(filePath, file.getBytes());

            music.setAudio_url(fileName);
        } catch (IOException e) {
            e.printStackTrace();
        }

        music.setUserId(getUserId(session));
        return musicRepository.save(music);
    }

    @GetMapping("/search/ai")
    public List<SearchResultDTO> aiSearch(@RequestParam String q, HttpSession session) {
        getUserId(session); // Require login
        return searchService.search(q);
    }

    @PostMapping("/shuffle/intelligent")
    public List<Music> getIntelligentShuffle(HttpSession session) {
        Long userId = getUserId(session);
        return intelligentShuffleService.generateSmartShuffle(userId);
    }

    @PostMapping("/history/{songId}")
    public void recordPlayHistory(@PathVariable long songId, HttpSession session) {
        Long userId = getUserId(session);
        PlayHistory history = new PlayHistory();
        history.setUserId(userId);
        history.setSongId(songId);
        history.setPlayedAt(LocalDateTime.now());
        playHistoryRepository.save(history);
    }


    @GetMapping("/songs/mood/{mood}")
    public List<Music> getSongsByMood(@PathVariable String mood, HttpSession session){
        return musicRepository.findByMoodAndUserId(mood, getUserId(session));
    }

    @DeleteMapping("/songs/{id}")
    public void deleteSong(@PathVariable int id, HttpSession session){
        Long userId = getUserId(session);
        Music song = musicRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Song not found."));

        if (!userId.equals(song.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed to delete this song.");
        }

        musicRepository.deleteById(id);
    }

    private Long getUserId(HttpSession session) {
        Object userId = session.getAttribute("userId");
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required.");
        }

        if (userId instanceof Long id) {
            return id;
        }

        if (userId instanceof Integer id) {
            return id.longValue();
        }

        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid session.");
    }

    @Configuration
    public class WebConfig implements WebMvcConfigurer {

        @Override
        public void addResourceHandlers(ResourceHandlerRegistry registry) {
            Path uploadDir = Paths.get("uploads");
            String uploadPath = uploadDir.toFile().getAbsolutePath();

            registry.addResourceHandler("/uploads/**")
                    .addResourceLocations("file:" + uploadPath + "/");
        }
    }
}
