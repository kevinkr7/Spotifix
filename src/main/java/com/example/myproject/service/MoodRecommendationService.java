package com.example.myproject.service;

import com.example.myproject.dto.MoodRecommendationResponse;
import com.example.myproject.model.Music;
import com.example.myproject.model.PlayHistory;
import com.example.myproject.model.UserMoodPreference;
import com.example.myproject.repository.MusicRepository;
import com.example.myproject.repository.PlayHistoryRepository;
import com.example.myproject.repository.UserMoodPreferenceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class MoodRecommendationService {

    private final UserMoodPreferenceRepository moodPrefRepo;
    private final PlayHistoryRepository historyRepo;
    private final MusicRepository musicRepo;

    public MoodRecommendationService(UserMoodPreferenceRepository moodPrefRepo,
                                     PlayHistoryRepository historyRepo,
                                     MusicRepository musicRepo) {
        this.moodPrefRepo = moodPrefRepo;
        this.historyRepo = historyRepo;
        this.musicRepo = musicRepo;
    }

    public UserMoodPreference getPreferences(Long userId) {
        return moodPrefRepo.findByUserId(userId).orElseGet(() -> {
            UserMoodPreference pref = new UserMoodPreference();
            pref.setUserId(userId);
            pref.setExplicitMood("Happy"); // Default fallback
            pref.setPassiveTrackingEnabled(true);
            return moodPrefRepo.save(pref);
        });
    }

    public UserMoodPreference updatePreferences(Long userId, UserMoodPreference update) {
        UserMoodPreference pref = getPreferences(userId);
        if (update.getExplicitMood() != null) {
            pref.setExplicitMood(update.getExplicitMood());
        }
        pref.setPassiveTrackingEnabled(update.isPassiveTrackingEnabled());
        return moodPrefRepo.save(pref);
    }

    public MoodRecommendationResponse getRecommendations(Long userId) {
        UserMoodPreference pref = getPreferences(userId);
        String targetMood = pref.getExplicitMood();
        String explanation = "Recommended based on your selected mood: " + targetMood + ".";

        if (pref.isPassiveTrackingEnabled()) {
            List<PlayHistory> recentHistory = historyRepo.findByUserIdOrderByPlayedAtDesc(userId);
            if (!recentHistory.isEmpty()) {
                // Get top 20 recent plays
                int limit = Math.min(recentHistory.size(), 20);
                List<PlayHistory> topRecent = recentHistory.subList(0, limit);

                List<Long> recentSongIds = topRecent.stream()
                        .map(PlayHistory::getSongId)
                        .distinct()
                        .collect(Collectors.toList());

                Map<Long, Music> songMap = musicRepo.findAllById(recentSongIds).stream()
                        .collect(Collectors.toMap(Music::getId, m -> m, (existing, replacement) -> existing));

                Map<String, Integer> moodCounts = new HashMap<>();
                for (PlayHistory ph : topRecent) {
                    Music song = songMap.get(ph.getSongId());
                    if (song != null) {
                        String m = song.getMood();
                        if (m != null && !m.isEmpty()) {
                            moodCounts.put(m, moodCounts.getOrDefault(m, 0) + 1);
                        }
                    }
                }

                if (!moodCounts.isEmpty()) {
                    String inferredMood = Collections.max(moodCounts.entrySet(), Map.Entry.comparingByValue()).getKey();
                    // If inferred differs from explicit, use inferred as passive takes precedence when exploring
                    targetMood = inferredMood;
                    explanation = "Recommended because you've been listening to a lot of " + inferredMood + " music lately.";

                    // Auto-update explicit mood so UI stays in sync
                    pref.setExplicitMood(targetMood);
                    moodPrefRepo.save(pref);
                }
            }
        }

        // Get recommendations for target mood
        List<Music> allTargetMoodSongs = musicRepo.findByMoodAndUserId(targetMood, userId);
        
        // Shuffle to avoid same songs, take top 15
        Collections.shuffle(allTargetMoodSongs);
        int limit = Math.min(allTargetMoodSongs.size(), 15);
        List<Music> recommendations = allTargetMoodSongs.subList(0, limit);

        return new MoodRecommendationResponse(targetMood, explanation, recommendations);
    }
}
