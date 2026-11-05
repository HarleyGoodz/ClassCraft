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
import {
  getSkillPracticeQuestions,
  SKILL_QUESTION_BANKS,
} from "../utils/skillQuestionSelection";
import "../css/skill_development_css.css";

const EXPERIENCES = [
  {
    key: "class-diagram-formation",
    title: "Class Diagram Formation",
    description:
      "Identify candidate classes and organize attributes, methods, and visibility symbols.",
  },
  {
    key: "class-relationships",
    title: "Class Relationships",
    description:
      "Apply association, inheritance, aggregation, and composition between classes.",
  },
  {
    key: "multiplicity",
    title: "Multiplicity",
    description:
      "Assign the correct multiplicity notation to relationships in a sample class diagram.",
  },
  {
    key: "oop-class-modeling",
    title: "OOP-Based Class Modeling",
    description:
      "Build a complete class diagram from a scenario using the four OOP pillars.",
  },
];

export default function SkillDevelopment() {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [userId, setUserId] = useState(null);
  const [progressError, setProgressError] = useState("");
  const [showMastered, setShowMastered] = useState({});
  const [practiceMode, setPracticeMode] = useState({});

  useEffect(() => {
    async function loadProgress() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        const user = session?.user;
        if (error) throw new Error(error.message);
        if (!user) throw new Error("Sign in to view your Skill Development progress.");

        setUserId(user.id);
        const cachedAttempts = getCachedLearningAttempts(user.id);
        setAttempts(cachedAttempts);

        const loadedAttempts = await loadLearningAttempts();
        setAttempts(loadedAttempts);
      } catch (error) {
        console.error("Could not load learning progress:", error);
        setProgressError(`Progress could not be refreshed: ${error.message}`);
      }
    }

    loadProgress();
  }, []);

  async function handleLogout() {
    // Removed setError to prevent crashes
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout failed:", error.message);
      return;
    }
    navigate("/", { replace: true });
  }

  function handlePractice(experience) {
    const skillQuestions = getSkillPracticeQuestions(
      experience.key,
      SKILL_QUESTION_BANKS[experience.key],
      attempts,
      practiceMode[experience.key] ?? "unmastered"
    );
    if (skillQuestions.length === 0) return;

    navigate(`/skill-development/${experience.key}`, {
      state: { skillQuestions, learningAttempts: attempts },
    });
  }

  return (
    <div className="dashboard-layout">
      {/* ===== Sidebar ===== */}
      <aside className="sidebar" style={{ display: "flex", flexDirection: "column" }}>
        <div>
          <h2 className="sidebar-brand">ClassCraft</h2>
          <nav className="sidebar-nav">
            <NavLink
              to="/dashboard"
              className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}
              end
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/learn-basics"
              className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}
            >
              Learn the Basics
            </NavLink>
            <NavLink
              to="/skill-development"
              className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}
            >
              Skill Development
            </NavLink>
            <NavLink
              to="/class-diagram-construction"
              className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}
            >
              Class Diagram Construction
            </NavLink>
          </nav>
        </div>
        
        {/* Logout button pushed to the bottom */}
        <div style={{ marginTop: "auto", paddingTop: "2rem" }}>
           <button 
             onClick={handleLogout} 
             className="sidebar-link" 
             style={{ width: "100%", textAlign: "left", background: "transparent", border: "none", cursor: "pointer", color: "#ef4444" }}
           >
             Log out
           </button>
        </div>
      </aside>

      {/* ===== Main content ===== */}
      <main className="skill-development">
        <header className="skill-development-header">
          <h1>Skill Development</h1>
          <p className="skill-development-intro">
            Practice all available questions. Completed questions are optional.
          </p>
          {progressError && <p role="alert">{progressError}</p>}
        </header>

        <section className="experience-grid">
          {EXPERIENCES.map((experience) => {
            const scenarios = getSkillScenarioBreakdown(attempts, experience.key);
            const masteredScenarios = scenarios.filter(
              (scenario) => scenario.currentlyMeetsTarget
            );
            const belowTargetScenarios = scenarios.filter((scenario) =>
              hasAttemptBelowTarget(scenario)
            );
            const selectedMode = practiceMode[experience.key] ?? "unmastered";
            const availableQuestionCount = selectedMode === "include-mastered"
              ? scenarios.length
              : selectedMode === "below-80"
                ? belowTargetScenarios.length
                : scenarios.length - masteredScenarios.length;
            return (
              <article key={experience.key} className="experience-card">
                <div className="experience-card-body">
                  <h2 className="experience-title">{experience.title}</h2>
                  <p className="experience-description">
                    {experience.description}
                  </p>
                  <p className="experience-availability">
                    {availableQuestionCount} questions available
                  </p>
                  <fieldset className="practice-mode-options">
                    <legend>Practice focus</legend>
                    <label>
                      <input
                        type="radio"
                        name={`practice-mode-${experience.key}`}
                        value="unmastered"
                        checked={selectedMode === "unmastered"}
                        onChange={() =>
                          setPracticeMode((current) => ({
                            ...current,
                            [experience.key]: "unmastered",
                          }))
                        }
                      />
                      New and incomplete
                    </label>
                    {masteredScenarios.length > 0 && (
                      <label>
                        <input
                          type="radio"
                          name={`practice-mode-${experience.key}`}
                          value="include-mastered"
                          checked={selectedMode === "include-mastered"}
                          onChange={() =>
                            setPracticeMode((current) => ({
                              ...current,
                              [experience.key]: "include-mastered",
                            }))
                          }
                        />
                        Include completed scenarios
                      </label>
                    )}
                    <label>
                      <input
                        type="radio"
                        name={`practice-mode-${experience.key}`}
                        value="below-80"
                        checked={selectedMode === "below-80"}
                        onChange={() =>
                          setPracticeMode((current) => ({
                            ...current,
                            [experience.key]: "below-80",
                          }))
                        }
                      />
                      Focus on scenarios with an attempt below {TARGET_FIRST_ATTEMPT_ACCURACY}%
                    </label>
                  </fieldset>
                  {availableQuestionCount === 0 && (
                    <p className="practice-empty-state">
                      {selectedMode === "below-80"
                        ? `No scenarios have an attempt below ${TARGET_FIRST_ATTEMPT_ACCURACY}% yet.`
                        : "All scenarios are completed. Include completed scenarios to keep practicing."}
                    </p>
                  )}
                  {masteredScenarios.length > 0 && (
                    <>
                      <button
                        type="button"
                        className="mastered-scenarios-toggle"
                        onClick={() =>
                          setShowMastered((current) => ({
                            ...current,
                            [experience.key]: !current[experience.key],
                          }))
                        }
                        aria-expanded={Boolean(showMastered[experience.key])}
                      >
                        {showMastered[experience.key] ? "Hide" : "Show"} completed
                        scenarios ({masteredScenarios.length})
                      </button>
                    </>
                  )}
                  {showMastered[experience.key] && masteredScenarios.length > 0 && (
                    <ul className="mastered-scenario-list">
                      {masteredScenarios.map((scenario) => (
                        <li key={scenario.scenarioKey}>
                          <span>{scenario.label}</span>
                          <strong>{scenario.latestAttemptAccuracy}%</strong>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="experience-card-actions">
                  <button
                    type="button"
                    className="practice-button"
                    onClick={() => handlePractice(experience)}
                    disabled={!userId || availableQuestionCount === 0}
                  >
                    Practice
                  </button>
                </div>
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