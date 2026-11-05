import { SCENARIOS as formationQuestions } from "../questionBank/classDiagramFormation.jsx";
import { RELATIONSHIP_SCENARIOS } from "../questionBank/classRelationships.jsx";
import { MULTIPLICITY_SCENARIOS } from "../questionBank/multiplicity.jsx";
import { OOP_SCENARIOS } from "../questionBank/oopClassModeling.jsx";
import {
  getSkillScenarioBreakdown,
  hasAttemptBelowTarget,
} from "./learningAttempts";

export const SKILL_QUESTION_BANKS = {
  "class-diagram-formation": formationQuestions,
  "class-relationships": RELATIONSHIP_SCENARIOS,
  multiplicity: MULTIPLICITY_SCENARIOS,
  "oop-class-modeling": OOP_SCENARIOS,
};

export function getSkillPracticeQuestions(
  activityKey,
  questionBank,
  attempts,
  practiceMode = "unmastered"
) {
  const scenarios = getSkillScenarioBreakdown(attempts, activityKey);
  const eligibleIds = new Set(
    scenarios
      .filter((scenario) => {
        if (practiceMode === "include-mastered") return true;
        if (practiceMode === "below-80") {
          return hasAttemptBelowTarget(scenario);
        }
        return !scenario.currentlyMeetsTarget;
      })
      .map((scenario) => scenario.scenarioKey)
  );
  const eligibleQuestions = questionBank.filter((question) =>
    eligibleIds.has(String(question.id))
  );

  return shuffle(eligibleQuestions);
}

function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}
