package com.capstone.classcraft.service;

import com.capstone.classcraft.entity.LearningAttemptEntity;
import com.capstone.classcraft.repository.LearningAttemptRepository;
import jakarta.persistence.EntityManager;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.node.JsonNodeFactory;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class LearningAttemptService {

    private static final Set<String> ACTIVITY_KEYS = Set.of(
        "class-diagram-formation",
        "class-relationships",
        "multiplicity",
        "oop-class-modeling",
        "class-diagram-construction"
    );

    private final LearningAttemptRepository repository;
    private final EntityManager entityManager;

    public LearningAttemptService(
        LearningAttemptRepository repository,
        EntityManager entityManager
    ) {
        this.repository = repository;
        this.entityManager = entityManager;
    }

    public List<LearningAttemptEntity> getAttempts(UUID authUserId) {
        return repository.findAllByAuthUserIdOrderByCreatedAtAsc(authUserId);
    }

    @Transactional
    public LearningAttemptEntity recordAttempt(
        UUID authUserId,
        RecordLearningAttemptRequest request
    ) {
        validate(request);

        entityManager.createNativeQuery(
            "select pg_advisory_xact_lock(hashtextextended("
                + "cast(:authUserId as text) || ':' || :activityKey || ':' || :scenarioKey, 0))"
        )
            .setParameter("authUserId", authUserId)
            .setParameter("activityKey", request.activityKey())
            .setParameter("scenarioKey", request.scenarioKey())
            .getSingleResult();

        int attemptNumber = repository.findHighestAttemptNumber(
            authUserId,
            request.activityKey(),
            request.scenarioKey()
        ) + 1;

        JsonNode submittedResponse = request.submittedResponse() == null
            ? JsonNodeFactory.instance.objectNode()
            : request.submittedResponse();

        return repository.save(new LearningAttemptEntity(
            authUserId,
            request.activityKey(),
            request.scenarioKey(),
            attemptNumber,
            request.correctElements(),
            request.requiredElements(),
            request.completed(),
            submittedResponse
        ));
    }

    private void validate(RecordLearningAttemptRequest request) {
        if (request == null
            || request.activityKey() == null
            || !ACTIVITY_KEYS.contains(request.activityKey())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown learning activity.");
        }
        if (request.scenarioKey() == null || request.scenarioKey().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A scenario key is required.");
        }
        if (request.scenarioKey().length() > 120
            || request.correctElements() < 0
            || request.requiredElements() <= 0
            || request.correctElements() > request.requiredElements()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The submitted score is invalid.");
        }
    }

    public record RecordLearningAttemptRequest(
        String activityKey,
        String scenarioKey,
        int correctElements,
        int requiredElements,
        boolean completed,
        JsonNode submittedResponse
    ) {
    }
}
