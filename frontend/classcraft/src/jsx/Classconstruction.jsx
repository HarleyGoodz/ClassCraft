/*
 * Classconstruction.jsx: the Class Construction lesson (/learn-basics/class-construction).
 * Purpose: teaches what belongs in each compartment of a class box.
 * What it does: learners drag pieces into a Student class box, then check their answers and
 * get a hint for each misplaced piece.
 */
import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";
import "../css/LearnBasics_css.css";
import "../css/ClassConstruction_css.css";
import "../css/lesson_path_header.css";
import TopicPager from "../components/TopicPager";

const ZONES = ["name", "attributes", "methods"];

const ZONE_LABELS = {
  name: "Class Name",
  attributes: "Attributes",
  methods: "Methods",
};

/*
  Each piece has:
  - zone: the compartment it belongs to (null = does not belong to Student)
  - why:  an explanation for each WRONG compartment it could be dropped into.
          These are shown only after "Check answers", and only for the pieces
          the learner misplaced. The correct answer is never revealed.

  Attributes = information about a student (id number, full name, year level).
  Methods    = things a student does or that work with the student's data
               (get id number, promote year level, update name, submit assignment).
*/

// Explanations for an attribute (e.g. "- fullName: String") placed in the wrong compartment
const attributeWhy = () => ({
  name: "A class name is just one simple noun with no sign, but this one has a \"-\" sign like an attribute.",
  methods: "Methods have a \"+\" sign, but this one has a \"-\" sign, so it is an attribute, which is used to store data.",
});

// Explanations for a method (e.g. "+ submitAssignment(): void") placed in the wrong compartment
const methodWhy = () => ({
  name: "A class name is just one simple noun with no sign, but this one has a \"+\" sign like a method.",
  attributes: "Attributes have a \"-\" sign, but this one has a \"+\" sign, so it is a method, which is an action word that works with the data stored in attributes.",
});

// Order here is the (mixed) order shown in the bank.
const PIECES = [
  { id: "m2", text: "+ submitAssignment(): void", zone: "methods", why: methodWhy() },
  { id: "a1", text: "- idNumber: int", zone: "attributes", why: attributeWhy() },
  { id: "m1", text: "+ getIdNumber(): int", zone: "methods", why: methodWhy() },
  { id: "m4", text: "+ promoteYearLevel(): void", zone: "methods", why: methodWhy() },
  {
    id: "n1",
    text: "Student",
    zone: "name",
    why: {
      attributes: "Attributes have a \"-\" sign, but this is the name of the class, which has no sign.",
      methods: "Methods have a \"+\" sign, but this is the name of the class, which has no sign.",
    },
  },
  { id: "a3", text: "- yearLevel: int", zone: "attributes", why: attributeWhy() },
  { id: "a2", text: "- fullName: String", zone: "attributes", why: attributeWhy() },
  { id: "m3", text: "+ updateName(newName: String): void", zone: "methods", why: methodWhy() },
];

const emptyLocations = () =>
  Object.fromEntries(PIECES.map((p) => [p.id, "bank"]));

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", end: true },
  { to: "/learn-basics", label: "Learn the Basics" },
  { to: "/skill-development", label: "Skill Development" },
  { to: "/class-diagram-construction", label: "Class Diagram Construction" },
];

function TopNav({ username, onLogout }) {
  const initial = (username || "U").trim().charAt(0).toUpperCase();
  return (
    <header className="topnav">
      <div className="topnav-inner">
        <Link to="/dashboard" className="topnav-brand">ClassCraft</Link>

        <nav className="topnav-links" aria-label="Main">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? "topnav-link active" : "topnav-link")}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="topnav-user">
          <span className="topnav-avatar" aria-hidden="true">{initial}</span>
          <span className="topnav-username">{username}</span>
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

