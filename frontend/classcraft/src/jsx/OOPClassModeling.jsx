import { OOP_SCENARIOS as SCENARIO_BANK } from "../questionBank/oopClassModeling.jsx";
import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useLearningAttemptTracking } from "../hooks/useLearningAttemptTracking";
import { usePointerDragDrop } from "../hooks/usePointerDragDrop.jsx";
import { useSkillQuestionSet } from "../hooks/useSkillQuestionSet";
import PreviousAttemptNotice from "../components/PreviousAttemptNotice";
import ActivityLoadingSkeleton from "../components/ActivityLoadingSkeleton";
import { GuidedExperiencePrompt, NoSkillQuestions } from "../components/SkillPracticeStatus";
import "../css/oop_class_modeling.css";
import "../css/oop_class_modeling_feedback.css";


// --- TEACHING TEXT ---
const VIS_MEANING = {
  "+": "anyone can use it",
  "-": "only its own class can use it",
  "#": "its own class and its children can use it",
};

const REL_MEANING = {
  Association: "a simple link, where neither is a kind or a part of the other",
  Inheritance: "an 'is a' link, where the child is a kind of the parent",
  Aggregation: "a 'has a' link, where the parts live on without the whole",
  Composition: "a 'has a' link, where the parts disappear with the whole",
};

const MULT_MEANING = {
  "1": "exactly one",
  "0..1": "zero or one",
  "0..*": "zero or many",
  "1..*": "one or many",
};

// --- HELPERS ---
// What kind of thing is this piece? (decided by how it is written)
const kindOf = (text) => (text.includes("(") ? "method" : text.includes(":") ? "attribute" : "class");
const sectionKind = (section) =>
  section.endsWith("_name") ? "class" : section.endsWith("_attr") ? "attribute" : "method";
const sectionSide = (section) => (section.startsWith("parent") ? "parent" : "child");
const displayName = (piece) => {
  const kind = kindOf(piece.text);
  if (kind === "class") return piece.text.replace(/«abstract»\n?/, "");
  if (kind === "attribute") return piece.text.split(":")[0];
  return piece.text.split("(")[0] + "()";
};
// The section a real (non-distractor) piece belongs in
const expectedSection = (piece) => {
  if (piece.type === "parent") return "parent_name";
  if (piece.type === "child") return "child_name";
  if (piece.type === "distractor") return null;
  return piece.type;
};

export default function OOPClassModeling() {
  const location = useLocation();
  const {
    questions,
    loading: questionsLoading,
    error: questionsError,
  } = useSkillQuestionSet(
    "oop-class-modeling",
    SCENARIO_BANK,
    location.state?.skillQuestions
  );

  if (questionsLoading) return <ActivityLoadingSkeleton />;
  if (questionsError) return <main className="dashboard" role="alert">{questionsError}</main>;
  if (questions.length === 0) return <NoSkillQuestions />;

  return (
    <OOPClassModelingActivity
      scenarios={questions}
      initialAttempts={location.state?.learningAttempts}
    />
  );
}

