/*
 * AdminUi.jsx: small display pieces shared by the admin pages (score bars, badges, cards,
 * filters). They reuse the learner dashboard's classes so the admin pages look the same.
 */
import { formatPercent, KNOWN_SCENARIOS, LEARNING_ACTIVITIES, scorePercent, TARGET } from "../../utils/adminMetrics";

export function ScoreBar({ value }) {
  const status = !Number.isFinite(value) ? "empty" : value >= TARGET ? "pass" : "needs-improvement";
  const width = Number.isFinite(value) ? Math.max(0, Math.min(100, Math.round(value))) : 0;
  return (
    <div className="accuracy-breakdown accuracy-breakdown--static admin-score-bar">
      <div className={`accuracy-bar accuracy-bar--${status}`}>
        <div className="accuracy-bar-fill" style={{ width: `${width}%` }} />
        <span className="accuracy-bar-label">{formatPercent(value)}</span>
      </div>
    </div>
  );
}

export function ScoreBadge({ value }) {
  if (!Number.isFinite(value)) return <span className="badge badge--muted">—</span>;
  return <span className={`badge ${value >= TARGET ? "badge--pass" : "badge--warn"}`}>{formatPercent(value)}</span>;
}

export function RoleBadge({ role }) {
  if (role === "admin") return <span className="badge admin-badge--admin">Admin</span>;
  if (!role) return <span className="badge badge--muted">Role unknown</span>;
  return <span className="badge badge--info">{role.charAt(0).toUpperCase() + role.slice(1)}</span>;
}

const STATUS_BADGES = {
  active: ["badge--pass", "Active"],
  unconfirmed: ["badge--warn", "Unconfirmed"],
  suspended: ["admin-badge--error", "Suspended"],
  deleted: ["badge--muted", "Deleted"],
};

export function StatusBadge({ status }) {
  const [className, label] = STATUS_BADGES[status] ?? ["badge--muted", "Unknown"];
  return <span className={`badge ${className}`}>{label}</span>;
}

export function TargetBadge({ met, total }) {
  if (!total) return <span className="badge badge--muted">No first attempts</span>;
  return (
    <span className={`badge ${met === total ? "badge--pass" : "badge--warn"}`}>
      {met} / {total} met
    </span>
  );
}

export function ScoreTrail({ history }) {
  return (
    <ol className="admin-score-trail" aria-label="Score for each attempt">
      {history.map((score) => {
        const value = scorePercent(score);
        return (
          <li
            key={score.attemptNumber}
            title={`Attempt ${score.attemptNumber}: ${score.correctElements}/${score.requiredElements} elements`}
          >
            <span className={value !== null && value >= TARGET ? "is-pass" : "is-warn"}>{formatPercent(value)}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function SummaryCard({ title, value, description }) {
  return (
    <article className="summary-card admin-summary-card">
      <p className="summary-label">{title}</p>
      <p className="summary-value">{value}</p>
      <p className="summary-sub">{description}</p>
    </article>
  );
}

export function PageHeader({ title, description, children }) {
  return (
    <header className="my-progress-header admin-page-header">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children}
    </header>
  );
}

/**
 * Filter bar. `fields` picks which controls this page shows:
 * "search", "activity", "scenario", "completion", "dates".
 */
export function AdminFilters({ filters, fields, onChange, onReset }) {
  const show = new Set(fields);
  const scenarioOptions = filters.activity ? KNOWN_SCENARIOS.get(filters.activity) ?? [] : [];
  const active = Object.values(filters).some(Boolean);

  return (
    <section className="admin-filters" aria-label="Filters">
      {show.has("search") && (
        <label className="admin-field admin-field--search">
          <span>Search accounts</span>
          <input
            type="search"
            value={filters.search}
            onChange={(event) => onChange("search", event.target.value)}
            placeholder="Username, email or account ID"
          />
        </label>
      )}
      {show.has("activity") && (
        <label className="admin-field">
          <span>Activity</span>
          <select value={filters.activity} onChange={(event) => onChange("activity", event.target.value)}>
            <option value="">All activities</option>
            {LEARNING_ACTIVITIES.map((activity) => (
              <option key={activity.key} value={activity.key}>{activity.label}</option>
            ))}
          </select>
        </label>
      )}
      {show.has("scenario") && (
        <label className="admin-field">
          <span>Scenario</span>
          <select
            value={filters.scenario}
            onChange={(event) => onChange("scenario", event.target.value)}
            disabled={!filters.activity}
          >
            <option value="">{filters.activity ? "All scenarios" : "Pick an activity first"}</option>
            {scenarioOptions.map((scenario) => (
              <option key={scenario.scenarioKey} value={scenario.scenarioKey}>{scenario.label}</option>
            ))}
          </select>
        </label>
      )}
      {show.has("completion") && (
        <label className="admin-field">
          <span>Completion</span>
          <select value={filters.completion} onChange={(event) => onChange("completion", event.target.value)}>
            <option value="">Any</option>
            <option value="completed">Completed a scenario</option>
            <option value="unfinished">Has unfinished scenarios</option>
            <option value="none">No attempts</option>
          </select>
        </label>
      )}
      {show.has("dates") && (
        <>
          <label className="admin-field">
            <span>From</span>
            <input type="date" value={filters.from} max={filters.to || undefined} onChange={(event) => onChange("from", event.target.value)} />
          </label>
          <label className="admin-field">
            <span>To</span>
            <input type="date" value={filters.to} min={filters.from || undefined} onChange={(event) => onChange("to", event.target.value)} />
          </label>
        </>
      )}
      <button type="button" className="admin-reset" onClick={onReset} disabled={!active}>
        Reset filters
      </button>
    </section>
  );
}
