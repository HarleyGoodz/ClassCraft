import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../css/oop_class_modeling.css";
import "../css/oop_class_modeling_feedback.css";

// --- SCENARIO DATABASE ---
export const OOP_SCENARIOS = [
  {
    id: 1,
    title: "Car Dealership: Vehicle and Car",
    scenario:
      "A Vehicle is only a general idea (abstract), because nobody buys just a 'Vehicle'. It has a protected 'fuelLevel' and a public 'start()'. A Car is a kind of Vehicle with a private 'numberOfDoors'. Each Car is exactly one Vehicle.",
    targetParent: "Vehicle",
    targetChild: "Car",
    correctRelationship: "Inheritance",
    correctMultiplicity: "1",
    relationshipClue: "the scenario says a Car is a kind of Vehicle",
    multiplicityClue: "the scenario says each Car is exactly one Vehicle",
    pieces: [
      { id: "p1", text: "«abstract»\nVehicle", type: "parent" },
      { id: "p2", text: "Car", type: "child" },
      { id: "p3", text: "Driver", type: "distractor" },
      { id: "p4", text: "fuelLevel: int", type: "parent_attr", correctVis: "#" },
      { id: "p5", text: "numberOfDoors: int", type: "child_attr", correctVis: "-" },
      { id: "p6", text: "driverName: String", type: "distractor" },
      { id: "p7", text: "start(): void", type: "parent_method", correctVis: "+" },
    ],
  },
  {
    id: 2,
    title: "Real Estate: House and Room",
    scenario:
      "A House has one or more Rooms. If the House is demolished, its Rooms are gone too. The House has a public 'address'. A Room has a private 'floorArea' and a public 'turnOnLights()'.",
    targetParent: "House",
    targetChild: "Room",
    correctRelationship: "Composition",
    correctMultiplicity: "1..*",
    relationshipClue: "the scenario says the Rooms are gone when the House is demolished",
    multiplicityClue: "the scenario says a House has one or more Rooms",
    pieces: [
      { id: "p1", text: "House", type: "parent" },
      { id: "p2", text: "Room", type: "child" },
      { id: "p3", text: "Tenant", type: "distractor" },
      { id: "p4", text: "address: String", type: "parent_attr", correctVis: "+" },
      { id: "p5", text: "floorArea: double", type: "child_attr", correctVis: "-" },
      { id: "p6", text: "monthlyRent: double", type: "distractor" },
      { id: "p7", text: "turnOnLights(): void", type: "child_method", correctVis: "+" },
    ],
  },
  {
    id: 3,
    title: "Basketball League: Team and Player",
    scenario:
      "A Team has zero or more Players. If the Team disbands, the Players still exist and can join another Team. The Team has a public 'teamName' and a public 'addPlayer()'. A Player has a private 'jerseyNumber'.",
    targetParent: "Team",
    targetChild: "Player",
    correctRelationship: "Aggregation",
    correctMultiplicity: "0..*",
    relationshipClue: "the scenario says the Players still exist when the Team disbands",
    multiplicityClue: "the scenario says a Team has zero or more Players",
    pieces: [
      { id: "p1", text: "Team", type: "parent" },
      { id: "p2", text: "Player", type: "child" },
      { id: "p3", text: "Stadium", type: "distractor" },
      { id: "p4", text: "teamName: String", type: "parent_attr", correctVis: "+" },
      { id: "p5", text: "jerseyNumber: int", type: "child_attr", correctVis: "-" },
      { id: "p6", text: "ticketPrice: double", type: "distractor" },
      { id: "p7", text: "addPlayer(): void", type: "parent_method", correctVis: "+" },
    ],
  },
  {
    id: 4,
    title: "Public Library: Member and Book",
    scenario:
      "A Member can borrow zero or many Books, and a Book can be borrowed by many Members. Neither owns the other. The Member has a public 'name'. A Book has a private 'availableCopies' and a public 'borrow()'.",
    targetParent: "Member",
    targetChild: "Book",
    correctRelationship: "Association",
    correctMultiplicity: "0..*",
    relationshipClue: "the scenario says neither one owns the other",
    multiplicityClue: "the scenario says a Member can borrow zero or many Books",
    pieces: [
      { id: "p1", text: "Member", type: "parent" },
      { id: "p2", text: "Book", type: "child" },
      { id: "p3", text: "Librarian", type: "distractor" },
      { id: "p4", text: "name: String", type: "parent_attr", correctVis: "+" },
      { id: "p5", text: "availableCopies: int", type: "child_attr", correctVis: "-" },
      { id: "p6", text: "librarianSalary: double", type: "distractor" },
      { id: "p7", text: "borrow(): void", type: "child_method", correctVis: "+" },
    ],
  },
];

// --- TEACHING TEXT ---
const VIS_MEANING = {
  "+": "public (anyone can use it)",
  "-": "private (only its own class can use it)",
  "#": "protected (only its own class and its child classes can use it)",
};
const VIS_WORD = { "+": "public", "-": "private", "#": "protected" };

