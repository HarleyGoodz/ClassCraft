import { NavLink } from "react-router-dom";
import { getScenarioMetrics } from "../utils/learningAttempts";

export function NoSkillQuestions() {
  return (
    <main className="dashboard" style={{ maxWidth: "48rem", margin: "4rem auto", padding: "2rem" }}>
      <h1>All caught up</h1>
      <p>You have reached 80% or higher on every question in this activity.</p>
      <NavLink to="/skill-development">Return to Skill Development</NavLink>
    </main>
  );
}

export function GuidedExperiencePrompt({ attempts, activityKey, scenarioKey }) {
  const scenario = getScenarioMetrics(attempts, activityKey).find(
    (item) => item.scenarioKey === String(scenarioKey)
  );

  if (!scenario?.needsGuidedExperience) return null;

  return (
    <section
      role="status"
      style={{
        margin: "1rem 0",
        padding: "1rem",
        border: "1px solid #f59e0b",
        borderRadius: "0.75rem",
        background: "#fffbeb",
        color: "#78350f",
      }}
    >
      <strong>A guided experience may help</strong>
      <p style={{ margin: "0.35rem 0 0.75rem" }}>
        Your last two submissions for this question were below 80%. A guided
        walkthrough for this topic is coming soon.
      </p>
      <button type="button" disabled>
        Guided experience coming soon
      </button>
    </section>
  );
}
