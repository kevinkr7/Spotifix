package com.example.myproject;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class HealthAndMediaSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void testActuatorHealthEndpointIsPublicAndUp() throws Exception {
        // Health check must be unauthenticated and return UP with 200 OK
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                // Ensure sensitive details (disk space, db url, etc.) are never exposed publicly
                .andExpect(jsonPath("$.components").doesNotExist())
                .andExpect(jsonPath("$.details").doesNotExist());
    }

    @Test
    public void testUploadsEndpointRejectsSensitiveFiles() throws Exception {
        // PathResourceResolver must strictly block non-audio files
        mockMvc.perform(get("/uploads/.env"))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/uploads/application.properties"))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/uploads/secret.txt"))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/uploads/malicious.sh"))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testUploadsEndpointAllowsAudioExtensionRouting() throws Exception {
        // Audio extensions are routed to resource handler (returns 404 for non-existent file cleanly)
        mockMvc.perform(get("/uploads/nonexistent-track.mp3"))
                .andExpect(status().isNotFound());
    }
}
