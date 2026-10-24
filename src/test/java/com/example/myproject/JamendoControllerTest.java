package com.example.myproject;

import com.example.myproject.dto.ExternalFavoriteRequestDTO;
import com.example.myproject.model.ExternalTrackFavorite;
import com.example.myproject.repository.ExternalPlayHistoryRepository;
import com.example.myproject.repository.ExternalTrackFavoriteRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class JamendoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ExternalTrackFavoriteRepository externalTrackFavoriteRepository;

    @Autowired
    private ExternalPlayHistoryRepository externalPlayHistoryRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    public void setup() {
        externalTrackFavoriteRepository.deleteAll();
        externalPlayHistoryRepository.deleteAll();
    }

    @Test
    public void testSearchTracksReturnsCatalogWithAttribution() throws Exception {
        mockMvc.perform(get("/jamendo/tracks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tracks", not(empty())))
                .andExpect(jsonPath("$.tracks[0].attribution", is("Jamendo Music / Creative Commons")))
                .andExpect(jsonPath("$.tracks[0].license_ccurl", notNullValue()))
                .andExpect(jsonPath("$.tracks[0].audio_url", notNullValue()))
                .andExpect(jsonPath("$.tracks[0].external", is(true)))
                .andExpect(jsonPath("$.tracks[0].provider", is("jamendo")));
    }

    @Test
    public void testLanguageFiltersSupportedLanguages() throws Exception {
        // Malayalam filter
        mockMvc.perform(get("/jamendo/tracks").param("language", "ml"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tracks", not(empty())))
                .andExpect(jsonPath("$.tracks[0].language", is("ml")));

        // Tamil filter
        mockMvc.perform(get("/jamendo/tracks").param("language", "ta"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tracks", not(empty())))
                .andExpect(jsonPath("$.tracks[0].language", is("ta")));

        // Hindi filter
        mockMvc.perform(get("/jamendo/tracks").param("language", "hi"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tracks", not(empty())))
                .andExpect(jsonPath("$.tracks[0].language", is("hi")));

        // English filter
        mockMvc.perform(get("/jamendo/tracks").param("language", "en"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tracks", not(empty())))
                .andExpect(jsonPath("$.tracks[0].language", is("en")));
    }

    @Test
    public void testSearchWithQuery() throws Exception {
        mockMvc.perform(get("/jamendo/tracks").param("query", "Acoustic"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tracks", not(empty())))
                .andExpect(jsonPath("$.tracks[0].title", containsStringIgnoringCase("Acoustic")));
    }

    @Test
    public void testGetTrackByIdSuccessAndNotFound() throws Exception {
        // Valid track ID from catalog
        mockMvc.perform(get("/jamendo/tracks/cc-101"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is("cc-101")))
                .andExpect(jsonPath("$.title", is("Acoustic Breeze")))
                .andExpect(jsonPath("$.license_ccurl", notNullValue()));

        // Non-existent track ID
        mockMvc.perform(get("/jamendo/tracks/non-existent-track-999"))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testExternalFavoritesRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/jamendo/favorites"))
                .andExpect(status().isUnauthorized());

        ExternalFavoriteRequestDTO dto = new ExternalFavoriteRequestDTO();
        dto.setProviderTrackId("cc-101");
        dto.setTitle("Test Track");
        dto.setAudioUrl("https://example.com/audio.mp3");

        mockMvc.perform(post("/jamendo/favorites")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void testExternalFavoritesUserIsolation() throws Exception {
        MockHttpSession user1Session = new MockHttpSession();
        user1Session.setAttribute("userId", 101L);

        MockHttpSession user2Session = new MockHttpSession();
        user2Session.setAttribute("userId", 202L);

        // User 1 adds external favorite
        ExternalFavoriteRequestDTO user1Fav = new ExternalFavoriteRequestDTO();
        user1Fav.setProviderTrackId("cc-101");
        user1Fav.setTitle("User 1 Liked Song");
        user1Fav.setArtist("Benjamin Tissot");
        user1Fav.setAudioUrl("https://example.com/audio1.mp3");
        user1Fav.setLicenseCcUrl("https://creativecommons.org/licenses/by/3.0/");

        mockMvc.perform(post("/jamendo/favorites")
                        .session(user1Session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(user1Fav)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.providerTrackId", is("cc-101")))
                .andExpect(jsonPath("$.userId", is(101)));

        // User 1 check: should be favorite
        mockMvc.perform(get("/jamendo/favorites/cc-101/check").session(user1Session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isFavorite", is(true)));

        // User 2 check: must NOT see User 1's favorite
        mockMvc.perform(get("/jamendo/favorites/cc-101/check").session(user2Session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isFavorite", is(false)));

        mockMvc.perform(get("/jamendo/favorites").session(user2Session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));

        // User 2 attempts to delete User 1's favorite - User 1's record must remain untouched
        mockMvc.perform(delete("/jamendo/favorites/cc-101").session(user2Session))
                .andExpect(status().isNoContent());

        assertEquals(1, externalTrackFavoriteRepository.count());

        // User 1 deletes their own favorite
        mockMvc.perform(delete("/jamendo/favorites/cc-101").session(user1Session))
                .andExpect(status().isNoContent());

        assertEquals(0, externalTrackFavoriteRepository.count());
    }

    @Test
    public void testExternalPlayHistoryUserIsolation() throws Exception {
        MockHttpSession user1Session = new MockHttpSession();
        user1Session.setAttribute("userId", 301L);

        MockHttpSession user2Session = new MockHttpSession();
        user2Session.setAttribute("userId", 302L);

        // Record history for User 1
        mockMvc.perform(post("/jamendo/history/cc-103")
                        .session(user1Session)
                        .param("title", "Raag Bhairav Fusion")
                        .param("artist", "Ananya Sharma"))
                .andExpect(status().isOk());

        // User 1 sees 1 history entry
        mockMvc.perform(get("/jamendo/history").session(user1Session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].providerTrackId", is("cc-103")));

        // User 2 sees 0 history entries (strict isolation)
        mockMvc.perform(get("/jamendo/history").session(user2Session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    public void testValidationFailsOnMissingRequiredFavoriteFields() throws Exception {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 500L);

        // Missing audioUrl and title
        ExternalFavoriteRequestDTO invalidDto = new ExternalFavoriteRequestDTO();
        invalidDto.setProviderTrackId("cc-999");

        mockMvc.perform(post("/jamendo/favorites")
                        .session(session)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidDto)))
                .andExpect(status().isBadRequest());
    }
}
