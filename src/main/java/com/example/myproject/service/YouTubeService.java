package com.example.myproject.service;

import com.example.myproject.dto.YouTubeSearchResponseDTO;
import com.example.myproject.dto.YouTubeTrackDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.HtmlUtils;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class YouTubeService {

    private static final Logger log = LoggerFactory.getLogger(YouTubeService.class);

    @Value("${youtube.api.key:}")
    private String apiKey;

    @Value("${youtube.api.base-url:https://www.googleapis.com/youtube/v3}")
    private String baseUrl;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    // In-memory cache for search queries to preserve YouTube API quota (15-minute TTL)
    private final Map<String, CacheEntry> searchCache = new ConcurrentHashMap<>();
    private static final long CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

    private static class CacheEntry {
        final long timestamp;
        final YouTubeSearchResponseDTO response;

        CacheEntry(YouTubeSearchResponseDTO response) {
            this.timestamp = System.currentTimeMillis();
            this.response = response;
        }

        boolean isExpired() {
            return System.currentTimeMillis() - timestamp > CACHE_TTL_MS;
        }
    }

    // Curated featured tracks across languages for offline/unconfigured or quota-exceeded fallback
    private static final List<YouTubeTrackDTO> CURATED_YOUTUBE_TRACKS = List.of(
            new YouTubeTrackDTO(
                    "jfKfPfyJRdk",
                    "lofi hip hop radio - beats to relax/study to",
                    "Lofi Girl",
                    "UCSJ4gkVC6NrvII8umztf0Ow",
                    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&auto=format&fit=crop",
                    "2023-01-01T00:00:00Z",
                    "Calming lofi beats to relax and unwind.",
                    "en"
            ),
            new YouTubeTrackDTO(
                    "5qap5aO4i9A",
                    "Lofi Hip Hop Radio - Beats to Sleep/Chill to",
                    "Lofi Girl",
                    "UCSJ4gkVC6NrvII8umztf0Ow",
                    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop",
                    "2023-01-01T00:00:00Z",
                    "Chill beats for late night relaxation.",
                    "en"
            ),
            new YouTubeTrackDTO(
                    "BWczaSneA0Q",
                    "Maanu - Jhol (Acoustic) | Annural Khalid",
                    "Maanu Official",
                    "UC_Maanu_Channel",
                    "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=400&auto=format&fit=crop",
                    "2023-05-12T00:00:00Z",
                    "Acoustic soulful indie song.",
                    "hi"
            ),
            new YouTubeTrackDTO(
                    "kXpDsm7uQjE",
                    "Keshava Madhava - Malayalam Devotional Classic",
                    "Malayalam Melody Records",
                    "UC_Malayalam_Channel",
                    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400&auto=format&fit=crop",
                    "2023-03-10T00:00:00Z",
                    "Classic Malayalam traditional melody.",
                    "ml"
            ),
            new YouTubeTrackDTO(
                    "4xDzrJKXOOY",
                    "Kannazhaga - Tamil Acoustic Fusion",
                    "Tamil Vibes Music",
                    "UC_Tamil_Channel",
                    "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=400&auto=format&fit=crop",
                    "2023-04-18T00:00:00Z",
                    "Melodic Tamil acoustic fusion track.",
                    "ta"
            )
    );

    public YouTubeService(RestTemplateBuilder restTemplateBuilder, ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;

        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(8000);
        requestFactory.setReadTimeout(12000);

        this.restTemplate = restTemplateBuilder
                .requestFactory(() -> requestFactory)
                .defaultHeader("User-Agent", "Spotifix/1.0 (Music Streaming Platform)")
                .defaultHeader("Accept", "application/json")
                .setConnectTimeout(Duration.ofSeconds(8))
                .setReadTimeout(Duration.ofSeconds(12))
                .build();
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank() && !apiKey.equalsIgnoreCase("your_youtube_data_api_v3_key_here");
    }

    /**
     * Search songs through the official YouTube Data API v3 search endpoint.
     * Keeps the secret API key exclusively on the backend.
     * Implements in-memory caching to responsibly conserve API quota.
     */
    public YouTubeSearchResponseDTO searchSongs(String query, String language, Integer maxResults) {
        int safeLimit = (maxResults != null && maxResults > 0) ? Math.min(maxResults, 25) : 15;
        String normalizedQuery = (query != null) ? query.trim() : "";
        String cleanLang = (language != null) ? language.trim().toLowerCase(Locale.ROOT) : "";

        // Check in-memory cache first
        String cacheKey = normalizedQuery + "::" + cleanLang + "::" + safeLimit;
        CacheEntry cached = searchCache.get(cacheKey);
        if (cached != null && !cached.isExpired()) {
            return cached.response;
        }

        // If API key is not configured, gracefully return curated tracks
        if (!isConfigured()) {
            List<YouTubeTrackDTO> fallback = filterCuratedTracks(normalizedQuery, cleanLang);
            YouTubeSearchResponseDTO response = new YouTubeSearchResponseDTO(
                    false,
                    "YouTube API Key is not configured. Showing featured music. Add YOUTUBE_API_KEY to .env to enable live YouTube search.",
                    fallback.size(),
                    fallback
            );
            return response;
        }

        try {
            // Build query considering requested language
            String finalSearchQuery = buildSearchQuery(normalizedQuery, cleanLang);

            UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromHttpUrl(baseUrl)
                    .path("/search")
                    .queryParam("part", "snippet")
                    .queryParam("type", "video")
                    .queryParam("videoCategoryId", "10") // YouTube Category 10 = Music
                    .queryParam("maxResults", safeLimit)
                    .queryParam("q", finalSearchQuery)
                    .queryParam("key", apiKey);

            // Add relevanceLanguage if a supported ISO language code is provided
            if (!cleanLang.isBlank()) {
                uriBuilder.queryParam("relevanceLanguage", cleanLang);
            }

            URI targetUri = uriBuilder.build().encode().toUri();
            String responseBody = restTemplate.getForObject(targetUri, String.class);

            if (responseBody == null || responseBody.isBlank()) {
                return new YouTubeSearchResponseDTO(true, "No response from YouTube API.", 0, Collections.emptyList());
            }

            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode itemsNode = root.path("items");
            List<YouTubeTrackDTO> tracks = new ArrayList<>();

            if (itemsNode.isArray()) {
                for (JsonNode item : itemsNode) {
                    YouTubeTrackDTO dto = mapJsonToTrackDTO(item, cleanLang);
                    if (dto != null && dto.getVideoId() != null && !dto.getVideoId().isBlank()) {
                        tracks.add(dto);
                    }
                }
            }

            YouTubeSearchResponseDTO response = new YouTubeSearchResponseDTO(
                    true,
                    null,
                    tracks.size(),
                    tracks
            );

            // Cache the result
            searchCache.put(cacheKey, new CacheEntry(response));
            return response;

        } catch (HttpStatusCodeException httpEx) {
            log.warn("YouTube Data API HTTP error: {}", httpEx.getStatusCode());
            String errorMsg = "YouTube Data API error: " + httpEx.getStatusCode();
            if (httpEx.getStatusCode().value() == 403) {
                errorMsg = "YouTube Data API daily quota limit reached. Showing featured tracks.";
            }

            List<YouTubeTrackDTO> fallback = filterCuratedTracks(normalizedQuery, cleanLang);
            return new YouTubeSearchResponseDTO(
                    true,
                    errorMsg,
                    fallback.size(),
                    fallback
            );

        } catch (Exception e) {
            log.error("Failed to execute YouTube search", e);
            List<YouTubeTrackDTO> fallback = filterCuratedTracks(normalizedQuery, cleanLang);
            return new YouTubeSearchResponseDTO(
                    false,
                    "Unable to reach YouTube service at this time. Showing featured tracks.",
                    fallback.size(),
                    fallback
            );
        }
    }

    private String buildSearchQuery(String query, String langCode) {
        String langName = getLanguageName(langCode);

        if (query == null || query.isBlank()) {
            if (!langName.isBlank()) {
                return "trending " + langName + " music songs";
            }
            return "trending music songs";
        }

        if (!langName.isBlank() && !query.toLowerCase(Locale.ROOT).contains(langName.toLowerCase(Locale.ROOT))) {
            return query + " " + langName + " song";
        }

        return query;
    }

    private String getLanguageName(String code) {
        if (code == null) return "";
        return switch (code.toLowerCase(Locale.ROOT)) {
            case "ml", "malayalam" -> "Malayalam";
            case "ta", "tamil" -> "Tamil";
            case "hi", "hindi" -> "Hindi";
            case "en", "english" -> "English";
            default -> "";
        };
    }

    private YouTubeTrackDTO mapJsonToTrackDTO(JsonNode item, String requestedLanguage) {
        if (item == null) return null;

        String videoId = item.path("id").path("videoId").asText();
        if (videoId == null || videoId.isBlank()) {
            return null;
        }

        JsonNode snippet = item.path("snippet");
        String rawTitle = snippet.path("title").asText("");
        String rawChannel = snippet.path("channelTitle").asText("YouTube Music");
        String channelId = snippet.path("channelId").asText("");
        String publishedAt = snippet.path("publishedAt").asText("");
        String description = snippet.path("description").asText("");

        // Clean and unescape HTML entities (e.g. &amp;, &#39;, &quot;)
        String title = HtmlUtils.htmlUnescape(rawTitle);
        String channelTitle = HtmlUtils.htmlUnescape(rawChannel);

        // Thumbnail priority: high -> medium -> default
        JsonNode thumbnails = snippet.path("thumbnails");
        String thumbnailUrl = thumbnails.path("high").path("url").asText("");
        if (thumbnailUrl.isBlank()) {
            thumbnailUrl = thumbnails.path("medium").path("url").asText("");
        }
        if (thumbnailUrl.isBlank()) {
            thumbnailUrl = thumbnails.path("default").path("url").asText("");
        }
        if (thumbnailUrl.isBlank()) {
            thumbnailUrl = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&auto=format&fit=crop";
        }

        return new YouTubeTrackDTO(
                videoId,
                title,
                channelTitle,
                channelId,
                thumbnailUrl,
                publishedAt,
                description,
                requestedLanguage
        );
    }

    private List<YouTubeTrackDTO> filterCuratedTracks(String query, String language) {
        return CURATED_YOUTUBE_TRACKS.stream()
                .filter(t -> {
                    if (query != null && !query.isBlank()) {
                        String q = query.toLowerCase(Locale.ROOT);
                        boolean matchTitle = t.getTitle() != null && t.getTitle().toLowerCase(Locale.ROOT).contains(q);
                        boolean matchArtist = t.getArtist() != null && t.getArtist().toLowerCase(Locale.ROOT).contains(q);
                        if (!matchTitle && !matchArtist) return false;
                    }
                    if (language != null && !language.isBlank()) {
                        String l = language.toLowerCase(Locale.ROOT);
                        boolean matchLang = t.getLanguage() != null && t.getLanguage().equalsIgnoreCase(l);
                        if (!matchLang) return false;
                    }
                    return true;
                })
                .toList();
    }
}
