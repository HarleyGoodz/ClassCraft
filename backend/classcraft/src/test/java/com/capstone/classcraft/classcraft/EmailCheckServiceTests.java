package com.capstone.classcraft.classcraft;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.capstone.classcraft.service.EmailCheckService;
import com.capstone.classcraft.service.MailDomainResolver;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class EmailCheckServiceTests {

    private MailDomainResolver resolver;
    private EmailCheckService service;

    @BeforeEach
    void setUp() {
        resolver = mock(MailDomainResolver.class);
        service = new EmailCheckService(resolver);
        when(resolver.resolve(any())).thenReturn(MailDomainResolver.Status.ACCEPTS_MAIL);
    }

    @Test
    void acceptsWellFormedAddresses() {
        for (String email : List.of(
                "student@gmail.com",
                "first.last+tag@school.edu.ph",
                "a@b.co")) {
            assertTrue(service.findProblem(email).isEmpty(), email);
        }
    }

    @Test
    void rejectsMalformedAddressesWithoutLookup() {
        for (String email : List.of(
                "",
                "plainaddress",
                "@gmail.com",
                "student@",
                "student@gmail",
                "stu dent@gmail.com",
                "student..name@gmail.com",
                ".student@gmail.com",
                "student@-gmail.com",
                "student@gmail..com")) {
            assertEquals(
                "Please enter a valid email address.",
                service.findProblem(email).orElseThrow(),
                email
            );
        }
        verify(resolver, never()).resolve(any());
    }

    @Test
    void rejectsMissingAndOverlongAddresses() {
        assertTrue(service.findProblem(null).isPresent());
        assertTrue(service.findProblem("a".repeat(250) + "@b.co").isPresent());
    }

    @Test
    void suggestsCorrectionForCommonTypos() {
        assertEquals(
            "Did you mean gmail.com? Please check your email address.",
            service.findProblem("student@GMIAL.com").orElseThrow()
        );
    }

    @Test
    void rejectsDomainsThatCannotReceiveMail() {
        when(resolver.resolve("fake-domain.test")).thenReturn(MailDomainResolver.Status.NO_MAIL);

        assertEquals(
            "fake-domain.test can't receive email. Please check your email address.",
            service.findProblem("student@fake-domain.test").orElseThrow()
        );
    }

    @Test
    void allowsAddressWhenDnsLookupIsInconclusive() {
        when(resolver.resolve("school.edu")).thenReturn(MailDomainResolver.Status.UNKNOWN);

        assertTrue(service.findProblem("student@school.edu").isEmpty());
    }
}
