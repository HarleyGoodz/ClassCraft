package com.capstone.classcraft.repository;

import com.capstone.classcraft.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Integer> {

    Optional<UserEntity> findByUsername(String username);
    Optional<UserEntity> findByEmail(String email);
    Optional<UserEntity> findByAuthUserId(
        java.util.UUID authUserId
    );
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}