const REL_MEANING = {
  Association: "a simple link between two classes, where neither one is a kind of the other or a part of the other",
  Inheritance: "an 'is a' link, where the child is a special kind of the parent",
  Aggregation: "a 'has a' link where the parts can still exist on their own if the whole is gone",
  Composition: "a 'has a' link where the parts are destroyed when the whole is destroyed",
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
const ownerSide = (piece) =>
  piece.type === "parent" || piece.type.startsWith("parent_") ? "parent" : "child";

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
      return `"${name}" is a class name, not an attribute. Attributes are fields that hold values. They have a name and a type, like "age: int", and usually start with a "-" sign. A class name goes in the top box of a class.`;
    if (pk === "class" && sk === "method")
      return `"${name}" is a class name, not a method. Methods are actions a class can do. They have parentheses, like "start()", and usually start with a "+" sign. A class name goes in the top box of a class.`;
    if (pk === "attribute" && sk === "class")
      return `The top box is only for the class name. "${name}" is an attribute: a field that stores a value. Attributes have a name and a type, like "age: int", and usually start with a "-" sign. It goes in the Attributes section.`;
    if (pk === "attribute" && sk === "method")
      return `"${name}" is an attribute, not a method. Attributes are fields that store values and have a type after a colon. Methods are actions and have parentheses "()". It goes in the Attributes section.`;
    if (pk === "method" && sk === "class")
      return `The top box is only for the class name. "${name}" is a method: an action the class can do. Methods have parentheses "()" and usually start with a "+" sign. It goes in the Methods section.`;
    return `"${name}" is a method, not an attribute. It has parentheses "()", which means it is an action the class can do. Attributes are fields that store values. It goes in the Methods section.`;
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
          message: `"${name}" is not part of this scenario. The scenario only talks about ${currentScenario.targetParent} and ${currentScenario.targetChild}, so extra classes do not belong in the diagram.`,
        };
      return {
        ok: false,
        message: `"${name}" is not mentioned in the scenario. Only add the ${kind === "attribute" ? "fields" : "actions"} that the scenario talks about.`,
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
          message: `"${name}" belongs in the ${ownerSide(piece)} class box, not the ${sectionSide(section)} one. Re-read the scenario to see which class is the main one and which one depends on it.`,
        };
      }
      const owner = ownerSide(piece) === "parent" ? currentScenario.targetParent : currentScenario.targetChild;
      const here = sectionSide(section) === "parent" ? currentScenario.targetParent : currentScenario.targetChild;
      return {
        ok: false,
        message: `"${name}" is a real ${kind}, but it describes ${owner}, not ${here}. Ask yourself: which class does this belong to?`,
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
        message: `Right box, but the sign is wrong. You used "${piece.currentVis}", which means ${VIS_MEANING[piece.currentVis]}. The scenario says "${name}" is ${VIS_WORD[piece.correctVis]}, so it needs "${piece.correctVis}" (${VIS_MEANING[piece.correctVis]}).`,
      };
    }

    return {
      ok: true,
      message:
        kind === "attribute"
          ? `Correct! "${name}" is an attribute: a field that stores a value. The "${piece.currentVis}" sign matches the scenario.`
          : `Correct! "${name}" is a method: an action the class can do. The "${piece.currentVis}" sign matches the scenario.`,
    };
  };

  const getRelationshipFeedback = () => {
    if (!droppedRelationship) return null;
    if (droppedRelationship === currentScenario.correctRelationship) {
      return {
        ok: true,
        message: `Correct! ${droppedRelationship} is ${REL_MEANING[droppedRelationship]}, and ${currentScenario.relationshipClue}.`,
      };
    }
    return {
      ok: false,
      message: `You chose ${droppedRelationship}, which is ${REL_MEANING[droppedRelationship]}. That does not fit because ${currentScenario.relationshipClue}.`,
    };
  };

  const getMultiplicityFeedback = () => {
    if (!droppedMultiplicity) return null;
    if (droppedMultiplicity === currentScenario.correctMultiplicity) {
      return {
        ok: true,
        message: `Correct! ${droppedMultiplicity} means ${MULT_MEANING[droppedMultiplicity]}, and ${currentScenario.multiplicityClue}.`,
      };
    }
    return {
      ok: false,
      message: `You chose ${droppedMultiplicity}, which means ${MULT_MEANING[droppedMultiplicity]}. That does not fit because ${currentScenario.multiplicityClue}.`,
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
    setScores((prev) => ({ ...prev, [currentIndex]: isCorrect }));

    if (isCorrect) {
      setFeedback({ message: "Excellent! You have correctly modeled the OOP concepts and relationships.", type: "success" });
    } else if (hasWrong) {
      setFeedback({
        message: "Look at the red boxes. Each one explains what to fix. Green boxes are already correct.",
        type: "error",
      });
    } else {
      setFeedback({
        message: "Everything you placed so far is correct, but your diagram is not finished yet. Keep building, then check again.",
        type: "info",
      });
    }
    return isCorrect;
  };

  const handleCheckAnswer = () => { evaluateAnswer(); setIsSubmitted(true); };

  // Clears the board and loads the pieces of the given scenario.
  // The scenario is passed in on purpose: right after setCurrentIndex, the
  // `currentScenario` variable still holds the OLD scenario for this render.
  const resetBoard = (scenario) => {
    setParentName(null); setChildName(null);
    setParentAttrs([]); setChildAttrs([]);
    setParentMethods([]); setChildMethods([]);
    setDroppedRelationship(null); setDroppedMultiplicity(null);
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

  const handleNext = () => {
    if (!isSubmitted) evaluateAnswer();
    if (currentIndex < OOP_SCENARIOS.length - 1) goToScenario(currentIndex + 1);
    else navigate("/skill-development");
  };

  const correctCount = Object.values(scores).filter((val) => val === true).length;

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
        <div onClick={() => removePiece(piece, section)} className="oop-class-name" style={{ whiteSpace: "pre-line" }}>
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
            <span className="oop-visibility-badge" onClick={() => toggleVisibility(item, section)}>{item.currentVis}</span>
            <span className="oop-item-text" onClick={() => removePiece(item, section)}>{item.text}</span>
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
            <div className="score-tracker">Score: <span style={{ color: "#22c55e" }}>{correctCount}</span> / {OOP_SCENARIOS.length}</div>
            <div className="cdf-scenario-counter">Scenario {currentIndex + 1} of {OOP_SCENARIOS.length}</div>
          </div>
        </div>

        <h1 className="cdf-title">{currentScenario.title}</h1>
        <p className="cdf-description">
          <strong>Scenario:</strong> {currentScenario.scenario} <br />
          Drag pieces to the classes. Connect them with a relationship. <strong>Click visibility symbols to change them.</strong>
        </p>

        <div className="oop-workspace">

          {/* LEFT SIDE: The UML Diagram Area */}
          <div className="oop-diagram-area">

            {/* PARENT CLASS */}
            <div className="oop-class-box">
              <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, "parent_name")} className="oop-class-header">
                {renderNameSlot(parentName, "parent_name", "Drop Parent")}
              </div>
              <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, "parent_attr")} className="oop-uml-section">
                <span className="oop-section-label">Attributes</span>
                {renderItems(parentAttrs, "parent_attr")}
              </div>
              <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, "parent_method")} className="oop-uml-section" style={{ borderBottom: "none" }}>
                <span className="oop-section-label">Methods</span>
                {renderItems(parentMethods, "parent_method")}
              </div>
            </div>

            {/* RELATIONSHIP GAP (Middle Column) */}
            <div className="oop-relationship-gap">
              <div className="oop-line"></div>

              <div
                className={`rel-dropzone ${droppedRelationship ? "filled" : ""} ${relFeedback ? (relFeedback.ok ? "correct" : "wrong") : ""}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDropRelationship}
                onClick={() => { setDroppedRelationship(null); setIsSubmitted(false); }}
              >
                {droppedRelationship ? droppedRelationship : "Drop Line"}
              </div>

              <div
                className={`mult-dropzone ${droppedMultiplicity ? "filled" : ""} ${multFeedback ? (multFeedback.ok ? "correct" : "wrong") : ""}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDropMultiplicity}
                onClick={() => { setDroppedMultiplicity(null); setIsSubmitted(false); }}
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
              <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, "child_name")} className="oop-class-header" style={{ background: "#f8fafc" }}>
                {renderNameSlot(childName, "child_name", "Drop Child")}
              </div>
              <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, "child_attr")} className="oop-uml-section">
                <span className="oop-section-label">Attributes</span>
                {renderItems(childAttrs, "child_attr")}
              </div>
              <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, "child_method")} className="oop-uml-section" style={{ borderBottom: "none" }}>
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
                <div key={piece.id} draggable onDragStart={(e) => handleDragStart(e, piece)} className="oop-piece" style={{ whiteSpace: "pre-line" }}>
                  {piece.text}
                </div>
              ))}
            </div>

            <h3 className="oop-bank-title" style={{ marginTop: "20px" }}>Relationships</h3>
            <div className="tools-bank">
              <div draggable onDragStart={(e) => e.dataTransfer.setData("relationship_type", "Association")} className="tool-item">Association</div>
              <div draggable onDragStart={(e) => e.dataTransfer.setData("relationship_type", "Inheritance")} className="tool-item">Inheritance</div>
              <div draggable onDragStart={(e) => e.dataTransfer.setData("relationship_type", "Aggregation")} className="tool-item">Aggregation</div>
              <div draggable onDragStart={(e) => e.dataTransfer.setData("relationship_type", "Composition")} className="tool-item">Composition</div>
            </div>

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