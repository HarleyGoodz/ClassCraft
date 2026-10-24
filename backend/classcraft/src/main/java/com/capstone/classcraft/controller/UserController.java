
package com.capstone.classcraft.controller;

import com.capstone.classcraft.entity.UserEntity;
import com.capstone.classcraft.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<UserEntity>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserEntity> getUserById(
            @PathVariable int userId) {

        return userService.getUserById(userId)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<UserEntity> getUserByUsername(
            @PathVariable String username) {

        return userService.getUserByUsername(username)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createUser(
            @RequestBody UserEntity user) {
        try {
            UserEntity createdUser = userService.createUser(user);

            return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdUser);

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                .badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{userId}/username")
    public ResponseEntity<?> updateUsername(
            @PathVariable int userId,
            @RequestBody Map<String, String> request) {

        try {
            String username = request.get("username");

            if (username == null || username.isBlank()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Username is required."));
            }

            return ResponseEntity.ok(
                userService.updateUsername(userId, username)
            );

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                .badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteUser(
            @PathVariable int userId) {

        try {
            userService.deleteUser(userId);
            return ResponseEntity.noContent().build();

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));
        }
    }
}
