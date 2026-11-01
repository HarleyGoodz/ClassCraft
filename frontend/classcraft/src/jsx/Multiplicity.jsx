import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../css/multiplicity.css";

// --- SCENARIO DATABASE ---
const MULTIPLICITY_SCENARIOS = [
  {
    id: 1,
    classA: "Student",
    classB: "Course",
    scenario: "A Student can enroll in many courses. A Course can have many students.",
    correctA: "0..*", 
    correctB: "0..*", 
    explanation: "Both ends are '0..*' (or '*') because a student can take zero or many courses, and a course can have zero or many students."
  },
  {
    id: 2,
    classA: "Department",
    classB: "Manager",
    scenario: "A Department has exactly one Manager. A Manager manages exactly one Department.",
    correctA: "1", 
    correctB: "1", 
    explanation: "Both ends are '1' because it is a strict one-to-one relationship."
  },
  {
    id: 3,
    classA: "Customer",
    classB: "Order",
    scenario: "A Customer can place many orders (or none if they are new). Every Order must belong to exactly one Customer.",
    correctA: "1", 
    correctB: "0..*", 
    explanation: "A customer is exactly '1', but they can have '0..*' orders. Every order has exactly 1 customer."
  },
  {
    id: 4,
    classA: "Car",
    classB: "LicensePlate",
    scenario: "A Car has exactly one License Plate. A License Plate belongs to exactly one Car.",
    correctA: "1",
    correctB: "1",
    explanation: "Both are '1' because a car has one plate, and a plate belongs to one car."
  },
  {
    id: 5,
    classA: "Teacher",
    classB: "Student",
    scenario: "A Teacher teaches one or many Students. A Student is taught by exactly one Teacher.",
    correctA: "1", // Teacher end
    correctB: "1..*", // Student end
    explanation: "A teacher is '1', but they must teach at least one student ('1..*')."
  },
  {
    id: 6,
    classA: "Person",
    classB: "Passport",
    scenario: "A Person can have zero or one Passport. A Passport belongs to exactly one Person.",
    correctA: "1", // Person end
    correctB: "0..1", // Passport end
    explanation: "A passport belongs to exactly '1' person. A person can have '0..1' passports (they might not have one)."
  },
  {
    id: 7,
    classA: "Company",
    classB: "Employee",
    scenario: "A Company employs zero or many Employees. An Employee works for exactly one Company.",
    correctA: "1", 
    correctB: "0..*", 
    explanation: "A company is '1'. Employees are '0..*' because a company can have zero employees (just started) or many."
  },
  {
    id: 8,
    classA: "Team",
    classB: "Player",
    scenario: "A Team has one or many Players. A Player belongs to zero or one Team (free agent).",
    correctA: "0..1", // Team end
    correctB: "1..*", // Player end
    explanation: "A team has '1..*' players. A player can be a free agent, so they belong to '0..1' teams."
  },
  {
    id: 9,
    classA: "Author",
    classB: "Book",
    scenario: "An Author can write zero or many Books. A Book must be written by one or many Authors.",
    correctA: "1..*", // Author end
    correctB: "0..*", // Book end
    explanation: "An author can write '0..*' books. A book must have at least '1..*' authors."
  },
  {
    id: 10,
    classA: "Patient",
    classB: "Doctor",
    scenario: "A Patient can visit one or many Doctors. A Doctor can treat zero or many Patients.",
    correctA: "0..*", // Patient end
    correctB: "1..*", // Doctor end
    explanation: "A patient visits '1..*' doctors. A doctor treats '0..*' patients."
  },
  {
    id: 11,
    classA: "ShoppingCart",
    classB: "Item",
    scenario: "A ShoppingCart contains zero or many Items. An Item is placed in exactly one ShoppingCart.",
    correctA: "1", // Cart end
    correctB: "0..*", // Item end
    explanation: "An item is in exactly '1' cart. A cart can have '0..*' items (it might be empty)."
  },
  {
    id: 12,
    classA: "Country",
    classB: "CapitalCity",
    scenario: "A Country has exactly one CapitalCity. A CapitalCity is the capital of exactly one Country.",
    correctA: "1",
    correctB: "1",
    explanation: "It is a strict one-to-one relationship. Both ends are '1'."
  }
];

const OPTIONS = ["1", "0..1", "0..*", "1..*"];

export default function Multiplicity() {
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [droppedA, setDroppedA] = useState(null);
  const [droppedB, setDroppedB] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Score Tracker
  const [scores, setScores] = useState({});

  const currentScenario = MULTIPLICITY_SCENARIOS[currentIndex];

  // --- Drag and Drop Logic ---
  const handleDragStart = (e, option) => {
    e.dataTransfer.setData("multiplicity", option);
  };

  const handleDropA = (e) => {
    e.preventDefault();
    const option = e.dataTransfer.getData("multiplicity");
    if (option) {
      setDroppedA(option);
      if (isSubmitted) setIsSubmitted(false); // Reset if changing answer
    }
  };

  const handleDropB = (e) => {
    e.preventDefault();
    const option = e.dataTransfer.getData("multiplicity");
    if (option) {
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
    
    setScores(prev => ({ ...prev, [currentIndex]: isCorrect }));
    return isCorrect;
  };

  const handleCheckAnswer = () => {
    if (!droppedA || !droppedB) return;
    evaluateAnswer();
    setIsSubmitted(true);
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

  const handleNext = () => {
    // Auto-evaluate if they haven't checked yet
    if (!isSubmitted && droppedA && droppedB) {
      evaluateAnswer();
    }

    if (currentIndex < MULTIPLICITY_SCENARIOS.length - 1) {
      setCurrentIndex(currentIndex + 1);
      handleReset();
    } else {
      navigate("/skill-development");
    }
  };

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

      <main className="multiplicity-page">
        
        {/* Header matching other modules */}
        <div className="cdf-top-header">
          <div className="cdf-breadcrumb">
            <span onClick={() => navigate("/skill-development")} className="cdf-breadcrumb-link">Skill Development</span>
            <span className="cdf-breadcrumb-separator">&rsaquo;</span>
            <span className="cdf-breadcrumb-current">Multiplicity</span>
          </div>
          
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
             <div className="score-tracker">
                Score: <span style={{ color: "#22c55e" }}>{correctCount}</span> / {MULTIPLICITY_SCENARIOS.length}
             </div>
             <div className="cdf-scenario-counter">
               Scenario {currentIndex + 1} of {MULTIPLICITY_SCENARIOS.length}
             </div>
          </div>
        </div>

        <h1 className="cdf-title">Assign Multiplicity</h1>
        <p className="cdf-description">
          Read the scenario and drag the correct multiplicity notation to the ends of the line.
        </p>

        <div className="multiplicity-builder">
          
          {/* 1. The Draggable Options */}
          <div className="multiplicity-bank">
            {OPTIONS.map(opt => (
              <div 
                key={opt} 
                draggable={true}
                onDragStart={(e) => handleDragStart(e, opt)}
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
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDropA}
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
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDropB}
              onClick={handleRemoveB}
              title={droppedB ? "Click to remove" : "Drop here"}
            >
              {droppedB || <span>Drop</span>}
            </div>

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