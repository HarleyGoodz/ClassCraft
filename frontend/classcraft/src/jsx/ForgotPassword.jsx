import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../utils/supabase";
import "../App.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

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
            <input
              id="email"
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

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