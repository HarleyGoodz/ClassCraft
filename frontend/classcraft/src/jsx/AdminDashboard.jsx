import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";
import "../css/admin_dashboard.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [showLogoutPrompt, setShowLogoutPrompt] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const navigate = useNavigate();

  async function confirmLogout() {
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setLogoutError(signOutError.message);
      return;
    }
    navigate("/", { replace: true });
  }

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        const token = sessionData.session?.access_token;
        if (!token) throw new Error("Sign in with an administrator account to continue.");
        const response = await fetch(`${API_BASE_URL}/api/admin/overview`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 403) throw new Error("This account does not have administrator access.");
        if (!response.ok) throw new Error(`Could not load admin data (${response.status}).`);
        const result = await response.json();
        if (active) { setData(result); setStatus("ready"); }
      } catch (err) {
        if (active) { setError(err.message || "Could not load admin data."); setStatus("error"); }
      }
    }
    load();
    return () => { active = false; };
  }, []);

  const accounts = useMemo(() => (data?.accounts || []).filter((account) =>
    `${account.username} ${account.email}`.toLowerCase().includes(query.trim().toLowerCase())
  ), [data, query]);

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div><span className="admin-eyebrow">CLASSCRAFT · ADMINISTRATION</span><h1>Admin dashboard</h1>
          <p>Account activity and learning progress across the platform.</p></div>
        <div className="admin-header-actions">
          <Link className="admin-back" to="/dashboard">Back to learning dashboard</Link>
          <button type="button" className="admin-logout" onClick={() => { setLogoutError(""); setShowLogoutPrompt(true); }}>Log out</button>
        </div>
      </header>
      {status === "loading" && <p className="admin-state">Loading account data…</p>}
      {status === "error" && <section className="admin-state admin-error" role="alert"><h2>Access unavailable</h2><p>{error}</p><Link to="/dashboard">Return to dashboard</Link></section>}
      {status === "ready" && <>
        <section className="admin-stats" aria-label="Platform summary">
          <article><span>Accounts</span><strong>{data.accounts.length}</strong></article>
          <article><span>Learners with attempts</span><strong>{data.activeLearners}</strong></article>
          <article><span>Total attempts</span><strong>{data.totalAttempts}</strong></article>
        </section>
        <section className="admin-directory">
          <div className="admin-directory-heading"><div><h2>Account directory</h2><p>Attempt totals and average score across saved submissions.</p></div>
            <label>Search accounts<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Username or email" /></label>
          </div>
          <div className="admin-table-wrap"><table><thead><tr><th>Account</th><th>Email</th><th>Attempts</th><th>Completed</th><th>Measurability</th><th>Last activity</th></tr></thead>
            <tbody>{accounts.map((account) => <tr key={account.userId}><td className="admin-username">{account.username}</td><td>{account.email}</td><td>{account.attempts}</td><td>{account.completedAttempts}</td><td>{account.measurability == null ? "—" : `${account.measurability}%`}</td><td>{account.lastActive ? new Date(account.lastActive).toLocaleString() : "No activity"}</td></tr>)}
              {!accounts.length && <tr><td colSpan="6" className="admin-empty">{query ? "No accounts match your search." : "No account records found."}</td></tr>}</tbody>
          </table></div>
          <p className="admin-footnote">Measurability is the average correct-elements / required-elements score across recorded attempts.</p>
        </section>
      </>}
      {showLogoutPrompt && <div className="admin-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowLogoutPrompt(false); }}>
        <section className="admin-logout-modal" role="dialog" aria-modal="true" aria-labelledby="admin-logout-title">
          <h2 id="admin-logout-title">Log out?</h2>
          <p>You’ll be signed out of ClassCraft and returned to the login page.</p>
          {logoutError && <p className="admin-logout-error" role="alert">{logoutError}</p>}
          <div className="admin-modal-actions">
            <button type="button" className="admin-cancel" onClick={() => setShowLogoutPrompt(false)}>Cancel</button>
            <button type="button" className="admin-confirm-logout" onClick={confirmLogout}>Log out</button>
          </div>
        </section>
      </div>}
    </main>
  );
}
