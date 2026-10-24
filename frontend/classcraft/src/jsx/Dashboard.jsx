import { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { supabase } from "../utils/supabase";
import "../css/dashboard_css.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("User");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUser() {
      const { data, error: authError } = await supabase.auth.getUser();

      if (authError || !data.user) {
        navigate("/", { replace: true });
        return;
      }

      try {
        const response = await fetch(`http://localhost:8080/api/users`);

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
        setError(err.message || "Could not connect to the backend.");
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
    <div className="dashboard-layout">
      {/* ===== Sidebar ===== */}
      <aside className="sidebar">
        <h2 className="sidebar-brand">ClassCraft</h2>
        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
            end
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/learn-basics"
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            Learn the Basics
          </NavLink>
          <NavLink
            to="/skill-development"
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            Skill Development
          </NavLink>
          <NavLink
            to="/class-diagram-construction"
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            Class Diagram Construction
          </NavLink>
          <NavLink
            to="/my-progress"
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            My Progress
          </NavLink>
        </nav>
      </aside>

      {/* ===== Main content ===== */}
      <main className="dashboard">
        <h1>Hello, {username}!</h1>
        <p>Welcome to ClassCraft.</p>

        {error && <p role="alert">{error}</p>}

        <button className="submit-button" onClick={handleLogout}>
          Log out
        </button>
      </main>
    </div>
  );
}