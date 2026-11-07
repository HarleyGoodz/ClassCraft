import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";

const COOLDOWN_SECONDS = 60;

export default function ResendConfirmationButton({ email, onSend, startOnCooldown = false }) {
  const [secondsLeft, setSecondsLeft] = useState(startOnCooldown ? COOLDOWN_SECONDS : 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (secondsLeft <= 0) return undefined;
    const timer = setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  async function handleResend() {
    setError("");
    setResent(false);
    setLoading(true);

    const { error: resendError } = onSend
      ? await onSend()
      : await supabase.auth.resend({
          type: "signup",
          email,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });

    setLoading(false);

    if (resendError) {
      setError(resendError.message);
      return;
    }

    setResent(true);
    setSecondsLeft(COOLDOWN_SECONDS);
  }

  let label = "Resend email";
  if (loading) label = "Sending...";
  else if (secondsLeft > 0) label = `Resend in ${secondsLeft}s`;

  return (
    <>
      <button
        type="button"
        onClick={handleResend}
        disabled={loading || secondsLeft > 0}
      >
        {label}
      </button>

      {resent && <p role="status">Email sent. Check your inbox and spam folder.</p>}
      {error && (
        <p className="simple-auth-error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
