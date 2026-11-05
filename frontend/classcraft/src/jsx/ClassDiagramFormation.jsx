import { SCENARIOS as SCENARIO_BANK } from "../questionBank/classDiagramFormation.jsx";
import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useLearningAttemptTracking } from "../hooks/useLearningAttemptTracking";
import { usePointerDragDrop } from "../hooks/usePointerDragDrop.jsx";
import { useSkillQuestionSet } from "../hooks/useSkillQuestionSet";
import PreviousAttemptNotice from "../components/PreviousAttemptNotice";
import ActivityLoadingSkeleton from "../components/ActivityLoadingSkeleton";
import { GuidedExperiencePrompt, NoSkillQuestions } from "../components/SkillPracticeStatus";
import "../css/class_diagram_formation.css"; 


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
  };

  const handleRemovePiece = (e, piece, section) => {
    e.stopPropagation();
    if (section === "class") setClassName(null);
    if (section === "attribute") setAttributes(attributes.filter((a) => a.id !== piece.id));
    if (section === "method") setMethods(methods.filter((m) => m.id !== piece.id));

    setAvailablePieces([...availablePieces, piece]);
    setFeedback({ message: "", type: "" });
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
    const hasExtraAttrs = userAttrTexts.some(usr => !requiredAttrs.includes(usr));

    if (hasMissingAttrs) errors.push("You are missing required attributes in the Attributes section.");
    if (hasExtraAttrs) errors.push("You have incorrect or irrelevant attributes in the Attributes section.");

    const userMethodTexts = methods.map(m => m.text);
    const requiredMethods = currentScenario.validMethods;
    const hasMissingMethods = requiredMethods.some(req => !userMethodTexts.includes(req));
    const hasExtraMethods = userMethodTexts.some(usr => !requiredMethods.includes(usr));

    if (hasMissingMethods) errors.push("You are missing required methods in the Methods section.");
    if (hasExtraMethods) errors.push("You have incorrect or irrelevant methods in the Methods section.");

    const correctElements =
      Number(className?.text === currentScenario.targetClass) +
      requiredAttrs.filter((required) => userAttrTexts.includes(required)).length +
      requiredMethods.filter((required) => userMethodTexts.includes(required)).length;
    const requiredElements = 1 + requiredAttrs.length + requiredMethods.length;
    const isCorrect = errors.length === 0;
    
    if (!isCorrect) {
      setFeedback({ 
        message: "Incorrect. Review your diagram:\n• " + errors.join("\n• "), 
        type: "error" 
      });
    } else {
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
        {trackingError && <p role="alert" style={{ color: "#b91c1c" }}>{trackingError}</p>}
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
              </div>

              <div data-drop-target="attribute" onClick={() => handleDropZoneClick("attribute")} className={`cdf-uml-section cdf-uml-attributes${selectedPiece ? " cdf-drop-ready" : ""}`}>
                <span className="cdf-section-label">Attributes</span>
                <div>
                  {attributes.length === 0 && <span className="cdf-drop-placeholder">Drop here</span>}
                  {attributes.map(attr => (
                    <div key={attr.id} onClick={(e) => handleRemovePiece(e, attr, "attribute")} className="cdf-placed-item">{attr.text}</div>
                  ))}
                </div>
              </div>

              <div data-drop-target="method" onClick={() => handleDropZoneClick("method")} className={`cdf-uml-section cdf-uml-methods${selectedPiece ? " cdf-drop-ready" : ""}`}>
                <span className="cdf-section-label">Methods</span>
                <div>
                  {methods.length === 0 && <span className="cdf-drop-placeholder">Drop here</span>}
                  {methods.map(method => (
                    <div key={method.id} onClick={(e) => handleRemovePiece(e, method, "method")} className="cdf-placed-item">{method.text}</div>
                  ))}
                </div>
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