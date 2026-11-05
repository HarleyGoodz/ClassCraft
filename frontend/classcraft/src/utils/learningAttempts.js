import { supabase } from "./supabase";
import { SCENARIOS as formationQuestions } from "../questionBank/classDiagramFormation.jsx";
import { RELATIONSHIP_SCENARIOS } from "../questionBank/classRelationships.jsx";
import { MULTIPLICITY_SCENARIOS } from "../questionBank/multiplicity.jsx";
import { OOP_SCENARIOS } from "../questionBank/oopClassModeling.jsx";
import { CDC_SCENARIOS } from "../questionBank/classDiagramConstruction.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const ATTEMPT_CACHE_KEY_PREFIX = "classcraft:learning-attempts:v1";

export const LEARNING_ACTIVITIES = [
  { key: "class-diagram-formation", label: "Class Diagram Formation" },
  { key: "class-relationships", label: "Class Relationships" },
  { key: "multiplicity", label: "Multiplicity" },
  { key: "oop-class-modeling", label: "OOP-Based Class Modeling" },
  { key: "class-diagram-construction", label: "Class Diagram Construction" },
];
export const TARGET_FIRST_ATTEMPT_ACCURACY = 80;

export function hasAttemptBelowTarget(scenario, target = TARGET_FIRST_ATTEMPT_ACCURACY) {
  return scenario.scoreHistory.some(
    (score) =>
      score.requiredElements > 0 &&
      (score.correctElements / score.requiredElements) * 100 < target
  );
}

const SKILL_SCENARIOS = {
  "class-diagram-formation": formationQuestions.map((question) => [question.id, question.title]),
  "class-relationships": RELATIONSHIP_SCENARIOS.map((question) => [
    question.id,
    `${question.classA} — ${question.classB}`,
  ]),
  multiplicity: MULTIPLICITY_SCENARIOS.map((question) => [
    question.id,
    `${question.classA} — ${question.classB}`,
  ]),
  "oop-class-modeling": OOP_SCENARIOS.map((question) => [question.id, question.title]),
};
const CONSTRUCTION_SCENARIO_LABELS = new Map(
  CDC_SCENARIOS.map((scenario) => [String(scenario.id), scenario.title])
);

export function getScenarioLabel(activityKey, scenarioKey) {
  if (activityKey === "class-diagram-construction") {
    return CONSTRUCTION_SCENARIO_LABELS.get(String(scenarioKey)) ?? `Scenario ${scenarioKey}`;
  }

  const label = SKILL_SCENARIOS[activityKey]?.find(
    ([id]) => String(id) === String(scenarioKey)
  )?.[1];
  return label ?? `Scenario ${scenarioKey}`;
}

export async function recordLearningAttempt({
  activityKey,
  scenarioKey,
  correctElements,
  requiredElements,
  completed,
  submittedResponse,
}) {
  const savedAttempt = await requestLearningAttempts("/api/learning-attempts", {
    method: "POST",
    body: JSON.stringify({
      activityKey,
      scenarioKey: String(scenarioKey),
      correctElements,
      requiredElements,
      completed,
      submittedResponse,
    }),
  });
  await cacheAttemptsForCurrentUser([savedAttempt], true);
  return savedAttempt;
}

export async function loadLearningAttempts() {
  const attempts = await requestLearningAttempts("/api/learning-attempts");
  await cacheAttemptsForCurrentUser(attempts);
  return attempts;
}

async function cacheAttemptsForCurrentUser(attempts, append = false) {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw new Error(error.message);
    const userId = data.session?.user?.id;
    if (!userId) return;

    const cachedAttempts = append ? getCachedLearningAttempts(userId) : [];
    setCachedLearningAttempts(userId, [...cachedAttempts, ...attempts]);
  } catch (error) {
    console.warn("Could not update cached learning progress:", error);
  }
}

export function getCachedLearningAttempts(userId) {
  if (!userId) return [];

  try {
    const cachedValue = localStorage.getItem(getAttemptCacheKey(userId));
    if (!cachedValue) return [];
    const attempts = JSON.parse(cachedValue);
    return Array.isArray(attempts) ? attempts : [];
  } catch (error) {
    console.warn("Could not read cached learning progress:", error);
    return [];
  }
}

