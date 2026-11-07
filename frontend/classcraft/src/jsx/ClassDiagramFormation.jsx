/*
 * ClassDiagramFormation.jsx: a Skill Development activity
 * (/skill-development/class-diagram-formation).
 * Purpose: practice building a class from a written scenario.
 * What it does: learners drag each piece into the right compartment and check their answers.
 * Shows their previous attempts.
 */
import { SCENARIOS as SCENARIO_BANK } from "../questionBank/classDiagramFormation.jsx";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";
import { useLearningAttemptTracking } from "../hooks/useLearningAttemptTracking";
import { usePointerDragDrop } from "../hooks/usePointerDragDrop.jsx";
import { useSkillQuestionSet } from "../hooks/useSkillQuestionSet";
import PreviousAttemptNotice from "../components/PreviousAttemptNotice";
import ActivityLoadingSkeleton from "../components/ActivityLoadingSkeleton";
import { GuidedExperiencePrompt, NoSkillQuestions } from "../components/SkillPracticeStatus";
import AuthFieldHint from "../components/AuthFieldHint";
import "../css/class_diagram_formation.css";

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

export default function ClassDiagramFormation() {
  const location = useLocation();
  const {
    questions,
    loading: questionsLoading,
    error: questionsError,
  } = useSkillQuestionSet(
    "class-diagram-formation",
    SCENARIO_BANK,
    location.state?.skillQuestions
  );

  if (questionsLoading) return <ActivityLoadingSkeleton />;
  if (questionsError) return <main className="dashboard" role="alert">{questionsError}</main>;
  if (questions.length === 0) return <NoSkillQuestions />;

  return (
    <ClassDiagramFormationActivity
      scenarios={questions}
      initialAttempts={location.state?.learningAttempts}
    />
  );
}

