/*
 * AdminHome.jsx: the admin Dashboard page, an at-a-glance summary.
 * Shows platform totals, this week's activity, learners who may need follow-up, the latest
 * submissions and a compact per-activity snapshot, each linking to the detailed page.
 */
import { useMemo } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  activityLabel,
  buildActivityRows,
  buildAttentionLists,
  countSince,
  formatPercent,
  formatRelative,
  getScenarioLabel,
  recentAttempts,
  scopeAccounts,
  scorePercent,
  summarize,
  TARGET,
} from "../../utils/adminMetrics";
import { PageHeader, ScoreBadge, ScoreBar, SummaryCard } from "../../components/admin/AdminUi";

const INACTIVE_DAYS = 14;
const LIST_LIMIT = 5;

function AttentionCard({ title, description, items, empty, renderMeta }) {
  return (
    <article className="admin-panel admin-attention">
      <div className="admin-panel-head">
        <h2>{title}</h2>
        <span className={`badge ${items.length ? "badge--warn" : "badge--pass"}`}>{items.length}</span>
      </div>
      <p className="admin-panel-note">{description}</p>
      {items.length ? (
        <ul className="admin-attention-list">
          {items.slice(0, LIST_LIMIT).map((item) => {
            const account = item.account ?? item;
            return (
              <li key={account.userId}>
                <Link to={`/admin/accounts/${account.userId}`}>{account.username}</Link>
                <span>{renderMeta(item)}</span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="admin-panel-empty">{empty}</p>
      )}
      {items.length > LIST_LIMIT && (
        <p className="admin-panel-more">+ {items.length - LIST_LIMIT} more</p>
      )}
    </article>
  );
}

export default function AdminHome() {
  const { learners } = useOutletContext();
  const accounts = useMemo(() => scopeAccounts(learners), [learners]);
  const summary = useMemo(() => summarize(accounts), [accounts]);
  const week = useMemo(() => countSince(accounts, 7), [accounts]);
  const attention = useMemo(() => buildAttentionLists(accounts, INACTIVE_DAYS), [accounts]);
  const recent = useMemo(() => recentAttempts(accounts), [accounts]);
  const activities = useMemo(() => buildActivityRows(accounts), [accounts]);

  return (
    <main className="my-progress admin-page">
      <PageHeader title="Dashboard" description="A quick look at how learners are doing across ClassCraft." />

      <section className="summary-section" aria-labelledby="admin-home-overview">
        <div className="summary-section-head">
          <h2 className="summary-section-title" id="admin-home-overview">At a glance</h2>
        </div>
        <div className="summary-grid admin-summary-grid">
          <SummaryCard
            title="Learner accounts"
            value={accounts.length}
            description={`${summary.activeLearners} have made at least one attempt`}
          />
          <SummaryCard
            title="Active this week"
            value={week.learners}
            description={`${week.attempts} attempts in the last 7 days`}
          />
          <SummaryCard
            title="First-attempt accuracy"
            value={formatPercent(summary.firstAverage)}
            description={`Latest attempt: ${formatPercent(summary.latestAverage)}`}
          />
          <SummaryCard
            title={`Meeting ${TARGET}% target`}
            value={`${summary.meeting} / ${summary.withFirst}`}
            description="Learner scenarios, first attempt"
          />
        </div>
      </section>

      <section className="summary-section" aria-labelledby="admin-home-attention">
        <div className="summary-section-head">
          <h2 className="summary-section-title" id="admin-home-attention">Needs attention</h2>
          <p className="summary-section-note">Select a learner to see their full history.</p>
        </div>
        <div className="admin-attention-grid">
          <AttentionCard
            title="Struggling"
            description={`Scored below ${TARGET}% on the first two attempts of a scenario.`}
            items={attention.struggling}
            empty="No learners are stuck on a scenario."
            renderMeta={(item) => `${item.count} scenario${item.count === 1 ? "" : "s"}`}
          />
          <AttentionCard
            title="Inactive"
            description={`Started practising but no attempts in ${INACTIVE_DAYS}+ days.`}
            items={attention.inactive}
            empty="Every learner who started is still active."
            renderMeta={(account) => formatRelative(account.lastActive)}
          />
          <AttentionCard
            title="Not started"
            description="Signed up but haven't attempted any scenario."
            items={attention.notStarted}
            empty="Every learner has made an attempt."
            renderMeta={(account) => `Joined ${formatRelative(account.createdAt)}`}
          />
        </div>
      </section>

      <div className="admin-home-columns">
        <section className="admin-panel" aria-labelledby="admin-home-recent">
          <div className="admin-panel-head">
            <h2 id="admin-home-recent">Recent attempts</h2>
            <Link to="/admin/accounts" className="admin-panel-link">All accounts →</Link>
          </div>
          {recent.length ? (
            <ul className="admin-recent-list">
              {recent.map((attempt) => (
                <li key={`${attempt.account.userId}:${attempt.activityKey}:${attempt.scenarioKey}:${attempt.attemptNumber}`}>
                  <div>
                    <Link to={`/admin/accounts/${attempt.account.userId}`}>{attempt.account.username}</Link>
                    <span>
                      {getScenarioLabel(attempt.activityKey, attempt.scenarioKey)} · {activityLabel(attempt.activityKey)} · attempt {attempt.attemptNumber}
                    </span>
                  </div>
                  <div className="admin-recent-meta">
                    <ScoreBadge value={scorePercent(attempt)} />
                    <span>{formatRelative(attempt.createdAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="admin-panel-empty">No attempts recorded yet.</p>
          )}
        </section>

        <section className="admin-panel" aria-labelledby="admin-home-activities">
          <div className="admin-panel-head">
            <h2 id="admin-home-activities">Activity snapshot</h2>
            <Link to="/admin/activities" className="admin-panel-link">Details →</Link>
          </div>
          <ul className="admin-snapshot-list">
            {activities.map((activity) => (
              <li key={activity.key}>
                <div>
                  <strong>{activity.label}</strong>
                  <span>{activity.learners} learner{activity.learners === 1 ? "" : "s"} · {activity.distinct} / {activity.known} scenarios tried</span>
                </div>
                <ScoreBar value={activity.firstAverage} />
              </li>
            ))}
          </ul>
          <p className="admin-panel-note">Bars show average first-attempt accuracy.</p>
        </section>
      </div>
    </main>
  );
}
