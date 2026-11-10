/*
 * adminMetrics.js: calculations shared by the admin pages.
 * Purpose: turns the /api/admin/overview response into per-learner, per-activity,
 * per-scenario and per-attempt figures, using the same scenario metrics as the learner dashboard.
 */
import {
  getScenarioLabel,
  getScenarioMetrics,
  getSkillScenarioBreakdown,
  LEARNING_ACTIVITIES,
  TARGET_FIRST_ATTEMPT_ACCURACY,
} from "./learningAttempts";

export const TARGET = TARGET_FIRST_ATTEMPT_ACCURACY;

const ACTIVITY_LABELS = new Map(LEARNING_ACTIVITIES.map((activity) => [activity.key, activity.label]));

export const KNOWN_SCENARIOS = new Map(
  LEARNING_ACTIVITIES.map((activity) => [
    activity.key,
    getSkillScenarioBreakdown([], activity.key).map(({ scenarioKey, label }) => ({ scenarioKey, label })),
  ])
);

export const EMPTY_FILTERS = {
  search: "",
  activity: "",
  scenario: "",
  completion: "",
  from: "",
  to: "",
};

const DAY_MS = 24 * 60 * 60 * 1000;

// ---------- formatting ----------
export function average(values) {
  const valid = values.filter((value) => Number.isFinite(value));
  return valid.length ? valid.reduce((sum, value) => sum + value, 0) / valid.length : null;
}

export function formatPercent(value) {
  return Number.isFinite(value) ? `${Math.round(value)}%` : "—";
}

export function formatChange(value) {
  if (!Number.isFinite(value)) return "—";
  const rounded = Math.round(value);
  return `${rounded > 0 ? "+" : ""}${rounded} pts`;
}

export function formatDate(value, withTime = false) {
  if (!value) return "—";
  const date = new Date(value);
  return withTime
    ? date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : date.toLocaleDateString(undefined, { dateStyle: "medium" });
}

export function formatRelative(value) {
  if (!value) return "—";
  const days = Math.floor((Date.now() - new Date(value).getTime()) / DAY_MS);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return formatDate(value);
}

export function scorePercent(score) {
  return score.requiredElements > 0 ? (score.correctElements / score.requiredElements) * 100 : null;
}

export function activityLabel(key) {
  return ACTIVITY_LABELS.get(key) ?? key;
}

export { getScenarioLabel, LEARNING_ACTIVITIES };

// ---------- filters ----------
export function changeFilter(current, name, value) {
  // A scenario only makes sense inside its activity
  return { ...current, [name]: value, ...(name === "activity" ? { scenario: "" } : {}) };
}

/** Each learner with attempts narrowed to the activity / scenario / date filters, plus their totals. */
export function scopeAccounts(accounts, filters = EMPTY_FILTERS) {
  const from = filters.from ? new Date(`${filters.from}T00:00:00`).getTime() : null;
  const to = filters.to ? new Date(`${filters.to}T23:59:59.999`).getTime() : null;

  return accounts.map((account) => {
    const attempts = (account.attempts ?? []).filter((attempt) => {
      if (filters.activity && attempt.activityKey !== filters.activity) return false;
      if (filters.scenario && String(attempt.scenarioKey) !== filters.scenario) return false;
      const time = new Date(attempt.createdAt).getTime();
      if (from !== null && time < from) return false;
      if (to !== null && time > to) return false;
      return true;
    });
    const scenarios = getScenarioMetrics(attempts);
    const withFirst = scenarios.filter((scenario) => scenario.accuracyValue !== null);
    const lastActive = attempts.reduce(
      (latest, attempt) => (!latest || attempt.createdAt > latest ? attempt.createdAt : latest),
      null
    );
    return {
      ...account,
      scopedAttempts: attempts,
      scenarios,
      attemptCount: attempts.length,
      scenariosAttempted: scenarios.length,
      scenariosCompleted: scenarios.filter((scenario) => scenario.completed).length,
      firstAverage: average(withFirst.map((scenario) => scenario.accuracyValue)),
      latestAverage: average(scenarios.map((scenario) => scenario.latestAttemptAccuracyValue)),
      meetingTarget: withFirst.filter((scenario) => scenario.meetsTarget).length,
      withFirst: withFirst.length,
      lastActive,
    };
  });
}

