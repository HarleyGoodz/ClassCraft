import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../css/class_diagram_formation.css"; 

// --- THE SCENARIO DATABASE ---
const SCENARIOS = [
  {
    id: 1,
    title: "University System",
    text: "A University has Students. Each student has a name and an ID. Students can enroll in courses.",
    targetClass: "Student",
    validAttributes: ["- name: String", "- studentId: int"],
    validMethods: ["+ enroll(): void"],
    pieces: [
      { id: "p1", text: "Student", type: "class" },
      { id: "p2", text: "Course", type: "class" },
      { id: "p3", text: "Professor", type: "class" },
      { id: "p4", text: "- name: String", type: "attribute" },
      { id: "p5", text: "- studentId: int", type: "attribute" },
      { id: "p6", text: "- title: String", type: "attribute" },
      { id: "p7", text: "+ enroll(): void", type: "method" },
      { id: "p8", text: "+ getDetails(): String", type: "method" },
    ]
  },
  {
    id: 2,
    title: "Library Management",
    text: "A Library contains Books. Every book has a title and an ISBN. Books can be borrowed by library members.",
    targetClass: "Book",
    validAttributes: ["- title: String", "- isbn: String"],
    validMethods: ["+ borrowBook(): void"],
    pieces: [
      { id: "p1", text: "Book", type: "class" },
      { id: "p2", text: "Library", type: "class" },
      { id: "p3", text: "Librarian", type: "class" },
      { id: "p4", text: "- title: String", type: "attribute" },
      { id: "p5", text: "- isbn: String", type: "attribute" },
      { id: "p6", text: "- address: String", type: "attribute" },
      { id: "p7", text: "+ borrowBook(): void", type: "method" },
      { id: "p8", text: "+ addBook(): void", type: "method" },
    ]
  },
  {
    id: 3,
    title: "Restaurant Ordering",
    text: "A Restaurant takes Orders. An order has a total price and a status. Customers can place orders.",
    targetClass: "Order",
    validAttributes: ["- totalPrice: double", "- status: String"],
    validMethods: ["+ placeOrder(): void"],
    pieces: [
      { id: "p1", text: "Order", type: "class" },
      { id: "p2", text: "Restaurant", type: "class" },
      { id: "p3", text: "Chef", type: "class" },
      { id: "p4", text: "- totalPrice: double", type: "attribute" },
      { id: "p5", text: "- status: String", type: "attribute" },
      { id: "p6", text: "- name: String", type: "attribute" },
      { id: "p7", text: "+ placeOrder(): void", type: "method" },
      { id: "p8", text: "+ cancelOrder(): void", type: "method" },
    ]
  },
  {
    id: 4,
    title: "Banking System",
    text: "A Bank manages Accounts. An account has an account number and a balance. Customers can deposit money.",
    targetClass: "Account",
    validAttributes: ["- accountNumber: String", "- balance: double"],
    validMethods: ["+ deposit(): void"],
    pieces: [
      { id: "p1", text: "Account", type: "class" },
      { id: "p2", text: "Bank", type: "class" },
      { id: "p3", text: "Customer", type: "class" },
      { id: "p4", text: "- accountNumber: String", type: "attribute" },
      { id: "p5", text: "- balance: double", type: "attribute" },
      { id: "p6", text: "- name: String", type: "attribute" },
      { id: "p7", text: "+ deposit(): void", type: "method" },
      { id: "p8", text: "+ withdraw(): void", type: "method" },
    ]
  },
  {
    id: 5,
    title: "E-Commerce Cart",
    text: "An Online Store has ShoppingCarts. A cart has a total amount and a list of items. Users can checkout a cart.",
    targetClass: "ShoppingCart",
    validAttributes: ["- totalAmount: double", "- items: List"],
    validMethods: ["+ checkout(): void"],
    pieces: [
      { id: "p1", text: "ShoppingCart", type: "class" },
      { id: "p2", text: "Product", type: "class" },
      { id: "p3", text: "Store", type: "class" },
      { id: "p4", text: "- totalAmount: double", type: "attribute" },
      { id: "p5", text: "- items: List", type: "attribute" },
      { id: "p6", text: "- price: double", type: "attribute" },
      { id: "p7", text: "+ checkout(): void", type: "method" },
      { id: "p8", text: "+ addItem(): void", type: "method" },
    ]
  },
  {
    id: 6,
    title: "Hospital Records",
    text: "A Hospital has Doctors. Every doctor has a specialization and a license number. Doctors can treat patients.",
    targetClass: "Doctor",
    validAttributes: ["- specialization: String", "- licenseNumber: String"],
    validMethods: ["+ treatPatient(): void"],
    pieces: [
      { id: "p1", text: "Doctor", type: "class" },
      { id: "p2", text: "Hospital", type: "class" },
      { id: "p3", text: "Patient", type: "class" },
      { id: "p4", text: "- specialization: String", type: "attribute" },
      { id: "p5", text: "- licenseNumber: String", type: "attribute" },
      { id: "p6", text: "- name: String", type: "attribute" },
      { id: "p7", text: "+ treatPatient(): void", type: "method" },
      { id: "p8", text: "+ prescribeMedicine(): void", type: "method" },
    ]
  },
  {
    id: 7,
    title: "Social Media App",
    text: "A Social Network has Posts. A post has content and a timestamp. Users can like a post.",
    targetClass: "Post",
    validAttributes: ["- content: String", "- timestamp: DateTime"],
    validMethods: ["+ like(): void"],
    pieces: [
      { id: "p1", text: "Post", type: "class" },
      { id: "p2", text: "User", type: "class" },
      { id: "p3", text: "Network", type: "class" },
      { id: "p4", text: "- content: String", type: "attribute" },
      { id: "p5", text: "- timestamp: DateTime", type: "attribute" },
      { id: "p6", text: "- username: String", type: "attribute" },
      { id: "p7", text: "+ like(): void", type: "method" },
      { id: "p8", text: "+ comment(): void", type: "method" },
    ]
  },
  {
    id: 8,
    title: "Smart Home Device",
    text: "A Smart Home has Thermostats. A thermostat has a current temperature and a target temperature. Users can adjust the temperature.",
    targetClass: "Thermostat",
    validAttributes: ["- currentTemp: int", "- targetTemp: int"],
    validMethods: ["+ adjustTemp(): void"],
    pieces: [
      { id: "p1", text: "Thermostat", type: "class" },
      { id: "p2", text: "SmartHome", type: "class" },
      { id: "p3", text: "User", type: "class" },
      { id: "p4", text: "- currentTemp: int", type: "attribute" },
      { id: "p5", text: "- targetTemp: int", type: "attribute" },
      { id: "p6", text: "- deviceName: String", type: "attribute" },
      { id: "p7", text: "+ adjustTemp(): void", type: "method" },
      { id: "p8", text: "+ turnOn(): void", type: "method" },
    ]
  },
  {
    id: 9,
    title: "Airline Booking",
    text: "An Airline manages Flights. A flight has a flight number and a departure time. Passengers can book a flight.",
    targetClass: "Flight",
    validAttributes: ["- flightNumber: String", "- departureTime: DateTime"],
    validMethods: ["+ bookFlight(): void"],
    pieces: [
      { id: "p1", text: "Flight", type: "class" },
      { id: "p2", text: "Airline", type: "class" },
      { id: "p3", text: "Pilot", type: "class" },
      { id: "p4", text: "- flightNumber: String", type: "attribute" },
      { id: "p5", text: "- departureTime: DateTime", type: "attribute" },
      { id: "p6", text: "- destination: String", type: "attribute" },
      { id: "p7", text: "+ bookFlight(): void", type: "method" },
      { id: "p8", text: "+ cancelFlight(): void", type: "method" },
    ]
  },
  {
    id: 10,
    title: "Video Game Character",
    text: "A Video Game features Characters. A character has a health value and a level. Characters can attack enemies.",
    targetClass: "Character",
    validAttributes: ["- health: int", "- level: int"],
    validMethods: ["+ attack(): void"],
    pieces: [
      { id: "p1", text: "Character", type: "class" },
      { id: "p2", text: "Enemy", type: "class" },
      { id: "p3", text: "VideoGame", type: "class" },
      { id: "p4", text: "- health: int", type: "attribute" },
      { id: "p5", text: "- level: int", type: "attribute" },
      { id: "p6", text: "- enemyType: String", type: "attribute" },
      { id: "p7", text: "+ attack(): void", type: "method" },
      { id: "p8", text: "+ heal(): void", type: "method" },
    ]
  }
];

