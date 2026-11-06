import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";
import "../App.css";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("checking"); // checking | ready | invalid | done
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Supabase reads the recovery token from the link and creates a session.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setStatus("ready");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setStatus("ready");
    });

    // If no session appears, the link is invalid or expired.
    const timeout = setTimeout(() => {
      setStatus((current) => (current === "checking" ? "invalid" : current));
    }, 4000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

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

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setStatus("done");
    await supabase.auth.signOut();
    setTimeout(() => navigate("/", { replace: true }), 2500);
  }

  return (
    <main className="simple-auth">
      <form className="simple-auth-form" onSubmit={handleSubmit}>
        <h1>ClassCraft</h1>
        <h2>Reset password</h2>

        {status === "checking" && <p>Verifying your reset link...</p>}

        {status === "invalid" && (
          <>
            <p className="simple-auth-error">
              This reset link is invalid or has expired.
            </p>
            <p>
              <Link to="/forgot-password">Request a new link</Link>
            </p>
          </>
        )}

        {status === "done" && (
          <p>Your password has been updated. Redirecting you to log in...</p>
        )}

        {status === "ready" && (
          <>
            <label htmlFor="new-password">New password</label>
            <input
              id="new-password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <label htmlFor="confirm-password">Confirm new password</label>
            <input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <label className="show-password-option">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
              />
              Show passwords
            </label>

            {error && <p className="simple-auth-error">{error}</p>}

            <button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update password"}
            </button>
          </>
        )}

        <p>
          <Link to="/">Back to log in</Link>
        </p>
      </form>
    </main>
  );
}