/** Applies the search and completion filters, most recently active first. */
export function filterAccounts(scoped, filters) {
  const query = filters.search.trim().toLowerCase();
  return scoped
    .filter((account) => {
      if (query && !`${account.username} ${account.email} ${account.userId}`.toLowerCase().includes(query)) return false;
      if (filters.completion === "completed" && account.scenariosCompleted === 0) return false;
      if (filters.completion === "unfinished" && account.scenariosCompleted === account.scenariosAttempted) return false;
      if (filters.completion === "none" && account.attemptCount > 0) return false;
      return true;
    })
    .sort((left, right) => {
      if (left.lastActive && right.lastActive) return right.lastActive.localeCompare(left.lastActive);
      if (left.lastActive || right.lastActive) return left.lastActive ? -1 : 1;
      return left.username.localeCompare(right.username);
    });
}

// ---------- aggregates ----------
export function summarize(accounts) {
  const scenarios = accounts.flatMap((account) => account.scenarios);
  const withFirst = scenarios.filter((scenario) => scenario.accuracyValue !== null);
  return {
    activeLearners: accounts.filter((account) => account.attemptCount > 0).length,
    attempts: accounts.reduce((sum, account) => sum + account.attemptCount, 0),
    firstAverage: average(withFirst.map((scenario) => scenario.accuracyValue)),
    latestAverage: average(scenarios.map((scenario) => scenario.latestAttemptAccuracyValue)),
    meeting: withFirst.filter((scenario) => scenario.meetsTarget).length,
    withFirst: withFirst.length,
    completed: scenarios.filter((scenario) => scenario.completed).length,
    attempted: scenarios.length,
  };
}

export function buildActivityRows(accounts, activityFilter = "") {
  const scenarios = accounts.flatMap((account) => account.scenarios);
  return LEARNING_ACTIVITIES.filter((activity) => !activityFilter || activity.key === activityFilter).map(
    (activity) => {
      const rows = scenarios.filter((scenario) => scenario.activityKey === activity.key);
      const withFirst = rows.filter((scenario) => scenario.accuracyValue !== null);
      const distinct = new Set(rows.map((scenario) => scenario.scenarioKey)).size;
      return {
        ...activity,
        learners: accounts.filter((account) =>
          account.scenarios.some((scenario) => scenario.activityKey === activity.key)
        ).length,
        attempts: rows.reduce((sum, scenario) => sum + scenario.attempts, 0),
        distinct,
        known: Math.max(KNOWN_SCENARIOS.get(activity.key)?.length ?? 0, distinct),
        firstAverage: average(withFirst.map((scenario) => scenario.accuracyValue)),
        latestAverage: average(rows.map((scenario) => scenario.latestAttemptAccuracyValue)),
        meeting: withFirst.filter((scenario) => scenario.meetsTarget).length,
        withFirst: withFirst.length,
        completed: rows.filter((scenario) => scenario.completed).length,
      };
    }
  );
}

export function buildScenarioRows(accounts, activityKey, scenarioFilter = "") {
  if (!activityKey) return [];
  const scenarios = accounts
    .flatMap((account) => account.scenarios)
    .filter((scenario) => scenario.activityKey === activityKey);
  const known = KNOWN_SCENARIOS.get(activityKey) ?? [];
  const seen = new Set(known.map((scenario) => scenario.scenarioKey));
  const extra = [...new Set(scenarios.map((scenario) => scenario.scenarioKey).filter((key) => !seen.has(key)))].map(
    (scenarioKey) => ({ scenarioKey, label: getScenarioLabel(activityKey, scenarioKey) })
  );

  return [...known, ...extra]
    .filter((scenario) => !scenarioFilter || scenario.scenarioKey === scenarioFilter)
    .map((scenario) => {
      const entries = scenarios.filter((item) => item.scenarioKey === scenario.scenarioKey);
      const withFirst = entries.filter((item) => item.accuracyValue !== null);
      return {
        ...scenario,
        learners: entries.length,
        attempts: entries.reduce((sum, item) => sum + item.attempts, 0),
        firstAverage: average(withFirst.map((item) => item.accuracyValue)),
        latestAverage: average(entries.map((item) => item.latestAttemptAccuracyValue)),
        meeting: withFirst.filter((item) => item.meetsTarget).length,
        withFirst: withFirst.length,
        completed: entries.filter((item) => item.completed).length,
      };
    });
}

