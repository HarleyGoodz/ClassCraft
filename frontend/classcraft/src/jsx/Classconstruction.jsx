import { useState } from "react";
import { NavLink } from "react-router-dom";
import "../css/LearnBasics_css.css";
import "../css/ClassConstruction_css.css";
import "../css/lesson_breadcrumb.css";

/*
  Class Construction – drag and drop, check at the end.
  1. The learner drags every piece from the bank into a compartment (or leaves
     it in the bank if they think it does not belong to the class).
  2. Nothing is revealed while they work.
  3. Pressing "Check answers" marks each piece and reveals the correct class box.
  No scoring or progress tracking yet.
*/

const ZONES = ["name", "attributes", "methods"];

const ZONE_LABELS = {
  name: "Class Name",
  attributes: "Attributes",
  methods: "Methods",
};

const ZONE_HINTS = {
  name: "The class name is a singular noun in PascalCase.",
  attributes:
    "Attributes are the data an object stores: visibility name: type (usually private, -).",
  methods:
    "Methods are the behaviors an object performs: visibility name(parameters): return type (usually public, +).",
};

// zone = the compartment the piece belongs to (null = does not belong to Student)
// Order here is the (mixed) order shown in the bank.
const PIECES = [
  { id: "m2", text: "+ getGpa(): double", zone: "methods" },
  { id: "a1", text: "- studentId: int", zone: "attributes" },
  { id: "x1", text: "Students", zone: null, note: "A class name should be singular, not plural." },
  { id: "m1", text: "+ enroll(course: Course): void", zone: "methods" },
  { id: "n1", text: "Student", zone: "name" },
  { id: "a3", text: "- gpa: double", zone: "attributes" },
  { id: "x2", text: "- courseCode: String", zone: null, note: "This data describes a Course, not a Student." },
  { id: "a2", text: "- fullName: String", zone: "attributes" },
  { id: "m3", text: "+ updateName(newName: String): void", zone: "methods" },
  { id: "x3", text: "+ calculateTax(): double", zone: null, note: "Tax calculation is not a behavior of a Student." },
];

const VISIBILITY = [
  { symbol: "+", meaning: "public" },
  { symbol: "-", meaning: "private" },
  { symbol: "#", meaning: "protected" },
];

const emptyLocations = () =>
  Object.fromEntries(PIECES.map((p) => [p.id, "bank"]));

export default function ClassConstruction() {
  const [locations, setLocations] = useState(emptyLocations); // id -> "bank" | zone
  const [selected, setSelected] = useState(null); // click-to-place fallback
  const [dragOver, setDragOver] = useState(null);
  const [checked, setChecked] = useState(false);

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
  function status(piece) {
    const loc = locations[piece.id];
    if (piece.zone === null) return loc === "bank" ? "correct" : "wrong";
    if (loc === "bank") return "missing";
    return loc === piece.zone ? "correct" : "wrong";
  }

  function feedbackFor(piece) {
    const s = status(piece);
    if (s === "correct") return null;
    if (piece.zone === null) return piece.note;
    if (s === "missing")
      return `"${piece.text}" was left out. It belongs in the ${ZONE_LABELS[piece.zone]} compartment. ${ZONE_HINTS[piece.zone]}`;
    return `"${piece.text}" belongs in the ${ZONE_LABELS[piece.zone]} compartment, not ${ZONE_LABELS[locations[piece.id]]}. ${ZONE_HINTS[piece.zone]}`;
  }

  const allCorrect = checked && PIECES.every((p) => status(p) === "correct");
  const problems = checked ? PIECES.filter((p) => status(p) !== "correct") : [];

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
    const classes = [
      "cc-piece",
      extraClass,
      selected === piece.id ? "selected" : "",
      s ? `cc-${s}` : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div
        key={piece.id}
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
        {s === "correct" && locations[piece.id] !== "bank" && (
          <span className="cc-mark" aria-label="correct">✓ </span>
        )}
        {s === "wrong" && <span className="cc-mark" aria-label="incorrect">✗ </span>}
        {piece.text}
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

  function renderSolution() {
    return (
      <div className="cc-class-box cc-solution-box">
        {ZONES.map((zone) => (
          <div
            key={zone}
            className={zone === "name" ? "cc-zone cc-zone-name" : "cc-zone"}
          >
            <span className="cc-zone-label">{ZONE_LABELS[zone]}</span>
            {PIECES.filter((p) => p.zone === zone).map((p) => (
              <div
                key={p.id}
                className={zone === "name" ? "cc-placed cc-placed-name" : "cc-placed"}
              >
                {p.text}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* ===== Sidebar ===== */}
      <aside className="sidebar">
        <h2 className="sidebar-brand">ClassCraft</h2>
        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}
            end
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/learn-basics"
            className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}
          >
            Learn the Basics
          </NavLink>
          <NavLink
            to="/skill-development"
            className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}
          >
            Skill Development
          </NavLink>
          <NavLink
            to="/class-diagram-construction"
            className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}
          >
            Class Diagram Construction
          </NavLink>
          <NavLink
            to="/my-progress"
            className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}
          >
            My Progress
          </NavLink>
        </nav>
      </aside>

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
            it belongs. Leave a piece in the bank if it does not belong to a Student. When you are
            ready, press <strong>Check answers</strong>.
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
                ) : (
                  <>
                    <div className="cc-feedback hint">
                      Some pieces are not quite right. Here is why:
                    </div>
                    <ul className="cc-problem-list">
                      {problems.map((p) => (
                        <li key={p.id}>{feedbackFor(p)}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Correct formation: only revealed after checking */}
        {checked && (
          <section className="cc-solution" aria-label="Correct class diagram">
            <h2>The correct class</h2>
            <div className="cc-solution-layout">
              {renderSolution()}
              <div>
                <p>
                  A class box always has three compartments: the <strong>name</strong>, its{" "}
                  <strong>attributes</strong>, and its <strong>methods</strong>.
                </p>
                <h3>Visibility symbols</h3>
                <ul className="cc-legend">
                  {VISIBILITY.map((v) => (
                    <li key={v.symbol}>
                      <code>{v.symbol}</code> {v.meaning}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

      </main>
    </div>
  );
}