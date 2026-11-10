/*
 * AdminAccounts.jsx: the learner account directory with search and filters.
 * Each row links to that learner's own page (AdminAccountDetail.jsx).
 */
import { useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  changeFilter,
  EMPTY_FILTERS,
  filterAccounts,
  formatDate,
  scopeAccounts,
} from "../../utils/adminMetrics";
import { AdminFilters, PageHeader, ScoreBar, StatusBadge } from "../../components/admin/AdminUi";

export default function AdminAccounts() {
  const { learners } = useOutletContext();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const scoped = useMemo(() => scopeAccounts(learners, filters), [learners, filters]);
  const accounts = useMemo(() => filterAccounts(scoped, filters), [scoped, filters]);
  const filtersActive = Object.values(filters).some(Boolean);

  return (
    <main className="my-progress admin-page">
      <PageHeader
        title="Accounts"
        description="Every learner account, with completion and accuracy for the selected filters."
      />

      <AdminFilters
        filters={filters}
        fields={["search", "activity", "scenario", "completion", "dates"]}
        onChange={(name, value) => setFilters((current) => changeFilter(current, name, value))}
        onReset={() => setFilters(EMPTY_FILTERS)}
      />

      <p className="admin-result-count">
        Showing {accounts.length} of {learners.length} learner account{learners.length === 1 ? "" : "s"}
      </p>

      <section className="progress-table-wrapper admin-table-scroll">
        <table className="progress-table admin-table admin-accounts-table">
          <thead>
            <tr>
              <th>Account</th>
              <th>Status</th>
              <th>Created</th>
              <th>Scenarios completed</th>
              <th>First attempt</th>
              <th>Latest attempt</th>
              <th>Last activity</th>
              <th><span className="admin-visually-hidden">Details</span></th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account.userId}>
                <td>
                  <div className="admin-account-cell">
                    <strong>{account.username}</strong>
                    <span>{account.email}</span>
                    <span className="admin-id">ID {account.userId}</span>
                  </div>
                </td>
                <td><StatusBadge status={account.status} /></td>
                <td>{formatDate(account.createdAt)}</td>
                <td>
                  {account.scenariosAttempted
                    ? `${account.scenariosCompleted} / ${account.scenariosAttempted}`
                    : <span className="admin-muted">None</span>}
                </td>
                <td><ScoreBar value={account.firstAverage} /></td>
                <td><ScoreBar value={account.latestAverage} /></td>
                <td>{account.lastActive ? formatDate(account.lastActive, true) : <span className="admin-muted">No activity</span>}</td>
                <td>
                  <Link className="admin-row-button" to={`/admin/accounts/${account.userId}`}>View</Link>
                </td>
              </tr>
            ))}
            {!accounts.length && (
              <tr>
                <td colSpan="8" className="admin-empty">
                  {filtersActive ? "No accounts match these filters." : "No learner accounts yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
