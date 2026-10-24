package com.example.myproject;

import com.example.myproject.dto.SearchResultDTO;
import com.example.myproject.model.Music;
import com.example.myproject.model.PlayHistory;
import com.example.myproject.repository.MusicRepository;
import com.example.myproject.repository.PlayHistoryRepository;
import com.example.myproject.service.IntelligentShuffleService;
import com.example.myproject.service.SearchService;
import com.example.myproject.util.SessionUtil;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
public class MusicController {

    private static final Set<String> ALLOWED_AUDIO_EXTENSIONS = Set.of(
            ".mp3", ".wav", ".ogg", ".flac", ".m4a", ".aac"
    );

    private static final long MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

    @Value("${spotifix.upload.dir:uploads}")
    private String uploadDir;

    private final MusicRepository musicRepository;
    private final SearchService searchService;
    private final IntelligentShuffleService intelligentShuffleService;
    private final PlayHistoryRepository playHistoryRepository;

    public MusicController(MusicRepository musicRepository,
                           SearchService searchService,
                           IntelligentShuffleService intelligentShuffleService,
                           PlayHistoryRepository playHistoryRepository) {
        this.musicRepository = musicRepository;
        this.searchService = searchService;
        this.intelligentShuffleService = intelligentShuffleService;
        this.playHistoryRepository = playHistoryRepository;
    }

    @GetMapping("/songs")
    public List<Music> displayAllSongs(HttpSession session) {
        Long userId = SessionUtil.requireUserId(session);
        return musicRepository.findByUserId(userId);
    }

