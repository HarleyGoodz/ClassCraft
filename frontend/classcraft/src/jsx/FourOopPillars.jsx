import { useState } from "react";
import { NavLink } from "react-router-dom";
import "../css/dashboard_css.css";
import "../css/four_oop_pillars.css";
import "../css/lesson_breadcrumb.css";
import {
  PillarDiagram,
  ScenarioDiagram,
} from "../components/FourOopPillarDiagrams";

const PILLARS = [
  {
    name: "Encapsulation",
    summary: "Keep an object's data and the methods that use it together.",
    example:
      "A BankAccount keeps its balance private and provides deposit() and withdraw() methods to update it safely.",
  },
  {
    name: "Abstraction",
    summary: "Show the important operations while hiding implementation details.",
    example:
      "A user calls pay() without needing to know the internal steps used to process the payment.",
  },
  {
    name: "Inheritance",
    summary: "Create a specialized class from a more general parent class.",
    example:
      "GraduateStudent inherits common identity and enrollment behavior from Student, then adds graduate-specific details.",
  },
  {
    name: "Polymorphism",
    summary: "Use one common operation with different behavior for different object types.",
    example:
      "Different Shape classes can implement area() in their own way, while the program calls area() on any Shape.",
  },
];

const SCENARIOS = [
  {
    title: "Online learning platform",
    intro:
      "A platform offers video lessons and quizzes. Both are learning resources, but opening each one behaves differently.",
    parent: "LearningResource",
    parentStereotype: "«abstract»",
    attributes: ["- title: String", "- completed: boolean"],
    parentMethods: ["+ open()", "+ markComplete()"],
    childOne: "VideoLesson",
    childOneMethod: "+ open() plays video",
    childTwo: "Quiz",
    childTwoMethod: "+ open() starts quiz",
    pillars: [
      {
        pillar: "Abstraction",
        description:
          "LearningResource defines what every resource can do without specifying how it opens.",
      },
      {
        pillar: "Encapsulation",
        description:
          "Resource details, such as title and completion state, belong inside the class.",
      },
      {
        pillar: "Inheritance",
        description:
          "VideoLesson and Quiz are specialized LearningResource classes.",
      },
      {
        pillar: "Polymorphism",
        description:
          "Calling open() plays a video or starts a quiz depending on the resource.",
      },
    ],
  },
  {
    title: "Smart home system",
    intro:
      "A smart home controls different devices. A Light and Thermostat share common device behavior, but respond to commands in their own way.",
    parent: "SmartDevice",
    parentStereotype: "«abstract»",
    attributes: ["- deviceId: String", "- isOn: boolean"],
    parentMethods: ["+ turnOn()", "+ turnOff()"],
    childOne: "Light",
    childOneMethod: "+ turnOn() lights room",
    childTwo: "Thermostat",
    childTwoMethod: "+ turnOn() starts heating",
    pillars: [
      {
        pillar: "Abstraction",
        description:
          "SmartDevice describes shared controls without exposing each device's inner workings.",
      },
      {
        pillar: "Encapsulation",
        description:
          "Each device manages its own state, such as whether it is on.",
      },
      {
        pillar: "Inheritance",
        description:
          "Light and Thermostat reuse common SmartDevice behavior.",
      },
      {
        pillar: "Polymorphism",
        description:
          "turnOn() lights a room or starts heating, depending on the device.",
      },
    ],
  },
];

export default function FourOopPillars() {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [selectedPillar, setSelectedPillar] = useState("Abstraction");
  const scenario = SCENARIOS[scenarioIndex];

  function showAnotherScenario() {
    setScenarioIndex((currentIndex) => (currentIndex + 1) % SCENARIOS.length);
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

      <main className="four-oop-page">
        <p className="lesson-breadcrumb">
          <NavLink to="/learn-basics">Learn the Basics</NavLink>
          <span className="lesson-breadcrumb-separator" aria-hidden="true">
            ›
          </span>
          <span className="lesson-breadcrumb-current" aria-current="page">
            The Four OOP Pillars
          </span>
        </p>

        <header className="four-oop-header">
          <h1>The Four OOP Pillars</h1>
          <p>
            Object-oriented programming uses four core ideas to organize code:
            encapsulation, abstraction, inheritance, and polymorphism.
          </p>
        </header>

        <section className="four-oop-grid" aria-label="The four OOP pillars">
          {PILLARS.map((pillar) => (
            <article className="four-oop-card" key={pillar.name}>
              <h2>{pillar.name}</h2>
              <p className="four-oop-summary">{pillar.summary}</p>
              <PillarDiagram type={pillar.name} />
              <p className="four-oop-example">{pillar.example}</p>
            </article>
          ))}
        </section>

        <section className="four-oop-scenario" aria-live="polite">
          <h2>Example scenario: {scenario.title}</h2>
          <p className="scenario-intro">
            {scenario.intro}
          </p>
          <ScenarioDiagram
            scenario={scenario}
            selectedPillar={selectedPillar}
          />
          <p className="scenario-explorer-hint">
            Select a pillar to see how it appears in the diagram.
          </p>
          <ul className="scenario-pillar-list">
            {scenario.pillars.map(({ pillar, description }) => (
              <li key={pillar}>
                <button
                  type="button"
                  className={`scenario-pillar-button${selectedPillar === pillar ? " is-active" : ""}`}
                  onClick={() => setSelectedPillar(pillar)}
                  aria-pressed={selectedPillar === pillar}
                >
                  <strong>{pillar}</strong>
                </button>
                : {description}
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="scenario-toggle"
            onClick={showAnotherScenario}
          >
            Show another scenario
          </button>
        </section>
      </main>
    </div>
  );
}
