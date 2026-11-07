package com.capstone.classcraft.service;

import org.springframework.stereotype.Component;

import javax.naming.Context;
import javax.naming.NameNotFoundException;
import javax.naming.NamingException;
import javax.naming.directory.Attribute;
import javax.naming.directory.Attributes;
import javax.naming.directory.DirContext;
import javax.naming.directory.InitialDirContext;
import java.util.Hashtable;

@Component
public class MailDomainResolver {

    public enum Status { ACCEPTS_MAIL, NO_MAIL, UNKNOWN }

    public Status resolve(String domain) {
        Hashtable<String, String> environment = new Hashtable<>();
        environment.put(
            Context.INITIAL_CONTEXT_FACTORY,
            "com.sun.jndi.dns.DnsContextFactory"
        );
        environment.put("com.sun.jndi.dns.timeout.initial", "2000");
        environment.put("com.sun.jndi.dns.timeout.retries", "1");

        DirContext context = null;
        try {
            context = new InitialDirContext(environment);
            // The trailing dot stops the local DNS search suffix being appended.
            String name = domain + ".";

            Attribute mx = context.getAttributes(name, new String[] {"MX"}).get("MX");
            if (mx != null && mx.size() > 0) {
                // "0 ." is a null MX: the domain declares it never receives mail.
                String first = String.valueOf(mx.get()).trim();
                return mx.size() == 1 && first.matches("0\\s+\\.?")
                    ? Status.NO_MAIL
                    : Status.ACCEPTS_MAIL;
            }

            // Without an MX record, mail falls back to the domain's address record.
            Attributes address = context.getAttributes(name, new String[] {"A", "AAAA"});
            return address.size() > 0 ? Status.ACCEPTS_MAIL : Status.NO_MAIL;

        } catch (NameNotFoundException exception) {
            return Status.NO_MAIL;
        } catch (NamingException exception) {
            return Status.UNKNOWN;
        } finally {
            if (context != null) {
                try {
                    context.close();
                } catch (NamingException ignored) {
                    // Nothing useful to do if closing the lookup fails.
                }
            }
        }
    }
}