function ClassDiagramFormationActivity({ scenarios: SCENARIOS, initialAttempts }) {
  const navigate = useNavigate();
  const { startDrag, previewElement } = usePointerDragDrop();
  const { attempts, priorAttempts, recordAttempt, trackingError } =
    useLearningAttemptTracking(initialAttempts);

  const [username, setUsername] = useState("User");

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

  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const currentScenario = SCENARIOS[currentScenarioIndex];

  const [className, setClassName] = useState(null);
  const [attributes, setAttributes] = useState([]);
  const [methods, setMethods] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [availablePieces, setAvailablePieces] = useState(() =>
    [...currentScenario.pieces].sort(() => Math.random() - 0.5)
  );

  const [feedback, setFeedback] = useState({ message: "", type: "" });
  const [mentorHints, setMentorHints] = useState({});
  
  const placePiece = (piece, targetSection) => {
    if (targetSection === "class") {
      if (className) {
        setAvailablePieces((prev) => [...prev, className]);
      }
      setClassName(piece);
      setAvailablePieces((prev) => prev.filter((p) => p.id !== piece.id));
    } else if (targetSection === "attribute") {
      setAttributes((previous) => [...previous, piece]);
      setAvailablePieces((previous) => previous.filter((p) => p.id !== piece.id));
    } else if (targetSection === "method") {
      setMethods((previous) => [...previous, piece]);
      setAvailablePieces((previous) => previous.filter((p) => p.id !== piece.id));
    }

    setSelectedPiece(null);
    setFeedback({ message: "", type: "" });
    let hint = "";

    if (targetSection === "class" && piece.text !== currentScenario.targetClass) {
      hint = piece.type === "attribute"
        ? `"${piece.text}" is data, not a class. A class name should be a noun or noun phrase for the thing being modeled.`
        : piece.type === "method"
          ? `"${piece.text}" is an action, not a class. Choose a noun for the thing being modeled.`
          : `"${piece.text}" is a noun, but this scenario asks you to model ${currentScenario.targetClass}.`;
    } else if (
      targetSection === "attribute" &&
      (piece.type !== "attribute" || !currentScenario.validAttributes.includes(piece.text))
    ) {
      hint = piece.type === "class"
        ? `"${piece.text}" names a thing, not data. Attributes are nouns for information the class has.`
        : piece.type === "method"
          ? `"${piece.text}" is an action. Attributes are nouns for information the class has.`
          : `"${piece.text}" is not a property described in this scenario. Choose relevant data the class has.`;
    } else if (
      targetSection === "method" &&
      (piece.type !== "method" || !currentScenario.validMethods.includes(piece.text))
    ) {
      hint = piece.type === "class"
        ? `"${piece.text}" names a thing, not an action. Methods are verbs for what the class can do.`
        : piece.type === "attribute"
          ? `"${piece.text}" is data, not an action. Methods are verbs for what the class can do.`
          : `"${piece.text}" is not an action described in this scenario. Choose a relevant class action.`;
    }

    setMentorHints((previous) => ({ ...previous, [targetSection]: hint }));
  };

  const handleRemovePiece = (e, piece, section) => {
    e.stopPropagation();
    if (section === "class") setClassName(null);
    if (section === "attribute") setAttributes(attributes.filter((a) => a.id !== piece.id));
    if (section === "method") setMethods(methods.filter((m) => m.id !== piece.id));

    setAvailablePieces([...availablePieces, piece]);
    setFeedback({ message: "", type: "" });
    setMentorHints({});
  };

  // Helper function to evaluate the board and save the score
  const evaluateBoard = () => {
    let errors = [];

    if (!className) {
      errors.push("Class Name is missing.");
    } else if (className.text !== currentScenario.targetClass) {
      errors.push("The Class Name is incorrect.");
    }

    const userAttrTexts = attributes.map(a => a.text);
    const requiredAttrs = currentScenario.validAttributes;
    const hasMissingAttrs = requiredAttrs.some(req => !userAttrTexts.includes(req));
    const extraAttributes = attributes.filter((attribute) => !requiredAttrs.includes(attribute.text));
    const hasExtraAttrs = extraAttributes.length > 0;

    if (hasMissingAttrs) errors.push("You are missing required attributes in the Attributes section.");
    if (hasExtraAttrs) errors.push("You have incorrect or irrelevant attributes in the Attributes section.");

    const userMethodTexts = methods.map(m => m.text);
    const requiredMethods = currentScenario.validMethods;
    const hasMissingMethods = requiredMethods.some(req => !userMethodTexts.includes(req));
    const extraMethods = methods.filter((method) => !requiredMethods.includes(method.text));
    const hasExtraMethods = extraMethods.length > 0;

    if (hasMissingMethods) errors.push("You are missing required methods in the Methods section.");
    if (hasExtraMethods) errors.push("You have incorrect or irrelevant methods in the Methods section.");

    const correctElements =
      Number(className?.text === currentScenario.targetClass) +
      requiredAttrs.filter((required) => userAttrTexts.includes(required)).length +
      requiredMethods.filter((required) => userMethodTexts.includes(required)).length;
    const requiredElements = 1 + requiredAttrs.length + requiredMethods.length;
    const isCorrect = errors.length === 0;
    
    if (!isCorrect) {
      const wrongClassHint = className && className.text !== currentScenario.targetClass
        ? className.type === "attribute"
          ? `"${className.text}" describes data, not a class. A class name should be a noun for the main thing in the scenario.`
          : className.type === "method"
            ? `"${className.text}" describes an action, not a class. Choose a noun for the thing the class represents.`
            : `"${className.text}" is a noun, but it is not the specific class requested by this scenario.`
        : "";
      const wrongAttribute = extraAttributes[0];
      const wrongAttributeHint = wrongAttribute
        ? wrongAttribute.type === "class"
          ? `"${wrongAttribute.text}" names a class, not data. Attributes are nouns for information the class has.`
          : wrongAttribute.type === "method"
            ? `"${wrongAttribute.text}" describes an action. Put actions under Methods; Attributes are nouns for data.`
            : `"${wrongAttribute.text}" is not a property described for this class. Choose relevant data from the scenario.`
        : hasMissingAttrs
          ? "Add the missing properties. Attributes are nouns for data the class has."
          : "";
      const wrongMethod = extraMethods[0];
      const wrongMethodHint = wrongMethod
        ? wrongMethod.type === "class"
          ? `"${wrongMethod.text}" names a thing, not an action. Methods should be verbs for what the class can do.`
          : wrongMethod.type === "attribute"
            ? `"${wrongMethod.text}" describes data, not an action. Put it under Attributes; Methods should be verbs.`
            : `"${wrongMethod.text}" is not an action described for this class. Choose a relevant action from the scenario.`
        : hasMissingMethods
          ? "Add the missing action. Methods are verbs for what the class can do."
          : "";

      setMentorHints({
        class: !className
          ? "Choose a noun or noun phrase for the thing this class represents."
          : wrongClassHint,
        attribute: wrongAttributeHint,
        method: wrongMethodHint,
      });
      setFeedback({ 
        message: "Incorrect. Review your diagram:\n• " + errors.join("\n• "), 
        type: "error" 
      });
    } else {
      setMentorHints({});
      setFeedback({ 
        message: "Correct! You have successfully formed the class diagram.", 
        type: "success" 
      });
    }
    
    return { isCorrect, correctElements, requiredElements };
  };

  const handleCheckAnswers = async () => {
    if (!className && attributes.length === 0 && methods.length === 0) return;
    const result = evaluateBoard();
    await recordAttempt({
      activityKey: "class-diagram-formation",
      scenarioKey: currentScenario.id,
      correctElements: result.correctElements,
      requiredElements: result.requiredElements,
      completed: result.isCorrect,
      submittedResponse: {
        className: className?.text ?? null,
        attributes: attributes.map((attribute) => attribute.text),
        methods: methods.map((method) => method.text),
      },
    });
  };

  const resetBoard = (scenario) => {
    setClassName(null);
    setAttributes([]);
    setMethods([]);
    setSelectedPiece(null);
    const shuffled = [...scenario.pieces].sort(() => Math.random() - 0.5);
    setAvailablePieces(shuffled);
    setFeedback({ message: "", type: "" });
    setMentorHints({});
  };

  const handleReset = () => resetBoard(currentScenario);

  const handleDropZoneClick = (targetSection) => {
    if (selectedPiece) placePiece(selectedPiece, targetSection);
  };

  const handlePrevious = () => {
    if (currentScenarioIndex > 0) {
      const previousIndex = currentScenarioIndex - 1;
      resetBoard(SCENARIOS[previousIndex]);
      setCurrentScenarioIndex(previousIndex);
    }
  };

  const handleNext = async () => {
    // Auto-evaluate if they haven't checked yet
    if (feedback.type === "" && (className || attributes.length > 0 || methods.length > 0)) {
      const result = evaluateBoard();
      await recordAttempt({
        activityKey: "class-diagram-formation",
        scenarioKey: currentScenario.id,
        correctElements: result.correctElements,
        requiredElements: result.requiredElements,
        completed: result.isCorrect,
        submittedResponse: {
          className: className?.text ?? null,
          attributes: attributes.map((attribute) => attribute.text),
          methods: methods.map((method) => method.text),
        },
      });
    }

    if (currentScenarioIndex < SCENARIOS.length - 1) {
      const nextIndex = currentScenarioIndex + 1;
      resetBoard(SCENARIOS[nextIndex]);
      setCurrentScenarioIndex(nextIndex);
    } else {
      navigate("/skill-development");
    }
  };

  return (
    <div className="app-shell">
      {/* ===== Top navigation ===== */}
      <TopNav username={username} onLogout={handleLogout} />

      <main className="class-diagram-formation">
        <div className="cdf-top-header">
          <div className="cdf-breadcrumb">
            <span onClick={() => navigate("/skill-development")} className="cdf-breadcrumb-link">
              Skill Development
            </span>
            <span className="cdf-breadcrumb-separator">&rsaquo;</span>
            <span className="cdf-breadcrumb-current">Class Diagram Formation</span>
          </div>
          
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
             <div className="cdf-scenario-counter">
               Scenario {currentScenarioIndex + 1} of {SCENARIOS.length}
             </div>
          </div>
        </div>

        <h1 className="cdf-title">{currentScenario.title}</h1>
        {trackingError && <p role="alert" style={{ color: "var(--cc-err)" }}>{trackingError}</p>}
        <p className="cdf-description">
          <strong>Scenario:</strong> {currentScenario.text} <br/>
          Drag each piece into the compartment where it belongs. When you are ready, press <strong>Check answers</strong>.
        </p>
        <PreviousAttemptNotice
          attempts={priorAttempts}
          activityKey="class-diagram-formation"
          scenarioKey={currentScenario.id}
        />
        <GuidedExperiencePrompt
          attempts={attempts}
          activityKey="class-diagram-formation"
          scenarioKey={currentScenario.id}
        />

        <div className="cdf-workspace-layout">
          <div className="cdf-uml-container">
            <div className="cdf-uml-box">
              
              <div data-drop-target="class" onClick={() => handleDropZoneClick("class")} className={`cdf-uml-section cdf-uml-class${selectedPiece ? " cdf-drop-ready" : ""}`}>
                <span className="cdf-section-label">Class Name</span>
                {className ? (
                  <div onClick={(e) => handleRemovePiece(e, className, "class")} className="cdf-placed-item">{className.text}</div>
                ) : (
                  <span className="cdf-drop-placeholder">Drop here</span>
                )}
                {mentorHints.class && (
                  <AuthFieldHint className="cdf-field-hint" title="Class name">
                    {mentorHints.class}
                  </AuthFieldHint>
                )}
              </div>

              <div data-drop-target="attribute" onClick={() => handleDropZoneClick("attribute")} className={`cdf-uml-section cdf-uml-attributes${selectedPiece ? " cdf-drop-ready" : ""}`}>
                <span className="cdf-section-label">Attributes</span>
                <div>
                  {attributes.length === 0 && <span className="cdf-drop-placeholder">Drop here</span>}
                  {attributes.map(attr => (
                    <div key={attr.id} onClick={(e) => handleRemovePiece(e, attr, "attribute")} className="cdf-placed-item">{attr.text}</div>
                  ))}
                </div>
                {mentorHints.attribute && (
                  <AuthFieldHint className="cdf-field-hint" title="Attributes">
                    {mentorHints.attribute}
                  </AuthFieldHint>
                )}
              </div>

              <div data-drop-target="method" onClick={() => handleDropZoneClick("method")} className={`cdf-uml-section cdf-uml-methods${selectedPiece ? " cdf-drop-ready" : ""}`}>
                <span className="cdf-section-label">Methods</span>
                <div>
                  {methods.length === 0 && <span className="cdf-drop-placeholder">Drop here</span>}
                  {methods.map(method => (
                    <div key={method.id} onClick={(e) => handleRemovePiece(e, method, "method")} className="cdf-placed-item">{method.text}</div>
                  ))}
                </div>
                {mentorHints.method && (
                  <AuthFieldHint className="cdf-field-hint" title="Methods">
                    {mentorHints.method}
                  </AuthFieldHint>
                )}
              </div>

            </div>
          </div>

          <div className="cdf-bank-container">
            <h3 className="cdf-bank-title">Pieces</h3>
            <div className="cdf-bank-box">
              {availablePieces.map(piece => (
                <div
                  key={piece.id}
                  onPointerDown={(e) => startDrag(
                    e,
                    piece,
                    piece.text,
                    (draggedPiece, target) => placePiece(draggedPiece, target)
                  )}
                  onClick={() => setSelectedPiece(piece)}
                  className={`cdf-piece${selectedPiece?.id === piece.id ? " cdf-piece-selected" : ""}`}
                >
                  {piece.text}
                </div>
              ))}
            </div>
            <p className="cdf-tip">Drag a piece into a section, or click a piece and then click a section. Click placed pieces to remove them.</p>
          </div>
        </div>
        {previewElement}

        {/* BOTTOM ACTIONS */}
        <div className="cdf-action-bar">
          <div className="cdf-action-left">
            <button onClick={handlePrevious} disabled={currentScenarioIndex === 0} className="cdf-btn cdf-btn-prev">
              ← Previous
            </button>
            <button onClick={handleNext} className="cdf-btn cdf-btn-next">
              {currentScenarioIndex === SCENARIOS.length - 1 ? "Finish" : "Next →"}
            </button>
          </div>

          <div className="cdf-action-right">
            <button onClick={handleReset} className="cdf-btn cdf-btn-reset">Reset</button>
            <button onClick={handleCheckAnswers} className="cdf-btn cdf-btn-check">Check Answers</button>
          </div>
        </div>

        {feedback.message && (
          <div className={`cdf-feedback ${feedback.type === "error" ? "cdf-feedback-error" : "cdf-feedback-success"}`}>
            {feedback.message}
          </div>
        )}
      </main>
    </div>
  );
}