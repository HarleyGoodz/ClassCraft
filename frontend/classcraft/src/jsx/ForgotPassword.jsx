import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../utils/supabase";
import AuthFieldHint from "../components/AuthFieldHint";
import "../App.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailHint, setEmailHint] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: `${window.location.origin}/reset-password` }
    );

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setSent(true);
  }

  return (
    <main className="simple-auth">
      <form className="simple-auth-form" onSubmit={handleSubmit}>
        <h1>ClassCraft</h1>
        <h2>Forgot password</h2>

        {sent ? (
          <p>
            If an account exists for <strong>{email.trim()}</strong>, a password
            reset link has been sent. Check your inbox and spam folder.
          </p>
        ) : (
          <>
            <p>Enter your email and we'll send you a link to reset your password.</p>

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
                aria-describedby={emailHint ? "forgot-email-hint" : undefined}
                required
              />
              {emailHint && (
                <AuthFieldHint id="forgot-email-hint" title="Email check">{emailHint}</AuthFieldHint>
              )}
            </div>

            {error && <p className="simple-auth-error">{error}</p>}

            <button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </>
        )}

        <p>
          Remembered it? <Link to="/">Back to log in</Link>
        </p>
      </form>
    </main>
  );
}