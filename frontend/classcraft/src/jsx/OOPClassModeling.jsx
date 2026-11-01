import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../css/oop_class_modeling.css";


export const OOP_SCENARIOS = [
  {
    id: 1,
    title: "Dragon's Lair: Creature and Dragon",
    scenario:
      "In a fantasy RPG, every Creature is an abstract blueprint: it has a protected 'health' value and a public 'attack()' action, but no creature is ever spawned as just a 'Creature'. A Dragon is a specialized kind of Creature with a private 'fireBreathPower'. Each Dragon inherits from exactly one Creature. Model the parent and child classes, protect the data properly, and connect them with the correct relationship and multiplicity.",
    targetParent: "Creature",
    targetChild: "Dragon",
    correctRelationship: "Inheritance",
    correctMultiplicity: "1",
    pieces: [
      { id: "p1", text: "«abstract»\nCreature", type: "parent" },
      { id: "p2", text: "Dragon", type: "child" },
      { id: "p3", text: "Treasure", type: "distractor" },
      { id: "p4", text: "health: int", type: "parent_attr", correctVis: "#" },
      { id: "p5", text: "fireBreathPower: int", type: "child_attr", correctVis: "-" },
      { id: "p6", text: "goldHoard: int", type: "distractor" },
      { id: "p7", text: "attack(): void", type: "parent_method", correctVis: "+" },
    ],
  },
  {
    id: 2,
    title: "Haunted Mansion: House and Room",
    scenario:
      "A spooky Mansion is made up of at least one Room. If the Mansion is demolished, every Room inside it disappears too, because a Room cannot exist on its own (a strong whole-part relationship). The Mansion's 'address' is public, while each Room's 'ghostCount' is private so only the Room can change it. A Room can be 'haunt()'-ed, which is a public action. Model the classes, the relationship, and the multiplicity on the Room end.",
    targetParent: "Mansion",
    targetChild: "Room",
    correctRelationship: "Composition",
    correctMultiplicity: "1..*",
    pieces: [
      { id: "p1", text: "Mansion", type: "parent" },
      { id: "p2", text: "Room", type: "child" },
      { id: "p3", text: "Ghost", type: "distractor" },
      { id: "p4", text: "address: String", type: "parent_attr", correctVis: "+" },
      { id: "p5", text: "ghostCount: int", type: "child_attr", correctVis: "-" },
      { id: "p6", text: "candlesLit: int", type: "distractor" },
      { id: "p7", text: "haunt(): void", type: "child_method", correctVis: "+" },
    ],
  },
  {
    id: 3,
    title: "Adventurer's Guild: Guild and Adventurer",
    scenario:
      "A Guild recruits Adventurers. A Guild may have no members yet or many members, but an Adventurer is a free spirit: if the Guild disbands, the Adventurer still exists and can join another Guild. The Guild's 'guildName' is public, the Adventurer's 'questsDone' counter is private, and the Guild can publicly 'recruit()' members. Model the classes and choose the relationship that shows the part can live without the whole, along with the correct multiplicity.",
    targetParent: "Guild",
    targetChild: "Adventurer",
    correctRelationship: "Aggregation",
    correctMultiplicity: "0..*",
    pieces: [
      { id: "p1", text: "Guild", type: "parent" },
      { id: "p2", text: "Adventurer", type: "child" },
      { id: "p3", text: "Tavern", type: "distractor" },
      { id: "p4", text: "guildName: String", type: "parent_attr", correctVis: "+" },
      { id: "p5", text: "questsDone: int", type: "child_attr", correctVis: "-" },
      { id: "p6", text: "swordType: String", type: "distractor" },
      { id: "p7", text: "recruit(): void", type: "parent_method", correctVis: "+" },
    ],
  },
  {
    id: 4,
    title: "Cat Cafe: Customer and Cat",
    scenario:
      "At a cozy Cat Cafe, a Customer can cuddle many Cats during a visit, and the same Cat can be cuddled by many Customers over the day. Neither one is a part of the other, and neither owns the other. It is a simple connection. The Customer's 'name' is public, the Cat's 'mood' is private (you never know what a cat is thinking!), and the Cat can publicly 'purr()'. Model the classes and the relationship, using the multiplicity that shows a Customer may cuddle zero or many Cats.",
    targetParent: "Customer",
    targetChild: "Cat",
    correctRelationship: "Association",
    correctMultiplicity: "0..*",
    pieces: [
      { id: "p1", text: "Customer", type: "parent" },
      { id: "p2", text: "Cat", type: "child" },
      { id: "p3", text: "Barista", type: "distractor" },
      { id: "p4", text: "name: String", type: "parent_attr", correctVis: "+" },
      { id: "p5", text: "mood: String", type: "child_attr", correctVis: "-" },
      { id: "p6", text: "latteArtStyle: String", type: "distractor" },
      { id: "p7", text: "purr(): void", type: "child_method", correctVis: "+" },
    ],
  },
];

