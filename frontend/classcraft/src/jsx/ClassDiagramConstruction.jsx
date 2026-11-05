import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
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

export default function ClassDiagramConstruction() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("User");
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
        if (active) setUsername(user.user_metadata?.username || "User");

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

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout failed:", error.message);
      return;
    }
    navigate("/", { replace: true });
  }

  function handleStart() {
    if (availableScenarios.length === 0 || loadingProgress) return;
    navigate("/class-diagram-construction/scenario", {
      state: { scenarioIds: availableScenarios.map((scenario) => scenario.id) },
    });
  }

  return (
    <div className="app-shell">
      {/* ===== Top navigation ===== */}
      <TopNav username={username} onLogout={handleLogout} />

      {/* ===== Main content ===== */}
      <main className="cdc-page">
        <div className="cdc-hero">
          {/* Left: what this is */}
          <div className="cdc-hero-intro">
            <h1 className="cdc-title">
              Independent Class Diagram Construction
            </h1>
            <p className="cdc-subtitle">
              Construct complete UML class diagrams from unfamiliar, increasingly
              complex problem scenarios — without system guidance. Your submitted
              diagrams are evaluated against predefined criteria, with feedback
              on missing or incorrectly modeled elements.
            </p>
            <p className="cdc-hint">
              Target: at least <strong>80%</strong> of required diagram elements
              correctly modeled per scenario.
            </p>
          </div>

          {/* Right: choose a focus and start */}
          <div className="cdc-hero-panel">
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
          </div>
        </div>
      </main>
    </div>
  );
}