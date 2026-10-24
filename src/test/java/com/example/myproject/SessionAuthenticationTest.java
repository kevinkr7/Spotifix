package com.example.myproject;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class SessionAuthenticationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void testUnauthenticatedRequestsReturn401() throws Exception {
        // Analytics
        mockMvc.perform(get("/analytics/weekly"))
                .andExpect(status().isUnauthorized());

        // Audio experience
        mockMvc.perform(get("/audio/equalizer/presets"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/audio/karaoke/settings"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/audio/karaoke/lyrics/1"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/audio/player/seek?songId=1&from=0&to=10"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/audio/reverse/log?songId=1&duration=5"))
                .andExpect(status().isUnauthorized());

        // Crossfade
        mockMvc.perform(get("/crossfade/settings"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/crossfade/analyze?fromSongId=1&toSongId=2"))
                .andExpect(status().isUnauthorized());

        // Mood
        mockMvc.perform(get("/mood/preferences"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/mood/recommendations"))
                .andExpect(status().isUnauthorized());

        // Favorites
        mockMvc.perform(get("/favorites"))
                .andExpect(status().isUnauthorized());

        // Music
        mockMvc.perform(get("/songs"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/search/ai?q=test"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void testAuthenticatedRequestsSucceedAcrossControllers() throws Exception {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 500L);
        session.setAttribute("username", "testuser500");

        mockMvc.perform(get("/analytics/weekly").session(session))
                .andExpect(status().isOk());

        mockMvc.perform(get("/audio/equalizer/presets").session(session))
                .andExpect(status().isOk());

        mockMvc.perform(get("/audio/karaoke/settings").session(session))
                .andExpect(status().isOk());

        mockMvc.perform(get("/crossfade/settings").session(session))
                .andExpect(status().isOk());

        mockMvc.perform(get("/mood/preferences").session(session))
                .andExpect(status().isOk());

        mockMvc.perform(get("/mood/recommendations").session(session))
                .andExpect(status().isOk());

        mockMvc.perform(get("/favorites").session(session))
                .andExpect(status().isOk());

        mockMvc.perform(get("/songs").session(session))
                .andExpect(status().isOk());
    }
}
