package com.capstone.classcraft.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "users")
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private int userId;
    @Column(name = "auth_user_id", nullable = false, unique = true)
    private UUID authUserId;
    @Column(nullable = false, unique = true)
    private String username;
    @Column(nullable = false, unique = true)
    private String email;

    public UserEntity() {
        super();
    }

    public UserEntity(UUID authUserId, String username, String email) {
        super();
        this.authUserId = authUserId;
        this.username = username;
        this.email = email;
    }

    // Getters and Setters
    public int getUserId() {
        return userId;
    }
    public void setUserId(int userId) {
        this.userId = userId;
    }

    public UUID getAuthUserId() {
        return authUserId;
    }
    public void setAuthUserId(UUID authUserId) {
        this.authUserId = authUserId;
    }

    public String getUsername() {
        return username;
    }
    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
}
