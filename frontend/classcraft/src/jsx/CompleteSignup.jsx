import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";
import AuthFieldHint from "../components/AuthFieldHint";
import "../App.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

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

async function claimUsername(username, accessToken) {
  const response = await fetch(`${API_BASE_URL}/api/users/me/username`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ username }),
  }).catch(() => {
    throw new Error("Could not reach the server. Please try again in a moment.");
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error || "Could not save your username. Please try again.");
  }
}

export default function CompleteSignup() {
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: current } }) => {
      if (!current) {
        navigate("/", { replace: true });
      } else if (current.user.user_metadata?.username) {
        navigate("/dashboard", { replace: true });
      } else {
        setSession(current);
      }
    });
  }, [navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setHint(null);

    if (username.trim().length < 2) {
      setHint({ field: "username", message: "Use at least 2 non-space characters." });
      return;
    }

    if (password.length < 6) {
      setHint({ field: "password", message: "Use at least 6 characters." });
      return;
    }

    if (password !== confirmPassword) {
      setHint({ field: "confirmPassword", message: "These passwords don't match." });
      return;
    }

    setHint(null);
    setLoading(true);

    try {
      const trimmedUsername = username.trim();
      await claimUsername(trimmedUsername, session.access_token);

      // A username in user metadata is what marks setup as finished.
      const { error: updateError } = await supabase.auth.updateUser({
        password,
        data: { username: trimmedUsername },
      });

      if (updateError) throw updateError;

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  async function handleUseDifferentAccount() {
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  }

  if (!session) return null;

  return (
    <main className="simple-auth">
      <form className="simple-auth-form" onSubmit={handleSubmit}>
        <h1>ClassCraft</h1>
        <h2>Finish creating your account</h2>

        <p className="complete-signup-email">
          Signed in as <strong>{session.user.email}</strong>
        </p>

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
                setHint({ field: "username", message: value ? "Use at least 2 characters." : "Please enter a username." });
              } else if (value.length > 30) {
                setHint({ field: "username", message: "Keep your username under 30 characters." });
              } else if (hint?.field === "username") {
                setHint(null);
              }
            }}
            aria-invalid={hint?.field === "username" || undefined}
            aria-describedby={hint?.field === "username" ? "signup-username-hint" : undefined}
            required
            minLength={2}
            maxLength={30}
          />
          {hint?.field === "username" && (
            <AuthFieldHint id="signup-username-hint" title="Username check">{hint.message}</AuthFieldHint>
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
                setHint({ field: "password", message: event.currentTarget.value ? "Use at least 6 characters." : "Please enter a password." });
              } else if (hint?.field === "password") {
                setHint(null);
              }
            }}
            aria-invalid={hint?.field === "password" || undefined}
            aria-describedby={hint?.field === "password" ? "signup-password-hint" : undefined}
            required
            minLength={6}
          />
          {hint?.field === "password" && (
            <AuthFieldHint id="signup-password-hint" title="Password check">{hint.message}</AuthFieldHint>
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
                setHint({ field: "confirmPassword", message: "Please re-enter your password." });
              } else if (confirmPassword !== password) {
                setHint({ field: "confirmPassword", message: "These passwords don't match." });
              } else if (hint?.field === "confirmPassword") {
                setHint(null);
              }
            }}
            aria-invalid={hint?.field === "confirmPassword" || undefined}
            aria-describedby={hint?.field === "confirmPassword" ? "signup-confirm-password-hint" : undefined}
            required
          />
          {hint?.field === "confirmPassword" && (
            <AuthFieldHint id="signup-confirm-password-hint" title="Password check">{hint.message}</AuthFieldHint>
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

        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </button>

        <button
          type="button"
          className="simple-auth-text-button"
          onClick={handleUseDifferentAccount}
        >
          Use a different account
        </button>
      </form>
    </main>
  );
}
