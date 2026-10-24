import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";
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

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          username: username.trim(),
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (!data.session) {
      setError(
        "Account created! Please check your email to confirm your account, then log in."
      );
      return;
    }

    navigate("/");
  }

  return (
    <main className="simple-auth">
      <form className="simple-auth-form" onSubmit={handleSubmit}>
        <h1>ClassCraft</h1>
        <h2>Create an account</h2>

        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          minLength={2}
        />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password">Password</label>
        <div className="password-wrapper">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
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
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
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

        <p>
          Already have an account? <Link to="/">Log in</Link>
        </p>
      </form>
    </main>
  );
}