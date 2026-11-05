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

  
}
