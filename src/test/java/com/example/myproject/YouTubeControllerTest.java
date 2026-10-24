package com.example.myproject;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class YouTubeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void testSearchSongsReturnsResponse() throws Exception {
        mockMvc.perform(get("/youtube/search"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tracks", notNullValue()))
                .andExpect(jsonPath("$.tracks", not(empty())))
                .andExpect(jsonPath("$.tracks[0].provider", is("youtube")))
                .andExpect(jsonPath("$.tracks[0].attribution", is("YouTube")))
                .andExpect(jsonPath("$.tracks[0].videoId", notNullValue()))
                .andExpect(jsonPath("$.tracks[0].youtubeUrl", containsString("youtube.com/watch?v=")));
    }

    @Test
    public void testSearchSongsWithLanguageFilter() throws Exception {
        // Malayalam
        mockMvc.perform(get("/youtube/search").param("language", "ml"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tracks", notNullValue()));

        // Tamil
        mockMvc.perform(get("/youtube/search").param("language", "ta"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tracks", notNullValue()));

        // Hindi
        mockMvc.perform(get("/youtube/search").param("language", "hi"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tracks", notNullValue()));

        // English
        mockMvc.perform(get("/youtube/search").param("language", "en"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tracks", notNullValue()));
    }

    @Test
    public void testSearchSongsWithQuery() throws Exception {
        mockMvc.perform(get("/youtube/search").param("query", "acoustic"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tracks", notNullValue()))
                .andExpect(jsonPath("$.tracks", not(empty())));
    }
}
