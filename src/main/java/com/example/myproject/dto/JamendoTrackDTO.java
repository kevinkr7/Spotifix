package com.example.myproject.dto;

import java.util.ArrayList;
import java.util.List;

public class JamendoTrackDTO {

    private String id;
    private String title;
    private String artist;
    private String album;
    private Integer duration;
    private String audio_url;
    private String image_url;
    private String license_ccurl;
    private String share_url;
    private String language;
    private List<String> tags = new ArrayList<>();
    private boolean isExternal = true;
    private String provider = "jamendo";
    private String attribution = "Jamendo Music / Creative Commons";

    public JamendoTrackDTO() {
    }

    public JamendoTrackDTO(String id, String title, String artist, String album, Integer duration,
                           String audio_url, String image_url, String license_ccurl, String share_url,
                           String language, List<String> tags) {
        this.id = id;
        this.title = title;
        this.artist = artist;
        this.album = album;
        this.duration = duration;
        this.audio_url = audio_url;
        this.image_url = image_url;
        this.license_ccurl = license_ccurl;
        this.share_url = share_url;
        this.language = language;
        if (tags != null) {
            this.tags = tags;
        }
        this.isExternal = true;
        this.provider = "jamendo";
        this.attribution = "Jamendo Music / Creative Commons";
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public String getAlbum() {
        return album;
    }

    public void setAlbum(String album) {
        this.album = album;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public String getAudio_url() {
        return audio_url;
    }

    public void setAudio_url(String audio_url) {
        this.audio_url = audio_url;
    }

    public String getImage_url() {
        return image_url;
    }

    public void setImage_url(String image_url) {
        this.image_url = image_url;
    }

    public String getLicense_ccurl() {
        return license_ccurl;
    }

    public void setLicense_ccurl(String license_ccurl) {
        this.license_ccurl = license_ccurl;
    }

    public String getShare_url() {
        return share_url;
    }

    public void setShare_url(String share_url) {
        this.share_url = share_url;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public boolean isExternal() {
        return isExternal;
    }

    public void setExternal(boolean external) {
        isExternal = external;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getAttribution() {
        return attribution;
    }

    public void setAttribution(String attribution) {
        this.attribution = attribution;
    }
}
