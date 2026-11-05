import { useEffect, useId, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { supabase } from "../utils/supabase";
import {
  getFirstAttemptMetrics,
  getScenarioLabel,
  getScenarioMetrics,
  getCachedLearningAttempts,
  LEARNING_ACTIVITIES,
  loadLearningAttempts,
  TARGET_FIRST_ATTEMPT_ACCURACY,
} from "../utils/learningAttempts";
import "../css/dashboard_css.css";
import "../css/myprogress_css.css";

// --- HELPER COMPONENTS ---
function AccuracyBar({
  value,
  targetValue = value,
  breakdown = { scenarios: [] },
  attemptLabel = "first-attempt",
  accuracyKey = "accuracyValue",
  showBreakdown = true,
  includeScoreDetails = false,
}) {
  const breakdownId = useId();
  const pct = value ?? 0;
  const status = value === null ? "empty" : targetValue >= TARGET_FIRST_ATTEMPT_ACCURACY ? "pass" : "needs-improvement";
  return (
    <div
      className={`accuracy-breakdown${showBreakdown ? "" : " accuracy-breakdown--static"}`}
      tabIndex={showBreakdown ? 0 : undefined}
      role={showBreakdown ? "group" : undefined}
      aria-label={`Overall ${attemptLabel} accuracy: ${value === null ? "not available" : `${value}%`}`}
      aria-describedby={showBreakdown ? breakdownId : undefined}
    >
      <div className={`accuracy-bar accuracy-bar--${status}`}>
        <div className="accuracy-bar-fill" style={{ width: `${pct}%` }} />
        <span className="accuracy-bar-label">{value === null ? "—" : `${pct}%`}</span>
      </div>
      {showBreakdown && (
        <div className="accuracy-breakdown-panel" id={breakdownId}>
          <strong>How this is calculated</strong>
          {breakdown.scenarios.length ? (
            <>
              <p>
                The average of each scenario's {attemptLabel} accuracy:
                <br />
                ({breakdown.scenarios.map((scenario) => `${formatPercentage(scenario[accuracyKey])}%`).join(" + ")})
                {" / "}{breakdown.scenarios.length} scenarios = {value}%.
              </p>
              <ul>
                {breakdown.scenarios.map((scenario) => (
                  <li key={scenario.scenarioKey}>
                    {getScenarioLabel(scenario.activityKey, scenario.scenarioKey)}: {formatPercentage(scenario[accuracyKey])}%
                    {includeScoreDetails && typeof scenario.firstAttemptRequired === "number" && (
                      <> ({scenario.firstAttemptCorrect}/{scenario.firstAttemptRequired} elements)</>
                    )}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p>No first attempts have been recorded yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

function formatPercentage(value) {
  return Number(value.toFixed(1)).toString();
}

function MetricCard({ title, value, description, breakdown }) {
  const tooltipId = useId();
  return (
    <article className="summary-card summary-card--breakdown">
      <p className="summary-label">{title}</p>
      <div
        className="summary-card-value-wrap"
        tabIndex={0}
        aria-label={`${title}: ${value}`}
        aria-describedby={tooltipId}
      >
        <p className="summary-value">{value}</p>
        <div className="summary-card-breakdown-tooltip" id={tooltipId}>
          <strong>{title} breakdown</strong>
          {breakdown.length ? (
            <ul>
              {breakdown.map((item) => <li key={item.label}>{item.label}: {item.value}</li>)}
            </ul>
          ) : (
            <p>No attempts recorded yet.</p>
          )}
        </div>
      </div>
      <p className="summary-sub">{description}</p>
    </article>
  );
}

function ConsistencyBar({ value, met, total, scenarios }) {
  const tooltipId = useId();
  const isEmpty = value === null;
  return (
    <div
      className="consistency-metric consistency-metric--interactive"
      tabIndex={0}
      role="group"
      aria-label={`Consistency: ${isEmpty ? "not available" : `${value}%`}`}
      aria-describedby={tooltipId}
    >
      <div className={`consistency-bar${isEmpty ? " consistency-bar--empty" : ""}`}>
        <div className="consistency-bar-fill" style={{ width: `${value ?? 0}%` }} />
        <span className="consistency-bar-label">{isEmpty ? "—" : `${value}%`}</span>
      </div>
      <div className="consistency-breakdown-panel" id={tooltipId}>
        <strong>Consistency</strong>
        {isEmpty ? (
          <p>Attempt scenarios to see how many meet the 80% target.</p>
        ) : (
          <>
            <p>{met} of {total} scenarios met the 80% target.</p>
            <ul>
              {scenarios.map((scenario) => (
                <li key={scenario.scenarioKey}>
                  {getScenarioLabel(scenario.activityKey, scenario.scenarioKey)}:{" "}
                  {formatPercentage(scenario.accuracyValue)}%{" "}
                  {scenario.meetsTarget ? "(met)" : "(not met)"}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ value, targetValue = value }) {
  if (value === null) return <span className="badge badge--muted">Not started</span>;
  if (targetValue >= TARGET_FIRST_ATTEMPT_ACCURACY) return <span className="badge badge--pass">On track</span>;
  return <span className="badge badge--warn">Needs practice</span>;
}

function SkillMetricStatus({ activity }) {
  if (!activity.attemptedScenarios) return <span className="badge badge--info">No attempts</span>;
  return <StatusBadge value={activity.accuracy} targetValue={activity.accuracyValue} />;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("User");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState([]);
  const [activeTab, setActiveTab] = useState("skills");

  useEffect(() => {
    async function loadUser() {
      // 1. Check authentication with Supabase
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      const user = session?.user;

      if (authError || !user) {
        navigate("/", { replace: true });
        return;
      }

      try {
        setUsername(user.user_metadata?.username || "User");
        setAttempts(getCachedLearningAttempts(user.id));
        setAttempts(await loadLearningAttempts());
      } catch (err) {
        setError(`Could not load your progress: ${err.message}`);
      }
    }
    
    loadUser();
  }, [navigate]);

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setError(error.message);
      return;
    }
    navigate("/", { replace: true });
  }

  const skillExperiences = LEARNING_ACTIVITIES.slice(0, 4).map((activity) => {
    const scenarios = getScenarioMetrics(attempts, activity.key);
    return {
      ...activity,
      ...getFirstAttemptMetrics(attempts, activity.key),
      accuracyBreakdown: scenarios.filter((scenario) => scenario.accuracy !== null),
      latestAccuracyBreakdown: scenarios.filter(
        (scenario) => scenario.latestAttemptAccuracyValue !== null
      ),
    };
  });
  const skillActivityKeys = new Set(skillExperiences.map((activity) => activity.key));
  const skillScenarios = getScenarioMetrics(attempts).filter(
    (scenario) => skillActivityKeys.has(scenario.activityKey)
  );
  const attemptedSkillScenarios = skillScenarios.filter((scenario) => scenario.accuracy !== null);
  const latestSkillScenarios = skillScenarios.filter(
    (scenario) => scenario.latestAttemptAccuracyValue !== null
  );
  const overallFirstAccuracy = attemptedSkillScenarios.length
    ? Math.round(
        attemptedSkillScenarios.reduce((sum, scenario) => sum + scenario.accuracyValue, 0) /
          attemptedSkillScenarios.length
      )
    : null;
  const overallLatestAccuracy = latestSkillScenarios.length
    ? Math.round(
        latestSkillScenarios.reduce((sum, scenario) => sum + scenario.latestAttemptAccuracyValue, 0) /
          latestSkillScenarios.length
      )
    : null;
  const scenariosMeetingTarget = attemptedSkillScenarios.filter((scenario) => scenario.meetsTarget).length;
  const practicedSkills = skillExperiences.filter((activity) => activity.attemptedScenarios > 0).length;
  const constructionScenarios = getScenarioMetrics(attempts, "class-diagram-construction");

  return (
    <div className="dashboard-layout">
      
      {/* ===== Sidebar ===== */}
      <aside className="sidebar" style={{ display: "flex", flexDirection: "column" }}>
        <div>
          <h2 className="sidebar-brand">ClassCraft</h2>
          <nav className="sidebar-nav">
            <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")} end>Dashboard</NavLink>
            <NavLink to="/learn-basics" className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}>Learn the Basics</NavLink>
            <NavLink to="/skill-development" className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}>Skill Development</NavLink>
            <NavLink to="/class-diagram-construction" className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}>Class Diagram Construction</NavLink>
          </nav>
        </div>
        
        {/* Logout button pushed to the bottom */}
        <div style={{ marginTop: "auto", paddingTop: "2rem" }}>
           <button 
             onClick={handleLogout} 
             className="sidebar-link" 
             style={{ width: "100%", textAlign: "left", background: "transparent", border: "none", cursor: "pointer", color: "#ef4444" }}
           >
             Log out
           </button>
        </div>
      </aside>

      {/* ===== Main content ===== */}
      <main className="my-progress"> 
        
        <header className="my-progress-header">
          <h1>Hello, {username}!</h1>
          <p>
            Progress is shown separately for Skill Development and Class Diagram
            Construction. Overall first-attempt accuracy stays fixed, while overall
            latest-attempt accuracy reflects the most recent score for each scenario.
          </p>
          {error && <p role="alert" style={{ color: '#ef4444', fontWeight: 'bold', marginTop: '10px' }}>⚠ {error}</p>}
        </header>

        {/* ===== Overview cards ===== */}
        <section className="summary-section" aria-labelledby="progress-overview-heading">
          <h2 className="summary-section-title" id="progress-overview-heading">
            Progress Overview
          </h2>
          <div className="summary-grid">
            <MetricCard
              title="Overall First-Attempt Accuracy"
              value={overallFirstAccuracy === null ? "—" : `${overallFirstAccuracy}%`}
              description={`Across ${attemptedSkillScenarios.length} attempted scenarios`}
              breakdown={skillExperiences.map((activity) => ({
                label: activity.label,
                value: activity.accuracy === null ? "No attempts" : `${activity.accuracy}%`,
              }))}
            />
            <MetricCard
              title="Overall Latest-Attempt Accuracy"
              value={overallLatestAccuracy === null ? "—" : `${overallLatestAccuracy}%`}
              description="Most recent score per scenario"
              breakdown={skillExperiences.map((activity) => ({
                label: activity.label,
                value: activity.latestAccuracy === null ? "No attempts" : `${activity.latestAccuracy}%`,
              }))}
            />
            <MetricCard
              title="Scenarios Meeting Target"
              value={`${scenariosMeetingTarget} / ${attemptedSkillScenarios.length}`}
              description="At least 80% on the first attempt"
              breakdown={skillExperiences.map((activity) => ({
                label: activity.label,
                value: `${activity.scenariosMeetingTarget} / ${activity.attemptedScenarios} scenarios`,
              }))}
            />
            <MetricCard
              title="Skill Experiences Practiced"
              value={`${practicedSkills} / ${skillExperiences.length}`}
              description="Experiences with at least one attempt"
              breakdown={skillExperiences.map((activity) => ({
                label: activity.label,
                value: `${activity.attemptedScenarios} scenarios · ${activity.attempts} attempts`,
              }))}
            />
          </div>
        </section>

        {/* ===== Tabs ===== */}
        <div className="progress-tabs">
          <button type="button" className={activeTab === "skills" ? "progress-tab active" : "progress-tab"} onClick={() => setActiveTab("skills")}>
            Skill Development
          </button>
          <button type="button" className={activeTab === "construction" ? "progress-tab active" : "progress-tab"} onClick={() => setActiveTab("construction")}>
            Class Diagram Construction
          </button>
        </div>

        {/* ===== Skills table ===== */}
        {activeTab === "skills" && (
          <section className="progress-table-wrapper">
            <table className="progress-table skill-progress-table">
              <thead>
                <tr>
                  <th>Experience</th>
                  <th>First-Attempt Accuracy</th>
                  <th>Latest Attempt Accuracy</th>
                  <th>Consistency</th>
                  <th>Attempts</th>
                  <th>Guided attempt used</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {skillExperiences.map((item) => {
                  return (
                    <tr key={item.key}>
                      <td>{item.label}</td>
                      <td>
                        <AccuracyBar
                          value={item.accuracy}
                          targetValue={item.accuracyValue}
                          breakdown={{ scenarios: item.accuracyBreakdown }}
                        />
                      </td>
                      <td className="cell-center">
                        <AccuracyBar
                          value={item.latestAccuracy}
                          targetValue={item.latestAccuracyValue}
                          breakdown={{ scenarios: item.latestAccuracyBreakdown }}
                          attemptLabel="latest-attempt"
                          accuracyKey="latestAttemptAccuracyValue"
                        />
                      </td>
                      <td className="cell-center">
                        <ConsistencyBar
                          value={item.consistency}
                          met={item.scenariosMeetingTarget}
                          total={item.attemptedScenarios}
                          scenarios={item.accuracyBreakdown}
                        />
                      </td>
                      <td className="cell-center">{item.attempts}</td>
                      <td><span className="badge badge--muted">—</span></td>
                      <td><SkillMetricStatus activity={item} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        )}

        {/* ===== Construction scenarios ===== */}
        {activeTab === "construction" && (
          <section className="progress-table-wrapper">
            <table className="progress-table construction-progress-table">
              <thead>
                <tr>
                  <th>Scenario</th>
                  <th>First attempt</th>
                  <th>Latest attempt</th>
                  <th>80% target</th>
                  <th>Guided attempt used</th>
                  <th>Attempts</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {constructionScenarios.map((item) => (
                  <tr key={item.scenarioKey}>
                    <td className="construction-scenario-cell">
                      <span className="construction-scenario-name">
                        {getScenarioLabel(item.activityKey, item.scenarioKey)}
                      </span>
                      <details className="construction-score-details">
                        <summary>Score breakdown</summary>
                        <ul>
                          {item.scoreHistory.map((score) => (
                            <li key={score.attemptNumber}>
                              <span>Attempt {score.attemptNumber}</span>
                              <strong>
                                {score.correctElements}/{score.requiredElements}
                              </strong>
                            </li>
                          ))}
                        </ul>
                      </details>
                    </td>
                    <td>
                      <AccuracyBar
                        value={item.accuracy}
                        targetValue={item.accuracyValue}
                        breakdown={{ scenarios: [item] }}
                        includeScoreDetails
                      />
                    </td>
                    <td>
                      <AccuracyBar
                        value={item.latestAttemptAccuracy}
                        targetValue={item.latestAttemptAccuracyValue}
                        breakdown={{ scenarios: [item] }}
                        attemptLabel="latest-attempt"
                        accuracyKey="latestAttemptAccuracyValue"
                        showBreakdown={false}
                      />
                    </td>
                    <td>
                      {item.accuracy === null
                        ? <span className="badge badge--muted">No first score</span>
                        : item.meetsTarget
                          ? <span className="badge badge--pass">Met</span>
                          : <span className="badge badge--warn">Not met</span>}
                    </td>
                    <td>
                      <span className="badge badge--muted">—</span>
                    </td>
                    <td className="cell-center">{item.attempts}</td>
                    <td>
                      {item.completed
                        ? <span className="badge badge--pass">Completed</span>
                        : <span className="badge badge--muted">In progress</span>}
                    </td>
                  </tr>
                ))}
                {constructionScenarios.length === 0 && (
                  <tr><td colSpan="7">No construction scenarios submitted yet.</td></tr>
                )}
              </tbody>
            </table>
          </section>
        )}
      </main>
    </div>
  );
}