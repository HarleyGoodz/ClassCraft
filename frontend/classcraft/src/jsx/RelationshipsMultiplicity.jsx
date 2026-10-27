import { useState } from "react";
import { NavLink } from "react-router-dom";
import "../css/relationships_multiplicity.css";
import "../css/lesson_path_header.css";
import {
  RelationshipConnector,
  RelationshipDiagram,
} from "../components/realations_line";

const RELATIONSHIPS = [
  {
    name: "Association",
    leftClass: "Student",
    rightClass: "Course",
    description:
      "A general connection between classes. For example, a Student enrolls in a Course.",
  },
  {
    name: "Inheritance",
    leftClass: "GraduateStudent",
    rightClass: "Student",
    description:
      "An “is-a” relationship where a child class inherits features from a parent class. For example, GraduateStudent is a Student.",
  },
  {
    name: "Aggregation",
    leftClass: "Team",
    rightClass: "Player",
    description:
      "A whole-part relationship where the parts can exist independently of the whole. For example, a Team has Players.",
  },
  {
    name: "Composition",
    leftClass: "Order",
    rightClass: "OrderItem",
    description:
      "A strong whole-part relationship where the parts belong to the whole. For example, an Order contains OrderItems.",
  },
];

const MULTIPLICITIES = [
  { notation: "1", meaning: "Exactly one" },
  { notation: "0..1", meaning: "Zero or one (optional)" },
  { notation: "* or 0..*", meaning: "Zero or more" },
  { notation: "1..*", meaning: "One or more" },
];

const RELATIONSHIP_CHOICES = [
  "Association",
  "Inheritance",
  "Aggregation",
  "Composition",
];

const EXAMPLES = [
  {
    title: "Student and Course",
    leftClass: "Student",
    rightClass: "Course",
    leftMultiplicity: "0..*",
    rightMultiplicity: "0..*",
    correctRelationship: "Association",
    description:
      "A student can enroll in zero or many courses, and a course can have zero or many students. The 0..* at both ends expresses that many-to-many relationship.",
    correctFeedback:
      "Correct! Students enroll in courses, so this is an association.",
  },
  {
    title: "Team and Player",
    leftClass: "Team",
    rightClass: "Player",
    leftMultiplicity: "1",
    rightMultiplicity: "1..*",
    correctRelationship: "Aggregation",
    description:
      "Each team has one or more players, and each player belongs to one team. Players can exist independently of a team, so this is aggregation.",
    correctFeedback:
      "Correct! Players can exist independently of their team, so this is aggregation.",
  },
];

