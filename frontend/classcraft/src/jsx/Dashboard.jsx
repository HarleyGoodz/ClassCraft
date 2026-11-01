import { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { supabase } from "../utils/supabase";
import "../css/dashboard_css.css";
import "../css/myprogress_css.css";

// --- PROGRESS DATA ---
const SKILL_EXPERIENCES = [
  { key: "candidate-class", label: "Candidate Class Identification", firstAttemptAccuracy: 85, consistency: 78, guidedUsed: false, attempts: 4 },
  { key: "attribute-method", label: "Attribute & Method Classification", firstAttemptAccuracy: 72, consistency: 65, guidedUsed: true, attempts: 5 },
  { key: "relationship-multiplicity", label: "Relationship & Multiplicity", firstAttemptAccuracy: 68, consistency: 61, guidedUsed: true, attempts: 3 },
  { key: "class-modelling", label: "Class Modelling", firstAttemptAccuracy: 74, consistency: 70, guidedUsed: false, attempts: 2 },
];

const CONSTRUCTION_SCENARIOS = [
  { key: "library-system", label: "Library Management System", completed: true, accuracy: 88, attempts: 2 },
  { key: "online-shop", label: "Online Shopping Cart", completed: true, accuracy: 82, attempts: 3 },
  { key: "hospital-records", label: "Hospital Records System", completed: false, accuracy: 64, attempts: 1 },
  { key: "school-enrollment", label: "School Enrollment System", completed: false, accuracy: null, attempts: 0 },
];

const TARGET_ACCURACY = 80;

// --- HELPER COMPONENTS ---
function AccuracyBar({ value }) {
  const pct = value ?? 0;
  const status = value === null ? "empty" : pct >= TARGET_ACCURACY ? "pass" : "needs-improvement";
  return (
    <div className={`accuracy-bar accuracy-bar--${status}`}>
      <div className="accuracy-bar-fill" style={{ width: `${pct}%` }} />
      <span className="accuracy-bar-label">{value === null ? "—" : `${pct}%`}</span>
    </div>
  );
}

function StatusBadge({ value }) {
  if (value === null) return <span className="badge badge--muted">Not started</span>;
  if (value >= TARGET_ACCURACY) return <span className="badge badge--pass">On track</span>;
  return <span className="badge badge--warn">Needs practice</span>;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("User");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [activeTab, setActiveTab] = useState("skills"); 

  useEffect(() => {
    async function loadUser() {
      const { data, error: authError } = await supabase.auth.getUser();

      if (authError || !data.user) {
        navigate("/", { replace: true });
        return;
      }

      try {
        // FIX 1: Add a 5-second timeout to prevent infinite loading
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`http://localhost:8080/api/users`, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId); // Clear timeout if successful

        if (!response.ok) throw new Error("Could not load your profile.");
        
        const users = await response.json();
        const profile = users.find((item) => item.authUserId === data.user.id);

        if (profile) setUsername(profile.username);
        else setError("Your profile was not found in the database.");
      } catch (err) {
        // FIX 2: Handle the timeout specifically
        if (err.name === 'AbortError') {
          setError("Backend connection timed out. Is the Spring Boot server running?");
        } else {
          setError(err.message || "Could not connect to the backend.");
        }
      } finally {
        // FIX 3: This now ALWAYS runs, so the page will never be stuck
        setLoading(false);
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

  const overallAccuracy = Math.round(
    SKILL_EXPERIENCES.reduce((sum, s) => sum + s.firstAttemptAccuracy, 0) / SKILL_EXPERIENCES.length
  );
  const completedScenarios = CONSTRUCTION_SCENARIOS.filter((s) => s.completed).length;

  if (loading) {
    return <main className="dashboard">Loading your profile...</main>;
  }

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
          <p>Welcome to ClassCraft. Here is your progress overview.</p>
          {error && <p role="alert" style={{ color: '#ef4444', fontWeight: 'bold', marginTop: '10px' }}>⚠ {error}</p>}
        </header>

        {/* ===== Summary cards ===== */}
        <section className="summary-grid">
          <div className="summary-card">
            <p className="summary-label">Overall First-Attempt Accuracy</p>
            <p className="summary-value">{overallAccuracy}%</p>
            <StatusBadge value={overallAccuracy} />
          </div>
          <div className="summary-card">
            <p className="summary-label">Skill Experiences</p>
            <p className="summary-value">{SKILL_EXPERIENCES.length}</p>
            <p className="summary-sub">4 interactive experiences tracked</p>
          </div>
          <div className="summary-card">
            <p className="summary-label">Scenarios Completed</p>
            <p className="summary-value">{completedScenarios} / {CONSTRUCTION_SCENARIOS.length}</p>
            <p className="summary-sub">Target: ≥ 80% per scenario</p>
          </div>
          <div className="summary-card">
            <p className="summary-label">Guided Experiences Used</p>
            <p className="summary-value">{SKILL_EXPERIENCES.filter((s) => s.guidedUsed).length}</p>
            <p className="summary-sub">Auto-opens below 80% accuracy</p>
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
            <table className="progress-table">
              <thead>
                <tr>
                  <th>Experience</th>
                  <th>First-Attempt Accuracy</th>
                  <th>Consistency</th>
                  <th>Guided</th>
                  <th>Attempts</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {SKILL_EXPERIENCES.map((item) => (
                  <tr key={item.key}>
                    <td>{item.label}</td>
                    <td><AccuracyBar value={item.firstAttemptAccuracy} /></td>
                    <td><AccuracyBar value={item.consistency} /></td>
                    <td>
                      {item.guidedUsed ? <span className="badge badge--info">Used</span> : <span className="badge badge--muted">Not used</span>}
                    </td>
                    <td className="cell-center">{item.attempts}</td>
                    <td><StatusBadge value={item.firstAttemptAccuracy} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* ===== Construction scenarios ===== */}
        {activeTab === "construction" && (
          <section className="progress-table-wrapper">
            <table className="progress-table">
              <thead>
                <tr>
                  <th>Scenario</th>
                  <th>Accuracy</th>
                  <th>Attempts</th>
                  <th>Completion</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {CONSTRUCTION_SCENARIOS.map((item) => (
                  <tr key={item.key}>
                    <td>{item.label}</td>
                    <td><AccuracyBar value={item.accuracy} /></td>
                    <td className="cell-center">{item.attempts}</td>
                    <td>
                      {item.completed ? <span className="badge badge--pass">Completed</span> : <span className="badge badge--muted">In progress</span>}
                    </td>
                    <td><StatusBadge value={item.accuracy} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </main>
    </div>
  );
}