function OOPClassModelingActivity({ scenarios: OOP_SCENARIOS, initialAttempts }) {
  const navigate = useNavigate();
  const { startDrag, previewElement } = usePointerDragDrop();
  const { attempts, priorAttempts, recordAttempt, trackingError } =
    useLearningAttemptTracking(initialAttempts);

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentScenario = OOP_SCENARIOS[currentIndex];

  // Class States
  const [parentName, setParentName] = useState(null);
  const [parentAttrs, setParentAttrs] = useState([]);
  const [parentMethods, setParentMethods] = useState([]);

  const [childName, setChildName] = useState(null);
  const [childAttrs, setChildAttrs] = useState([]);
  const [childMethods, setChildMethods] = useState([]);

  // Relationship States
  const [droppedRelationship, setDroppedRelationship] = useState(null);
  const [droppedMultiplicity, setDroppedMultiplicity] = useState(null);
  const [selectedTool, setSelectedTool] = useState(null);

  const [availablePieces, setAvailablePieces] = useState(() =>
    [...currentScenario.pieces].sort(() => Math.random() - 0.5)
  );

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [feedback, setFeedback] = useState({ message: "", type: "" });

  const placePiece = (piece, targetSection) => {
    const removeFromBank = (id) => {
      setAvailablePieces((prev) => prev.filter((p) => p.id !== id));
    };

    // --- NO RESTRICTIONS: Anything can go anywhere ---
    if (targetSection === "parent_name") {
      if (parentName) setAvailablePieces((prev) => [...prev, parentName]); // Return old piece
      setParentName(piece);
      removeFromBank(piece.id);
    } else if (targetSection === "child_name") {
      if (childName) setAvailablePieces((prev) => [...prev, childName]);
      setChildName(piece);
      removeFromBank(piece.id);
    } else if (targetSection === "parent_attr") {
      setParentAttrs([...parentAttrs, { ...piece, currentVis: "+" }]);
      removeFromBank(piece.id);
    } else if (targetSection === "child_attr") {
      setChildAttrs([...childAttrs, { ...piece, currentVis: "+" }]);
      removeFromBank(piece.id);
    } else if (targetSection === "parent_method") {
      setParentMethods([...parentMethods, { ...piece, currentVis: "+" }]);
      removeFromBank(piece.id);
    } else if (targetSection === "child_method") {
      setChildMethods([...childMethods, { ...piece, currentVis: "+" }]);
      removeFromBank(piece.id);
    }

    setFeedback({ message: "", type: "" });
    setIsSubmitted(false);
    setSelectedTool(null);
  };

  const placeSelectedPiece = (targetSection) => {
    if (selectedTool?.type === "piece") {
      placePiece(selectedTool.value, targetSection);
    }
  };

  const placeSelectedTool = (type) => {
    if (selectedTool?.type !== type) return;
    if (type === "relationship") setDroppedRelationship(selectedTool.value);
    if (type === "multiplicity") setDroppedMultiplicity(selectedTool.value);
    setSelectedTool(null);
    setIsSubmitted(false);
  };

  // --- Relationship Drag Logic ---
  const handlePointerDrop = (payload, target) => {
    if (payload.type === "piece") {
      if (currentScenario.pieces.some((piece) => piece.id === payload.value.id)) {
        placePiece(payload.value, target);
      }
    } else if (payload.type === "relationship" && target === "relationship") {
      setDroppedRelationship(payload.value);
      setSelectedTool(null);
      setIsSubmitted(false);
    } else if (payload.type === "multiplicity" && target === "multiplicity") {
      setDroppedMultiplicity(payload.value);
      setSelectedTool(null);
      setIsSubmitted(false);
    }
  };

  const removePiece = (piece, section) => {
    if (section === "parent_name") setParentName(null);
    if (section === "child_name") setChildName(null);
    if (section === "parent_attr") setParentAttrs(parentAttrs.filter((a) => a.id !== piece.id));
    if (section === "child_attr") setChildAttrs(childAttrs.filter((a) => a.id !== piece.id));
    if (section === "parent_method") setParentMethods(parentMethods.filter((m) => m.id !== piece.id));
    if (section === "child_method") setChildMethods(childMethods.filter((m) => m.id !== piece.id));
    setAvailablePieces((prev) => [...prev, piece]);
    setIsSubmitted(false);
  };

  const toggleVisibility = (item, section) => {
    const visOrder = ["+", "-", "#"];
    const nextVis = visOrder[(visOrder.indexOf(item.currentVis) + 1) % visOrder.length];

    if (section === "parent_attr") setParentAttrs((prev) => prev.map((a) => (a.id === item.id ? { ...a, currentVis: nextVis } : a)));
    if (section === "child_attr") setChildAttrs((prev) => prev.map((a) => (a.id === item.id ? { ...a, currentVis: nextVis } : a)));
    if (section === "parent_method") setParentMethods((prev) => prev.map((m) => (m.id === item.id ? { ...m, currentVis: nextVis } : m)));
    if (section === "child_method") setChildMethods((prev) => prev.map((m) => (m.id === item.id ? { ...m, currentVis: nextVis } : m)));
    setIsSubmitted(false);
  };

  // --- Teaching feedback (only for boxes the learner actually used) ---

  // Piece is the wrong kind of thing for the box it was dropped in
  const mismatchMessage = (piece, section) => {
    const pk = kindOf(piece.text);
    const sk = sectionKind(section);
    const name = displayName(piece);

    if (pk === "class" && sk === "attribute")
      return `"${name}" is a class name, not an attribute. Attributes store values, like "age: int", and usually use "-".`;
    if (pk === "class" && sk === "method")
      return `"${name}" is a class name, not a method. Methods are actions with "()", like "start()", and usually use "+".`;
    if (pk === "attribute" && sk === "class")
      return `The top box is only for the class name. "${name}" is an attribute: it stores a value and usually uses "-".`;
    if (pk === "attribute" && sk === "method")
      return `"${name}" is an attribute, not a method. Attributes store values. Methods are actions with "()".`;
    if (pk === "method" && sk === "class")
      return `The top box is only for the class name. "${name}" is a method: an action with "()" that usually uses "+".`;
    return `"${name}" is a method, not an attribute. It has "()", so it is an action.`;
  };

  // Returns { ok, message } for a piece the learner placed in a box
  const getItemFeedback = (piece, section) => {
    const name = displayName(piece);
    const kind = kindOf(piece.text);

    // Not part of the scenario at all
    if (piece.type === "distractor") {
      if (kind === "class")
        return {
          ok: false,
          message: `"${name}" is not in this scenario. Only ${currentScenario.targetParent} and ${currentScenario.targetChild} are.`,
        };
      return {
        ok: false,
        message: `"${name}" is not mentioned in the scenario.`,
      };
    }

    // Wrong kind of box (e.g. class name in Attributes)
    if (kind !== sectionKind(section)) {
      return { ok: false, message: mismatchMessage(piece, section) };
    }

    // Right kind of box, but wrong class
    if (section !== expectedSection(piece)) {
      if (kind === "class") {
        return {
          ok: false,
          message: `"${name}" is in the wrong class box. Which class is the main one?`,
        };
      }
      return {
        ok: false,
        message: `"${name}" does not belong to this class. Which class does it describe?`,
      };
    }

    // Right box. Classes have no sign to check.
    if (kind === "class") {
      return { ok: true, message: `Correct! "${name}" is the ${sectionSide(section)} class.` };
    }

    // Right box, check the visibility sign
    if (piece.currentVis !== piece.correctVis) {
      return {
        ok: false,
        message: `Right box, but the sign is wrong. "${piece.currentVis}" means ${VIS_MEANING[piece.currentVis]}. Re-read who can use "${name}".`,
      };
    }

    return {
      ok: true,
      message: `Correct! "${name}" is ${kind === "attribute" ? "an attribute" : "a method"}, and "${piece.currentVis}" fits.`,
    };
  };

  const getRelationshipFeedback = () => {
    if (!droppedRelationship) return null;
    if (droppedRelationship === currentScenario.correctRelationship) {
      return {
        ok: true,
        message: `Correct! ${droppedRelationship} is ${REL_MEANING[droppedRelationship]}.`,
      };
    }
    return {
      ok: false,
      message: `${droppedRelationship} is ${REL_MEANING[droppedRelationship]}. Re-read how the two classes connect.`,
    };
  };

  const getMultiplicityFeedback = () => {
    if (!droppedMultiplicity) return null;
    if (droppedMultiplicity === currentScenario.correctMultiplicity) {
      return {
        ok: true,
        message: `Correct! ${droppedMultiplicity} means ${MULT_MEANING[droppedMultiplicity]}.`,
      };
    }
    return {
      ok: false,
      message: `${droppedMultiplicity} means ${MULT_MEANING[droppedMultiplicity]}. Re-read how many connect.`,
    };
  };

  // Everything the learner has placed in the diagram
  const placedItems = () => [
    ...(parentName ? [{ piece: parentName, section: "parent_name" }] : []),
    ...(childName ? [{ piece: childName, section: "child_name" }] : []),
    ...parentAttrs.map((piece) => ({ piece, section: "parent_attr" })),
    ...childAttrs.map((piece) => ({ piece, section: "child_attr" })),
    ...parentMethods.map((piece) => ({ piece, section: "parent_method" })),
    ...childMethods.map((piece) => ({ piece, section: "child_method" })),
  ];

  // --- Evaluation ---
  const evaluateAnswer = () => {
    const hasWrongItem = placedItems().some(({ piece, section }) => !getItemFeedback(piece, section).ok);
    const relFb = getRelationshipFeedback();
    const multFb = getMultiplicityFeedback();
    const hasWrong = hasWrongItem || (relFb && !relFb.ok) || (multFb && !multFb.ok);

    const hasAll = (items, type) =>
      currentScenario.pieces
        .filter((p) => p.type === type)
        .every((req) => items.some((i) => i.text === req.text));

    const isComplete =
      parentName && childName && droppedRelationship && droppedMultiplicity &&
      hasAll(parentAttrs, "parent_attr") &&
      hasAll(childAttrs, "child_attr") &&
      hasAll(parentMethods, "parent_method") &&
      hasAll(childMethods, "child_method");

    const isCorrect = !hasWrong && !!isComplete;
    const requiredPieces = currentScenario.pieces.filter((piece) => piece.type !== "distractor");
    const correctPieces = requiredPieces.filter((required) =>
      placedItems().some(
        ({ piece, section }) => piece.id === required.id && getItemFeedback(piece, section).ok
      )
    ).length;
    const correctElements =
      correctPieces + Number(!!relFb?.ok) + Number(!!multFb?.ok);

    if (isCorrect) {
      setFeedback({ message: "Excellent! Your model is correct.", type: "success" });
    } else if (hasWrong) {
      setFeedback({ message: "Check the red boxes to see what to fix.", type: "error" });
    } else {
      setFeedback({
        message: "Everything placed so far is correct. Keep building, then check again.",
        type: "info",
      });
    }
    return {
      isCorrect,
      correctElements,
      requiredElements: requiredPieces.length + 2,
    };
  };

  const handleCheckAnswer = async () => {
    if (placedItems().length === 0 && !droppedRelationship && !droppedMultiplicity) return;
    const result = evaluateAnswer();
    setIsSubmitted(true);
    await recordAttempt({
      activityKey: "oop-class-modeling",
      scenarioKey: currentScenario.id,
      correctElements: result.correctElements,
      requiredElements: result.requiredElements,
      completed: result.isCorrect,
      submittedResponse: {
        parentName: parentName?.text ?? null,
        parentAttributes: parentAttrs.map(({ text, currentVis }) => ({ text, visibility: currentVis })),
        parentMethods: parentMethods.map(({ text, currentVis }) => ({ text, visibility: currentVis })),
        childName: childName?.text ?? null,
        childAttributes: childAttrs.map(({ text, currentVis }) => ({ text, visibility: currentVis })),
        childMethods: childMethods.map(({ text, currentVis }) => ({ text, visibility: currentVis })),
        relationship: droppedRelationship,
        multiplicity: droppedMultiplicity,
      },
    });
  };

  // Clears the board and loads the pieces of the given scenario.
  // The scenario is passed in on purpose: right after setCurrentIndex, the
  // `currentScenario` variable still holds the OLD scenario for this render.
  const resetBoard = (scenario) => {
    setParentName(null); setChildName(null);
    setParentAttrs([]); setChildAttrs([]);
    setParentMethods([]); setChildMethods([]);
    setDroppedRelationship(null); setDroppedMultiplicity(null);
    setSelectedTool(null);
    setAvailablePieces([...scenario.pieces].sort(() => Math.random() - 0.5));
    setFeedback({ message: "", type: "" });
    setIsSubmitted(false);
  };

  const handleReset = () => resetBoard(currentScenario);

  const goToScenario = (index) => {
    setCurrentIndex(index);
    resetBoard(OOP_SCENARIOS[index]);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) goToScenario(currentIndex - 1);
  };

  const handleNext = async () => {
    if (!isSubmitted && (placedItems().length > 0 || droppedRelationship || droppedMultiplicity)) {
      await handleCheckAnswer();
    }
    if (currentIndex < OOP_SCENARIOS.length - 1) goToScenario(currentIndex + 1);
    else navigate("/skill-development");
  };

  // --- Rendering helpers ---
  const stateClass = (fb) => (fb ? (fb.ok ? "oop-item-correct" : "oop-item-wrong") : "");

  const renderFeedback = (fb) =>
    fb && (
      <div className="oop-item-feedback" role="status">
        <strong>{fb.ok ? "✓ " : "✗ "}</strong>
        {fb.message}
      </div>
    );

  const renderNameSlot = (piece, section, placeholder) => {
    if (!piece) return <span className="oop-drop-placeholder">{placeholder}</span>;
    const fb = isSubmitted ? getItemFeedback(piece, section) : null;
    return (
      <div className={`oop-name-wrap ${stateClass(fb)}`}>
        <div onClick={(event) => { event.stopPropagation(); removePiece(piece, section); }} className="oop-class-name" style={{ whiteSpace: "pre-line" }}>
          {piece.text}
        </div>
        {renderFeedback(fb)}
      </div>
    );
  };

  const renderItems = (items, section) =>
    items.map((item) => {
      const fb = isSubmitted ? getItemFeedback(item, section) : null;
      return (
        <div key={item.id} className={`oop-item-wrap ${stateClass(fb)}`}>
          <div className="oop-item-row">
            <span className="oop-visibility-badge" onClick={(event) => { event.stopPropagation(); toggleVisibility(item, section); }}>{item.currentVis}</span>
            <span className="oop-item-text" onClick={(event) => { event.stopPropagation(); removePiece(item, section); }}>{item.text}</span>
          </div>
          {renderFeedback(fb)}
        </div>
      );
    });

  const relFeedback = isSubmitted ? getRelationshipFeedback() : null;
  const multFeedback = isSubmitted ? getMultiplicityFeedback() : null;

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <h2 className="sidebar-brand">ClassCraft</h2>
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")} end>Dashboard</NavLink>
          <NavLink to="/learn-basics" className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}>Learn the Basics</NavLink>
          <NavLink to="/skill-development" className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}>Skill Development</NavLink>
          <NavLink to="/class-diagram-construction" className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}>Class Diagram Construction</NavLink>
        </nav>
      </aside>

      <main className="oop-modeling-page">
        <div className="cdf-top-header">
          <div className="cdf-breadcrumb">
            <span onClick={() => navigate("/skill-development")} className="cdf-breadcrumb-link">Skill Development</span>
            <span className="cdf-breadcrumb-separator">&rsaquo;</span>
            <span className="cdf-breadcrumb-current">OOP-Based Class Modeling</span>
          </div>
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <div className="cdf-scenario-counter">Scenario {currentIndex + 1} of {OOP_SCENARIOS.length}</div>
          </div>
        </div>

        <h1 className="cdf-title">{currentScenario.title}</h1>
        {trackingError && <p role="alert" style={{ color: "#b91c1c" }}>{trackingError}</p>}
        <p className="cdf-description">
          <strong>Scenario:</strong> {currentScenario.scenario} <br />
          Drag pieces to the classes. Connect them with a relationship. <strong>Click visibility symbols to change them.</strong>
        </p>
        <PreviousAttemptNotice
          attempts={priorAttempts}
          activityKey="oop-class-modeling"
          scenarioKey={currentScenario.id}
        />
        <GuidedExperiencePrompt
          attempts={attempts}
          activityKey="oop-class-modeling"
          scenarioKey={currentScenario.id}
        />

        <div className="oop-workspace">

          {/* LEFT SIDE: The UML Diagram Area */}
          <div className="oop-diagram-area">

            {/* PARENT CLASS */}
            <div className="oop-class-box">
              <div data-drop-target="parent_name" onClick={() => placeSelectedPiece("parent_name")} className={`oop-class-header${selectedTool?.type === "piece" ? " oop-drop-ready" : ""}`}>
                {renderNameSlot(parentName, "parent_name", "Drop Parent")}
              </div>
              <div data-drop-target="parent_attr" onClick={() => placeSelectedPiece("parent_attr")} className={`oop-uml-section${selectedTool?.type === "piece" ? " oop-drop-ready" : ""}`}>
                <span className="oop-section-label">Attributes</span>
                {renderItems(parentAttrs, "parent_attr")}
              </div>
              <div data-drop-target="parent_method" onClick={() => placeSelectedPiece("parent_method")} className={`oop-uml-section${selectedTool?.type === "piece" ? " oop-drop-ready" : ""}`} style={{ borderBottom: "none" }}>
                <span className="oop-section-label">Methods</span>
                {renderItems(parentMethods, "parent_method")}
              </div>
            </div>

            {/* RELATIONSHIP GAP (Middle Column) */}
            <div className="oop-relationship-gap">
              <div className="oop-line"></div>

              <div
                className={`rel-dropzone ${droppedRelationship ? "filled" : ""} ${selectedTool?.type === "relationship" ? "oop-drop-ready" : ""} ${relFeedback ? (relFeedback.ok ? "correct" : "wrong") : ""}`}
                data-drop-target="relationship"
                onClick={() => selectedTool?.type === "relationship"
                  ? placeSelectedTool("relationship")
                  : (setDroppedRelationship(null), setIsSubmitted(false))}
              >
                {droppedRelationship ? droppedRelationship : "Drop Line"}
              </div>

              <div
                className={`mult-dropzone ${droppedMultiplicity ? "filled" : ""} ${selectedTool?.type === "multiplicity" ? "oop-drop-ready" : ""} ${multFeedback ? (multFeedback.ok ? "correct" : "wrong") : ""}`}
                data-drop-target="multiplicity"
                onClick={() => selectedTool?.type === "multiplicity"
                  ? placeSelectedTool("multiplicity")
                  : (setDroppedMultiplicity(null), setIsSubmitted(false))}
              >
                {droppedMultiplicity || "Mult"}
              </div>

              {(relFeedback || multFeedback) && (
                <div className="oop-rel-feedback">
                  {relFeedback && (
                    <div className={`oop-mini-feedback ${relFeedback.ok ? "correct" : "wrong"}`} role="status">
                      <strong>{relFeedback.ok ? "✓ Line: " : "✗ Line: "}</strong>{relFeedback.message}
                    </div>
                  )}
                  {multFeedback && (
                    <div className={`oop-mini-feedback ${multFeedback.ok ? "correct" : "wrong"}`} role="status">
                      <strong>{multFeedback.ok ? "✓ Multiplicity: " : "✗ Multiplicity: "}</strong>{multFeedback.message}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* CHILD CLASS */}
            <div className="oop-class-box">
              <div data-drop-target="child_name" onClick={() => placeSelectedPiece("child_name")} className={`oop-class-header${selectedTool?.type === "piece" ? " oop-drop-ready" : ""}`} style={{ background: "#f8fafc" }}>
                {renderNameSlot(childName, "child_name", "Drop Child")}
              </div>
              <div data-drop-target="child_attr" onClick={() => placeSelectedPiece("child_attr")} className={`oop-uml-section${selectedTool?.type === "piece" ? " oop-drop-ready" : ""}`}>
                <span className="oop-section-label">Attributes</span>
                {renderItems(childAttrs, "child_attr")}
              </div>
              <div data-drop-target="child_method" onClick={() => placeSelectedPiece("child_method")} className={`oop-uml-section${selectedTool?.type === "piece" ? " oop-drop-ready" : ""}`} style={{ borderBottom: "none" }}>
                <span className="oop-section-label">Methods</span>
                {renderItems(childMethods, "child_method")}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: The Tool Banks */}
          <div className="oop-bank-container">
            <h3 className="oop-bank-title">Pieces</h3>
            <div className="oop-bank-box">
              {availablePieces.map((piece) => (
                <div key={piece.id} onPointerDown={(e) => startDrag(e, { type: "piece", value: piece }, piece.text, handlePointerDrop)} onClick={() => setSelectedTool({ type: "piece", value: piece })} className={`oop-piece${selectedTool?.type === "piece" && selectedTool.value.id === piece.id ? " oop-piece-selected" : ""}`} style={{ whiteSpace: "pre-line" }}>
                  {piece.text}
                </div>
              ))}
            </div>

            <h3 className="oop-bank-title" style={{ marginTop: "20px" }}>Relationships</h3>
            <div className="tools-bank">
              {["Association", "Inheritance", "Aggregation", "Composition"].map((relationship) => (
                <div key={relationship} onPointerDown={(e) => startDrag(e, { type: "relationship", value: relationship }, relationship, handlePointerDrop)} onClick={() => setSelectedTool({ type: "relationship", value: relationship })} className={`tool-item${selectedTool?.type === "relationship" && selectedTool.value === relationship ? " oop-tool-selected" : ""}`}>{relationship}</div>
              ))}
            </div>

            <h3 className="oop-bank-title" style={{ marginTop: "20px" }}>Multiplicity</h3>
            <div className="tools-bank">
              {["1", "0..1", "0..*", "1..*"].map((multiplicity) => (
                <div key={multiplicity} onPointerDown={(e) => startDrag(e, { type: "multiplicity", value: multiplicity }, multiplicity, handlePointerDrop)} onClick={() => setSelectedTool({ type: "multiplicity", value: multiplicity })} className={`tool-item${selectedTool?.type === "multiplicity" && selectedTool.value === multiplicity ? " oop-tool-selected" : ""}`}>{multiplicity}</div>
              ))}
            </div>
          </div>
        </div>
        {previewElement}

        {isSubmitted && (
          <div
            className={`oop-feedback ${
              feedback.type === "error"
                ? "oop-feedback-error"
                : feedback.type === "info"
                ? "oop-feedback-info"
                : "oop-feedback-success"
            }`}
          >
            {feedback.message}
          </div>
        )}

        <div className="cdf-action-bar">
          <div className="cdf-action-left">
            <button onClick={handlePrevious} disabled={currentIndex === 0} className="cdf-btn cdf-btn-prev">← Previous</button>
            <button onClick={handleNext} className="cdf-btn cdf-btn-next">{currentIndex === OOP_SCENARIOS.length - 1 ? "Finish" : "Next →"}</button>
          </div>
          <div className="cdf-action-right">
            <button onClick={handleReset} className="cdf-btn cdf-btn-reset">Reset</button>
            {!isSubmitted && <button onClick={handleCheckAnswer} className="cdf-btn cdf-btn-check">Check Answer</button>}
          </div>
        </div>
      </main>
    </div>
  );
}