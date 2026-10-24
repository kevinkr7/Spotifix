package com.example.myproject.dto;

public class YouTubeTrackDTO {

    private String id;            // Spotifix-compatible ID (e.g. yt-{videoId})
    private String videoId;       // Raw YouTube Video ID
    private String title;
    private String artist;        // Channel Title as Artist
    private String channelTitle;
    private String channelId;
    private String thumbnailUrl;
    private String image_url;     // Spotifix player compatibility alias
    private String publishedAt;
    private String description;
    private Integer duration;     // Duration in seconds (if available)
    private String provider = "youtube";
    private boolean isExternal = true;
    private String attribution = "YouTube";
    private String youtubeUrl;
    private String language;

    public YouTubeTrackDTO() {
    }

    public YouTubeTrackDTO(String videoId, String title, String channelTitle, String channelId,
                           String thumbnailUrl, String publishedAt, String description, String language) {
        this.videoId = videoId;
        this.id = "yt-" + videoId;
        this.title = title;
        this.artist = channelTitle;
        this.channelTitle = channelTitle;
        this.channelId = channelId;
        this.thumbnailUrl = thumbnailUrl;
        this.image_url = thumbnailUrl;
        this.publishedAt = publishedAt;
        this.description = description;
        this.language = language;
        this.provider = "youtube";
        this.isExternal = true;
        this.attribution = "YouTube";
        this.youtubeUrl = "https://www.youtube.com/watch?v=" + videoId;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getVideoId() {
        return videoId;
    }

    public void setVideoId(String videoId) {
        this.videoId = videoId;
        if (this.id == null || this.id.isBlank()) {
            this.id = "yt-" + videoId;
        }
        if (this.youtubeUrl == null || this.youtubeUrl.isBlank()) {
            this.youtubeUrl = "https://www.youtube.com/watch?v=" + videoId;
        }
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getArtist() {
        return artist;
    }

    public void setArtist(String artist) {
        this.artist = artist;
    }

    public String getChannelTitle() {
        return channelTitle;
    }

    public void setChannelTitle(String channelTitle) {
        this.channelTitle = channelTitle;
        if (this.artist == null || this.artist.isBlank()) {
            this.artist = channelTitle;
        }
    }

    public String getChannelId() {
        return channelId;
    }

    public void setChannelId(String channelId) {
        this.channelId = channelId;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public void setThumbnailUrl(String thumbnailUrl) {
        this.thumbnailUrl = thumbnailUrl;
        if (this.image_url == null || this.image_url.isBlank()) {
            this.image_url = thumbnailUrl;
        }
    }

    public String getImage_url() {
        return image_url;
    }

    public void setImage_url(String image_url) {
        this.image_url = image_url;
    }

    public String getPublishedAt() {
        return publishedAt;
    }

    public void setPublishedAt(String publishedAt) {
        this.publishedAt = publishedAt;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public boolean isExternal() {
        return isExternal;
    }

    public void setExternal(boolean external) {
        isExternal = external;
    }

    public String getAttribution() {
        return attribution;
    }

    public void setAttribution(String attribution) {
        this.attribution = attribution;
    }

    public String getYoutubeUrl() {
        return youtubeUrl;
    }

    public void setYoutubeUrl(String youtubeUrl) {
        this.youtubeUrl = youtubeUrl;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }
}
