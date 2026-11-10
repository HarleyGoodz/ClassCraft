/*
 * AdminActivities.jsx: results grouped by learning activity, and by scenario once an
 * activity is chosen.
 */
import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  activityLabel,
  buildActivityRows,
  buildScenarioRows,
  changeFilter,
  EMPTY_FILTERS,
  scopeAccounts,
  summarize,
  TARGET,
} from "../../utils/adminMetrics";
import { AdminFilters, PageHeader, ScoreBar, SummaryCard, TargetBadge } from "../../components/admin/AdminUi";

export default function AdminActivities() {
  const { learners } = useOutletContext();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const accounts = useMemo(() => scopeAccounts(learners, filters), [learners, filters]);
  const summary = useMemo(() => summarize(accounts), [accounts]);
  const activityRows = useMemo(() => buildActivityRows(accounts, filters.activity), [accounts, filters.activity]);
  const scenarioRows = useMemo(
    () => buildScenarioRows(accounts, filters.activity, filters.scenario),
    [accounts, filters.activity, filters.scenario]
  );
  const setFilter = (name, value) => setFilters((current) => changeFilter(current, name, value));

  return (
    <main className="my-progress admin-page">
      <PageHeader
        title="Learning Activities"
        description="How learners perform in each activity and scenario."
      />

      <AdminFilters
        filters={filters}
        fields={["activity", "scenario", "dates"]}
        onChange={setFilter}
        onReset={() => setFilters(EMPTY_FILTERS)}
      />

      <section className="summary-section">
        <div className="summary-grid admin-summary-grid">
          <SummaryCard title="Attempts" value={summary.attempts} description={`By ${summary.activeLearners} learners`} />
          <SummaryCard
            title="First-attempt accuracy"
            value={summary.firstAverage === null ? "—" : `${Math.round(summary.firstAverage)}%`}
            description={`Latest attempt: ${summary.latestAverage === null ? "—" : `${Math.round(summary.latestAverage)}%`}`}
          />
          <SummaryCard
            title={`Meeting ${TARGET}% target`}
            value={`${summary.meeting} / ${summary.withFirst}`}
            description="Learner scenarios, first attempt"
          />
          <SummaryCard
            title="Scenarios completed"
            value={`${summary.completed} / ${summary.attempted}`}
            description="Of learner scenarios attempted"
          />
        </div>
      </section>

      <section className="admin-section" aria-labelledby="admin-activities-heading">
        <div className="summary-section-head">
          <h2 className="summary-section-title" id="admin-activities-heading">By activity</h2>
          <p className="summary-section-note">
            {filters.activity ? "Scenario details are below." : "Select an activity to see its scenarios."}
          </p>
        </div>
        <div className="progress-table-wrapper admin-table-scroll">
          <table className="progress-table admin-table">
            <thead>
              <tr>
                <th>Activity</th>
                <th>Learners</th>
                <th>Scenarios attempted</th>
                <th>Attempts</th>
                <th>First attempt</th>
                <th>Latest attempt</th>
                <th>{TARGET}% target</th>
                <th>Completed</th>
              </tr>
            </thead>
            <tbody>
              {activityRows.map((row) => (
                <tr key={row.key}>
                  <td>
                    <button type="button" className="admin-link-button" onClick={() => setFilter("activity", row.key)}>
                      {row.label}
                    </button>
                  </td>
                  <td>{row.learners}</td>
                  <td>{row.distinct} / {row.known}</td>
                  <td>{row.attempts}</td>
                  <td><ScoreBar value={row.firstAverage} /></td>
                  <td><ScoreBar value={row.latestAverage} /></td>
                  <td><TargetBadge met={row.meeting} total={row.withFirst} /></td>
                  <td>{row.completed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="admin-footnote">
          Averages are taken per learner per scenario. “Completed” counts learner scenarios marked complete.
        </p>
      </section>

      {filters.activity && (
        <section className="admin-section" aria-labelledby="admin-scenarios-heading">
          <div className="summary-section-head">
            <h2 className="summary-section-title" id="admin-scenarios-heading">
              {activityLabel(filters.activity)} scenarios
            </h2>
            <p className="summary-section-note">
              {scenarioRows.filter((row) => !row.learners).length} of {scenarioRows.length} not attempted by any learner
            </p>
          </div>
          <div className="progress-table-wrapper admin-table-scroll">
            <table className="progress-table admin-table">
              <thead>
                <tr>
                  <th>Scenario</th>
                  <th>Learners</th>
                  <th>Attempts</th>
                  <th>First attempt</th>
                  <th>Latest attempt</th>
                  <th>{TARGET}% target</th>
                  <th>Completed</th>
                </tr>
              </thead>
              <tbody>
                {scenarioRows.map((row) => (
                  <tr key={row.scenarioKey}>
                    <td>{row.label}</td>
                    {row.learners ? (
                      <>
                        <td>{row.learners}</td>
                        <td>{row.attempts}</td>
                        <td><ScoreBar value={row.firstAverage} /></td>
                        <td><ScoreBar value={row.latestAverage} /></td>
                        <td><TargetBadge met={row.meeting} total={row.withFirst} /></td>
                        <td>{row.completed} / {row.learners}</td>
                      </>
                    ) : (
                      <td colSpan="6"><span className="badge badge--muted">Not attempted</span></td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}
