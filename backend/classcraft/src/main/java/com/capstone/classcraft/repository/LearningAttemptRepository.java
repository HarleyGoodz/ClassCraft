package com.capstone.classcraft.repository;

import com.capstone.classcraft.entity.LearningAttemptEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LearningAttemptRepository extends JpaRepository<LearningAttemptEntity, Long> {

    List<LearningAttemptEntity> findAllByAuthUserIdOrderByCreatedAtAsc(UUID authUserId);

    List<LearningAttemptEntity> findAllByOrderByCreatedAtDesc();

    @Query("""
        select coalesce(max(attempt.attemptNumber), 0)
        from LearningAttemptEntity attempt
        where attempt.authUserId = :authUserId
          and attempt.activityKey = :activityKey
          and attempt.scenarioKey = :scenarioKey
        """)
    int findHighestAttemptNumber(
        @Param("authUserId") UUID authUserId,
        @Param("activityKey") String activityKey,
        @Param("scenarioKey") String scenarioKey
    );
}
