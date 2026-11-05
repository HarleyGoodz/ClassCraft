import { MULTIPLICITY_SCENARIOS as SCENARIO_BANK } from "../questionBank/multiplicity.jsx";
import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useLearningAttemptTracking } from "../hooks/useLearningAttemptTracking";
import { usePointerDragDrop } from "../hooks/usePointerDragDrop.jsx";
import { useSkillQuestionSet } from "../hooks/useSkillQuestionSet";
import PreviousAttemptNotice from "../components/PreviousAttemptNotice";
import ActivityLoadingSkeleton from "../components/ActivityLoadingSkeleton";
import { GuidedExperiencePrompt, NoSkillQuestions } from "../components/SkillPracticeStatus";
import "../css/multiplicity.css";


const OPTIONS = ["1", "0..1", "0..*", "1..*"];

export default function Multiplicity() {
  const location = useLocation();
  const navigate = useNavigate();
  const { startDrag, previewElement } = usePointerDragDrop();
  const { attempts, priorAttempts, recordAttempt, trackingError } =
    useLearningAttemptTracking(location.state?.learningAttempts);
  const {
    questions: MULTIPLICITY_SCENARIOS,
    loading: questionsLoading,
    error: questionsError,
  } = useSkillQuestionSet(
    "multiplicity",
    SCENARIO_BANK,
    location.state?.skillQuestions
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [droppedA, setDroppedA] = useState(null);
  const [droppedB, setDroppedB] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const currentScenario = MULTIPLICITY_SCENARIOS[currentIndex];

  // --- Drag and Drop Logic ---
  const handlePointerDrop = (option, target) => {
    if (target === "multiplicity-a") {
      setDroppedA(option);
      if (isSubmitted) setIsSubmitted(false);
    } else if (target === "multiplicity-b") {
      setDroppedB(option);
      if (isSubmitted) setIsSubmitted(false);
    }
  };

  // Click to place (Mobile support)
  const handleOptionClick = (option) => {
    if (!droppedA) {
      setDroppedA(option);
      if (isSubmitted) setIsSubmitted(false);
    } else if (!droppedB) {
      setDroppedB(option);
      if (isSubmitted) setIsSubmitted(false);
    }
  };

  const handleRemoveA = (e) => { 
    e.stopPropagation();
    setDroppedA(null); 
    setIsSubmitted(false);
  };
  
  const handleRemoveB = (e) => { 
    e.stopPropagation();
    setDroppedB(null); 
    setIsSubmitted(false);
  };

  // --- Evaluation Logic ---
  const evaluateAnswer = () => {
    if (!droppedA || !droppedB) return false;
    const isCorrect = droppedA === currentScenario.correctA && droppedB === currentScenario.correctB;
    
    return isCorrect;
  };

  const handleCheckAnswer = async () => {
    if (!droppedA || !droppedB) return;
    const isCorrect = evaluateAnswer();
    setIsSubmitted(true);
    await recordAttempt({
      activityKey: "multiplicity",
      scenarioKey: currentScenario.id,
      correctElements: Number(droppedA === currentScenario.correctA) + Number(droppedB === currentScenario.correctB),
      requiredElements: 2,
      completed: isCorrect,
      submittedResponse: { classA: droppedA, classB: droppedB },
    });
  };

  const handleReset = () => {
    setDroppedA(null);
    setDroppedB(null);
    setIsSubmitted(false);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      handleReset();
    }
  };

  const handleNext = async () => {
    // Auto-evaluate if they haven't checked yet
    if (!isSubmitted && droppedA && droppedB) {
      await handleCheckAnswer();
    }

    if (currentIndex < MULTIPLICITY_SCENARIOS.length - 1) {
      setCurrentIndex(currentIndex + 1);
      handleReset();
    } else {
      navigate("/skill-development");
    }
  };

  if (questionsLoading) return <ActivityLoadingSkeleton />;
  if (questionsError) return <main className="dashboard" role="alert">{questionsError}</main>;
  if (MULTIPLICITY_SCENARIOS.length === 0) return <NoSkillQuestions />;

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

      <main className="multiplicity-page">
        
        {/* Header matching other modules */}
        <div className="cdf-top-header">
          <div className="cdf-breadcrumb">
            <span onClick={() => navigate("/skill-development")} className="cdf-breadcrumb-link">Skill Development</span>
            <span className="cdf-breadcrumb-separator">&rsaquo;</span>
            <span className="cdf-breadcrumb-current">Multiplicity</span>
          </div>
          
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
             <div className="cdf-scenario-counter">
               Scenario {currentIndex + 1} of {MULTIPLICITY_SCENARIOS.length}
             </div>
          </div>
        </div>

        <h1 className="cdf-title">Assign Multiplicity</h1>
        <p className="cdf-description">
          Read the scenario and drag the correct multiplicity notation to the ends of the line.
        </p>
        {trackingError && <p role="alert" style={{ color: "#b91c1c" }}>{trackingError}</p>}
        <PreviousAttemptNotice
          attempts={priorAttempts}
          activityKey="multiplicity"
          scenarioKey={currentScenario.id}
        />
        <GuidedExperiencePrompt
          attempts={attempts}
          activityKey="multiplicity"
          scenarioKey={currentScenario.id}
        />

        <div className="multiplicity-builder">
          
          {/* 1. The Draggable Options */}
          <div className="multiplicity-bank">
            {OPTIONS.map(opt => (
              <div 
                key={opt} 
                onPointerDown={(e) => startDrag(
                  e,
                  opt,
                  opt,
                  handlePointerDrop
                )}
                onClick={() => handleOptionClick(opt)}
                className="multiplicity-option"
              >
                {opt}
              </div>
            ))}
          </div>

          {/* 2. The Diagram Workspace */}
          <div className="multiplicity-workspace">
            
            <div className="uml-class-box">{currentScenario.classA}</div>
            
            {/* Left Drop Zone */}
            <div 
              className={`multiplicity-dropzone ${droppedA ? 'filled' : ''} ${isSubmitted ? (droppedA === currentScenario.correctA ? 'correct' : 'wrong') : ''}`}
              data-drop-target="multiplicity-a"
              onClick={handleRemoveA}
              title={droppedA ? "Click to remove" : "Drop here"}
            >
              {droppedA || <span>Drop</span>}
            </div>

            {/* The Connection Line */}
            <div className="multiplicity-line"></div>

            {/* Right Drop Zone */}
            <div 
              className={`multiplicity-dropzone ${droppedB ? 'filled' : ''} ${isSubmitted ? (droppedB === currentScenario.correctB ? 'correct' : 'wrong') : ''}`}
              data-drop-target="multiplicity-b"
              onClick={handleRemoveB}
              title={droppedB ? "Click to remove" : "Drop here"}
            >
              {droppedB || <span>Drop</span>}
            </div>
            {previewElement}

            <div className="uml-class-box">{currentScenario.classB}</div>
          </div>

          <p className="relationship-scenario-text">
            <strong>Scenario:</strong> {currentScenario.scenario}
          </p>

          {/* Feedback */}
          {isSubmitted && (
            <div className={`relationship-feedback ${droppedA === currentScenario.correctA && droppedB === currentScenario.correctB ? "success" : "error"}`}>
              <h3>
                {droppedA === currentScenario.correctA && droppedB === currentScenario.correctB 
                  ? "Correct!" 
                  : "Incorrect. Check the explanation below."}
              </h3>
              <p>{currentScenario.explanation}</p>
            </div>
          )}
        </div>

        {/* Bottom Action Bar */}
        <div className="cdf-action-bar">
          <div className="cdf-action-left">
            <button onClick={handlePrevious} disabled={currentIndex === 0} className="cdf-btn cdf-btn-prev">
              ← Previous
            </button>
            <button onClick={handleNext} className="cdf-btn cdf-btn-next">
              {currentIndex === MULTIPLICITY_SCENARIOS.length - 1 ? "Finish" : "Next →"}
            </button>
          </div>

          <div className="cdf-action-right">
            <button onClick={handleReset} className="cdf-btn cdf-btn-reset">Reset</button>
            {!isSubmitted && (
              <button 
                onClick={handleCheckAnswer} 
                className="cdf-btn cdf-btn-check" 
                disabled={!droppedA || !droppedB}
                style={{ opacity: (!droppedA || !droppedB) ? 0.5 : 1 }}
              >
                Check Answer
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}