package com.example.myproject;

import com.example.myproject.dto.LoginRequest;
import com.example.myproject.dto.RegisterRequest;
import com.example.myproject.model.AppUser;
import com.example.myproject.repository.AppUserRepository;
import com.example.myproject.util.SessionUtil;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/auth")
public class AuthController {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$");

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AppUserRepository appUserRepository, PasswordEncoder passwordEncoder) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest payload, HttpSession session) {
        if (payload.getUsername() == null || payload.getUsername().trim().length() < 3) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username must be at least 3 characters."));
        }

        if (payload.getEmail() == null || !EMAIL_PATTERN.matcher(payload.getEmail().trim()).matches()) {
            return ResponseEntity.badRequest().body(Map.of("message", "A valid email address is required."));
        }

        if (payload.getPassword() == null || payload.getPassword().length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password must be at least 6 characters."));
        }

        String username = payload.getUsername().trim();
        String email = payload.getEmail().trim().toLowerCase();

        if (appUserRepository.existsByUsername(username)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Username already exists."));
        }

        if (appUserRepository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Email already exists."));
        }

        AppUser newUser = new AppUser();
        newUser.setUsername(username);
        newUser.setEmail(email);
        // Securely hash password with BCrypt
        newUser.setPassword(passwordEncoder.encode(payload.getPassword()));

        AppUser saved = appUserRepository.save(newUser);
        session.setAttribute("userId", saved.getId());
        session.setAttribute("username", saved.getUsername());

        return ResponseEntity.status(HttpStatus.CREATED).body(buildSessionResponse(saved.getUsername(), saved.getEmail()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest payload, HttpSession session) {
        String identifier = payload.getIdentifier() != null ? payload.getIdentifier().trim() : "";
        String password = payload.getPassword() != null ? payload.getPassword() : "";

        if (identifier.isBlank() || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username/email and password are required."));
        }

        Optional<AppUser> userOpt = appUserRepository.findByUsernameOrEmail(identifier, identifier.toLowerCase());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid credentials."));
        }

        AppUser user = userOpt.get();
        String storedPassword = user.getPassword();
        boolean passwordValid = false;

        // Check for BCrypt hash format ($2a$, $2b$, or $2y$)
        if (isBCryptHash(storedPassword)) {
            passwordValid = passwordEncoder.matches(password, storedPassword);
        } else if (storedPassword != null && storedPassword.equals(password)) {
            // Legacy plaintext password verification
            passwordValid = true;
            // Transparently rehash and persist as BCrypt hash to eliminate plaintext storage
            user.setPassword(passwordEncoder.encode(password));
            appUserRepository.save(user);
        }

        if (!passwordValid) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid credentials."));
        }

        session.setAttribute("userId", user.getId());
        session.setAttribute("username", user.getUsername());

        return ResponseEntity.ok(buildSessionResponse(user.getUsername(), user.getEmail()));
    }

    @GetMapping("/session")
    public ResponseEntity<?> session(HttpSession session) {
        Long userId;
        try {
            userId = SessionUtil.requireUserId(session);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "No active session."));
        }

        String username = SessionUtil.getUsername(session);
        Map<String, Object> response = new HashMap<>();
        response.put("authenticated", true);
        response.put("userId", userId);
        response.put("username", username);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        if (session != null) {
            session.invalidate();
        }
        return ResponseEntity.ok(Map.of("message", "Logged out."));
    }

    private boolean isBCryptHash(String password) {
        return password != null && (password.startsWith("$2a$") || password.startsWith("$2b$") || password.startsWith("$2y$"));
    }

    private Map<String, Object> buildSessionResponse(String username, String email) {
        Map<String, Object> response = new HashMap<>();
        response.put("authenticated", true);
        response.put("username", username);
        response.put("email", email);
        return response;
    }
}
