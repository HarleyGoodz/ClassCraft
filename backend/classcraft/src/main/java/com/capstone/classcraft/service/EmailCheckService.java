package com.capstone.classcraft.service;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class EmailCheckService {

    private static final int MAX_EMAIL_LENGTH = 254;

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(\\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*"
            + "@([A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?\\.)+"
            + "[A-Za-z][A-Za-z0-9-]{0,61}[A-Za-z0-9]$"
    );

    private static final Map<String, String> COMMON_TYPOS = Map.ofEntries(
        Map.entry("gmial.com", "gmail.com"),
        Map.entry("gamil.com", "gmail.com"),
        Map.entry("gmai.com", "gmail.com"),
        Map.entry("gmal.com", "gmail.com"),
        Map.entry("gmail.co", "gmail.com"),
        Map.entry("gmail.con", "gmail.com"),
        Map.entry("yaho.com", "yahoo.com"),
        Map.entry("yahooo.com", "yahoo.com"),
        Map.entry("yahoo.con", "yahoo.com"),
        Map.entry("hotmial.com", "hotmail.com"),
        Map.entry("hotmal.com", "hotmail.com"),
        Map.entry("hotmail.con", "hotmail.com"),
        Map.entry("outlok.com", "outlook.com"),
        Map.entry("outlook.con", "outlook.com")
    );

    private final MailDomainResolver mailDomainResolver;

    public EmailCheckService(MailDomainResolver mailDomainResolver) {
        this.mailDomainResolver = mailDomainResolver;
    }

    /**
     * Returns why this address can't receive mail. Empty means no problem was
     * found, not that the mailbox exists: only the confirmation email proves that.
     */
    public Optional<String> findProblem(String email) {
        if (email == null
                || email.length() > MAX_EMAIL_LENGTH
                || !EMAIL_PATTERN.matcher(email).matches()) {
            return Optional.of("Please enter a valid email address.");
        }

        String domain = email.substring(email.lastIndexOf('@') + 1).toLowerCase();

        String suggestion = COMMON_TYPOS.get(domain);
        if (suggestion != null) {
            return Optional.of("Did you mean " + suggestion + "? Please check your email address.");
        }

        if (mailDomainResolver.resolve(domain) == MailDomainResolver.Status.NO_MAIL) {
            return Optional.of(domain + " can't receive email. Please check your email address.");
        }

        return Optional.empty();
    }
}