export default function OOPClassModeling() {
  const navigate = useNavigate();

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

  const [availablePieces, setAvailablePieces] = useState(() => 
    [...currentScenario.pieces].sort(() => Math.random() - 0.5)
  );

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [feedback, setFeedback] = useState({ message: "", type: "" });
  const [scores, setScores] = useState({});

  // --- Drag and Drop Logic ---
  const handleDragStart = (e, piece) => {
    e.dataTransfer.setData("piece", JSON.stringify(piece));
  };

  const handleDrop = (e, targetSection) => {
    e.preventDefault();
    const pieceData = e.dataTransfer.getData("piece");
    if (!pieceData) return;
    const piece = JSON.parse(pieceData);

    const placePiece = (setter, list, pieceObj) => {
      setter([...list, pieceObj]);
      setAvailablePieces(prev => prev.filter(p => p.id !== pieceObj.id));
    };

    if (targetSection === "parent_name" && piece.type === "parent") {
      if (parentName) setAvailablePieces(prev => [...prev, parentName]);
      setParentName(piece);
      setAvailablePieces(prev => prev.filter(p => p.id !== piece.id));
    } 
    else if (targetSection === "child_name" && piece.type === "child") {
      if (childName) setAvailablePieces(prev => [...prev, childName]);
      setChildName(piece);
      setAvailablePieces(prev => prev.filter(p => p.id !== piece.id));
    }
    else if (targetSection === "parent_attr" && piece.type === "parent_attr") {
      placePiece(setParentAttrs, parentAttrs, { ...piece, currentVis: "+" });
    }
    else if (targetSection === "child_attr" && piece.type === "child_attr") {
      placePiece(setChildAttrs, childAttrs, { ...piece, currentVis: "+" });
    }
    else if (targetSection === "parent_method" && piece.type === "parent_method") {
      placePiece(setParentMethods, parentMethods, { ...piece, currentVis: "+" });
    }
    else if (targetSection === "child_method" && piece.type === "child_method") {
      placePiece(setChildMethods, childMethods, { ...piece, currentVis: "+" });
    }

    setFeedback({ message: "", type: "" });
    setIsSubmitted(false);
  };

  // --- Relationship Drag Logic ---
  const handleDropRelationship = (e) => {
    e.preventDefault();
    const rel = e.dataTransfer.getData("relationship_type");
    if (rel) {
      setDroppedRelationship(rel);
      setIsSubmitted(false);
    }
  };

  const handleDropMultiplicity = (e) => {
    e.preventDefault();
    const mult = e.dataTransfer.getData("multiplicity_type");
    if (mult) {
      setDroppedMultiplicity(mult);
      setIsSubmitted(false);
    }
  };

  const removePiece = (piece, section) => {
    if (section === "parent_name") setParentName(null);
    if (section === "child_name") setChildName(null);
    if (section === "parent_attr") setParentAttrs(parentAttrs.filter(a => a.id !== piece.id));
    if (section === "child_attr") setChildAttrs(childAttrs.filter(a => a.id !== piece.id));
    if (section === "parent_method") setParentMethods(parentMethods.filter(m => m.id !== piece.id));
    if (section === "child_method") setChildMethods(childMethods.filter(m => m.id !== piece.id));
    setAvailablePieces(prev => [...prev, piece]);
    setIsSubmitted(false);
  };

  const toggleVisibility = (item, section) => {
    const visOrder = ["+", "-", "#"];
    const nextVis = visOrder[(visOrder.indexOf(item.currentVis) + 1) % visOrder.length];
    
    if (section === "parent_attr") setParentAttrs(prev => prev.map(a => a.id === item.id ? { ...a, currentVis: nextVis } : a));
    if (section === "child_attr") setChildAttrs(prev => prev.map(a => a.id === item.id ? { ...a, currentVis: nextVis } : a));
    if (section === "parent_method") setParentMethods(prev => prev.map(m => m.id === item.id ? { ...m, currentVis: nextVis } : m));
    if (section === "child_method") setChildMethods(prev => prev.map(m => m.id === item.id ? { ...m, currentVis: nextVis } : m));
    setIsSubmitted(false);
  };

  // --- Evaluation ---
  const evaluateAnswer = () => {
    let errors = [];

    if (!parentName || !parentName.text.includes(currentScenario.targetParent)) errors.push(`Missing or incorrect Parent Class.`);
    if (!childName || childName.text !== currentScenario.targetChild) errors.push(`Missing or incorrect Child Class.`);
    
    if (!droppedRelationship) errors.push("You must connect the two classes with a relationship line.");
    else if (droppedRelationship !== currentScenario.correctRelationship) errors.push(`Incorrect relationship type.`);

    if (!droppedMultiplicity) errors.push("You must assign a multiplicity to the connection.");
    else if (droppedMultiplicity !== currentScenario.correctMultiplicity) errors.push(`Incorrect multiplicity.`);

    const checkItems = (items, requiredType, sectionName) => {
      const required = currentScenario.pieces.filter(p => p.type === requiredType);
      required.forEach(req => {
        const placed = items.find(i => i.text === req.text);
        if (!placed) errors.push(`Missing from ${sectionName}: ${req.text.split(':')[0]}`);
        else if (placed.currentVis !== req.correctVis) errors.push(`Incorrect visibility for ${req.text.split(':')[0]}`);
      });
    };
    checkItems(parentAttrs, "parent_attr", "Parent Attributes");
    checkItems(childAttrs, "child_attr", "Child Attributes");
    checkItems(parentMethods, "parent_method", "Parent Methods");
    checkItems(childMethods, "child_method", "Child Methods");

    const isCorrect = errors.length === 0;
    setScores(prev => ({ ...prev, [currentIndex]: isCorrect }));

    if (isCorrect) {
      setFeedback({ message: "Excellent! You have correctly modeled the OOP concepts and relationships.", type: "success" });
    } else {
      setFeedback({ message: "Review your model:\n• " + errors.join("\n• "), type: "error" });
    }
    return isCorrect;
  };

  const handleCheckAnswer = () => { evaluateAnswer(); setIsSubmitted(true); };

  const handleReset = () => {
    setParentName(null); setChildName(null);
    setParentAttrs([]); setChildAttrs([]);
    setParentMethods([]); setChildMethods([]);
    setDroppedRelationship(null); setDroppedMultiplicity(null);
    setAvailablePieces([...currentScenario.pieces].sort(() => Math.random() - 0.5));
    setFeedback({ message: "", type: "" });
    setIsSubmitted(false);
  };

  const handlePrevious = () => { if (currentIndex > 0) { setCurrentIndex(currentIndex - 1); handleReset(); } };
  const handleNext = () => {
    if (!isSubmitted) evaluateAnswer();
    if (currentIndex < OOP_SCENARIOS.length - 1) { setCurrentIndex(currentIndex + 1); handleReset(); } 
    else { navigate("/skill-development"); }
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

      <main className="oop-modeling-page">
        <div className="cdf-top-header">
          <div className="cdf-breadcrumb">
            <span onClick={() => navigate("/skill-development")} className="cdf-breadcrumb-link">Skill Development</span>
            <span className="cdf-breadcrumb-separator">&rsaquo;</span>
            <span className="cdf-breadcrumb-current">OOP-Based Class Modeling</span>
          </div>
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
             <div className="score-tracker">Score: <span style={{ color: "#22c55e" }}>{correctCount}</span> / {OOP_SCENARIOS.length}</div>
             <div className="cdf-scenario-counter">Scenario {currentIndex + 1} of {OOP_SCENARIOS.length}</div>
          </div>
        </div>

        <h1 className="cdf-title">{currentScenario.title}</h1>
        <p className="cdf-description">
          <strong>Scenario:</strong> {currentScenario.scenario} <br/>
          Drag pieces to the classes. Connect them with a relationship. <strong>Click visibility symbols to change them.</strong>
        </p>

        <div className="oop-workspace">
          
          {/* LEFT SIDE: The UML Diagram Area */}
          <div className="oop-diagram-area">
            
            {/* PARENT CLASS */}
            <div className="oop-class-box">
              <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, "parent_name")} className="oop-class-header">
                {parentName ? <div onClick={() => removePiece(parentName, "parent_name")} className="oop-class-name" style={{ whiteSpace: "pre-line" }}>{parentName.text}</div> : <span className="oop-drop-placeholder">Drop Parent</span>}
              </div>
              <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, "parent_attr")} className="oop-uml-section">
                <span className="oop-section-label">Attributes</span>
                {parentAttrs.map(attr => (
                  <div key={attr.id} className="oop-item-row">
                    <span className="oop-visibility-badge" onClick={() => toggleVisibility(attr, "parent_attr")}>{attr.currentVis}</span>
                    <span className="oop-item-text" onClick={() => removePiece(attr, "parent_attr")}>{attr.text}</span>
                  </div>
                ))}
              </div>
              <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, "parent_method")} className="oop-uml-section" style={{ borderBottom: "none" }}>
                <span className="oop-section-label">Methods</span>
                {parentMethods.map(method => (
                  <div key={method.id} className="oop-item-row">
                    <span className="oop-visibility-badge" onClick={() => toggleVisibility(method, "parent_method")}>{method.currentVis}</span>
                    <span className="oop-item-text" onClick={() => removePiece(method, "parent_method")}>{method.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* RELATIONSHIP GAP (Middle Column) */}
            <div className="oop-relationship-gap">
              <div className="oop-line"></div>
              
              <div 
                className={`rel-dropzone ${droppedRelationship ? 'filled' : ''} ${isSubmitted ? (droppedRelationship === currentScenario.correctRelationship ? 'correct' : 'wrong') : ''}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDropRelationship}
                onClick={() => setDroppedRelationship(null)}
              >
                {droppedRelationship ? droppedRelationship : "Drop Line"}
              </div>

              <div 
                className={`mult-dropzone ${droppedMultiplicity ? 'filled' : ''} ${isSubmitted ? (droppedMultiplicity === currentScenario.correctMultiplicity ? 'correct' : 'wrong') : ''}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDropMultiplicity}
                onClick={() => setDroppedMultiplicity(null)}
              >
                {droppedMultiplicity || "Mult"}
              </div>
            </div>

            {/* CHILD CLASS */}
            <div className="oop-class-box">
              <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, "child_name")} className="oop-class-header" style={{ background: "#f8fafc" }}>
                {childName ? <div onClick={() => removePiece(childName, "child_name")} className="oop-class-name">{childName.text}</div> : <span className="oop-drop-placeholder">Drop Child</span>}
              </div>
              <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, "child_attr")} className="oop-uml-section">
                <span className="oop-section-label">Attributes</span>
                {childAttrs.map(attr => (
                  <div key={attr.id} className="oop-item-row">
                    <span className="oop-visibility-badge" onClick={() => toggleVisibility(attr, "child_attr")}>{attr.currentVis}</span>
                    <span className="oop-item-text" onClick={() => removePiece(attr, "child_attr")}>{attr.text}</span>
                  </div>
                ))}
              </div>
              <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, "child_method")} className="oop-uml-section" style={{ borderBottom: "none" }}>
                <span className="oop-section-label">Methods</span>
                {childMethods.map(method => (
                  <div key={method.id} className="oop-item-row">
                    <span className="oop-visibility-badge" onClick={() => toggleVisibility(method, "child_method")}>{method.currentVis}</span>
                    <span className="oop-item-text" onClick={() => removePiece(method, "child_method")}>{method.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: The Tool Banks */}
          <div className="oop-bank-container">
            <h3 className="oop-bank-title">Pieces</h3>
            <div className="oop-bank-box">
              {availablePieces.map(piece => (
                <div key={piece.id} draggable onDragStart={(e) => handleDragStart(e, piece)} className="oop-piece" style={{ whiteSpace: "pre-line" }}>
                  {piece.text}
                </div>
              ))}
            </div>
            
            {/* UPDATED: All 4 Relationships */}
            <h3 className="oop-bank-title" style={{ marginTop: "20px" }}>Relationships</h3>
            <div className="tools-bank">
              <div draggable onDragStart={(e) => e.dataTransfer.setData("relationship_type", "Association")} className="tool-item">Association</div>
              <div draggable onDragStart={(e) => e.dataTransfer.setData("relationship_type", "Inheritance")} className="tool-item">Inheritance</div>
              <div draggable onDragStart={(e) => e.dataTransfer.setData("relationship_type", "Aggregation")} className="tool-item">Aggregation</div>
              <div draggable onDragStart={(e) => e.dataTransfer.setData("relationship_type", "Composition")} className="tool-item">Composition</div>
            </div>

            {/* UPDATED: All 4 Multiplicities */}
            <h3 className="oop-bank-title" style={{ marginTop: "20px" }}>Multiplicity</h3>
            <div className="tools-bank">
              <div draggable onDragStart={(e) => e.dataTransfer.setData("multiplicity_type", "1")} className="tool-item">1</div>
              <div draggable onDragStart={(e) => e.dataTransfer.setData("multiplicity_type", "0..1")} className="tool-item">0..1</div>
              <div draggable onDragStart={(e) => e.dataTransfer.setData("multiplicity_type", "0..*")} className="tool-item">0..*</div>
              <div draggable onDragStart={(e) => e.dataTransfer.setData("multiplicity_type", "1..*")} className="tool-item">1..*</div>
            </div>
          </div>
        </div>

        {isSubmitted && (
          <div className={`oop-feedback ${feedback.type === "error" ? "oop-feedback-error" : "oop-feedback-success"}`}>
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