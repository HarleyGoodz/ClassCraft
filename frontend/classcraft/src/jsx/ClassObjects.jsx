import { useState } from "react";
import { NavLink } from "react-router-dom";
import "../css/class_objects.css";
import "../css/class_objects_scenarios.css";
import "../css/lesson_path_header.css";

/*
  Extra scenarios shown by the "Show another scenario" button.
  Each one has a class (blueprint: attribute names only, no values)
  and objects created from it (the same attributes, now with real values).
*/
const SCENARIOS = [
  {
    className: "Car",
    attributes: ["brand", "color", "speed"],
    methods: ["start()", "brake()"],
    objects: [
      { name: "myCar", values: ["Toyota", "red", "0 km/h"] },
      { name: "yourCar", values: ["Honda", "blue", "0 km/h"] },
    ],
    explain:
      "Car is the blueprint: every car has a brand, a color, and a speed, and can start and brake. myCar and yourCar are two real cars made from it, each with its own values.",
  },
  {
    className: "Dog",
    attributes: ["name", "breed", "age"],
    methods: ["bark()", "eat()"],
    objects: [
      { name: "bantay", values: ["Bantay", "Aspin", "3"] },
      { name: "bella", values: ["Bella", "Poodle", "1"] },
    ],
    explain:
      "Dog only says that every dog has a name, a breed, and an age, and can bark and eat. bantay and bella are real dogs, each with different values.",
  },
  {
    className: "Phone",
    attributes: ["brand", "model", "batteryLevel"],
    methods: ["call()", "charge()"],
    objects: [
      { name: "phoneA", values: ["Samsung", "Galaxy A15", "80%"] },
      { name: "phoneB", values: ["Apple", "iPhone 13", "35%"] },
    ],
    explain:
      "Phone lists what every phone has and can do. phoneA and phoneB are two actual phones, so they can have different brands and different battery levels.",
  },
  {
    className: "Book",
    attributes: ["title", "author", "pages"],
    methods: ["open()", "read()"],
    objects: [
      { name: "book1", values: ["Noli Me Tangere", "Jose Rizal", "439"] },
      { name: "book2", values: ["Harry Potter", "J.K. Rowling", "309"] },
    ],
    explain:
      "Book is the template: every book has a title, an author, and a number of pages. book1 and book2 are two real books made from that template.",
  },
  {
    className: "BankAccount",
    attributes: ["owner", "balance"],
    methods: ["deposit()", "withdraw()"],
    objects: [
      { name: "account1", values: ["Maria", "PHP 5,000"] },
      { name: "account2", values: ["Juan", "PHP 12,500"] },
    ],
    explain:
      "BankAccount says every account has an owner and a balance, and can deposit and withdraw. account1 and account2 are real accounts that each keep their own balance.",
  },
];

export default function ClassObjects() {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const scenario = SCENARIOS[scenarioIndex];

  function showAnotherScenario() {
    setScenarioIndex((i) => (i + 1) % SCENARIOS.length);
  }

  return (
    <div className="dashboard-layout">
      {/* ===== Sidebar ===== */}
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

      {/* ===== Main content ===== */}
      <main className="class-objects">
        <p className="lesson-breadcrumb">
          <NavLink to="/learn-basics">Learn the Basics</NavLink>
          <span className="lesson-breadcrumb-separator" aria-hidden="true">
            ›
          </span>
          <span className="lesson-breadcrumb-current" aria-current="page">
            Classes and Objects
          </span>
        </p>
        <header className="class-objects-header">
          <h1>Classes and Objects</h1>
          <p>
            Before you can build a class diagram, you need to tell the
            difference between a <strong>class</strong> (a blueprint) and an{" "}
            <strong>object</strong> (a real instance of that blueprint).
          </p>
        </header>

        {/* ===== Lesson cards ===== */}
        <section className="lesson-grid">
          <article className="lesson-card lesson-card--class">
            <h2>What is a Class?</h2>
            <p>
              A <strong>class</strong> is a template or blueprint. It defines
              what kinds of <em>attributes</em> (data) and{" "}
              <em>methods</em> (behaviors) an object of that type will have —
              but it holds no actual values by itself.
            </p>
            <pre className="lesson-code">
{`class Student {
  name;
  id;
  enroll(course) { ... }
}`}
            </pre>
            <p className="lesson-note">
              The <code>Student</code> class says every student has a{" "}
              <code>name</code> and <code>id</code>, and can <code>enroll</code>
              . It doesn't name any specific student.
            </p>
          </article>

          <article className="lesson-card lesson-card--object">
            <h2>What is an Object?</h2>
            <p>
              An <strong>object</strong> is a real, usable instance of a class.
              It is created from the class blueprint and holds its own values.
            </p>
            <pre className="lesson-code">
{`john = new Student();
john.name = "John Cruz";
john.id = "2024-001";`}
            </pre>
            <p className="lesson-note">
              <code>john</code> is an object — a specific Student whose{" "}
              <code>name</code> is "John Cruz". Another object,{" "}
              <code>maria</code>, could be created from the same class with
              different values.
            </p>
          </article>
        </section>

        {/* ===== Relationship callout ===== */}
        <section className="relationship-callout">
          <h2>The Relationship</h2>
          <p>
            A class is to an object as a <strong>cookie cutter</strong> is to a
            cookie, or a <strong>house blueprint</strong> is to an actual
            house. You can create many objects from one class — each with
            its own data, but sharing the same structure.
          </p>
        </section>

        {/* ===== Another scenario ===== */}
        <section className="scenario-section" aria-labelledby="scenario-title">
          <div className="scenario-top">
            <div>
              <h2 id="scenario-title">See it in another scenario</h2>
              <p className="scenario-intro">
                The class is the blueprint. The objects are the real things made
                from it.
              </p>
            </div>
            <span className="scenario-counter">
              Scenario {scenarioIndex + 1} of {SCENARIOS.length}
            </span>
          </div>

          <div className="scenario-body" aria-live="polite">
            {/* Class (blueprint) */}
            <div className="scenario-card scenario-card--class">
              <span className="scenario-tag">Class (blueprint)</span>
              <h3>{scenario.className}</h3>

              <h4>Attributes</h4>
              <ul>
                {scenario.attributes.map((attr) => (
                  <li key={attr}>
                    <code>{attr}</code>
                  </li>
                ))}
              </ul>

              <h4>Methods</h4>
              <ul>
                {scenario.methods.map((method) => (
                  <li key={method}>
                    <code>{method}</code>
                  </li>
                ))}
              </ul>

              <p className="scenario-small">No values yet. It is only a plan.</p>
            </div>

            <div className="scenario-arrow" aria-hidden="true">
              <span>creates</span>
              <span className="scenario-arrow-icon">→</span>
            </div>

            {/* Objects (real things) */}
            <div className="scenario-objects">
              {scenario.objects.map((obj) => (
                <div
                  key={obj.name}
                  className="scenario-card scenario-card--object"
                >
                  <span className="scenario-tag">Object (real thing)</span>
                  <h3>{obj.name}</h3>
                  <ul>
                    {scenario.attributes.map((attr, i) => (
                      <li key={attr}>
                        <code>{attr}</code>: <strong>{obj.values[i]}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <p className="scenario-explain">{scenario.explain}</p>

          <button
            type="button"
            className="submit-button"
            onClick={showAnotherScenario}
          >
            Show another scenario
          </button>
        </section>
      </main>
    </div>
  );
}