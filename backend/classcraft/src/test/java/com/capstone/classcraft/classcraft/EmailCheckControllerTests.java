package com.capstone.classcraft.classcraft;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.capstone.classcraft.controller.EmailCheckController;
import com.capstone.classcraft.service.EmailCheckService;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;

class EmailCheckControllerTests {

    @Test
    void reportsValidAddress() {
        EmailCheckService service = mock(EmailCheckService.class);
        when(service.findProblem("student@gmail.com")).thenReturn(Optional.empty());

        Map<String, Object> result = new EmailCheckController(service)
            .checkEmail(Map.of("email", "student@gmail.com"));

        assertEquals(Map.of("valid", true), result);
    }

    @Test
    void reportsProblemWithAddress() {
        EmailCheckService service = mock(EmailCheckService.class);
        when(service.findProblem("student@bad.test")).thenReturn(Optional.of("Nope."));

        Map<String, Object> result = new EmailCheckController(service)
            .checkEmail(Map.of("email", "student@bad.test"));

        assertFalse((Boolean) result.get("valid"));
        assertEquals("Nope.", result.get("error"));
    }
}