export function buildTrends(accounts) {
  const scenarios = accounts.flatMap((account) => account.scenarios);
  const buckets = [1, 2, 3, 4].map((number) => ({
    label: number === 4 ? "Attempt 4+" : `Attempt ${number}`,
    scores: [],
  }));
  scenarios.forEach((scenario) =>
    scenario.scoreHistory.forEach((score) => {
      const value = scorePercent(score);
      if (value !== null) buckets[Math.min(score.attemptNumber, 4) - 1].scores.push(value);
    })
  );
  const retried = scenarios.filter(
    (scenario) =>
      scenario.attempts > 1 &&
      scenario.accuracyValue !== null &&
      Number.isFinite(scenario.latestAttemptAccuracyValue)
  );
  const belowFirst = retried.filter((scenario) => !scenario.meetsTarget);
  return {
    buckets: buckets.map((bucket) => ({ ...bucket, count: bucket.scores.length, average: average(bucket.scores) })),
    retried: retried.length,
    averageChange: average(retried.map((scenario) => scenario.latestAttemptAccuracyValue - scenario.accuracyValue)),
    improved: retried.filter((scenario) => scenario.latestAttemptAccuracyValue > scenario.accuracyValue).length,
    belowFirst: belowFirst.length,
    reachedTarget: belowFirst.filter((scenario) => scenario.currentlyMeetsTarget).length,
  };
}

export function buildAccountActivities(account) {
  return LEARNING_ACTIVITIES.map((activity) => {
    const scenarios = account.scenarios.filter((scenario) => scenario.activityKey === activity.key);
    return {
      ...activity,
      attempted: scenarios.length,
      known: Math.max(KNOWN_SCENARIOS.get(activity.key)?.length ?? 0, scenarios.length),
      completed: scenarios.filter((scenario) => scenario.completed).length,
      firstAverage: average(scenarios.map((scenario) => scenario.accuracyValue)),
      latestAverage: average(scenarios.map((scenario) => scenario.latestAttemptAccuracyValue)),
    };
  });
}

/** Learners an admin may want to follow up with, for the dashboard home. */
export function buildAttentionLists(accounts, inactiveDays = 14) {
  const cutoff = Date.now() - inactiveDays * DAY_MS;
  return {
    struggling: accounts
      .map((account) => ({
        account,
        count: account.scenarios.filter((scenario) => scenario.needsGuidedExperience).length,
      }))
      .filter((item) => item.count > 0)
      .sort((left, right) => right.count - left.count),
    inactive: accounts
      .filter((account) => account.lastActive && new Date(account.lastActive).getTime() < cutoff)
      .sort((left, right) => left.lastActive.localeCompare(right.lastActive)),
    notStarted: accounts.filter((account) => account.attemptCount === 0),
  };
}

export function recentAttempts(accounts, limit = 8) {
  return accounts
    .flatMap((account) => account.scopedAttempts.map((attempt) => ({ ...attempt, account })))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, limit);
}

export function countSince(accounts, days) {
  const cutoff = Date.now() - days * DAY_MS;
  const recent = accounts.map((account) =>
    account.scopedAttempts.filter((attempt) => new Date(attempt.createdAt).getTime() >= cutoff).length
  );
  return {
    learners: recent.filter((count) => count > 0).length,
    attempts: recent.reduce((sum, count) => sum + count, 0),
  };
}
