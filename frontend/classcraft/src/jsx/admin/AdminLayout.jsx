/*
 * AdminLayout.jsx: the frame shared by every admin page.
 * Loads the admin overview once, shows the top navigation and the log-out dialog, and hands
 * the learner accounts to the page that is open (Dashboard, Accounts, Activities, Trends).
 */
import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "../../utils/supabase";
import "../../css/dashboard_css.css";
import "../../css/admin_dashboard.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/accounts", label: "Accounts" },
  { to: "/admin/activities", label: "Learning Activities" },
  { to: "/admin/trends", label: "Progress Trends" },
];

function AdminTopNav({ username, onLogout }) {
  const initial = (username || "A").trim().charAt(0).toUpperCase();
  return (
    <header className="topnav">
      <div className="topnav-inner">
        <Link to="/admin/dashboard" className="topnav-brand">ClassCraft</Link>
        <nav className="topnav-links" aria-label="Admin">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? "topnav-link active" : "topnav-link")}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="topnav-user">
          <span className="topnav-avatar" aria-hidden="true">{initial}</span>
          <span className="topnav-username">{username}</span>
          <span className="badge admin-badge--admin">Admin</span>
          <button type="button" className="topnav-logout" onClick={onLogout}>
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [adminName, setAdminName] = useState("Admin");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        const session = sessionData.session;
        if (!session?.access_token) {
          navigate("/", { replace: true });
          return;
        }
        if (active) setAdminName(session.user.user_metadata?.username || session.user.email || "Admin");
        const response = await fetch(`${API_BASE_URL}/api/admin/overview`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (response.status === 403) throw new Error("This account does not have administrator access.");
        if (!response.ok) throw new Error(`Could not load admin data (${response.status}).`);
        const result = await response.json();
        if (active) {
          setData(result);
          setStatus("ready");
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Could not load admin data.");
          setStatus("error");
        }
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [navigate]);

  // Admin accounts are not learners, so they are left out of every list and total.
  const learners = useMemo(
    () => (data?.accounts ?? []).filter((account) => account.role !== "admin"),
    [data]
  );

  async function confirmLogout() {
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setLogoutError(signOutError.message);
      return;
    }
    navigate("/", { replace: true });
  }

  return (
    <div className="app-shell">
      <AdminTopNav
        username={adminName}
        onLogout={() => {
          setLogoutError("");
          setShowLogoutConfirm(true);
        }}
      />

      {status === "ready" ? (
        <>
          {!data.accountDetailsAvailable && (
            <p className="admin-notice admin-notice--bar" role="status">
              Account status and creation date couldn't be read from Supabase, so they show as unknown.
            </p>
          )}
          <Outlet context={{ learners }} />
        </>
      ) : (
        <main className="my-progress admin-page">
          {status === "loading" && <p className="admin-state">Loading account data…</p>}
          {status === "error" && (
            <div className="progress-alert" role="alert">
              <div className="progress-alert-text">
                <strong className="progress-alert-title">Admin data unavailable</strong>
                <span className="progress-alert-message">{error}</span>
              </div>
            </div>
          )}
        </main>
      )}

      {showLogoutConfirm && (
        <div
          className="logout-confirm-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowLogoutConfirm(false);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") setShowLogoutConfirm(false);
          }}
        >
          <section className="logout-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="logout-confirm-title">
            <h2 id="logout-confirm-title">Log out?</h2>
            <p>Are you sure you want to log out of ClassCraft?</p>
            {logoutError && <p className="logout-confirm-error" role="alert">{logoutError}</p>}
            <div className="logout-confirm-actions">
              <button type="button" className="logout-cancel-button" onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
              <button type="button" className="logout-confirm-button" onClick={confirmLogout}>Log out</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
