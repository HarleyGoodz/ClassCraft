import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../css/LearnBasics_css.css";

const TOPICS = [
  { key: "classes-objects", label: "Classes and Objects" },
  { key: "class-construction", label: "Class Construction" },
  { key: "relationships-multiplicity", label: "Relationships and Multiplicity" },
  { key: "four-oop-pillars", label: "The Four OOP Pillars" },
];

export default function LearnBasics() {
  const navigate = useNavigate();
  const [activeTopic, setActiveTopic] = useState(null);

  return (
    <div className="dashboard-layout">
      {/* ===== Sidebar (shared across pages) ===== */}
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
      <main className="learn-basics">
        <header className="learn-basics-header">
          <h1>Learn the Basics</h1>
          <p>Select a topic to begin.</p>
        </header>

        <section className="topic-grid">
          {TOPICS.map((topic) => (
            <button
              key={topic.key}
              type="button"
              className={
                activeTopic === topic.key
                  ? "topic-button active"
                  : "topic-button"
              }
              onClick={() => setActiveTopic(topic.key)}
            >
              {topic.label}
            </button>
          ))}
        </section>

        {activeTopic && (
          <p className="topic-hint">
            You selected:{" "}
            <strong>
              {TOPICS.find((t) => t.key === activeTopic)?.label}
            </strong>
          </p>
        )}

        <button
          type="button"
          className="back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>
      </main>
    </div>
  );
}