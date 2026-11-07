/*
 * PreviousAttemptNotice.jsx: a small notice shown at the top of practice activities.
 * Purpose: reminds learners how they did on this scenario before.
 * What it does: filters the attempts for this activity and scenario, then shows the number of
 * attempts with the first and latest scores. Shows nothing if there are no attempts.
 */
export default function PreviousAttemptNotice({ attempts, activityKey, scenarioKey }) {
  const scenarioAttempts = attempts
    .filter(
      (attempt) =>
        attempt.activityKey === activityKey &&
        attempt.scenarioKey === String(scenarioKey)
    )
    .sort((left, right) => left.attemptNumber - right.attemptNumber);

  if (scenarioAttempts.length === 0) return null;

  const firstAttempt = scenarioAttempts[0];
  const latestAttempt = scenarioAttempts[scenarioAttempts.length - 1];
  const percentage = (attempt) =>
    Math.round((attempt.correctElements / attempt.requiredElements) * 100);

  return (
    <p
      role="status"
      style={{
        padding: "0.65rem 0.85rem",
        borderRadius: "var(--cc-radius)",
        background: "var(--cc-blue-tint)",
        color: "var(--cc-info)",
      }}
    >
      Previously attempted {scenarioAttempts.length}{" "}
      {scenarioAttempts.length === 1 ? "time" : "times"}. First attempt:{" "}
      {percentage(firstAttempt)}%. Latest attempt: {percentage(latestAttempt)}%.
    </p>
  );
}
