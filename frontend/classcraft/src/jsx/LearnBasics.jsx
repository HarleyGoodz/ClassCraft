/*
 * LearnBasics.jsx: the Learn the Basics topic list page (/learn-basics).
 * Purpose: the starting point for the lessons.
 * What it does: shows each topic from LEARN_BASICS_TOPICS as a class-style card that opens
 * that lesson.
 */
import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";
import { LEARN_BASICS_TOPICS } from "../utils/learnBasicsTopics";
import "../css/LearnBasics_css.css";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", end: true },
  { to: "/learn-basics", label: "Learn the Basics" },
  { to: "/skill-development", label: "Skill Development" },
  { to: "/class-diagram-construction", label: "Class Diagram Construction" },
];

function TopNav({ username, onLogout }) {
  const initial = (username || "U").trim().charAt(0).toUpperCase();
  return (
    <header className="topnav">
      <div className="topnav-inner">
        <Link to="/dashboard" className="topnav-brand">ClassCraft</Link>

        <nav className="topnav-links" aria-label="Main">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? "topnav-link active" : "topnav-link")}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="topnav-user">
          <span className="topnav-avatar" aria-hidden="true">{initial}</span>
          <span className="topnav-username">{username}</span>
          <button type="button" className="topnav-logout" onClick={onLogout}>
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}

export default function LearnBasics() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("User");

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession();
      setUsername(session?.user?.user_metadata?.username || "User");
    }
    loadUser();
  }, []);

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout failed:", error.message);
      return;
    }
    navigate("/", { replace: true });
  }

  return (
    <div className="app-shell">
      {/* ===== Top navigation ===== */}
      <TopNav username={username} onLogout={handleLogout} />

      {/* ===== Main content ===== */}
      <main className="learn-basics">
        <header className="learn-basics-header">
          <h1>Learn the Basics</h1>
          <p>Select a topic to begin.</p>
        </header>

        <section className="topic-grid">
          {LEARN_BASICS_TOPICS.map((topic) => (
            <button
              key={topic.key}
              type="button"
              className="topic-button"
              onClick={() => navigate(`/learn-basics/${topic.key}`)}
            >
              <span className="topic-header">
                <span className="topic-stereotype" aria-hidden="true">«topic»</span>
                <span className="topic-name">{topic.label}</span>
              </span>
              <span className="topic-covers" aria-hidden="true">
                {topic.covers.map((item) => (
                  <span key={item} className="topic-cover">- {item}</span>
                ))}
              </span>
              <span className="topic-action" aria-hidden="true">
                <span>+ open()</span>
                <span className="topic-arrow">→</span>
              </span>
            </button>
          ))}
        </section>
      </main>
    </div>
  );
}