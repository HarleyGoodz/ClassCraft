package com.capstone.classcraft.controller;

import com.capstone.classcraft.entity.LearningAttemptEntity;
import com.capstone.classcraft.entity.UserEntity;
import com.capstone.classcraft.repository.LearningAttemptRepository;
import com.capstone.classcraft.service.SupabaseAuthService;
import com.capstone.classcraft.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private static final Logger log = LoggerFactory.getLogger(AdminController.class);

    private final SupabaseAuthService authService;
    private final UserService userService;
    private final LearningAttemptRepository attemptRepository;
    private final JdbcTemplate jdbcTemplate;

    public AdminController(SupabaseAuthService authService, UserService userService,
                           LearningAttemptRepository attemptRepository, JdbcTemplate jdbcTemplate) {
        this.authService = authService;
        this.userService = userService;
        this.attemptRepository = attemptRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/overview")
    public AdminOverview getOverview(@RequestHeader(value = "Authorization", required = false) String authorization) {
        authService.requireAdmin(authorization);
        List<LearningAttemptEntity> attempts = attemptRepository.findAllByOrderByCreatedAtDesc();
        Map<UUID, List<LearningAttemptEntity>> byUser = attempts.stream()
            .collect(Collectors.groupingBy(LearningAttemptEntity::getAuthUserId));
        Map<UUID, AuthAccount> authAccounts = loadAuthAccounts();

        // Admin accounts are not learners, so they are left out of the overview.
        List<AccountSummary> accounts = userService.getAllUsers().stream()
            .filter(user -> !isAdmin(authAccounts.get(user.getAuthUserId())))
            .map(user -> summarize(user, authAccounts.get(user.getAuthUserId()),
                byUser.getOrDefault(user.getAuthUserId(), List.of())))
            .toList();
        long learnerAttempts = accounts.stream().mapToLong(account -> account.attempts().size()).sum();
        long activeLearners = accounts.stream().filter(account -> !account.attempts().isEmpty()).count();
        return new AdminOverview(accounts, learnerAttempts, activeLearners, !authAccounts.isEmpty());
    }

    private static boolean isAdmin(AuthAccount account) {
        return account != null && "admin".equals(account.role());
    }

    /**
     * Reads role, status and creation date from Supabase's auth.users table. The backend connects to
     * the same Postgres database, so this needs no service-role key. If the table can't be read, the
     * dashboard still works and shows these fields as unknown.
     */
    private Map<UUID, AuthAccount> loadAuthAccounts() {
        Map<UUID, AuthAccount> result = new HashMap<>();
        try {
            jdbcTemplate.query("""
                    select id, raw_app_meta_data ->> 'role' as role, created_at, email_confirmed_at,
                           banned_until, deleted_at, last_sign_in_at
                    from auth.users
                    """,
                rs -> {
                    UUID id = rs.getObject("id", UUID.class);
                    String role = rs.getString("role");
                    Instant now = Instant.now();
                    Instant bannedUntil = toInstant(rs.getTimestamp("banned_until"));
                    String status;
                    if (rs.getTimestamp("deleted_at") != null) status = "deleted";
                    else if (bannedUntil != null && bannedUntil.isAfter(now)) status = "suspended";
                    else if (rs.getTimestamp("email_confirmed_at") == null) status = "unconfirmed";
                    else status = "active";
                    result.put(id, new AuthAccount(
                        role == null || role.isBlank() ? "learner" : role.toLowerCase(),
                        status,
                        toInstant(rs.getTimestamp("created_at")),
                        toInstant(rs.getTimestamp("last_sign_in_at"))));
                });
        } catch (RuntimeException exception) {
            log.warn("Could not read auth.users for the admin dashboard: {}", exception.getMessage());
        }
        return result;
    }

    private static Instant toInstant(Timestamp timestamp) {
        return timestamp == null ? null : timestamp.toInstant();
    }

    private AccountSummary summarize(UserEntity user, AuthAccount auth, List<LearningAttemptEntity> attempts) {
        Instant lastActive = attempts.stream().map(LearningAttemptEntity::getCreatedAt)
            .max(Instant::compareTo).orElse(null);
        List<AttemptRecord> records = attempts.stream()
            .map(a -> new AttemptRecord(a.getActivityKey(), a.getScenarioKey(), a.getAttemptNumber(),
                a.getCorrectElements(), a.getRequiredElements(), a.isCompleted(), a.getCreatedAt()))
            .toList();
        return new AccountSummary(user.getUserId(), user.getUsername(), user.getEmail(),
            auth == null ? null : auth.role(),
            auth == null ? null : auth.status(),
            auth == null ? null : auth.createdAt(),
            auth == null ? null : auth.lastSignInAt(),
            lastActive, records);
    }

    private record AuthAccount(String role, String status, Instant createdAt, Instant lastSignInAt) {}

    public record AdminOverview(List<AccountSummary> accounts, long totalAttempts, long activeLearners,
                                boolean accountDetailsAvailable) {}

    public record AccountSummary(int userId, String username, String email, String role, String status,
                                 Instant createdAt, Instant lastSignInAt, Instant lastActive,
                                 List<AttemptRecord> attempts) {}

    public record AttemptRecord(String activityKey, String scenarioKey, int attemptNumber,
                                int correctElements, int requiredElements, boolean completed,
                                Instant createdAt) {}
}
