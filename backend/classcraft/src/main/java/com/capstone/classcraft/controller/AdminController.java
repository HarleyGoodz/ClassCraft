package com.capstone.classcraft.controller;

import com.capstone.classcraft.entity.LearningAttemptEntity;
import com.capstone.classcraft.entity.UserEntity;
import com.capstone.classcraft.repository.LearningAttemptRepository;
import com.capstone.classcraft.service.SupabaseAuthService;
import com.capstone.classcraft.service.UserService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final SupabaseAuthService authService;
    private final UserService userService;
    private final LearningAttemptRepository attemptRepository;

    public AdminController(SupabaseAuthService authService, UserService userService,
                           LearningAttemptRepository attemptRepository) {
        this.authService = authService;
        this.userService = userService;
        this.attemptRepository = attemptRepository;
    }

    @GetMapping("/overview")
    public AdminOverview getOverview(@RequestHeader(value = "Authorization", required = false) String authorization) {
        authService.requireAdmin(authorization);
        List<LearningAttemptEntity> attempts = attemptRepository.findAllByOrderByCreatedAtDesc();
        Map<UUID, List<LearningAttemptEntity>> byUser = attempts.stream()
            .collect(Collectors.groupingBy(LearningAttemptEntity::getAuthUserId));
        List<AccountSummary> accounts = userService.getAllUsers().stream()
            .map(user -> summarize(user, byUser.getOrDefault(user.getAuthUserId(), List.of())))
            .toList();
        return new AdminOverview(accounts, attempts.size(),
            attempts.stream().map(LearningAttemptEntity::getAuthUserId).distinct().count());
    }

    private AccountSummary summarize(UserEntity user, List<LearningAttemptEntity> attempts) {
        double measurable = attempts.stream().filter(a -> a.getRequiredElements() > 0)
            .mapToDouble(a -> 100.0 * a.getCorrectElements() / a.getRequiredElements())
            .average().orElse(Double.NaN);
        Instant lastActive = attempts.stream().map(LearningAttemptEntity::getCreatedAt)
            .max(Instant::compareTo).orElse(null);
        return new AccountSummary(user.getUserId(), user.getUsername(), user.getEmail(),
            attempts.size(), attempts.stream().filter(LearningAttemptEntity::isCompleted).count(),
            Double.isNaN(measurable) ? null : Math.round(measurable), lastActive);
    }

    public record AdminOverview(List<AccountSummary> accounts, long totalAttempts, long activeLearners) {}
    public record AccountSummary(int userId, String username, String email, long attempts,
                                 long completedAttempts, Long measurability, Instant lastActive) {}
}
