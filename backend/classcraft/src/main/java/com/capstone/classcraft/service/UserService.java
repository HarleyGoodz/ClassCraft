
package com.capstone.classcraft.service;

import com.capstone.classcraft.entity.UserEntity;
import com.capstone.classcraft.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserEntity> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<UserEntity> getUserById(int userId) {
        return userRepository.findById(userId);
    }

    public Optional<UserEntity> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public Optional<UserEntity> getUserByAuthUserId(UUID authUserId) {
        return userRepository.findByAuthUserId(authUserId);
    }

    @Transactional
    public UserEntity createUser(UserEntity user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new IllegalArgumentException("Username already exists.");
        }

        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Email already exists.");
        }

        if (user.getAuthUserId() == null) {
            throw new IllegalArgumentException(
                "Supabase Auth user ID is required."
            );
        }

        if (userRepository.findByAuthUserId(user.getAuthUserId()).isPresent()) {
            throw new IllegalArgumentException(
                "A profile already exists for this account."
            );
        }

        return userRepository.save(user);
    }

    @Transactional
    public UserEntity updateUsername(int userId, String username) {
        UserEntity user = userRepository.findById(userId)
            .orElseThrow(() ->
                new IllegalArgumentException("User not found.")
            );

        if (userRepository.existsByUsername(username)
                && !user.getUsername().equals(username)) {
            throw new IllegalArgumentException("Username already exists.");
        }

        user.setUsername(username);
        return userRepository.save(user);
    }

    public void deleteUser(int userId) {
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found.");
        }

        userRepository.deleteById(userId);
    }
}
