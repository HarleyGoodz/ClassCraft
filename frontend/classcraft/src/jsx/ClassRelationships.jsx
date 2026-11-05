import {
  RELATIONSHIP_SCENARIOS as SCENARIO_BANK,
  getRelationshipFeedback,
} from "../questionBank/classRelationships.jsx";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";
import { useLearningAttemptTracking } from "../hooks/useLearningAttemptTracking";
import { usePointerDragDrop } from "../hooks/usePointerDragDrop.jsx";
import { useSkillQuestionSet } from "../hooks/useSkillQuestionSet";
import PreviousAttemptNotice from "../components/PreviousAttemptNotice";
import ActivityLoadingSkeleton from "../components/ActivityLoadingSkeleton";
import { GuidedExperiencePrompt, NoSkillQuestions } from "../components/SkillPracticeStatus";
import "../css/class_relationships.css";

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

// Visual Connector Component
function ConnectorVisual({ type }) {
  const color = "#475569";
  const stroke = 2;
  
  if (type === "Association") {
    return <svg width="100%" height="20" viewBox="0 0 100 20" preserveAspectRatio="none"><line x1="0" y1="10" x2="100" y2="10" stroke={color} strokeWidth={stroke} /></svg>;
  }
  if (type === "Inheritance") {
    return (
      <svg width="100%" height="20" viewBox="0 0 100 20" preserveAspectRatio="none">
        <line x1="0" y1="10" x2="90" y2="10" stroke={color} strokeWidth={stroke} />
        <polygon points="90,5 100,10 90,15" fill="#fff" stroke={color} strokeWidth={stroke} />
      </svg>
    );
  }
  if (type === "Aggregation") {
    return (
      <svg width="100%" height="20" viewBox="0 0 100 20" preserveAspectRatio="none">
        <line x1="0" y1="10" x2="85" y2="10" stroke={color} strokeWidth={stroke} />
        <polygon points="85,5 95,10 85,15 75,10" fill="#fff" stroke={color} strokeWidth={stroke} />
      </svg>
    );
  }
  if (type === "Composition") {
    return (
      <svg width="100%" height="20" viewBox="0 0 100 20" preserveAspectRatio="none">
        <line x1="0" y1="10" x2="85" y2="10" stroke={color} strokeWidth={stroke} />
        <polygon points="85,5 95,10 85,15 75,10" fill={color} stroke={color} strokeWidth={stroke} />
      </svg>
    );
  }
  return null;
}