export default function ClassDiagramFormation() {
  const navigate = useNavigate();

  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const currentScenario = SCENARIOS[currentScenarioIndex];

  const [className, setClassName] = useState(null);
  const [attributes, setAttributes] = useState([]);
  const [methods, setMethods] = useState([]);
  const [availablePieces, setAvailablePieces] = useState([]);

  const [feedback, setFeedback] = useState({ message: "", type: "" });
  
  // NEW: Track scores
  const [scores, setScores] = useState({});

  useEffect(() => {
    handleReset();
  }, [currentScenarioIndex]);

  const handleDragStart = (e, piece) => {
    e.dataTransfer.setData("piece", JSON.stringify(piece));
  };

  const handleDrop = (e, targetSection) => {
    e.preventDefault();
    const pieceData = e.dataTransfer.getData("piece");
    if (!pieceData) return;

    const piece = JSON.parse(pieceData);

    if (targetSection === "class") {
      if (className) {
        setAvailablePieces((prev) => [...prev, className]);
      }
      setClassName(piece);
      setAvailablePieces((prev) => prev.filter((p) => p.id !== piece.id));
    } 
    
    if (targetSection === "attribute") {
      setAttributes([...attributes, piece]);
      setAvailablePieces(availablePieces.filter((p) => p.id !== piece.id));
    }
    
    if (targetSection === "method") {
      setMethods([...methods, piece]);
      setAvailablePieces(availablePieces.filter((p) => p.id !== piece.id));
    }

    setFeedback({ message: "", type: "" });
  };

  const handleRemovePiece = (piece, section) => {
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

    const isCorrect = errors.length === 0;
    
    // Save score
    setScores(prev => ({ ...prev, [currentScenarioIndex]: isCorrect }));

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
    
    return isCorrect;
  };

  const handleCheckAnswers = () => {
    evaluateBoard();
  };

  const handleReset = () => {
    setClassName(null);
    setAttributes([]);
    setMethods([]);
    const shuffled = [...currentScenario.pieces].sort(() => Math.random() - 0.5);
    setAvailablePieces(shuffled);
    setFeedback({ message: "", type: "" });
  };

  const handlePrevious = () => {
    if (currentScenarioIndex > 0) setCurrentScenarioIndex(currentScenarioIndex - 1);
  };

  const handleNext = () => {
    // Auto-evaluate if they haven't checked yet
    if (feedback.type === "") {
      evaluateBoard();
    }

    if (currentScenarioIndex < SCENARIOS.length - 1) {
      setCurrentScenarioIndex(currentScenarioIndex + 1);
    } else {
      navigate("/skill-development");
    }
  };

  // Calculate live score
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
          <NavLink to="/my-progress" className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}>My Progress</NavLink>
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
          
          {/* NEW: Score Tracker */}
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
             <div className="score-tracker">
                Score: <span style={{ color: "#22c55e" }}>{correctCount}</span> / {SCENARIOS.length}
             </div>
             <div className="cdf-scenario-counter">
               Scenario {currentScenarioIndex + 1} of {SCENARIOS.length}
             </div>
          </div>
        </div>

        <h1 className="cdf-title">{currentScenario.title}</h1>
        <p className="cdf-description">
          <strong>Scenario:</strong> {currentScenario.text} <br/>
          Drag each piece into the compartment where it belongs. When you are ready, press <strong>Check answers</strong>.
        </p>

        <div className="cdf-workspace-layout">
          <div className="cdf-uml-container">
            <div className="cdf-uml-box">
              
              <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, "class")} className="cdf-uml-section cdf-uml-class">
                <span className="cdf-section-label">Class Name</span>
                {className ? (
                  <div onClick={() => handleRemovePiece(className, "class")} className="cdf-placed-item">{className.text}</div>
                ) : (
                  <span className="cdf-drop-placeholder">Drop here</span>
                )}
              </div>

              <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, "attribute")} className="cdf-uml-section cdf-uml-attributes">
                <span className="cdf-section-label">Attributes</span>
                <div>
                  {attributes.length === 0 && <span className="cdf-drop-placeholder">Drop here</span>}
                  {attributes.map(attr => (
                    <div key={attr.id} onClick={() => handleRemovePiece(attr, "attribute")} className="cdf-placed-item">{attr.text}</div>
                  ))}
                </div>
              </div>

              <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, "method")} className="cdf-uml-section cdf-uml-methods">
                <span className="cdf-section-label">Methods</span>
                <div>
                  {methods.length === 0 && <span className="cdf-drop-placeholder">Drop here</span>}
                  {methods.map(method => (
                    <div key={method.id} onClick={() => handleRemovePiece(method, "method")} className="cdf-placed-item">{method.text}</div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          <div className="cdf-bank-container">
            <h3 className="cdf-bank-title">Pieces</h3>
            <div className="cdf-bank-box">
              {availablePieces.map(piece => (
                <div key={piece.id} draggable onDragStart={(e) => handleDragStart(e, piece)} className="cdf-piece">
                  {piece.text}
                </div>
              ))}
            </div>
            <p className="cdf-tip">Tip: Click a piece inside the box to remove it.</p>
          </div>
        </div>

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