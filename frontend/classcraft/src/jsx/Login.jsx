
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";
import { getUserHomePath } from "../utils/authRoles";
import ResendConfirmationButton from "../components/ResendConfirmationButton";
import SocialAuthButtons from "../components/SocialAuthButtons";
import AuthFieldHint from "../components/AuthFieldHint";
import "../App.css";

function getConfirmationLinkError() {
  const linkError = new URLSearchParams(window.location.hash.slice(1)).get("error_code");

  if (!linkError) return "";

  return linkError === "otp_expired"
    ? "That confirmation link is invalid or has expired. Log in with your email and password to get a new one."
    : "We couldn't confirm your email from that link. Please try again.";
}

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailHint, setEmailHint] = useState("");
  const [passwordHint, setPasswordHint] = useState("");
  const [error, setError] = useState(getConfirmationLinkError);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState("");

  // Confirmation links land here: signed in if valid, error details in the URL if not.
  useEffect(() => {
    if (window.location.hash.includes("error_code=")) {
      window.history.replaceState(null, "", window.location.pathname);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate(getUserHomePath(session.user), { replace: true });
    });
  }, [navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setUnconfirmedEmail("");
    setEmailHint("");
    setPasswordHint("");

    const { data, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    if (signInError) {
      if (signInError.code === "email_not_confirmed") {
        setError("Please confirm your email before logging in. Check your inbox and spam folder.");
        setUnconfirmedEmail(email.trim());
        return;
      }

      if (signInError.code === "invalid_credentials") {
        setPasswordHint("credentials");
        return;
      }

      setError(signInError.message);
      return;
    }

    navigate(getUserHomePath(data.user), { replace: true });
  }

  return (
    <main className="simple-auth">
      <form className="simple-auth-form" onSubmit={handleSubmit}>
        <h1>ClassCraft</h1>
        <h2>Log in</h2>

        <label htmlFor="email">Email</label>
        <div className="login-email-field">
          <input
            id="email"
            type="email"
            placeholder="Enter email"
            value={email}
            onInvalid={(event) => {
              event.preventDefault();
              setEmailHint(event.currentTarget.value.trim() ? "format" : "required");
            }}
            onChange={(event) => {
              const nextEmail = event.target.value;
              setEmail(nextEmail);
              setPasswordHint("");
              if (!nextEmail || event.currentTarget.validity.valid) {
                setEmailHint("");
              } else if (emailHint) {
                setEmailHint("format");
              }
            }}
            onBlur={(event) => {
              if (!event.currentTarget.value.trim()) {
                setEmailHint("required");
              } else if (!event.currentTarget.validity.valid) {
                setEmailHint("format");
              }
            }}
            aria-invalid={Boolean(emailHint) || undefined}
            aria-describedby={emailHint ? "login-email-hint" : undefined}
            required
          />
          {emailHint && (
            <AuthFieldHint id="login-email-hint" title="Email check">
              {emailHint === "required"
                ? "Please enter your email address."
                : "That doesn't look like a valid email address."}
            </AuthFieldHint>
          )}
        </div>

        <label htmlFor="password">Password</label>
        <div className="password-wrapper">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter password"
            value={password}
            onChange={(event) => {
              const nextPassword = event.target.value;
              setPassword(nextPassword);
              setPasswordHint("");
            }}
            onBlur={(event) => {
              if (!event.currentTarget.value) setPasswordHint("required");
            }}
            aria-invalid={Boolean(passwordHint) || undefined}
            aria-describedby={passwordHint ? "login-password-hint" : undefined}
            required
          />

          
        <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            >
            {showPassword ? (
                <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                >
                <path d="M3 3l18 18" />
                <path d="M10.6 10.6a2 2 0 002.8 2.8" />
                <path d="M9.9 5.2A10.8 10.8 0 0112 5c5 0 8.5 4.5 9.5 7a11.7 11.7 0 01-3.1 4.4" />
                <path d="M6.2 6.2A12.5 12.5 0 002.5 12c1 2.5 4.5 7 9.5 7a10.5 10.5 0 004-.8" />
                </svg>
            ) : (
                <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                >
                <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" />
                <circle cx="12" cy="12" r="3" />
                </svg>
            )}
        </button>
          {passwordHint && (
            <AuthFieldHint id="login-password-hint" title="Password check">
              {passwordHint === "required"
                ? "Please enter your password."
                : "These details don't match. Check your email and password."}
            </AuthFieldHint>
          )}
        </div>

        <p className="forgot-password-link">
    <Link to="/forgot-password">Forgot password?</Link>
        </p>

        {error && <p className="simple-auth-error">{error}</p>}

        <button type="submit">Log in</button>

        {unconfirmedEmail && <ResendConfirmationButton email={unconfirmedEmail} />}

        <div className="simple-auth-divider">or</div>

        <SocialAuthButtons />

        <p>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </main>
  );
}
