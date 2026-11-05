import { PILLARS, SCENARIOS } from "../questionBank/fourOopPillars.jsx";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import "../css/dashboard_css.css";
import "../css/four_oop_pillars.css";
import "../css/lesson_path_header.css";
import {
  PillarDiagram,
  ScenarioDiagram,
} from "../components/pillars_diagram";





export default function FourOopPillars() {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [selectedPillar, setSelectedPillar] = useState("Abstraction");
  const scenario = SCENARIOS[scenarioIndex];

  function showAnotherScenario() {
    setScenarioIndex((currentIndex) => (currentIndex + 1) % SCENARIOS.length);
  }

  return (
    <div className="dashboard-layout">
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
        </nav>
      </aside>

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
