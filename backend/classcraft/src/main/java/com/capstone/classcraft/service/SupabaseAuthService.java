package com.capstone.classcraft.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.UUID;

@Service
public class SupabaseAuthService {

    private final String supabaseUrl;
    private final String publishableKey;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public SupabaseAuthService(
        @Value("${supabase.url:}") String supabaseUrl,
        @Value("${supabase.publishable-key:}") String publishableKey,
        ObjectMapper objectMapper
    ) {
        this.supabaseUrl = supabaseUrl;
        this.publishableKey = publishableKey;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();
    }

    public UUID requireUserId(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "A bearer token is required.");
        }

        if (supabaseUrl.isBlank() || publishableKey.isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.SERVICE_UNAVAILABLE,
                "Supabase authentication is not configured on the backend."
            );
        }

        String accessToken = authorizationHeader.substring("Bearer ".length()).trim();
        if (accessToken.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "A bearer token is required.");
        }

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(supabaseUrl.replaceAll("/+$", "") + "/auth/v1/user"))
            .timeout(Duration.ofSeconds(10))
            .header("apikey", publishableKey)
            .header("Authorization", "Bearer " + accessToken)
            .GET()
            .build();

        try {
            HttpResponse<String> response = httpClient.send(
                request,
                HttpResponse.BodyHandlers.ofString()
            );

            if (response.statusCode() == 401 || response.statusCode() == 403) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "The access token is invalid or expired.");
            }
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Supabase could not verify the access token."
                );
            }

            JsonNode user = objectMapper.readTree(response.body());
            return UUID.fromString(user.path("id").asText());
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(
                HttpStatus.SERVICE_UNAVAILABLE,
                "Supabase authentication was interrupted.",
                exception
            );
        } catch (IOException | IllegalArgumentException exception) {
            throw new ResponseStatusException(
                HttpStatus.BAD_GATEWAY,
                "Supabase returned an invalid authentication response.",
                exception
            );
        }
    }
}