export default function ClassRelationships() {
  const location = useLocation();
  const navigate = useNavigate();
  const { startDrag, previewElement } = usePointerDragDrop();
  const { attempts, priorAttempts, recordAttempt, trackingError } =
    useLearningAttemptTracking(location.state?.learningAttempts);
  const {
    questions: RELATIONSHIP_SCENARIOS,
    loading: questionsLoading,
    error: questionsError,
  } = useSkillQuestionSet(
    "class-relationships",
    SCENARIO_BANK,
    location.state?.skillQuestions
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [droppedAnswer, setDroppedAnswer] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
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

  const currentScenario = RELATIONSHIP_SCENARIOS[currentIndex];

  const handlePointerDrop = (type, target) => {
    if (target !== "relationship") return;
    if (type) {
      setDroppedAnswer(type);
      if (isSubmitted) setIsSubmitted(false); // Reset feedback if they change answer
    }
  };

  const handleOptionClick = (option) => {
    setDroppedAnswer(option);
    if (isSubmitted) setIsSubmitted(false);
  };

  const handleRemoveConnector = (e) => {
    e.stopPropagation();
    setDroppedAnswer(null);
    setIsSubmitted(false);
  };

  // Save the score whenever they click "Check Answer" or "Next"
  const evaluateAnswer = () => {
    if (!droppedAnswer) return false;
    const isCorrect = droppedAnswer === currentScenario.correctAnswer;
    
    return isCorrect;
  };

  const handleCheckAnswer = async () => {
    if (!droppedAnswer) return;
    const isCorrect = evaluateAnswer();
    setIsSubmitted(true);
    await recordAttempt({
      activityKey: "class-relationships",
      scenarioKey: currentScenario.id,
      correctElements: Number(isCorrect),
      requiredElements: 1,
      completed: isCorrect,
      submittedResponse: { relationship: droppedAnswer },
    });
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setDroppedAnswer(null);
      setIsSubmitted(false);
    }
  };

  const handleNext = async () => {
    // If they click Next without clicking "Check Answer", we evaluate it automatically
    if (!isSubmitted && droppedAnswer) {
       await handleCheckAnswer();
    }

    if (currentIndex < RELATIONSHIP_SCENARIOS.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setDroppedAnswer(null);
      setIsSubmitted(false);
    } else {
      navigate("/skill-development");
    }
  };

  if (questionsLoading) return <ActivityLoadingSkeleton />;
  if (questionsError) return <main className="dashboard" role="alert">{questionsError}</main>;
  if (RELATIONSHIP_SCENARIOS.length === 0) return <NoSkillQuestions />;

  // Feedback for the connector the learner dropped (never reveals the correct answer)
  const feedback =
    isSubmitted && droppedAnswer ? getRelationshipFeedback(currentScenario, droppedAnswer) : null;

  return (
    <div className="app-shell">
      {/* ===== Top navigation ===== */}
      <TopNav username={username} onLogout={handleLogout} />

      <main className="class-relationships">
        
        <div className="cdf-top-header">
          <div className="cdf-breadcrumb">
            <span onClick={() => navigate("/skill-development")} className="cdf-breadcrumb-link">Skill Development</span>
            <span className="cdf-breadcrumb-separator">&rsaquo;</span>
            <span className="cdf-breadcrumb-current">Class Relationships</span>
          </div>
          
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
             <div className="cdf-scenario-counter">
               Scenario {currentIndex + 1} of {RELATIONSHIP_SCENARIOS.length}
             </div>
          </div>
        </div>

        <h1 className="cdf-title">Build the relationship</h1>
        <p className="cdf-description">
          Drag a connector into the gap between the classes. On a touchscreen, tap a connector, then tap the gap.
        </p>
        {trackingError && <p role="alert" style={{ color: "#b91c1c" }}>{trackingError}</p>}
        <PreviousAttemptNotice
          attempts={priorAttempts}
          activityKey="class-relationships"
          scenarioKey={currentScenario.id}
        />
        <GuidedExperiencePrompt
          attempts={attempts}
          activityKey="class-relationships"
          scenarioKey={currentScenario.id}
        />

        <div className="relationship-builder-box">
          
          <div className="connector-bank">
            {currentScenario.options.map((option) => (
              <div 
                key={option} 
                className="connector-option"
                onPointerDown={(e) => startDrag(
                  e,
                  option,
                  option,
                  handlePointerDrop
                )}
                onClick={() => handleOptionClick(option)}
              >
                <div className="svg-container">
                  <ConnectorVisual type={option} />
                </div>
                <span>{option}</span>
              </div>
            ))}
          </div>

          <div className="uml-dropzone">
            <div className="uml-class-box">{currentScenario.classA}</div>
            
            <div 
              className={`connection-gap ${droppedAnswer ? 'filled' : ''} ${isSubmitted ? (droppedAnswer === currentScenario.correctAnswer ? 'correct' : 'wrong') : ''}`}
              data-drop-target="relationship"
            >
              {droppedAnswer ? (
                <div className="dropped-connector" onClick={handleRemoveConnector} title="Click to remove">
                  <ConnectorVisual type={droppedAnswer} />
                </div>
              ) : (
                <span className="drop-text">Drop line here</span>
              )}
            </div>

            <div className="uml-class-box">{currentScenario.classB}</div>
          </div>
          {previewElement}

          <p className="relationship-scenario-text">
            {currentScenario.scenario}
          </p>

          {feedback && (
            <div className={`relationship-feedback ${feedback.correct ? "success" : "error"}`}>
              <h3>{feedback.title}</h3>
              <p>{feedback.message}</p>
            </div>
          )}
        </div>

        <div className="cdf-action-bar">
          
          <div className="cdf-action-left">
            <button onClick={handlePrevious} disabled={currentIndex === 0} className="cdf-btn cdf-btn-prev">
              ← Previous
            </button>
            <button onClick={handleNext} className="cdf-btn cdf-btn-next">
              {currentIndex === RELATIONSHIP_SCENARIOS.length - 1 ? "Finish" : "Next →"}
            </button>
          </div>

          <div className="cdf-action-right">
            {!isSubmitted && (
              <button 
                className="cdf-btn cdf-btn-check" 
                onClick={handleCheckAnswer}
                disabled={!droppedAnswer}
                style={{ opacity: !droppedAnswer ? 0.5 : 1 }}
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