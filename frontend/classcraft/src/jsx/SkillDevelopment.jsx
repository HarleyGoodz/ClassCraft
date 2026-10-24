import { NavLink, useNavigate } from "react-router-dom";
import "../css/skill_development_css.css";

/* ------------------------------------------------------------------ */
/* PLACEHOLDER DATA — swap for backend values later                   */
/* ------------------------------------------------------------------ */
const EXPERIENCES = [
  {
    key: "class-diagram-formation",
    title: "Class Diagram Formation",
    description:
      "Identify candidate classes and organize attributes, methods, and visibility symbols.",
    accuracy: 85,
  },
  {
    key: "class-relationships",
    title: "Class Relationships",
    description:
      "Apply association, inheritance, aggregation, and composition between classes.",
    accuracy: 68,
  },
  {
    key: "multiplicity",
    title: "Multiplicity",
    description:
      "Assign the correct multiplicity notation to relationships in a sample class diagram.",
    accuracy: 72,
  },
  {
    key: "oop-class-modeling",
    title: "OOP-Based Class Modeling",
    description:
      "Build a complete class diagram from a scenario using the four OOP pillars.",
    accuracy: null,
  },
];

const TARGET_ACCURACY = 80;

function accuracyLabel(value) {
  if (value === null) return { text: "Not attempted", status: "empty" };
  if (value >= TARGET_ACCURACY)
    return { text: `First-attempt accuracy: ${value}%`, status: "pass" };
  return { text: `First-attempt accuracy: ${value}%`, status: "warn" };
}

export default function SkillDevelopment() {
  const navigate = useNavigate();

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
      <main className="skill-development">
        <header className="skill-development-header">
          <h1>Skill Development</h1>
          <p>
            Practice each class-modeling skill. A Guided Experience opens
            automatically if your first-attempt accuracy drops below{" "}
            {TARGET_ACCURACY}%.
          </p>
        </header>

        <section className="experience-grid">
          {EXPERIENCES.map((exp) => {
            const acc = accuracyLabel(exp.accuracy);
            return (
              <article key={exp.key} className="experience-card">
                <div className="experience-card-body">
                  <h2 className="experience-title">{exp.title}</h2>
                  <p className="experience-description">
                    {exp.description}
                  </p>
                  <p className={`experience-accuracy accuracy--${acc.status}`}>
                    {acc.text}
                  </p>
                </div>
                <button
                  type="button"
                  className="practice-button"
                  onClick={() =>
                    navigate(`/skill-development/${exp.key}`)
                  }
                >
                  Practice
                </button>
              </article>
            );
          })}
        </section>

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