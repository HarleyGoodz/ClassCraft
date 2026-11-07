import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../utils/supabase";
import { findEmailProblem } from "../utils/emailCheck";
import ResendConfirmationButton from "../components/ResendConfirmationButton";
import AuthFieldHint from "../components/AuthFieldHint";
import "../App.css";

function sendSignInLink(email) {
  // New users finish their account on this page; returning users pass through it.
  return supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${window.location.origin}/complete-signup` },
  });
}

export default function ContinueWithEmail() {
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailHint, setEmailHint] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const trimmedEmail = email.trim();
    const problem = await findEmailProblem(trimmedEmail);

    if (problem) {
      setEmailHint("That address may not receive email. Check it or try another.");
      setLoading(false);
      return;
    }

    const { error: sendError } = await sendSignInLink(trimmedEmail);
    setLoading(false);

    if (sendError) {
      setError(sendError.message);
      return;
    }

    setSentTo(trimmedEmail);
  }

  if (sentTo) {
    return (
      <main className="simple-auth">
        <div className="simple-auth-form">
          <h1>ClassCraft</h1>
          <h2>Check your email</h2>

          <p>
            We sent a link to <strong>{sentTo}</strong>. Click it to continue.
            Check your spam folder if you don't see it.
          </p>

          <ResendConfirmationButton
            email={sentTo}
            onSend={() => sendSignInLink(sentTo)}
            startOnCooldown
          />

          <p>
            Wrong email?{" "}
            <button
              type="button"
              className="simple-auth-link-button"
              onClick={() => setSentTo("")}
            >
              Try again
            </button>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="simple-auth">
      <form className="simple-auth-form" onSubmit={handleSubmit}>
        <h1>ClassCraft</h1>
        <h2>Continue with Email</h2>

        <p>Enter your email and we'll send you a link to continue.</p>

        <label htmlFor="email">Email</label>
        <div className="auth-field-anchor">
          <input
            id="email"
            type="email"
            placeholder="Enter email"
            value={email}
            onInvalid={(event) => {
              event.preventDefault();
              setEmailHint(
                event.currentTarget.value.trim()
                  ? "That doesn't look like a valid email address."
                  : "Please enter your email address."
              );
            }}
            onChange={(event) => {
              setEmail(event.target.value);
              if (emailHint) {
                setEmailHint(!event.currentTarget.value.trim()
                  ? "Please enter your email address."
                  : !event.currentTarget.validity.valid
                    ? "That doesn't look like a valid email address."
                    : "");
              }
            }}
            onBlur={(event) => {
              setEmailHint(!event.currentTarget.value.trim()
                ? "Please enter your email address."
                : !event.currentTarget.validity.valid
                  ? "That doesn't look like a valid email address."
                  : "");
            }}
            aria-invalid={Boolean(emailHint) || undefined}
            aria-describedby={emailHint ? "continue-email-hint" : undefined}
            required
          />
          {emailHint && (
            <AuthFieldHint id="continue-email-hint" title="Email check">{emailHint}</AuthFieldHint>
          )}
        </div>

        {error && (
          <p className="simple-auth-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send link"}
        </button>

        <p>
          <Link to="/">Back to log in</Link>
        </p>
      </form>
    </main>
  );
}
