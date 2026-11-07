package com.capstone.classcraft.classcraft;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.capstone.classcraft.entity.UserEntity;
import com.capstone.classcraft.repository.UserRepository;
import com.capstone.classcraft.service.UserService;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class UserServiceClaimUsernameTests {

    private static final UUID AUTH_ID = UUID.randomUUID();
    private static final String EMAIL = "student@example.com";

    private UserRepository userRepository;
    private UserService userService;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        userService = new UserService(userRepository);
        when(userRepository.findByAuthUserId(AUTH_ID)).thenReturn(Optional.empty());
        when(userRepository.findByUsername(any())).thenReturn(Optional.empty());
        when(userRepository.save(any())).thenAnswer(call -> call.getArgument(0));
    }

    @Test
    void createsProfileForNewUser() {
        UserEntity user = userService.claimUsername(AUTH_ID, EMAIL, "student");

        assertEquals(AUTH_ID, user.getAuthUserId());
        assertEquals(EMAIL, user.getEmail());
        assertEquals("student", user.getUsername());
    }

    @Test
    void updatesExistingProfileOnRetry() {
        UserEntity existing = new UserEntity(AUTH_ID, "old-name", EMAIL);
        when(userRepository.findByAuthUserId(AUTH_ID)).thenReturn(Optional.of(existing));

        UserEntity user = userService.claimUsername(AUTH_ID, EMAIL, "new-name");

        assertEquals("new-name", user.getUsername());
    }

    @Test
    void allowsReclaimingOwnUsername() {
        UserEntity existing = new UserEntity(AUTH_ID, "student", EMAIL);
        when(userRepository.findByAuthUserId(AUTH_ID)).thenReturn(Optional.of(existing));
        when(userRepository.findByUsername("student")).thenReturn(Optional.of(existing));

        assertEquals("student", userService.claimUsername(AUTH_ID, EMAIL, "student").getUsername());
    }

    @Test
    void rejectsUsernameOwnedByAnotherUser() {
        UserEntity other = new UserEntity(UUID.randomUUID(), "student", "other@example.com");
        when(userRepository.findByUsername("student")).thenReturn(Optional.of(other));

        assertThrows(
            IllegalArgumentException.class,
            () -> userService.claimUsername(AUTH_ID, EMAIL, "student")
        );
        verify(userRepository, never()).save(any());
    }

    @Test
    void rejectsEmailOwnedByAnotherProfile() {
        when(userRepository.existsByEmail(EMAIL)).thenReturn(true);

        assertThrows(
            IllegalArgumentException.class,
            () -> userService.claimUsername(AUTH_ID, EMAIL, "student")
        );
    }

    @Test
    void rejectsInvalidUsernameLengthAndMissingEmail() {
        assertThrows(
            IllegalArgumentException.class,
            () -> userService.claimUsername(AUTH_ID, EMAIL, "a")
        );
        assertThrows(
            IllegalArgumentException.class,
            () -> userService.claimUsername(AUTH_ID, EMAIL, "a".repeat(31))
        );
        assertThrows(
            IllegalArgumentException.class,
            () -> userService.claimUsername(AUTH_ID, "", "student")
        );
    }
}