function setCachedLearningAttempts(userId, attempts) {
  try {
    const cacheableAttempts = attempts.map((attempt) => ({
      id: attempt.id,
      activityKey: attempt.activityKey,
      scenarioKey: attempt.scenarioKey,
      attemptNumber: attempt.attemptNumber,
      correctElements: attempt.correctElements,
      requiredElements: attempt.requiredElements,
      completed: attempt.completed,
      createdAt: attempt.createdAt,
    }));
    localStorage.setItem(getAttemptCacheKey(userId), JSON.stringify(cacheableAttempts));
  } catch (error) {
    console.warn("Could not cache learning progress:", error);
  }
}

function getAttemptCacheKey(userId) {
  return `${ATTEMPT_CACHE_KEY_PREFIX}:${userId}`;
}

async function requestLearningAttempts(path, options = {}) {
  const { data, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    throw new Error(sessionError.message);
  }

  const accessToken = data.session?.access_token;
  if (!accessToken) {
    throw new Error("Please sign in again to access your learning progress.");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = `Learning progress request failed (${response.status}).`;
    try {
      const body = await response.json();
      message = body.detail || body.message || body.error || message;
    } catch {
      // Keep the HTTP status message when the server did not return JSON.
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function getFirstAttemptMetrics(attempts, activityKey, selectedScenarioKeys = null) {
  const activityAttempts = attempts.filter((attempt) => attempt.activityKey === activityKey);
  const allScenarios = getScenarioMetrics(activityAttempts);
  const selectedKeys = selectedScenarioKeys === null
    ? null
    : new Set(selectedScenarioKeys.map(String));
  const scenarios = selectedKeys === null
    ? allScenarios
    : allScenarios.filter((scenario) => selectedKeys.has(scenario.scenarioKey));
  const attemptedScenarios = scenarios.filter((scenario) => scenario.accuracy !== null);
  const scenariosMeetingTarget = attemptedScenarios.filter((scenario) => scenario.meetsTarget).length;
  const accuracyValue = averageScenarioAccuracyValue(attemptedScenarios);
  const scenariosWithLatestAttempt = scenarios.filter(
    (scenario) => scenario.latestAttemptAccuracyValue !== null
  );
  const latestAccuracyValue = averageScenarioAccuracyValue(
    scenariosWithLatestAttempt,
    "latestAttemptAccuracyValue"
  );

  return {
    accuracy: accuracyValue === null ? null : Math.round(accuracyValue),
    accuracyValue,
    latestAccuracy: latestAccuracyValue === null ? null : Math.round(latestAccuracyValue),
    latestAccuracyValue,
    attempts: activityAttempts.length,
    attemptedScenarios: attemptedScenarios.length,
    scenariosMeetingTarget,
    consistency: attemptedScenarios.length
      ? Math.round((scenariosMeetingTarget / attemptedScenarios.length) * 100)
      : null,
  };
}

export function getOverallFirstAttemptMetrics(attempts, activityKeys = null) {
  const allowedActivities = activityKeys ? new Set(activityKeys) : null;
  const scenarios = getScenarioMetrics(
    attempts.filter((attempt) => !allowedActivities || allowedActivities.has(attempt.activityKey))
  ).filter((scenario) => scenario.accuracy !== null);
  const scenariosMeetingTarget = scenarios.filter((scenario) => scenario.meetsTarget).length;
  const accuracyValue = averageScenarioAccuracyValue(scenarios);

  return {
    accuracy: accuracyValue === null ? null : Math.round(accuracyValue),
    accuracyValue,
    attemptedScenarios: scenarios.length,
    scenariosMeetingTarget,
    consistency: scenarios.length
      ? Math.round((scenariosMeetingTarget / scenarios.length) * 100)
      : null,
  };
}

function averageScenarioAccuracyValue(scenarios, accuracyKey = "accuracyValue") {
  return scenarios.length
    ? scenarios.reduce((sum, scenario) => sum + scenario[accuracyKey], 0) / scenarios.length
    : null;
}

export function getScenarioMetrics(attempts, activityKey = null) {
  const scenarios = new Map();

  attempts
    .filter(
      (attempt) =>
        activityKey === null || attempt.activityKey === activityKey
    )
    .forEach((attempt) => {
      const key = `${attempt.activityKey}:${attempt.scenarioKey}`;
      const current = scenarios.get(key) ?? {
        activityKey: attempt.activityKey,
        scenarioKey: attempt.scenarioKey,
        attempts: 0,
        firstAttemptCorrect: null,
        firstAttemptRequired: null,
        completed: false,
        scoreHistory: [],
      };

      current.attempts += 1;
      current.completed = current.completed || attempt.completed;
      current.scoreHistory.push({
        attemptNumber: attempt.attemptNumber,
        correctElements: attempt.correctElements,
        requiredElements: attempt.requiredElements,
        completed: attempt.completed,
      });
      if (attempt.attemptNumber === 1) {
        current.firstAttemptCorrect = attempt.correctElements;
        current.firstAttemptRequired = attempt.requiredElements;
      }
      scenarios.set(key, current);
    });

  return [...scenarios.values()].map((scenario) => {
    const scoreHistory = scenario.scoreHistory.sort(
      (left, right) => left.attemptNumber - right.attemptNumber
    );
    const latestAttempt = scoreHistory[scoreHistory.length - 1];
    const accuracyValue =
      scenario.firstAttemptRequired === null
        ? null
        : (scenario.firstAttemptCorrect / scenario.firstAttemptRequired) * 100;
    const latestAttemptAccuracyValue = latestAttempt
      ? (latestAttempt.correctElements / latestAttempt.requiredElements) * 100
      : null;
    return {
      ...scenario,
      accuracyValue,
      accuracy: accuracyValue === null ? null : Math.round(accuracyValue),
      meetsTarget: accuracyValue !== null && accuracyValue >= TARGET_FIRST_ATTEMPT_ACCURACY,
      latestAttemptAccuracyValue,
      latestAttemptAccuracy: latestAttemptAccuracyValue === null
        ? null
        : Math.round(latestAttemptAccuracyValue),
      currentlyMeetsTarget:
        latestAttemptAccuracyValue !== null &&
        latestAttemptAccuracyValue >= TARGET_FIRST_ATTEMPT_ACCURACY,
      needsGuidedExperience: hasTwoLowScores(scoreHistory),
      scoreHistory,
    };
  });
}

export function getScenarioImprovementMetrics(scenarios) {
  const retriedScenarios = scenarios.filter(
    (scenario) =>
      scenario.attempts > 1 &&
      scenario.accuracyValue !== null &&
      scenario.latestAttemptAccuracyValue !== null
  );
  const averageChange = retriedScenarios.length
    ? retriedScenarios.reduce(
        (sum, scenario) => sum + scenario.latestAttemptAccuracyValue - scenario.accuracyValue,
        0
      ) / retriedScenarios.length
    : null;

  return {
    averageChange,
    retriedScenarios: retriedScenarios.length,
    scenarios: retriedScenarios.map((scenario) => ({
      scenarioKey: scenario.scenarioKey,
      firstAccuracy: scenario.accuracyValue,
      latestAccuracy: scenario.latestAttemptAccuracyValue,
      change: scenario.latestAttemptAccuracyValue - scenario.accuracyValue,
    })),
  };
}

function hasTwoLowScores(scoreHistory) {
  const firstTwo = [...scoreHistory]
    .sort((left, right) => left.attemptNumber - right.attemptNumber)
    .slice(0, 2);
  return firstTwo.length === 2 && firstTwo.every(
    (score) => (score.correctElements / score.requiredElements) * 100 < TARGET_FIRST_ATTEMPT_ACCURACY
  );
}

export function getSkillScenarioBreakdown(attempts, activityKey) {
  const knownScenarios = activityKey === "class-diagram-construction"
    ? CDC_SCENARIOS.map((scenario) => [scenario.id, scenario.title])
    : SKILL_SCENARIOS[activityKey] ?? [];
  const savedScenarios = new Map(
    getScenarioMetrics(attempts, activityKey).map((scenario) => [scenario.scenarioKey, scenario])
  );

  return knownScenarios.map(([id, label]) => {
    const scenarioKey = String(id);
    return {
      scenarioKey,
      label,
      ...(savedScenarios.get(scenarioKey) ?? {
        attempts: 0,
        accuracy: null,
        firstAttemptCorrect: null,
        firstAttemptRequired: null,
        meetsTarget: false,
        latestAttemptAccuracy: null,
        currentlyMeetsTarget: false,
        scoreHistory: [],
      }),
    };
  });
}