export default function RelationshipsMultiplicity() {
  const [exampleIndex, setExampleIndex] = useState(0);
  const [selectedRelationship, setSelectedRelationship] = useState("");
  const [placedRelationship, setPlacedRelationship] = useState("");
  const example = EXAMPLES[exampleIndex];
  const isCorrect = placedRelationship === example.correctRelationship;

  function showAnotherExample() {
    setExampleIndex((currentIndex) => (currentIndex + 1) % EXAMPLES.length);
    setSelectedRelationship("");
    setPlacedRelationship("");
  }

  function placeRelationship(relationship) {
    setPlacedRelationship(relationship);
  }

  function handleDrop(event) {
    event.preventDefault();
    const relationship = event.dataTransfer.getData("text/plain");
    if (RELATIONSHIP_CHOICES.includes(relationship)) {
      placeRelationship(relationship);
      setSelectedRelationship("");
    }
  }

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <h2 className="sidebar-brand">ClassCraft</h2>
        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
            end
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/learn-basics"
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            Learn the Basics
          </NavLink>
          <NavLink
            to="/skill-development"
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            Skill Development
          </NavLink>
          <NavLink
            to="/class-diagram-construction"
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            Class Diagram Construction
          </NavLink>
          <NavLink
            to="/my-progress"
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            My Progress
          </NavLink>
        </nav>
      </aside>

      <main className="relationships-multiplicity">
        <p className="lesson-breadcrumb">
          <NavLink to="/learn-basics">Learn the Basics</NavLink>
          <span className="lesson-breadcrumb-separator" aria-hidden="true">
            ›
          </span>
          <span className="lesson-breadcrumb-current" aria-current="page">
            Relationships and Multiplicity
          </span>
        </p>
        <header className="relationships-header">
          <h1>Relationships and Multiplicity</h1>
          <p>
            Class relationships show how types of objects connect. Multiplicity
            tells you how many objects can take part in each connection.
          </p>
        </header>

        <section className="relationships-section">
          <h2>Common class relationships</h2>
          <div className="relationships-grid">
            {RELATIONSHIPS.map((relationship) => (
              <article
                className="relationship-card"
                key={relationship.name}
              >
                <h3>{relationship.name}</h3>
                <RelationshipDiagram
                  type={relationship.name}
                  leftClass={relationship.leftClass}
                  rightClass={relationship.rightClass}
                />
                <p>{relationship.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="relationships-section">
          <h2>Reading multiplicity</h2>
          <p className="relationships-intro">
            Multiplicity is written beside each end of a relationship line. It
            answers: “For one object on the other end, how many of these objects
            can be connected?”
          </p>
          <div className="multiplicity-table-wrap">
            <table className="multiplicity-table">
              <thead>
                <tr>
                  <th scope="col">Notation</th>
                  <th scope="col">Meaning</th>
                </tr>
              </thead>
              <tbody>
                {MULTIPLICITIES.map(({ notation, meaning }) => (
                  <tr key={notation}>
                    <th scope="row">
                      <code>{notation}</code>
                    </th>
                    <td>{meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="relationships-example">
          <h2>Build the relationship: {example.title}</h2>
          <p className="example-instructions">
            Drag a connector into the gap between the classes. On a
            touchscreen, tap a connector, then tap the gap.
          </p>
          <div className="relationship-choice-list" aria-label="Relationship types">
            {RELATIONSHIP_CHOICES.map((relationship) => (
              <button
                className={`relationship-choice${selectedRelationship === relationship ? " is-selected" : ""}`}
                type="button"
                key={relationship}
                draggable
                aria-label={`Drag ${relationship} connector`}
                onDragStart={(event) => {
                  event.dataTransfer.setData("text/plain", relationship);
                  event.dataTransfer.effectAllowed = "copy";
                }}
                onClick={() =>
                  setSelectedRelationship((current) =>
                    current === relationship ? "" : relationship,
                  )
                }
                aria-pressed={selectedRelationship === relationship}
              >
                <RelationshipConnector type={relationship} />
                <span>{relationship}</span>
              </button>
            ))}
          </div>
          <div
            className="example-diagram"
            aria-label={`${example.leftClass} and ${example.rightClass} relationship diagram`}
          >
            <div className="example-class">{example.leftClass}</div>
            <div className="example-end">
              <span>{example.leftMultiplicity}</span>
              <button
                className={`relationship-drop-zone${selectedRelationship ? " is-ready" : ""}`}
                type="button"
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDrop}
                onClick={() => {
                  if (selectedRelationship) {
                    placeRelationship(selectedRelationship);
                    setSelectedRelationship("");
                  }
                }}
                aria-label="Drop or tap here to place the relationship connector"
              >
                {placedRelationship ? (
                  <RelationshipConnector type={placedRelationship} />
                ) : (
                  <span className="drop-prompt">
                    {selectedRelationship ? "Tap to place" : "Drop line here"}
                  </span>
                )}
              </button>
              <span>{example.rightMultiplicity}</span>
            </div>
            <div className="example-class">{example.rightClass}</div>
          </div>
          {placedRelationship && (
            <div className="example-answer-row">
              <p
                className={`example-feedback${isCorrect ? " is-correct" : " is-incorrect"}`}
                role="status"
              >
                {isCorrect
                  ? example.correctFeedback
                  : `Not quite. ${placedRelationship} doesn't fit this example. Try another connector.`}
              </p>
            </div>
          )}
          <p className="example-explanation">
            {example.description}
          </p>
          <button
            type="button"
            className="another-example-button"
            onClick={showAnotherExample}
          >
            Another example
          </button>
        </section>

      </main>
    </div>
  );
}
