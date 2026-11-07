import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";
import AuthFieldHint from "../components/AuthFieldHint";
import "../App.css";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [hint, setHint] = useState(null);
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
    setHint(null);

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
            <div className="auth-field-anchor">
              <input
                id="new-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (hint?.field === "password") setHint(null);
                }}
                onBlur={(event) => {
                  if (event.currentTarget.value.length < 6) {
                    setHint({ field: "password", message: event.currentTarget.value ? "Use at least 6 characters." : "Please enter a new password." });
                  } else if (hint?.field === "password") {
                    setHint(null);
                  }
                }}
                aria-invalid={hint?.field === "password" || undefined}
                aria-describedby={hint?.field === "password" ? "reset-password-hint" : undefined}
                required
              />
              {hint?.field === "password" && (
                <AuthFieldHint id="reset-password-hint" title="Password check">{hint.message}</AuthFieldHint>
              )}
            </div>

            <label htmlFor="confirm-password">Confirm new password</label>
            <div className="auth-field-anchor">
              <input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                placeholder="Re-enter new password"
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
                aria-describedby={hint?.field === "confirmPassword" ? "reset-confirm-password-hint" : undefined}
                required
              />
              {hint?.field === "confirmPassword" && (
                <AuthFieldHint id="reset-confirm-password-hint" title="Password check">{hint.message}</AuthFieldHint>
              )}
            </div>

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