    @PostMapping("/songs")
    public Music addSong(@ModelAttribute Music music,
                         @RequestParam("file") MultipartFile file,
                         HttpSession session) {
        // Enforce authentication BEFORE any filesystem operation
        Long userId = SessionUtil.requireUserId(session);

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "An audio file is required.");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "File size exceeds the 20MB limit.");
        }

        String rawOriginalFilename = file.getOriginalFilename();
        if (rawOriginalFilename == null || rawOriginalFilename.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File name must not be empty.");
        }

        // Sanitize original filename (strip directories to prevent path traversal)
        String cleanOriginalName = Paths.get(rawOriginalFilename).getFileName().toString();
        int dotIndex = cleanOriginalName.lastIndexOf('.');
        if (dotIndex == -1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File must have an audio extension.");
        }

        String extension = cleanOriginalName.substring(dotIndex).toLowerCase(Locale.ROOT);
        if (!ALLOWED_AUDIO_EXTENSIONS.contains(extension)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Unsupported audio format. Allowed: " + ALLOWED_AUDIO_EXTENSIONS);
        }

        // Validate MIME type and deep byte signatures
        validateAudioFile(file, extension);

        // Generate safe server-side UUID filename
        String storedFilename = UUID.randomUUID().toString() + extension;
        Path baseUploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Path destination = baseUploadPath.resolve(storedFilename).normalize();

        // Prevent path traversal escapes
        if (!destination.startsWith(baseUploadPath)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file storage path.");
        }

        try {
            if (!Files.exists(baseUploadPath)) {
                Files.createDirectories(baseUploadPath);
            }
            Files.write(destination, file.getBytes());
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store uploaded audio file.");
        }

        try {
            music.setUserId(userId);
            music.setAudio_url(storedFilename);

            if (music.getTitle() == null || music.getTitle().isBlank()) {
                music.setTitle(cleanOriginalName.substring(0, dotIndex));
            }

            return musicRepository.save(music);
        } catch (Exception e) {
            // Delete file on database failure to avoid orphan files
            try {
                Files.deleteIfExists(destination);
            } catch (IOException ignored) {}
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to save song record.");
        }
    }

    private void validateAudioFile(MultipartFile file, String extension) {
        if (file.getSize() == 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Audio file is empty.");
        }

        // Verify MIME type header if provided
        String contentType = file.getContentType();
        if (contentType != null && !contentType.isBlank()) {
            String lowerType = contentType.toLowerCase(Locale.ROOT);
            if (!lowerType.startsWith("audio/") && !lowerType.equals("application/octet-stream")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File content is not recognized as audio.");
            }
        }

        // Inspect actual file bytes (magic numbers) to prevent file signature mismatch or spoofing
        byte[] header = new byte[Math.min(64, (int) file.getSize())];
        try (InputStream is = file.getInputStream()) {
            int bytesRead = is.read(header);
            if (bytesRead < 4) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Audio file is too small or truncated.");
            }
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unable to read audio file header.");
        }

        // Block known dangerous binary / script file signatures immediately
        if (isExecutableOrScript(header)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Executable or script files are strictly prohibited.");
        }

        // Validate that bytes match the declared audio extension
        boolean validSignature = matchesAudioSignature(header, extension);
        if (!validSignature) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "File signature does not match the declared " + extension + " audio format.");
        }
    }

    private boolean isExecutableOrScript(byte[] h) {
        if (h.length >= 2 && h[0] == 'M' && h[1] == 'Z') return true; // DOS/Windows PE
        if (h.length >= 4 && h[0] == 0x7F && h[1] == 'E' && h[2] == 'L' && h[3] == 'F') return true; // ELF
        if (h.length >= 2 && h[0] == '#' && h[1] == '!') return true; // Shebang script
        if (h.length >= 4 && h[0] == 'P' && h[1] == 'K' && h[2] == 0x03 && h[3] == 0x04) return true; // ZIP/JAR
        if (h.length >= 4 && h[0] == '%' && h[1] == 'P' && h[2] == 'D' && h[3] == 'F') return true; // PDF
        if (h.length >= 1 && (h[0] == '<' || h[0] == '{')) return true; // HTML/XML/JSON
        return false;
    }

    private boolean matchesAudioSignature(byte[] h, String ext) {
        switch (ext) {
            case ".mp3":
                // ID3v2 tag (ID3)
                if (h.length >= 3 && h[0] == 'I' && h[1] == 'D' && h[2] == '3') {
                    return true;
                }
                // MPEG audio frame sync word (0xFF followed by 111b in high 3 bits)
                if (h.length >= 2 && (h[0] & 0xFF) == 0xFF && (h[1] & 0xE0) == 0xE0) {
                    return true;
                }
                return false;

            case ".wav":
                // RIFF container with WAVE format
                if (h.length >= 12) {
                    boolean isRiff = h[0] == 'R' && h[1] == 'I' && h[2] == 'F' && h[3] == 'F';
                    boolean isWave = h[8] == 'W' && h[9] == 'A' && h[10] == 'V' && h[11] == 'E';
                    return isRiff && isWave;
                }
                return false;

            case ".ogg":
                // OggS container
                return h.length >= 4 && h[0] == 'O' && h[1] == 'g' && h[2] == 'g' && h[3] == 'S';

            case ".flac":
                // fLaC marker
                return h.length >= 4 && h[0] == 'f' && h[1] == 'L' && h[2] == 'a' && h[3] == 'C';

            case ".m4a":
                // ISO Base Media File Format: bytes 4..7 'ftyp'
                if (h.length >= 8) {
                    return h[4] == 'f' && h[5] == 't' && h[6] == 'y' && h[7] == 'p';
                }
                return false;

            case ".aac":
                // ADTS frame header (0xFF followed by 0xF0..0xFF)
                if (h.length >= 2 && (h[0] & 0xFF) == 0xFF && (h[1] & 0xF0) == 0xF0) {
                    return true;
                }
                // Or ID3v2 tag on AAC stream
                if (h.length >= 3 && h[0] == 'I' && h[1] == 'D' && h[2] == '3') {
                    return true;
                }
                return false;

            default:
                return false;
        }
    }

    @GetMapping("/search/ai")
    public List<SearchResultDTO> aiSearch(@RequestParam String q, HttpSession session) {
        Long userId = SessionUtil.requireUserId(session);
        return searchService.search(q, userId);
    }

    @PostMapping("/shuffle/intelligent")
    public List<Music> getIntelligentShuffle(HttpSession session) {
        Long userId = SessionUtil.requireUserId(session);
        return intelligentShuffleService.generateSmartShuffle(userId);
    }

    @PostMapping("/history/{songId}")
    public void recordPlayHistory(@PathVariable Long songId, HttpSession session) {
        Long userId = SessionUtil.requireUserId(session);

        if (!musicRepository.existsByIdAndUserId(songId, userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Song not found.");
        }

        PlayHistory history = new PlayHistory();
        history.setUserId(userId);
        history.setSongId(songId);
        history.setPlayedAt(LocalDateTime.now());
        playHistoryRepository.save(history);
    }

    @GetMapping("/songs/mood/{mood}")
    public List<Music> getSongsByMood(@PathVariable String mood, HttpSession session) {
        Long userId = SessionUtil.requireUserId(session);
        return musicRepository.findByMoodAndUserId(mood, userId);
    }

    @DeleteMapping("/songs/{id}")
    public void deleteSong(@PathVariable Long id, HttpSession session) {
        Long userId = SessionUtil.requireUserId(session);
        Music song = musicRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Song not found."));

        if (!userId.equals(song.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed to delete this song.");
        }

        // Clean up file from disk
        if (song.getAudio_url() != null) {
            try {
                Path baseUploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
                Path filePath = baseUploadPath.resolve(song.getAudio_url()).normalize();
                if (filePath.startsWith(baseUploadPath)) {
                    Files.deleteIfExists(filePath);
                }
            } catch (IOException ignored) {}
        }

        musicRepository.delete(song);
    }
}
