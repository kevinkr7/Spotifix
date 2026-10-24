package com.example.myproject.model;

import jakarta.persistence.*;

@Entity
@Table(name = "fav", uniqueConstraints = {
        @UniqueConstraint(name = "uk_fav_user_song", columnNames = {"user_id", "song_id"})
}, indexes = {
        @Index(name = "idx_fav_user_sort", columnList = "user_id, sort_order")
})
public class Fav {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "song_id", nullable = false)
    private Long songId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "sort_order")
    private Integer sortOrder;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getSongId() {
        return songId;
    }

    public void setSongId(Long songId) {
        this.songId = songId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }
}
