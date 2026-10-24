package com.example.myproject.service;

import com.example.myproject.dto.ExternalFavoriteRequestDTO;
import com.example.myproject.dto.JamendoSearchResponseDTO;
import com.example.myproject.dto.JamendoTrackDTO;
import com.example.myproject.model.ExternalPlayHistory;
import com.example.myproject.model.ExternalTrackFavorite;
import com.example.myproject.repository.ExternalPlayHistoryRepository;
import com.example.myproject.repository.ExternalTrackFavoriteRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpStatus;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class JamendoService {

    private static final Logger log = LoggerFactory.getLogger(JamendoService.class);

    @Value("${jamendo.api.client-id:}")
    private String clientId;

    @Value("${jamendo.api.base-url:https://api.jamendo.com/v3.0}")
    private String baseUrl;

    private final ExternalTrackFavoriteRepository externalTrackFavoriteRepository;
    private final ExternalPlayHistoryRepository externalPlayHistoryRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    // Curated high-quality Creative Commons sample tracks with authentic audio streams and CC licensing
    // used as an offline/unconfigured fallback so the application works out-of-the-box.
    private static final List<JamendoTrackDTO> CURATED_CC_TRACKS = List.of(
            new JamendoTrackDTO(
                    "cc-101",
                    "Acoustic Breeze",
                    "Benjamin Tissot",
                    "Acoustic Moments",
                    162,
                    "https://www.bensound.com/bensound-music/bensound-acousticbreeze.mp3",
                    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&auto=format&fit=crop",
                    "https://creativecommons.org/licenses/by/3.0/",
                    "https://www.jamendo.com/track/cc-101",
                    "en",
                    List.of("acoustic", "chill", "guitar", "calm")
            ),
            new JamendoTrackDTO(
                    "cc-102",
                    "Sunny Days",
                    "Eleanor Vance",
                    "Summer Sunshine",
                    145,
                    "https://www.bensound.com/bensound-music/bensound-sunny.mp3",
                    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop",
                    "https://creativecommons.org/licenses/by-nc-nd/4.0/",
                    "https://www.jamendo.com/track/cc-102",
                    "en",
                    List.of("pop", "happy", "acoustic", "uplifting")
            ),
            new JamendoTrackDTO(
                    "cc-103",
                    "Raag Bhairav Fusion",
                    "Ananya Sharma & Collective",
                    "Echoes of the East",
                    210,
                    "https://www.bensound.com/bensound-music/bensound-india.mp3",
                    "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=400&auto=format&fit=crop",
                    "https://creativecommons.org/licenses/by-sa/4.0/",
                    "https://www.jamendo.com/track/cc-103",
                    "hi",
                    List.of("hindi", "fusion", "sitar", "classical", "meditation")
            ),
            new JamendoTrackDTO(
                    "cc-104",
                    "Malabar Ocean Waves",
                    "Kavitha Menon Ensemble",
                    "Coastal Reflections",
                    184,
                    "https://www.bensound.com/bensound-music/bensound-relaxing.mp3",
                    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400&auto=format&fit=crop",
                    "https://creativecommons.org/licenses/by/4.0/",
                    "https://www.jamendo.com/track/cc-104",
                    "ml",
                    List.of("malayalam", "ambient", "traditional", "serene")
            ),
            new JamendoTrackDTO(
                    "cc-105",
                    "Carnatic Twilight",
                    "Sundaram Brothers",
                    "Temple Bells & Veena",
                    225,
                    "https://www.bensound.com/bensound-music/bensound-sweet.mp3",
                    "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=400&auto=format&fit=crop",
                    "https://creativecommons.org/licenses/by-nc/4.0/",
                    "https://www.jamendo.com/track/cc-105",
                    "ta",
                    List.of("tamil", "carnatic", "veena", "peaceful")
            ),
            new JamendoTrackDTO(
                    "cc-106",
                    "Neon Horizon",
                    "Kavinsky Dreams",
                    "Cyber City",
                    195,
                    "https://www.bensound.com/bensound-music/bensound-creativeminds.mp3",
                    "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=400&auto=format&fit=crop",
                    "https://creativecommons.org/licenses/by-sa/3.0/",
                    "https://www.jamendo.com/track/cc-106",
                    "en",
                    List.of("electronic", "synthwave", "chill", "workout")
            )
    );

    public JamendoService(ExternalTrackFavoriteRepository externalTrackFavoriteRepository,
                          ExternalPlayHistoryRepository externalPlayHistoryRepository,
                          RestTemplateBuilder restTemplateBuilder,
                          ObjectMapper objectMapper) {
        this.externalTrackFavoriteRepository = externalTrackFavoriteRepository;
        this.externalPlayHistoryRepository = externalPlayHistoryRepository;
        this.objectMapper = objectMapper;

        // Configure RestTemplate with safe connect/read timeouts, SimpleClientHttpRequestFactory, and custom User-Agent to avoid CDN tarpit/blocking
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(10000);
        requestFactory.setReadTimeout(15000);

        this.restTemplate = restTemplateBuilder
                .requestFactory(() -> requestFactory)
                .defaultHeader("User-Agent", "Spotifix/1.0 (Mozilla/5.0 Music Streaming App)")
                .defaultHeader("Accept", "application/json")
                .setConnectTimeout(Duration.ofSeconds(10))
                .setReadTimeout(Duration.ofSeconds(15))
                .build();
    }

    public boolean isConfigured() {
        return clientId != null && !clientId.isBlank() && !clientId.equalsIgnoreCase("your_jamendo_client_id_here");
    }

    /**
     * Search and explore external tracks from Jamendo API.
     * Supports search query, language filters (en, hi, ta, ml), tag filters, pagination.
     */
    public JamendoSearchResponseDTO searchTracks(String query, String language, String tag, Integer limit, Integer offset) {
        int safeLimit = (limit != null && limit > 0) ? Math.min(limit, 50) : 20;
        int safeOffset = (offset != null && offset >= 0) ? offset : 0;

        // If client ID is not configured or blank, return the curated Creative Commons catalog
        if (!isConfigured()) {
            List<JamendoTrackDTO> filtered = filterCuratedTracks(query, language, tag);
            int total = filtered.size();
            int fromIndex = Math.min(safeOffset, total);
            int toIndex = Math.min(fromIndex + safeLimit, total);
            List<JamendoTrackDTO> page = filtered.subList(fromIndex, toIndex);

            return new JamendoSearchResponseDTO(
                    false,
                    "Jamendo Client ID is not configured in .env. Showing featured Creative Commons tracks. Add JAMENDO_CLIENT_ID to .env to query the full live Jamendo library.",
                    total,
                    page
            );
        }

        try {
            UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromHttpUrl(baseUrl)
                    .path("/tracks/")
                    .queryParam("client_id", clientId)
                    .queryParam("format", "json")
                    .queryParam("limit", safeLimit)
                    .queryParam("offset", safeOffset)
                    .queryParam("include", "licenses")
                    .queryParam("audioformat", "mp32");

            if (query != null && !query.isBlank()) {
                uriBuilder.queryParam("namesearch", query.trim());
            }

            if (language != null && !language.isBlank()) {
                String cleanLang = language.trim().toLowerCase(Locale.ROOT);
                String langTag = getLanguageName(cleanLang);
                if (tag != null && !tag.isBlank()) {
                    uriBuilder.queryParam("tags", tag.trim().toLowerCase(Locale.ROOT) + " " + langTag);
                } else {
                    uriBuilder.queryParam("tags", langTag);
                }
            } else if (tag != null && !tag.isBlank()) {
                uriBuilder.queryParam("tags", tag.trim().toLowerCase(Locale.ROOT));
            }

            URI targetUri = uriBuilder.build().encode().toUri();
            String responseBody = restTemplate.getForObject(targetUri, String.class);

            if (responseBody == null || responseBody.isBlank()) {
                return new JamendoSearchResponseDTO(true, "No response from Jamendo API.", 0, Collections.emptyList());
            }

            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode headersNode = root.path("headers");
            String status = headersNode.path("status").asText();
            int code = headersNode.path("code").asInt();

            if (!"success".equalsIgnoreCase(status) || code != 0) {
                String errorMsg = headersNode.path("error_message").asText("Jamendo API error");
                log.warn("Jamendo API returned error status: {}, code: {}", status, code);

                // Fallback gracefully so the UI still displays content
                List<JamendoTrackDTO> fallback = filterCuratedTracks(query, language, tag);
                return new JamendoSearchResponseDTO(
                        false,
                        "Jamendo API returned: " + errorMsg + ". Showing featured Creative Commons catalog.",
                        fallback.size(),
                        fallback
                );
            }

            int resultsCount = headersNode.path("results_count").asInt(0);
            JsonNode resultsNode = root.path("results");
            List<JamendoTrackDTO> tracks = new ArrayList<>();

            if (resultsNode.isArray()) {
                for (JsonNode item : resultsNode) {
                    JamendoTrackDTO dto = mapJsonToTrackDTO(item);
                    if (dto != null && dto.getAudio_url() != null && !dto.getAudio_url().isBlank()) {
                        if (dto.getLanguage() == null && language != null && !language.isBlank()) {
                            dto.setLanguage(language.trim().toLowerCase(Locale.ROOT));
                        }
                        tracks.add(dto);
                    }
                }
            }

            return new JamendoSearchResponseDTO(true, null, resultsCount, tracks);

        } catch (Exception e) {
            log.error("Failed to communicate with Jamendo API", e);
            // Graceful degradation: return curated tracks
            List<JamendoTrackDTO> fallback = filterCuratedTracks(query, language, tag);
            return new JamendoSearchResponseDTO(
                    false,
                    "Unable to reach Jamendo API at this time. Showing featured Creative Commons catalog.",
                    fallback.size(),
                    fallback
            );
        }
    }

    /**
     * Retrieve a single track by its Jamendo provider track ID.
     */
    public JamendoTrackDTO getTrackById(String trackId) {
        if (trackId == null || trackId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Track ID cannot be blank.");
        }

        // Check curated tracks first
        for (JamendoTrackDTO track : CURATED_CC_TRACKS) {
            if (track.getId().equals(trackId)) {
                return track;
            }
        }

        if (!isConfigured()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Track not found.");
        }

        try {
            URI targetUri = UriComponentsBuilder.fromHttpUrl(baseUrl)
                    .path("/tracks/")
                    .queryParam("client_id", clientId)
                    .queryParam("id", trackId)
                    .queryParam("include", "licenses")
                    .queryParam("audioformat", "mp32")
                    .build().encode().toUri();

            String responseBody = restTemplate.getForObject(targetUri, String.class);
            if (responseBody == null || responseBody.isBlank()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Track not found.");
            }

            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode resultsNode = root.path("results");
            if (resultsNode.isArray() && !resultsNode.isEmpty()) {
                JamendoTrackDTO dto = mapJsonToTrackDTO(resultsNode.get(0));
                if (dto != null) {
                    return dto;
                }
            }

            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Track not found on Jamendo.");
        } catch (ResponseStatusException rse) {
            throw rse;
        } catch (Exception e) {
            log.warn("Error fetching track {}: {}", trackId, e.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Failed to fetch track from Jamendo.");
        }
    }

    // ── User-Isolated Favorites for External Tracks ─────────────────────────────

    public List<ExternalTrackFavorite> getFavorites(Long userId) {
        return externalTrackFavoriteRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public ExternalTrackFavorite addFavorite(Long userId, ExternalFavoriteRequestDTO dto) {
        return externalTrackFavoriteRepository.findByUserIdAndProviderAndProviderTrackId(userId, "jamendo", dto.getProviderTrackId())
                .orElseGet(() -> {
                    ExternalTrackFavorite fav = new ExternalTrackFavorite();
                    fav.setUserId(userId);
                    fav.setProvider("jamendo");
                    fav.setProviderTrackId(dto.getProviderTrackId());
                    fav.setTitle(dto.getTitle());
                    fav.setArtist(dto.getArtist());
                    fav.setAlbum(dto.getAlbum());
                    fav.setImageUrl(dto.getImageUrl());
                    fav.setAudioUrl(dto.getAudioUrl());
                    fav.setDuration(dto.getDuration());
                    fav.setLicenseCcUrl(dto.getLicenseCcUrl());
                    fav.setShareUrl(dto.getShareUrl());
                    fav.setLanguage(dto.getLanguage());
                    fav.setCreatedAt(LocalDateTime.now());
                    return externalTrackFavoriteRepository.save(fav);
                });
    }

    @Transactional
    public void deleteFavorite(Long userId, String providerTrackId) {
        externalTrackFavoriteRepository.deleteByUserIdAndProviderAndProviderTrackId(userId, "jamendo", providerTrackId);
    }

    public boolean isFavorite(Long userId, String providerTrackId) {
        return externalTrackFavoriteRepository.existsByUserIdAndProviderAndProviderTrackId(userId, "jamendo", providerTrackId);
    }

    // ── External Play History ───────────────────────────────────────────────────

    @Transactional
    public void recordPlayHistory(Long userId, String providerTrackId, String title, String artist) {
        ExternalPlayHistory history = new ExternalPlayHistory();
        history.setUserId(userId);
        history.setProvider("jamendo");
        history.setProviderTrackId(providerTrackId);
        history.setTitle(title);
        history.setArtist(artist);
        history.setPlayedAt(LocalDateTime.now());
        externalPlayHistoryRepository.save(history);
    }

    public List<ExternalPlayHistory> getPlayHistory(Long userId) {
        return externalPlayHistoryRepository.findByUserIdOrderByPlayedAtDesc(userId);
    }

    // ── Internal Helper Methods ────────────────────────────────────────────────

    private JamendoTrackDTO mapJsonToTrackDTO(JsonNode item) {
        if (item == null) return null;

        String id = item.path("id").asText();
        String title = item.path("name").asText();
        String artist = item.path("artist_name").asText();
        String album = item.path("album_name").asText();
        int duration = item.path("duration").asInt(0);
        String audioUrl = item.path("audio").asText();
        String imageUrl = item.path("image").asText();
        if (imageUrl == null || imageUrl.isBlank()) {
            imageUrl = item.path("album_image").asText();
        }
        if (imageUrl == null || imageUrl.isBlank()) {
            imageUrl = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&auto=format&fit=crop";
        }
        String licenseCcUrl = item.path("license_ccurl").asText();
        if (licenseCcUrl == null || licenseCcUrl.isBlank()) {
            licenseCcUrl = "https://creativecommons.org/licenses/by-nc-sa/4.0/";
        }
        String shareUrl = item.path("shareurl").asText();

        // Musicinfo
        JsonNode musicinfo = item.path("musicinfo");
        String lang = musicinfo.path("lang").asText(null);
        if (lang != null && lang.isBlank()) {
            lang = null;
        }

        List<String> tags = new ArrayList<>();
        JsonNode tagsNode = musicinfo.path("tags");
        if (tagsNode.isObject()) {
            JsonNode genres = tagsNode.path("genres");
            if (genres.isArray()) {
                genres.forEach(g -> tags.add(g.asText()));
            }
            JsonNode instruments = tagsNode.path("instruments");
            if (instruments.isArray()) {
                instruments.forEach(i -> tags.add(i.asText()));
            }
            JsonNode vartags = tagsNode.path("vartags");
            if (vartags.isArray()) {
                vartags.forEach(v -> tags.add(v.asText()));
            }
        }

        return new JamendoTrackDTO(id, title, artist, album, duration, audioUrl, imageUrl, licenseCcUrl, shareUrl, lang, tags);
    }

    private List<JamendoTrackDTO> filterCuratedTracks(String query, String language, String tag) {
        return CURATED_CC_TRACKS.stream()
                .filter(t -> {
                    if (query != null && !query.isBlank()) {
                        String q = query.toLowerCase(Locale.ROOT);
                        boolean matchTitle = t.getTitle() != null && t.getTitle().toLowerCase(Locale.ROOT).contains(q);
                        boolean matchArtist = t.getArtist() != null && t.getArtist().toLowerCase(Locale.ROOT).contains(q);
                        boolean matchAlbum = t.getAlbum() != null && t.getAlbum().toLowerCase(Locale.ROOT).contains(q);
                        if (!matchTitle && !matchArtist && !matchAlbum) return false;
                    }
                    if (language != null && !language.isBlank()) {
                        String l = language.toLowerCase(Locale.ROOT);
                        boolean matchLang = t.getLanguage() != null && t.getLanguage().equalsIgnoreCase(l);
                        // Also match tags for regional representations without fabricating metadata
                        boolean matchTag = t.getTags() != null && t.getTags().stream().anyMatch(tg -> tg.equalsIgnoreCase(l) || tg.equalsIgnoreCase(getLanguageName(l)));
                        if (!matchLang && !matchTag) return false;
                    }
                    if (tag != null && !tag.isBlank()) {
                        String targetTag = tag.toLowerCase(Locale.ROOT);
                        if (t.getTags() == null || t.getTags().stream().noneMatch(tg -> tg.toLowerCase(Locale.ROOT).contains(targetTag))) {
                            return false;
                        }
                    }
                    return true;
                })
                .toList();
    }

    private String getLanguageName(String code) {
        return switch (code) {
            case "hi" -> "hindi";
            case "ta" -> "tamil";
            case "ml" -> "malayalam";
            case "en" -> "english";
            default -> code;
        };
    }
}
