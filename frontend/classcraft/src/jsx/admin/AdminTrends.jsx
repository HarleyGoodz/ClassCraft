/*
 * AdminTrends.jsx: how scores change across attempts, separating initial understanding
 * (first attempt) from improvement (later attempts).
 */
import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  buildActivityRows,
  buildTrends,
  changeFilter,
  EMPTY_FILTERS,
  formatChange,
  scopeAccounts,
  TARGET,
} from "../../utils/adminMetrics";
import { AdminFilters, PageHeader, ScoreBar, SummaryCard } from "../../components/admin/AdminUi";

export default function AdminTrends() {
  const { learners } = useOutletContext();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const accounts = useMemo(() => scopeAccounts(learners, filters), [learners, filters]);
  const trends = useMemo(() => buildTrends(accounts), [accounts]);
  const activityRows = useMemo(() => buildActivityRows(accounts, filters.activity), [accounts, filters.activity]);

  return (
    <main className="my-progress admin-page">
      <PageHeader
        title="Progress Trends"
        description="Attempt 1 shows initial understanding; later attempts show improvement."
      />

      <AdminFilters
        filters={filters}
        fields={["activity", "scenario", "dates"]}
        onChange={(name, value) => setFilters((current) => changeFilter(current, name, value))}
        onReset={() => setFilters(EMPTY_FILTERS)}
      />

      <section className="summary-section">
        <div className="summary-grid admin-summary-grid">
          <SummaryCard title="Retried scenarios" value={trends.retried} description="Learner scenarios with 2+ attempts" />
          <SummaryCard title="Average change" value={formatChange(trends.averageChange)} description="First attempt → latest attempt" />
          <SummaryCard title="Improved" value={`${trends.improved} / ${trends.retried}`} description="Latest score higher than first" />
          <SummaryCard
            title={`Reached ${TARGET}% after retrying`}
            value={`${trends.reachedTarget} / ${trends.belowFirst}`}
            description={`Of those below ${TARGET}% at first`}
          />
        </div>
      </section>

      <section className="admin-section" aria-labelledby="admin-attempt-trend-heading">
        <div className="summary-section-head">
          <h2 className="summary-section-title" id="admin-attempt-trend-heading">Average score by attempt</h2>
        </div>
        <div className="progress-table-wrapper admin-table-scroll">
          <table className="progress-table admin-table admin-trend-table">
            <thead>
              <tr>
                <th>Attempt</th>
                <th>Average score</th>
                <th>Scores recorded</th>
              </tr>
            </thead>
            <tbody>
              {trends.buckets.map((bucket) => (
                <tr key={bucket.label}>
                  <td>{bucket.label}</td>
                  <td><ScoreBar value={bucket.average} /></td>
                  <td>{bucket.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-section" aria-labelledby="admin-activity-trend-heading">
        <div className="summary-section-head">
          <h2 className="summary-section-title" id="admin-activity-trend-heading">First vs latest by activity</h2>
        </div>
        <div className="progress-table-wrapper admin-table-scroll">
          <table className="progress-table admin-table">
            <thead>
              <tr>
                <th>Activity</th>
                <th>First attempt</th>
                <th>Latest attempt</th>
                <th>Change</th>
              </tr>
            </thead>
            <tbody>
              {activityRows.map((row) => {
                const change = Number.isFinite(row.firstAverage) && Number.isFinite(row.latestAverage)
                  ? row.latestAverage - row.firstAverage
                  : null;
                return (
                  <tr key={row.key}>
                    <td>{row.label}</td>
                    <td><ScoreBar value={row.firstAverage} /></td>
                    <td><ScoreBar value={row.latestAverage} /></td>
                    <td className={change > 0 ? "admin-up" : change < 0 ? "admin-down" : undefined}>
                      {formatChange(change)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
