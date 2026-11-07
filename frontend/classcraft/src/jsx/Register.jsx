import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";
import { findEmailProblem } from "../utils/emailCheck";
import SocialAuthButtons from "../components/SocialAuthButtons";
import ResendConfirmationButton from "../components/ResendConfirmationButton";
import AuthFieldHint from "../components/AuthFieldHint";
import "../App.css";

function PasswordToggle({ visible, onToggle }) {
  return (
    <button
      type="button"
      className="password-toggle"
      onClick={onToggle}
      aria-label={visible ? "Hide password" : "Show password"}
    >
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
        {visible ? (
          <>
            <path d="M3 3l18 18" />
            <path d="M10.6 10.6a2 2 0 002.8 2.8" />
            <path d="M9.9 5.2A10.8 10.8 0 0112 5c5 0 8.5 4.5 9.5 7a11.7 11.7 0 01-3.1 4.4" />
            <path d="M6.2 6.2A12.5 12.5 0 002.5 12c1 2.5 4.5 7 9.5 7a10.5 10.5 0 004-.8" />
          </>
        ) : (
          <>
            <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" />
            <circle cx="12" cy="12" r="3" />
          </>
        )}
      </svg>
    </button>
  );
}

export default function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmationSentTo, setConfirmationSentTo] = useState("");
  const [hint, setHint] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setHint(null);

    if (username.trim().length < 2) {
      setHint({
        field: "username",
        title: "Username check",
        message: "Use at least 2 non-space characters.",
      });
      return;
    }

    if (password.length < 6) {
      setHint({ field: "password", title: "Password check", message: "Use at least 6 characters." });
      return;
    }

    if (password !== confirmPassword) {
      setHint({ field: "confirmPassword", title: "Password check", message: "These passwords don't match." });
      return;
    }

    const emailProblem = await findEmailProblem(email.trim());

    if (emailProblem) {
      setHint({
        field: "email",
        title: "Email check",
        message: "That address may not receive email. Check it or try another.",
      });
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          username: username.trim(),
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    // Supabase sends no email for an address that is already registered and
    // signals it with an empty identities list.
    if (data.user?.identities?.length === 0) {
      setError("An account with this email already exists. Please log in instead.");
      return;
    }

    if (!data.session) {
      setConfirmationSentTo(email.trim());
      return;
    }

    navigate("/");
  }

  if (confirmationSentTo) {
    return (
      <main className="simple-auth">
        <div className="simple-auth-form">
          <h1>ClassCraft</h1>
          <h2>Confirm your email</h2>

          <p>
            We sent a confirmation link to <strong>{confirmationSentTo}</strong>.
            Click it to activate your account, then log in. Check your spam
            folder if you don't see it.
          </p>

          <ResendConfirmationButton email={confirmationSentTo} startOnCooldown />

          <p>
            Wrong email?{" "}
            <button
              type="button"
              className="simple-auth-link-button"
              onClick={() => setConfirmationSentTo("")}
            >
              Sign up again
            </button>
          </p>
          <p>
            Already confirmed? <Link to="/">Log in</Link>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="simple-auth">
      <form className="simple-auth-form" onSubmit={handleSubmit}>
        <h1>ClassCraft</h1>
        <h2>Create an account</h2>

        <label htmlFor="username">Username</label>
        <div className="auth-field-anchor">
          <input
            id="username"
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(event) => {
              setUsername(event.target.value);
              if (hint?.field === "username") setHint(null);
            }}
            onBlur={(event) => {
              const value = event.currentTarget.value.trim();
              if (value.length < 2) {
                setHint({ field: "username", title: "Username check", message: value ? "Use at least 2 characters." : "Please enter a username." });
              } else if (hint?.field === "username") {
                setHint(null);
              }
            }}
            aria-invalid={hint?.field === "username" || undefined}
            aria-describedby={hint?.field === "username" ? "register-username-hint" : undefined}
            required
            minLength={2}
          />
          {hint?.field === "username" && (
            <AuthFieldHint id="register-username-hint" title={hint.title}>{hint.message}</AuthFieldHint>
          )}
        </div>

        <label htmlFor="email">Email</label>
        <div className="auth-field-anchor">
          <input
            id="email"
            type="email"
            placeholder="Enter email"
            value={email}
            onInvalid={(event) => {
              event.preventDefault();
              setHint({
                field: "email",
                title: "Email check",
                message: event.currentTarget.value.trim()
                  ? "That doesn't look like a valid email address."
                  : "Please enter your email address.",
              });
            }}
            onChange={(event) => {
              setEmail(event.target.value);
              if (hint?.field === "email") {
                setHint(!event.currentTarget.value.trim()
                  ? { field: "email", title: "Email check", message: "Please enter your email address." }
                  : !event.currentTarget.validity.valid
                    ? { field: "email", title: "Email check", message: "That doesn't look like a valid email address." }
                    : null);
              }
            }}
            onBlur={(event) => {
              if (!event.currentTarget.value.trim()) {
                setHint({ field: "email", title: "Email check", message: "Please enter your email address." });
              } else if (!event.currentTarget.validity.valid) {
                setHint({ field: "email", title: "Email check", message: "That doesn't look like a valid email address." });
              } else if (hint?.field === "email") {
                setHint(null);
              }
            }}
            aria-invalid={hint?.field === "email" || undefined}
            aria-describedby={hint?.field === "email" ? "register-email-hint" : undefined}
            required
          />
          {hint?.field === "email" && (
            <AuthFieldHint id="register-email-hint" title={hint.title}>{hint.message}</AuthFieldHint>
          )}
        </div>

        <label htmlFor="password">Password</label>
        <div className="password-wrapper">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="At least 6 characters"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              if (hint?.field === "password") setHint(null);
            }}
            onBlur={(event) => {
              if (event.currentTarget.value.length < 6) {
                setHint({ field: "password", title: "Password check", message: event.currentTarget.value ? "Use at least 6 characters." : "Please enter a password." });
              } else if (hint?.field === "password") {
                setHint(null);
              }
            }}
            aria-invalid={hint?.field === "password" || undefined}
            aria-describedby={hint?.field === "password" ? "register-password-hint" : undefined}
            required
            minLength={6}
          />
          {hint?.field === "password" && (
            <AuthFieldHint id="register-password-hint" title={hint.title}>{hint.message}</AuthFieldHint>
          )}
          <PasswordToggle
            visible={showPassword}
            onToggle={() => setShowPassword(!showPassword)}
          />
        </div>

        <label htmlFor="confirmPassword">Confirm password</label>
        <div className="password-wrapper">
          <input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
              if (hint?.field === "confirmPassword") setHint(null);
            }}
            onBlur={() => {
              if (!confirmPassword) {
                setHint({ field: "confirmPassword", title: "Password check", message: "Please re-enter your password." });
              } else if (confirmPassword !== password) {
                setHint({ field: "confirmPassword", title: "Password check", message: "These passwords don't match." });
              } else if (hint?.field === "confirmPassword") {
                setHint(null);
              }
            }}
            aria-invalid={hint?.field === "confirmPassword" || undefined}
            aria-describedby={hint?.field === "confirmPassword" ? "register-confirm-password-hint" : undefined}
            required
          />
          {hint?.field === "confirmPassword" && (
            <AuthFieldHint id="register-confirm-password-hint" title={hint.title}>{hint.message}</AuthFieldHint>
          )}
          <PasswordToggle
            visible={showConfirmPassword}
            onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
          />
        </div>

        {error && (
          <p className="simple-auth-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit">Create account</button>

        <div className="simple-auth-divider">or</div>

        <SocialAuthButtons />

        <p>
          Already have an account? <Link to="/">Log in</Link>
        </p>
      </form>
    </main>
  );
}