import { PILLARS, SCENARIOS } from "../questionBank/fourOopPillars.jsx";
import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";
import "../css/dashboard_css.css";
import "../css/four_oop_pillars.css";
import "../css/lesson_path_header.css";
import {
  PillarDiagram,
  ScenarioDiagram,
} from "../components/pillars_diagram";

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

export default function FourOopPillars() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("User");
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [selectedPillar, setSelectedPillar] = useState("Abstraction");
  const scenario = SCENARIOS[scenarioIndex];

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

  function showAnotherScenario() {
    setScenarioIndex((currentIndex) => (currentIndex + 1) % SCENARIOS.length);
  }

  return (
    <div className="app-shell">
      {/* ===== Top navigation (styles in dashboard_css.css) ===== */}
      <TopNav username={username} onLogout={handleLogout} />

      <main className="four-oop-page">
        <p className="lesson-breadcrumb">
          <NavLink to="/learn-basics">Learn the Basics</NavLink>
          <span className="lesson-breadcrumb-separator" aria-hidden="true">
            ›
          </span>
          <span className="lesson-breadcrumb-current" aria-current="page">
            The Four OOP Pillars
          </span>
        </p>

        <header className="four-oop-header">
          <h1>The Four OOP Pillars</h1>
          <p>
            Object-oriented programming uses four core ideas to organize code:
            encapsulation, abstraction, inheritance, and polymorphism.
          </p>
        </header>

        <section className="four-oop-grid" aria-label="The four OOP pillars">
          {PILLARS.map((pillar) => (
            <article className="four-oop-card" key={pillar.name}>
              <h2>{pillar.name}</h2>
              <p className="four-oop-summary">{pillar.summary}</p>
              <PillarDiagram type={pillar.name} />
              <p className="four-oop-example">{pillar.example}</p>
            </article>
          ))}
        </section>

        <section className="four-oop-scenario" aria-live="polite">
          <h2>Example scenario: {scenario.title}</h2>
          <p className="scenario-intro">
            {scenario.intro}
          </p>
          <ScenarioDiagram
            scenario={scenario}
            selectedPillar={selectedPillar}
          />
          <p className="scenario-explorer-hint">
            Select a pillar to see how it appears in the diagram.
          </p>
          <ul className="scenario-pillar-list">
            {scenario.pillars.map(({ pillar, description }) => (
              <li key={pillar}>
                <button
                  type="button"
                  className={`scenario-pillar-button${selectedPillar === pillar ? " is-active" : ""}`}
                  onClick={() => setSelectedPillar(pillar)}
                  aria-pressed={selectedPillar === pillar}
                >
                  <strong>{pillar}</strong>
                </button>
                : {description}
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="scenario-toggle"
            onClick={showAnotherScenario}
          >
            Show another scenario
          </button>
        </section>
      </main>
    </div>
  );
}