package com.example.myproject;

import com.example.myproject.dto.LoginRequest;
import com.example.myproject.dto.RegisterRequest;
import com.example.myproject.model.AppUser;
import com.example.myproject.repository.AppUserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AppUserRepository appUserRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    public void setup() {
        appUserRepository.deleteAll();
    }

    @Test
    public void testRegistrationHashesPasswordWithBCrypt() throws Exception {
        RegisterRequest req = new RegisterRequest("testuser", "test@example.com", "securePassword123");

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.authenticated").value(true))
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.email").value("test@example.com"));

        AppUser savedUser = appUserRepository.findByUsername("testuser").orElseThrow();
        assertNotEquals("securePassword123", savedUser.getPassword());
        assertTrue(savedUser.getPassword().startsWith("$2a$") || savedUser.getPassword().startsWith("$2b$"));
        assertTrue(passwordEncoder.matches("securePassword123", savedUser.getPassword()));
    }

    @Test
    public void testRegistrationValidationFailsOnShortPassword() throws Exception {
        RegisterRequest req = new RegisterRequest("testuser2", "test2@example.com", "123");

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testRegistrationFailsOnDuplicateUsername() throws Exception {
        RegisterRequest req1 = new RegisterRequest("dupuser", "dup1@example.com", "password123");
        RegisterRequest req2 = new RegisterRequest("dupuser", "dup2@example.com", "password123");

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req1)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req2)))
                .andExpect(status().isConflict());
    }

    @Test
    public void testLoginWithBCryptPassword() throws Exception {
        AppUser user = new AppUser();
        user.setUsername("loginuser");
        user.setEmail("login@example.com");
        user.setPassword(passwordEncoder.encode("correctPassword123"));
        appUserRepository.save(user);

        LoginRequest req = new LoginRequest("loginuser", "correctPassword123");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authenticated").value(true))
                .andExpect(jsonPath("$.username").value("loginuser"));
    }

    @Test
    public void testLoginFailsWithIncorrectPassword() throws Exception {
        AppUser user = new AppUser();
        user.setUsername("wronguser");
        user.setEmail("wrong@example.com");
        user.setPassword(passwordEncoder.encode("correctPassword123"));
        appUserRepository.save(user);

        LoginRequest req = new LoginRequest("wronguser", "wrongPassword");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void testLegacyPlaintextPasswordLoginAndTransparentUpgrade() throws Exception {
        // Simulate existing legacy user created before BCrypt migration
        AppUser legacyUser = new AppUser();
        legacyUser.setUsername("legacyuser");
        legacyUser.setEmail("legacy@example.com");
        legacyUser.setPassword("plainTextPassword123"); // RAW plaintext
        legacyUser = appUserRepository.save(legacyUser);

        LoginRequest req = new LoginRequest("legacyuser", "plainTextPassword123");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authenticated").value(true));

        // Verify password was transparently upgraded to BCrypt
        AppUser upgradedUser = appUserRepository.findByUsername("legacyuser").orElseThrow();
        assertNotEquals("plainTextPassword123", upgradedUser.getPassword());
        assertTrue(upgradedUser.getPassword().startsWith("$2a$") || upgradedUser.getPassword().startsWith("$2b$"));
        assertTrue(passwordEncoder.matches("plainTextPassword123", upgradedUser.getPassword()));
    }

    @Test
    public void testSessionEndpointRequiresLogin() throws Exception {
        mockMvc.perform(get("/auth/session"))
                .andExpect(status().isUnauthorized());

        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 42L);
        session.setAttribute("username", "sessionuser");

        mockMvc.perform(get("/auth/session").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authenticated").value(true))
                .andExpect(jsonPath("$.username").value("sessionuser"));
    }

    @Test
    public void testLogoutInvalidatesSession() throws Exception {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userId", 42L);

        mockMvc.perform(post("/auth/logout").session(session))
                .andExpect(status().isOk());

        assertTrue(session.isInvalid());
    }
}
