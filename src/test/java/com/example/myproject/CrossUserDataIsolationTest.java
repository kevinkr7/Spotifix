package com.example.myproject;

import com.example.myproject.model.EqualizerPreset;
import com.example.myproject.model.Music;
import com.example.myproject.repository.EqualizerPresetRepository;
import com.example.myproject.repository.MusicRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class CrossUserDataIsolationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private MusicRepository musicRepository;

    @Autowired
    private EqualizerPresetRepository presetRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    public void setup() {
        musicRepository.deleteAll();
        presetRepository.deleteAll();
    }

    @Test
    public void testIntelligentShuffleDoesNotLeakOtherUsersSongs() throws Exception {
        // User 1 song
        Music song1 = new Music();
        song1.setTitle("User 1 Secret Track");
        song1.setArtist("Artist 1");
        song1.setGenre("Rock");
        song1.setUserId(100L);
        musicRepository.save(song1);

        // User 2 song
        Music song2 = new Music();
        song2.setTitle("User 2 Secret Track");
        song2.setArtist("Artist 2");
        song2.setGenre("Pop");
        song2.setUserId(200L);
        musicRepository.save(song2);

        // User 1 calls shuffle
        MockHttpSession user1Session = new MockHttpSession();
        user1Session.setAttribute("userId", 100L);

        mockMvc.perform(post("/shuffle/intelligent").session(user1Session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title").value("User 1 Secret Track"));

        // User 2 calls shuffle
        MockHttpSession user2Session = new MockHttpSession();
        user2Session.setAttribute("userId", 200L);

        mockMvc.perform(post("/shuffle/intelligent").session(user2Session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title").value("User 2 Secret Track"));
    }

    @Test
    public void testAiSearchDoesNotLeakOtherUsersSongsOrLyrics() throws Exception {
        // User 1 song with secret lyrics
        Music song1 = new Music();
        song1.setTitle("Secret Song");
        song1.setArtist("Artist A");
        song1.setLyrics("top secret confidential lyrics user1");
        song1.setUserId(100L);
        musicRepository.save(song1);

        // User 2 searches for "secret"
        MockHttpSession user2Session = new MockHttpSession();
        user2Session.setAttribute("userId", 200L);

        mockMvc.perform(get("/search/ai?q=secret").session(user2Session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0))); // User 2 should NOT see User 1's secret track

        // User 1 searches for "secret"
        MockHttpSession user1Session = new MockHttpSession();
        user1Session.setAttribute("userId", 100L);

        mockMvc.perform(get("/search/ai?q=secret").session(user1Session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].music.title").value("Secret Song"));
    }

    @Test
    public void testEqualizerPresetIdorProtection() throws Exception {
        // User 1 creates preset
        EqualizerPreset preset = new EqualizerPreset();
        preset.setName("User 1 Bass Preset");
        preset.setUserId(100L);
        preset.setBassBoost(0.8);
        preset = presetRepository.save(preset);

        // User 2 attempts to overwrite User 1's preset by ID
        MockHttpSession user2Session = new MockHttpSession();
        user2Session.setAttribute("userId", 200L);

        EqualizerPreset maliciousUpdate = new EqualizerPreset();
        maliciousUpdate.setId(preset.getId());
        maliciousUpdate.setName("Tampered by User 2");
        maliciousUpdate.setBassBoost(0.2);

        mockMvc.perform(post("/audio/equalizer/presets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(maliciousUpdate))
                        .session(user2Session))
                .andExpect(status().isForbidden());

        // Verify preset was not modified
        EqualizerPreset unchanged = presetRepository.findById(preset.getId()).orElseThrow();
        assertEquals("User 1 Bass Preset", unchanged.getName());
        assertEquals(100L, unchanged.getUserId());
    }

    @Test
    public void testCrossfadeTransitionRejectsForeignSongs() throws Exception {
        Music user1Song = new Music();
        user1Song.setTitle("Song 1");
        user1Song.setUserId(100L);
        user1Song = musicRepository.save(user1Song);

        Music user2Song = new Music();
        user2Song.setTitle("Song 2");
        user2Song.setUserId(200L);
        user2Song = musicRepository.save(user2Song);

        MockHttpSession user1Session = new MockHttpSession();
        user1Session.setAttribute("userId", 100L);

        mockMvc.perform(get("/crossfade/analyze")
                        .param("fromSongId", user1Song.getId().toString())
                        .param("toSongId", user2Song.getId().toString())
                        .session(user1Session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.curveType").value("None"))
                .andExpect(jsonPath("$.explanation").value("One or both tracks were not found in your library."));
    }
}
