/*
 * AdminAccountDetail.jsx: one learner's page.
 * Shows the account's details, progress per activity and the score history of every scenario.
 */
import { useMemo } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import {
  activityLabel,
  buildAccountActivities,
  formatChange,
  formatDate,
  formatPercent,
  getScenarioLabel,
  scopeAccounts,
  TARGET,
} from "../../utils/adminMetrics";
import { RoleBadge, ScoreBar, ScoreTrail, StatusBadge, SummaryCard } from "../../components/admin/AdminUi";

export default function AdminAccountDetail() {
  const { learners } = useOutletContext();
  const { userId } = useParams();
  const account = useMemo(
    () => scopeAccounts(learners.filter((item) => String(item.userId) === userId))[0] ?? null,
    [learners, userId]
  );
  const activities = useMemo(() => (account ? buildAccountActivities(account) : []), [account]);

  if (!account) {
    return (
      <main className="my-progress admin-page">
        <Link to="/admin/accounts" className="admin-back-link">← Back to accounts</Link>
        <p className="admin-state">No learner account with ID {userId}.</p>
      </main>
    );
  }

  return (
    <main className="my-progress admin-page">
      <Link to="/admin/accounts" className="admin-back-link">← Back to accounts</Link>

      <header className="my-progress-header admin-page-header">
        <div>
          <h1>{account.username}</h1>
          <div className="admin-detail-badges">
            <RoleBadge role={account.role} />
            <StatusBadge status={account.status} />
          </div>
        </div>
      </header>

      <dl className="admin-meta">
        <div><dt>Account ID</dt><dd>{account.userId}</dd></div>
        <div><dt>Email</dt><dd>{account.email}</dd></div>
        <div><dt>Created</dt><dd>{formatDate(account.createdAt)}</dd></div>
        <div><dt>Last sign-in</dt><dd>{formatDate(account.lastSignInAt, true)}</dd></div>
        <div><dt>Last activity</dt><dd>{formatDate(account.lastActive, true)}</dd></div>
      </dl>

      <section className="summary-section">
        <div className="summary-grid admin-summary-grid">
          <SummaryCard title="Attempts" value={account.attemptCount} description={`Across ${account.scenariosAttempted} scenarios`} />
          <SummaryCard
            title="Scenarios completed"
            value={`${account.scenariosCompleted} / ${account.scenariosAttempted}`}
            description="Of the scenarios attempted"
          />
          <SummaryCard
            title="First-attempt accuracy"
            value={formatPercent(account.firstAverage)}
            description={`Latest attempt: ${formatPercent(account.latestAverage)}`}
          />
          <SummaryCard
            title={`Meeting ${TARGET}% target`}
            value={`${account.meetingTarget} / ${account.withFirst}`}
            description="On the first attempt"
          />
        </div>
      </section>

      <section className="admin-section" aria-labelledby="admin-detail-activities">
        <div className="summary-section-head">
          <h2 className="summary-section-title" id="admin-detail-activities">Progress by activity</h2>
        </div>
        <div className="progress-table-wrapper admin-table-scroll">
          <table className="progress-table admin-table">
            <thead>
              <tr>
                <th>Activity</th>
                <th>Attempted</th>
                <th>Not attempted</th>
                <th>Completed</th>
                <th>First attempt</th>
                <th>Latest attempt</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr key={activity.key}>
                  <td>{activity.label}</td>
                  <td>{activity.attempted} / {activity.known}</td>
                  <td>{activity.known - activity.attempted}</td>
                  <td>{activity.completed}</td>
                  <td><ScoreBar value={activity.firstAverage} /></td>
                  <td><ScoreBar value={activity.latestAverage} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-section" aria-labelledby="admin-detail-history">
        <div className="summary-section-head">
          <h2 className="summary-section-title" id="admin-detail-history">Scenario history</h2>
          <p className="summary-section-note">Hover a score to see the elements behind it.</p>
        </div>
        {account.scenarios.length ? (
          <div className="progress-table-wrapper admin-table-scroll">
            <table className="progress-table admin-table admin-history-table">
              <thead>
                <tr>
                  <th>Scenario</th>
                  <th>Activity</th>
                  <th>Scores by attempt</th>
                  <th>Change</th>
                  <th>{TARGET}% target</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {account.scenarios.map((scenario) => {
                  const change = scenario.attempts > 1 && scenario.accuracyValue !== null
                    ? scenario.latestAttemptAccuracyValue - scenario.accuracyValue
                    : null;
                  return (
                    <tr key={`${scenario.activityKey}:${scenario.scenarioKey}`}>
                      <td>{getScenarioLabel(scenario.activityKey, scenario.scenarioKey)}</td>
                      <td>{activityLabel(scenario.activityKey)}</td>
                      <td><ScoreTrail history={scenario.scoreHistory} /></td>
                      <td className={change > 0 ? "admin-up" : change < 0 ? "admin-down" : undefined}>
                        {formatChange(change)}
                      </td>
                      <td>
                        {scenario.accuracyValue === null
                          ? <span className="badge badge--muted">No first score</span>
                          : scenario.meetsTarget
                            ? <span className="badge badge--pass">Met first try</span>
                            : scenario.currentlyMeetsTarget
                              ? <span className="badge badge--info">Met on retry</span>
                              : <span className="badge badge--warn">Not met</span>}
                      </td>
                      <td>
                        {scenario.completed
                          ? <span className="badge badge--pass">Completed</span>
                          : <span className="badge badge--muted">In progress</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="admin-state">This learner hasn't attempted any scenarios yet.</p>
        )}
      </section>
    </main>
  );
}
