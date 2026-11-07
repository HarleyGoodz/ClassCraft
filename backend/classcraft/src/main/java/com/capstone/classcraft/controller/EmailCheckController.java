package com.capstone.classcraft.controller;

import com.capstone.classcraft.service.EmailCheckService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/email-check")
public class EmailCheckController {

    private final EmailCheckService emailCheckService;

    public EmailCheckController(EmailCheckService emailCheckService) {
        this.emailCheckService = emailCheckService;
    }

    @PostMapping
    public Map<String, Object> checkEmail(@RequestBody Map<String, String> request) {
        return emailCheckService.findProblem(request.get("email"))
            .<Map<String, Object>>map(problem -> Map.of("valid", false, "error", problem))
            .orElseGet(() -> Map.of("valid", true));
    }
}
