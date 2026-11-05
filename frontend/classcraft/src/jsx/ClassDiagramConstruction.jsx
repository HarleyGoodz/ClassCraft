import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";
import {
  getCachedLearningAttempts,
  getSkillScenarioBreakdown,
  hasAttemptBelowTarget,
  loadLearningAttempts,
  TARGET_FIRST_ATTEMPT_ACCURACY,
} from "../utils/learningAttempts";
import { CDC_SCENARIOS } from "../questionBank/classDiagramConstruction.jsx";
import "../css/class_diagram_construction_css.css";

export default function ClassDiagramConstruction() {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [practiceMode, setPracticeMode] = useState("unmastered");
  const [progressError, setProgressError] = useState("");
  const [loadingProgress, setLoadingProgress] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadProgress() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw new Error(error.message);
        const user = data.session?.user;
        if (!user) throw new Error("Sign in to view your construction progress.");

        if (active) setAttempts(getCachedLearningAttempts(user.id));
        const loadedAttempts = await loadLearningAttempts();
        if (active) setAttempts(loadedAttempts);
      } catch (error) {
        console.error("Could not load construction progress:", error);
        if (active) {
          setProgressError(
            error instanceof Error ? error.message : "Could not load your progress."
          );
        }
      } finally {
        if (active) setLoadingProgress(false);
      }
    }

    loadProgress();
    return () => {
      active = false;
    };
  }, []);

  const scenarios = getSkillScenarioBreakdown(
    attempts,
    "class-diagram-construction"
  );
  const masteredIds = new Set(
    scenarios
      .filter((scenario) => scenario.currentlyMeetsTarget)
      .map((scenario) => scenario.scenarioKey)
  );
  const belowTargetIds = new Set(
    scenarios
      .filter((scenario) => hasAttemptBelowTarget(scenario))
      .map((scenario) => scenario.scenarioKey)
  );
  const availableScenarios = CDC_SCENARIOS.filter((scenario) => {
    const scenarioId = String(scenario.id);
    if (practiceMode === "include-mastered") return true;
    if (practiceMode === "below-80") return belowTargetIds.has(scenarioId);
    return !masteredIds.has(scenarioId);
  });

  function handleStart() {
    if (availableScenarios.length === 0 || loadingProgress) return;
    navigate("/class-diagram-construction/scenario", {
      state: { scenarioIds: availableScenarios.map((scenario) => scenario.id) },
    });
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

          {progressError && <p className="cdc-progress-error" role="alert">{progressError}</p>}

          <fieldset className="cdc-practice-modes">
            <legend>Practice focus</legend>
            <label>
              <input
                type="radio"
                name="cdc-practice-mode"
                value="unmastered"
                checked={practiceMode === "unmastered"}
                onChange={() => setPracticeMode("unmastered")}
              />
              New and incomplete
            </label>
            {masteredIds.size > 0 && (
              <label>
                <input
                  type="radio"
                  name="cdc-practice-mode"
                  value="include-mastered"
                  checked={practiceMode === "include-mastered"}
                  onChange={() => setPracticeMode("include-mastered")}
                />
                Include completed scenarios
              </label>
            )}
            <label>
              <input
                type="radio"
                name="cdc-practice-mode"
                value="below-80"
                checked={practiceMode === "below-80"}
                onChange={() => setPracticeMode("below-80")}
              />
              Focus on scenarios with an attempt below {TARGET_FIRST_ATTEMPT_ACCURACY}%
            </label>
          </fieldset>

          <p className="cdc-availability" aria-live="polite">
            {loadingProgress ? "Loading your progress..." : `${availableScenarios.length} scenarios available`}
          </p>
          {!loadingProgress && availableScenarios.length === 0 && (
            <p className="cdc-empty-state">
              {practiceMode === "below-80"
                ? `No scenarios have an attempt below ${TARGET_FIRST_ATTEMPT_ACCURACY}% yet. Try another practice focus.`
                : "All scenarios are completed. Include completed scenarios to keep practicing."}
            </p>
          )}

          <button
            type="button"
            className="cdc-start-button"
            onClick={handleStart}
            disabled={loadingProgress || availableScenarios.length === 0}
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