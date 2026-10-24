package com.example.myproject;

import com.example.myproject.model.Music;
import com.example.myproject.repository.MusicRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class MusicControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private MusicRepository musicRepository;

    @BeforeEach
    public void setup() {
        musicRepository.deleteAll();
    }

    @Test
    public void testUnauthenticatedUploadIsRejectedWithoutWriting() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "song.mp3", "audio/mpeg", "dummy-audio-content".getBytes()
        );

        mockMvc.perform(multipart("/songs").file(file))
                .andExpect(status().isUnauthorized());

        assertEquals(0, musicRepository.count());
    }

    private static final byte[] VALID_MP3_BYTES = new byte[]{
            'I', 'D', '3', 3, 0, 0, 0, 0, 0, 10, 'T', 'I', 'T', '2', 0, 0, 0, 0
    };

    private static final byte[] VALID_WAV_BYTES = new byte[]{
            'R', 'I', 'F', 'F', 36, 0, 0, 0, 'W', 'A', 'V', 'E', 'f', 'm', 't', ' '
    };

    @Test
    public void testPathTraversalInFilenameIsSanitizedToSafeUuid() throws Exception {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 100L);

        // Path traversal payload with valid MP3 signature
        MockMultipartFile maliciousFile = new MockMultipartFile(
                "file", "../../../../evil.mp3", "audio/mpeg", VALID_MP3_BYTES
        );

        mockMvc.perform(multipart("/songs").file(maliciousFile).session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.audio_url").exists());

        Music saved = musicRepository.findByUserId(100L).get(0);
        assertNotNull(saved.getAudio_url());
        assertFalse(saved.getAudio_url().contains(".."));
        assertFalse(saved.getAudio_url().contains("/"));
        assertFalse(saved.getAudio_url().contains("\\"));
        assertTrue(saved.getAudio_url().endsWith(".mp3"));
    }

    @Test
    public void testDisallowedFileExtensionIsRejected() throws Exception {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 100L);

        MockMultipartFile executableFile = new MockMultipartFile(
                "file", "script.sh", "application/x-sh", "echo evil".getBytes()
        );

        mockMvc.perform(multipart("/songs").file(executableFile).session(session))
                .andExpect(status().isBadRequest());

        assertEquals(0, musicRepository.count());
    }

    @Test
    public void testMismatchedFileSignatureIsRejected() throws Exception {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 100L);

        // WAV signature but declared as .mp3 extension
        MockMultipartFile mismatchedFile = new MockMultipartFile(
                "file", "spoofed.mp3", "audio/mpeg", VALID_WAV_BYTES
        );

        mockMvc.perform(multipart("/songs").file(mismatchedFile).session(session))
                .andExpect(status().isBadRequest());

        assertEquals(0, musicRepository.count());
    }

    @Test
    public void testNonAudioFileSignatureIsRejected() throws Exception {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 100L);

        // Windows PE executable header masquerading as audio/mpeg .mp3
        byte[] exeBytes = new byte[]{'M', 'Z', (byte) 0x90, 0, 3, 0, 0, 0, 4, 0, 0, 0};
        MockMultipartFile exeFile = new MockMultipartFile(
                "file", "malware.mp3", "audio/mpeg", exeBytes
        );

        mockMvc.perform(multipart("/songs").file(exeFile).session(session))
                .andExpect(status().isBadRequest());

        assertEquals(0, musicRepository.count());
    }

    @Test
    public void testEmptyAudioFileIsRejected() throws Exception {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 100L);

        MockMultipartFile emptyFile = new MockMultipartFile(
                "file", "empty.mp3", "audio/mpeg", new byte[0]
        );

        mockMvc.perform(multipart("/songs").file(emptyFile).session(session))
                .andExpect(status().isBadRequest());

        assertEquals(0, musicRepository.count());
    }

    @Test
    public void testOversizedAudioFileIsRejected() throws Exception {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 100L);

        // Simulate 21MB file (exceeds 20MB limit)
        byte[] largeBytes = new byte[21 * 1024 * 1024];
        largeBytes[0] = 'I'; largeBytes[1] = 'D'; largeBytes[2] = '3';
        MockMultipartFile largeFile = new MockMultipartFile(
                "file", "large.mp3", "audio/mpeg", largeBytes
        );

        mockMvc.perform(multipart("/songs").file(largeFile).session(session))
                .andExpect(status().isPayloadTooLarge());

        assertEquals(0, musicRepository.count());
    }

    @Test
    public void testValidWavUploadSucceeds() throws Exception {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 100L);

        MockMultipartFile wavFile = new MockMultipartFile(
                "file", "track.wav", "audio/wav", VALID_WAV_BYTES
        );

        mockMvc.perform(multipart("/songs").file(wavFile).session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.audio_url").exists());

        assertEquals(1, musicRepository.count());
    }

    @Test
    public void testDeleteSongEnforcesOwnership() throws Exception {
        Music song = new Music();
        song.setTitle("User 1 Song");
        song.setUserId(100L);
        song = musicRepository.save(song);

        // User 2 tries to delete User 1's song
        MockHttpSession user2Session = new MockHttpSession();
        user2Session.setAttribute("userId", 200L);

        mockMvc.perform(delete("/songs/" + song.getId()).session(user2Session))
                .andExpect(status().isForbidden());

        assertTrue(musicRepository.existsById(song.getId()));

        // User 1 deletes their own song
        MockHttpSession user1Session = new MockHttpSession();
        user1Session.setAttribute("userId", 100L);

        mockMvc.perform(delete("/songs/" + song.getId()).session(user1Session))
                .andExpect(status().isOk());

        assertFalse(musicRepository.existsById(song.getId()));
    }
}
