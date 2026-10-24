# Spotifix 🎵

A modern, Spotify-inspired full-stack music streaming platform featuring music uploads, real-time audio effects, AI-driven recommendations, and multi-source streaming integrations (Jamendo & YouTube Data API v3).

---

## 👥 Contributors & Team

- **M Abhinav** ([@Abhinavm055](https://github.com/Abhinavm055))
- **Kevin** ([@kevinkr7](https://github.com/kevinkr7))

---

## 🚀 Key Features

- **Spotify-Inspired UI/UX**: Dark mode aesthetic with responsive sidebar, search, explore, and bottom playback bar.
- **Audio Upload & Streaming**: Secure audio upload pipeline with format validation, metadata storage, and persistent volume storage.
- **Multi-Source Music Catalog**:
  - **Local Music Library**: User-uploaded tracks.
  - **Jamendo Music API**: Free Creative Commons music search and streaming.
  - **YouTube Data API v3**: Official YouTube search integration categorized for music with language filters (Malayalam, Tamil, Hindi, English).
  - **YouTube IFrame Player API**: Embedded, fully synchronized, and compliant playback without violating third-party audio policies.
- **Advanced Audio Processing**:
  - Web Audio API real-time parametric Equalizer (Bass, Mid, Treble).
  - Reverse playback audio engine.
  - Karaoke vocal attenuation engine.
- **Session-Based Authentication**: Secure Spring Boot session authentication with BCrypt password hashing.
- **Database Isolation**: Multi-tenant data safety backed by PostgreSQL (Neon Cloud compatible).
- **Containerized**: Fully containerized backend deployment using Docker and Docker Compose.

---

## 🛠️ Tech Stack

### Backend
- **Java 17**
- **Spring Boot 3.4.2**
- **Spring Data JPA & Hibernate 6.6**
- **PostgreSQL** (Neon Cloud compatible)
- **Spring Session & BCrypt**
- **Docker & Docker Compose**

### Frontend
- **React 19**
- **JavaScript (ES6+) & Modern CSS**
- **Web Audio API**
- **YouTube IFrame Player API**

---

## ⚙️ Getting Started

### Prerequisites
- [Docker & Docker Compose](https://www.docker.com/)
- [Node.js](https://nodejs.org/) (v18+)
- [Java 17 JDK](https://adoptium.net/) & Maven (optional if using Docker)

### 1. Environment Setup

Copy `.env.example` to `.env` in the project root:

```bash
cp .env.example .env
```

Configure your credentials in `.env`:
```properties
# Database Configuration
DB_URL=jdbc:postgresql://<your-neon-host>/<your-database>?sslmode=require
DB_USERNAME=<your-username>
DB_PASSWORD=<your-password>

# Server Configuration
SERVER_PORT=8081
SESSION_COOKIE_SECURE=false

# Media Storage
SPOTIFIX_UPLOAD_DIR=/app/uploads

# External Music APIs
JAMENDO_CLIENT_ID=<your-jamendo-client-id>
JAMENDO_BASE_URL=https://api.jamendo.com/v3.0

YOUTUBE_API_KEY=<your-youtube-data-api-key>
YOUTUBE_BASE_URL=https://www.googleapis.com/youtube/v3
```

> **Security Note**: Never commit `.env` containing real credentials to version control.

---

### 2. Run with Docker Compose

Build and launch the backend and database services:

```bash
docker compose up -d --build
```

Verify backend health:
```bash
curl http://localhost:8081/actuator/health
# Output: {"status":"UP"}
```

---

### 3. Run the Frontend

Navigate to `Frontend/` and start the development server:

```bash
cd Frontend
npm install
npm start
```

The application will be accessible at: `http://localhost:3000`

---

## 🧪 Testing

### Backend Tests
Run the comprehensive test suite (including authentication, security, audio controllers, and data isolation tests):

```bash
./mvnw clean test
```

### Frontend Build Verification
Verify production React build:

```bash
cd Frontend
npm run build
```

---

## 📄 License
This project is developed for educational and collaborative purposes.
