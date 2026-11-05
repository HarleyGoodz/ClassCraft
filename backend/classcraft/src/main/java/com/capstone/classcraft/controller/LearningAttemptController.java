package com.capstone.classcraft.controller;

import com.capstone.classcraft.entity.LearningAttemptEntity;
import com.capstone.classcraft.service.LearningAttemptService;
import com.capstone.classcraft.service.LearningAttemptService.RecordLearningAttemptRequest;
import com.capstone.classcraft.service.SupabaseAuthService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/learning-attempts")
public class LearningAttemptController {

    private final LearningAttemptService learningAttemptService;
    private final SupabaseAuthService supabaseAuthService;

    public LearningAttemptController(
        LearningAttemptService learningAttemptService,
        SupabaseAuthService supabaseAuthService
    ) {
        this.learningAttemptService = learningAttemptService;
        this.supabaseAuthService = supabaseAuthService;
    }

    @GetMapping
    public List<LearningAttemptEntity> getAttempts(
        @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        UUID authUserId = supabaseAuthService.requireUserId(authorization);
        return learningAttemptService.getAttempts(authUserId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LearningAttemptEntity recordAttempt(
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @RequestBody RecordLearningAttemptRequest request
    ) {
        UUID authUserId = supabaseAuthService.requireUserId(authorization);
        return learningAttemptService.recordAttempt(authUserId, request);
    }
}
