import { NavLink, useNavigate } from "react-router-dom";
import "../css/class_diagram_construction_css.css";

export default function ClassDiagramConstruction() {
  const navigate = useNavigate();

  function handleStart() {
    // Point this at your first scenario route when it exists,
    // e.g. navigate("/class-diagram-construction/scenario/library-system")
    navigate("/class-diagram-construction/scenario");
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
      <main className="cdc-page">
        <div className="cdc-hero">
          <h1 className="cdc-title">
            Independent Class Diagram Construction
          </h1>
          <p className="cdc-subtitle">
            Construct complete UML class diagrams from unfamiliar, increasingly
            complex problem scenarios — without system guidance. Your submitted
            diagrams are evaluated against predefined criteria, with feedback
            on missing or incorrectly modeled elements.
          </p>

          <button
            type="button"
            className="cdc-start-button"
            onClick={handleStart}
          >
            Start
          </button>

          <p className="cdc-hint">
            Target: at least <strong>80%</strong> of required diagram elements
            correctly modeled per scenario.
          </p>
        </div>
      </main>
    </div>
  );
}