import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../css/class_relationships.css";

// --- SCENARIO DATABASE ---
const RELATIONSHIP_SCENARIOS = [
  {
    id: 1,
    classA: "Student",
    classB: "Course",
    scenario: "A Student enrolls in Courses. A Student can enroll in many courses, and a Course can have many Students. Neither owns the other.",
    options: ["Association", "Inheritance", "Aggregation", "Composition"],
    correctAnswer: "Association",
    explanation: "Association is a simple connection. Neither class is a part of the other."
  },
  {
    id: 2,
    classA: "Dog",
    classB: "Animal",
    scenario: "A Dog is a specific type of Animal. It inherits the traits of the Animal class.",
    options: ["Association", "Inheritance", "Aggregation", "Composition"],
    correctAnswer: "Inheritance",
    explanation: "Inheritance is an 'is-a' relationship."
  },
  {
    id: 3,
    classA: "Department",
    classB: "Professor",
    scenario: "A Department has Professors. If the Department closes, the Professors still exist.",
    options: ["Association", "Inheritance", "Aggregation", "Composition"],
    correctAnswer: "Aggregation",
    explanation: "Aggregation is a weak 'has-a' relationship where the part can exist independently."
  },
  {
    id: 4,
    classA: "Car",
    classB: "Engine",
    scenario: "A Car has an Engine. If the Car is destroyed, the Engine is destroyed with it.",
    options: ["Association", "Inheritance", "Aggregation", "Composition"],
    correctAnswer: "Composition",
    explanation: "Composition is a strong 'has-a' relationship where the part cannot exist without the whole."
  }
];

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
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [droppedAnswer, setDroppedAnswer] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // NEW: Track scores for each scenario
  // e.g., { 0: true, 1: false } means scenario 1 was correct, scenario 2 was wrong
  const [scores, setScores] = useState({}); 

  const currentScenario = RELATIONSHIP_SCENARIOS[currentIndex];

  const handleDragStart = (e, type) => {
    e.dataTransfer.setData("relationshipType", type);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("relationshipType");
    if (type) {
      setDroppedAnswer(type);
      if (isSubmitted) setIsSubmitted(false); // Reset feedback if they change answer
    }
  };

  const handleDragOver = (e) => e.preventDefault();

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
    
    // Save to state
    setScores(prev => ({ ...prev, [currentIndex]: isCorrect }));
    return isCorrect;
  };

  const handleCheckAnswer = () => {
    if (!droppedAnswer) return;
    evaluateAnswer();
    setIsSubmitted(true);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setDroppedAnswer(null);
      setIsSubmitted(false);
    }
  };

  const handleNext = () => {
    // NEW: If they click Next without clicking "Check Answer", we evaluate it automatically
    if (!isSubmitted && droppedAnswer) {
       evaluateAnswer();
    }

    if (currentIndex < RELATIONSHIP_SCENARIOS.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setDroppedAnswer(null);
      setIsSubmitted(false);
    } else {
      // Calculate final score before finishing
      const totalScore = Object.values(scores).filter(Boolean).length;
      console.log(`Finished! Score: ${totalScore}/${RELATIONSHIP_SCENARIOS.length}`);
      navigate("/skill-development");
    }
  };

  // Calculate live score for the header
  const correctCount = Object.values(scores).filter(val => val === true).length;

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

      <main className="class-relationships">
        
        <div className="cdf-top-header">
          <div className="cdf-breadcrumb">
            <span onClick={() => navigate("/skill-development")} className="cdf-breadcrumb-link">Skill Development</span>
            <span className="cdf-breadcrumb-separator">&rsaquo;</span>
            <span className="cdf-breadcrumb-current">Class Relationships</span>
          </div>
          
          {/* NEW: Score Tracker & Counter */}
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
             <div className="score-tracker">
                Score: <span style={{ color: "#22c55e" }}>{correctCount}</span> / {RELATIONSHIP_SCENARIOS.length}
             </div>
             <div className="cdf-scenario-counter">
               Scenario {currentIndex + 1} of {RELATIONSHIP_SCENARIOS.length}
             </div>
          </div>
        </div>

        <h1 className="cdf-title">Build the relationship</h1>
        <p className="cdf-description">
          Drag a connector into the gap between the classes. On a touchscreen, tap a connector, then tap the gap.
        </p>

        <div className="relationship-builder-box">
          
          <div className="connector-bank">
            {currentScenario.options.map((option) => (
              <div 
                key={option} 
                className="connector-option"
                draggable={true}
                onDragStart={(e) => handleDragStart(e, option)}
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
              onDragOver={handleDragOver}
              onDrop={handleDrop}
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

          <p className="relationship-scenario-text">
            {currentScenario.scenario}
          </p>

          {isSubmitted && (
            <div className={`relationship-feedback ${droppedAnswer === currentScenario.correctAnswer ? "success" : "error"}`}>
              <h3>{droppedAnswer === currentScenario.correctAnswer ? "Correct!" : `Incorrect. It should be ${currentScenario.correctAnswer}.`}</h3>
              <p>{currentScenario.explanation}</p>
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