export default function ClassConstruction() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("User");
  const [locations, setLocations] = useState(emptyLocations); // id -> "bank" | zone
  const [selected, setSelected] = useState(null); // click-to-place fallback
  const [dragOver, setDragOver] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession();
      setUsername(session?.user?.user_metadata?.username || "User");
    }
    loadUser();
  }, []);

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout failed:", error.message);
      return;
    }
    navigate("/", { replace: true });
  }

  const pieceById = (id) => PIECES.find((p) => p.id === id);
  const inLocation = (loc) => PIECES.filter((p) => locations[p.id] === loc);

  const placedCount = PIECES.filter((p) => locations[p.id] !== "bank").length;

  // ----- Moving pieces -----
  function movePiece(id, target) {
    if (checked || !pieceById(id)) return;
    setLocations((prev) => ({ ...prev, [id]: target }));
    setSelected(null);
  }

  function handleDragStart(e, piece) {
    if (checked) return;
    e.dataTransfer.setData("text/plain", piece.id);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDrop(e, target) {
    e.preventDefault();
    setDragOver(null);
    movePiece(e.dataTransfer.getData("text/plain"), target);
  }

  function handleTargetClick(target) {
    if (selected) movePiece(selected, target);
  }

  function toggleSelect(id) {
    if (checked) return;
    setSelected(selected === id ? null : id);
  }

  // ----- Checking -----
  // "correct" | "wrong" (placed in the wrong compartment) | "missing" (should be placed but was not)
  function status(piece) {
    const loc = locations[piece.id];
    if (piece.zone === null) return loc === "bank" ? "correct" : "wrong";
    if (loc === "bank") return "missing";
    return loc === piece.zone ? "correct" : "wrong";
  }

  // Explains why a piece the learner dragged into a compartment is wrong.
  // Pieces still in the bank never get a hint.
  function feedbackFor(piece) {
    if (status(piece) !== "wrong") return null;
    return piece.why[locations[piece.id]];
  }

  const allCorrect = checked && PIECES.every((p) => status(p) === "correct");
  const hasWrongPlacement =
    checked && PIECES.some((p) => status(p) === "wrong");
  const hasUnplaced =
    checked && PIECES.some((p) => status(p) === "missing");

  function checkAnswers() {
    setChecked(true);
    setSelected(null);
  }

  function tryAgain() {
    setChecked(false);
  }

  function reset() {
    setLocations(emptyLocations());
    setChecked(false);
    setSelected(null);
  }

  // ----- Rendering helpers -----
  function renderPiece(piece, extraClass = "") {
    const s = checked ? status(piece) : null;
    const isWrong = s === "wrong";
    const classes = [
      "cc-piece",
      extraClass,
      selected === piece.id ? "selected" : "",
      isWrong ? "cc-wrong" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div key={piece.id} className="cc-piece-wrap">
        <div
          className={classes}
          draggable={!checked}
          onDragStart={(e) => handleDragStart(e, piece)}
          onDragEnd={() => setDragOver(null)}
          onClick={(e) => {
            e.stopPropagation();
            toggleSelect(piece.id);
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggleSelect(piece.id);
            }
          }}
        >
          {isWrong && <span className="cc-mark" aria-label="incorrect">✗ </span>}
          {piece.text}
        </div>
        {isWrong && (
          <div className="cc-inline-hint" role="status">
            {feedbackFor(piece)}
          </div>
        )}
      </div>
    );
  }

  function dropProps(target) {
    return {
      onDragOver: (e) => {
        if (checked) return;
        e.preventDefault();
        setDragOver(target);
      },
      onDragLeave: () => setDragOver(null),
      onDrop: (e) => handleDrop(e, target),
      onClick: () => handleTargetClick(target),
    };
  }

  function renderZone(zone) {
    const items = inLocation(zone);
    const classes = [
      "cc-zone",
      dragOver === zone ? "cc-zone-over" : "",
      zone === "name" ? "cc-zone-name" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div
        key={zone}
        className={classes}
        aria-label={`${ZONE_LABELS[zone]} compartment`}
        {...dropProps(zone)}
      >
        <span className="cc-zone-label">{ZONE_LABELS[zone]}</span>
        {items.length === 0 ? (
          <span className="cc-zone-empty">Drop here</span>
        ) : (
          items.map((p) => renderPiece(p, "cc-in-zone"))
        )}
      </div>
    );
  }

  return (
    <div className="app-shell">
      {/* ===== Top navigation ===== */}
      <TopNav username={username} onLogout={handleLogout} />

      {/* ===== Main content ===== */}
      <main className="learn-basics cc-page">
        <p className="lesson-breadcrumb">
          <NavLink to="/learn-basics">Learn the Basics</NavLink>
          <span className="lesson-breadcrumb-separator" aria-hidden="true">
            ›
          </span>
          <span className="lesson-breadcrumb-current" aria-current="page">
            Class Construction
          </span>
        </p>
        <header className="learn-basics-header">
          <h1>Class Construction</h1>
          <p>
            Build the <strong>Student</strong> class. Drag each piece into the compartment where
            it belongs. When you are ready, press <strong>Check answers</strong>.
          </p>
        </header>

        <div className="cc-workspace">
          {/* Class box the learner builds */}
          <section className="cc-canvas" aria-label="Your class diagram">
            <div className="cc-class-box">{ZONES.map(renderZone)}</div>
          </section>

          {/* Bank + actions + results */}
          <section className="cc-side">
            <h2>Pieces</h2>
            <div
              className={dragOver === "bank" ? "cc-palette cc-bank cc-bank-over" : "cc-palette cc-bank"}
              {...dropProps("bank")}
            >
              {inLocation("bank").length === 0 ? (
                <p className="cc-muted">All pieces have been placed.</p>
              ) : (
                inLocation("bank").map((p) => renderPiece(p))
              )}
            </div>
            <p className="cc-muted">
              Tip: you can also click a piece, then click a compartment. Drag a piece back to the
              bank to take it out.
            </p>

            <div className="cc-actions">
              {!checked ? (
                <>
                  <button
                    type="button"
                    className="submit-button"
                    onClick={checkAnswers}
                    disabled={placedCount === 0}
                  >
                    Check answers
                  </button>
                  <button type="button" className="back-button" onClick={reset}>
                    Reset
                  </button>
                </>
              ) : (
                <>
                  {!allCorrect && (
                    <button type="button" className="submit-button" onClick={tryAgain}>
                      Try again
                    </button>
                  )}
                  <button type="button" className="back-button" onClick={reset}>
                    Start over
                  </button>
                </>
              )}
            </div>

            {checked && (
              <div className="cc-results" role="status">
                {allCorrect ? (
                  <div className="cc-feedback ok">
                    Great job! Every piece is in the right place.
                  </div>
                ) : hasWrongPlacement ? (
                  <div className="cc-feedback hint">
                    Some of the pieces you placed are not quite right. See the notes under them in
                    your class box.
                  </div>
                ) : hasUnplaced ? (
                  <div className="cc-feedback ok">
                    Nothing you placed so far is wrong. Keep building the class, then check again.
                  </div>
                ) : null}
              </div>
            )}
          </section>
        </div>

        <TopicPager current="class-construction" />
      </main>
    </div>
  );
}