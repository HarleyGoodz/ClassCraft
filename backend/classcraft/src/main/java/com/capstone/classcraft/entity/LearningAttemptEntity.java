package com.capstone.classcraft.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import tools.jackson.databind.JsonNode;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
    name = "learning_attempts",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_learning_attempt_sequence",
        columnNames = {"auth_user_id", "activity_key", "scenario_key", "attempt_number"}
    ),
    indexes = @Index(
        name = "idx_learning_attempt_user_activity",
        columnList = "auth_user_id, activity_key, created_at"
    )
)
public class LearningAttemptEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "auth_user_id", nullable = false)
    private UUID authUserId;

    @Column(name = "activity_key", nullable = false, length = 80)
    private String activityKey;

    @Column(name = "scenario_key", nullable = false, length = 120)
    private String scenarioKey;

    @Column(name = "attempt_number", nullable = false)
    private int attemptNumber;

    @Column(name = "correct_elements", nullable = false)
    private int correctElements;

    @Column(name = "required_elements", nullable = false)
    private int requiredElements;

    @Column(nullable = false)
    private boolean completed;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "submitted_response", nullable = false, columnDefinition = "jsonb")
    private JsonNode submittedResponse;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected LearningAttemptEntity() {
    }

    public LearningAttemptEntity(
        UUID authUserId,
        String activityKey,
        String scenarioKey,
        int attemptNumber,
        int correctElements,
        int requiredElements,
        boolean completed,
        JsonNode submittedResponse
    ) {
        this.authUserId = authUserId;
        this.activityKey = activityKey;
        this.scenarioKey = scenarioKey;
        this.attemptNumber = attemptNumber;
        this.correctElements = correctElements;
        this.requiredElements = requiredElements;
        this.completed = completed;
        this.submittedResponse = submittedResponse;
        this.createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public UUID getAuthUserId() {
        return authUserId;
    }

    public String getActivityKey() {
        return activityKey;
    }

    public String getScenarioKey() {
        return scenarioKey;
    }

    public int getAttemptNumber() {
        return attemptNumber;
    }

    public int getCorrectElements() {
        return correctElements;
    }

    public int getRequiredElements() {
        return requiredElements;
    }

    public boolean isCompleted() {
        return completed;
    }

    public JsonNode getSubmittedResponse() {
        return submittedResponse;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
