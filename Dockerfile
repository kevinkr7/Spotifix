# Production Dockerfile for Spotifix Spring Boot backend
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Create non-root user for security
RUN addgroup -S spotifix && adduser -S spotifix -G spotifix

# Create uploads directory and set permissions
RUN mkdir -p /app/uploads && chown -R spotifix:spotifix /app

# Copy built JAR from target directory
COPY target/*.jar app.jar
RUN chown spotifix:spotifix app.jar

USER spotifix

EXPOSE 8081

ENV SERVER_PORT=8081 \
    SPOTIFIX_UPLOAD_DIR=/app/uploads

VOLUME ["/app/uploads"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8081/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
