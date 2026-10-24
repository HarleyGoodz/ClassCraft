
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";

export default function Dashboard() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("User");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUser() {
      const { data, error: authError } =
        await supabase.auth.getUser();

      if (authError || !data.user) {
        navigate("/", { replace: true });
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:8080/api/users`
        );

        if (!response.ok) {
          throw new Error("Could not load your profile.");
        }

        const users = await response.json();

        const profile = users.find(
          (item) => item.authUserId === data.user.id
        );

        if (profile) {
          setUsername(profile.username);
        } else {
          setError("Your profile was not found.");
        }
      } catch (err) {
        setError(
          err.message || "Could not connect to the backend."
        );
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [navigate]);

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      setError(error.message);
      return;
    }

    navigate("/", { replace: true });
  }

  if (loading) {
    return <main className="dashboard">Loading your profile...</main>;
  }

  return (
    <main className="dashboard">
      <h1>Hello, {username}!</h1>
      <p>Welcome to ClassCraft.</p>

      {error && <p role="alert">{error}</p>}

      <button className="submit-button" onClick={handleLogout}>
        Log out
      </button>
    </main>
  );
}
