package com.example.myproject.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Locale;
import java.util.Set;

/**
 * Media Storage Configuration
 *
 * Media Access Policy:
 * Uploaded audio tracks are content-addressed by unguessable 128-bit UUIDs (e.g. /uploads/{uuid}.mp3).
 * Media is intentionally accessible publicly via direct HTTP GET to support standard HTML5 <audio>
 * crossOrigin="anonymous" elements and Web Audio API reverse-playback processing without cookie coupling.
 *
 * Defense-in-depth:
 * The PathResourceResolver strictly allows only registered audio file extensions (.mp3, .wav, .ogg,
 * .flac, .m4a, .aac) to be served from the upload location. All requests for sensitive files
 * (such as .env, .properties, .sh, or directory traversal attempts) are rejected.
 */
@Configuration
public class MediaStorageConfig implements WebMvcConfigurer {

    public static final Set<String> ALLOWED_AUDIO_EXTENSIONS = Set.of(
            ".mp3", ".wav", ".ogg", ".flac", ".m4a", ".aac"
    );

    @Value("${spotifix.upload.dir:uploads}")
    private String uploadDir;

    @PostConstruct
    public void init() {
        try {
            Path path = Paths.get(uploadDir).toAbsolutePath().normalize();
            if (!Files.exists(path)) {
                Files.createDirectories(path);
            }
        } catch (IOException e) {
            throw new IllegalStateException("Could not initialize upload directory: " + uploadDir, e);
        }
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path path = Paths.get(uploadDir).toAbsolutePath().normalize();
        String uploadPath = path.toString().replace('\\', '/');
        if (!uploadPath.endsWith("/")) {
            uploadPath += "/";
        }

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadPath)
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        String lower = resourcePath.toLowerCase(Locale.ROOT);
                        boolean isAllowedAudio = ALLOWED_AUDIO_EXTENSIONS.stream().anyMatch(lower::endsWith);
                        if (!isAllowedAudio) {
                            return null; // Deny non-audio or sensitive files
                        }
                        return super.getResource(resourcePath, location);
                    }
                });
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/uploads/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "HEAD")
                .allowCredentials(false);
    }
}
