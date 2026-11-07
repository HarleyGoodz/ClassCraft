/*
 * ClassObjects.jsx: the Classes and Objects lesson (/learn-basics/classes-objects).
 * Purpose: teaches the difference between a class (blueprint) and an object (real instance).
 * What it does: explains both with code samples, then shows example scenarios of a class
 * diagram and the objects made from it.
 */
import { SCENARIOS } from "../questionBank/classObjects.jsx";
import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";
import "../css/class_objects.css";
import "../css/class_objects_scenarios.css";
import "../css/lesson_path_header.css";
import TopicPager from "../components/TopicPager";

/*
  Plain-English meaning of each data type used in the scenarios.
*/
const TYPE_MEANINGS = {
  String: "text (words, names, letters)",
  int: "a whole number (no decimals)",
  double: "a number with decimals",
  boolean: "true or false",
};

/*
  Scenarios shown by the "Show another scenario" button.
  - attributes: { name, type }       -> written as  - name: type
  - methods:    { name, params, returns } -> written as  + name(params): returns
  - objects:    values are in the same order as the attributes
*/


const attributeLine = (a) => `- ${a.name}: ${a.type}`;
const methodLine = (m) => `+ ${m.name}(${m.params}): ${m.returns}`;
// Text values are shown in quotes, numbers and true/false are not.
const formatValue = (attr, value) =>
  attr.type === "String" ? `"${value}"` : value;

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

export default function ClassObjects() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("User");
  const [scenarioIndex, setScenarioIndex] = useState(0);

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
  const scenario = SCENARIOS[scenarioIndex];

  const usedTypes = [...new Set(scenario.attributes.map((a) => a.type))];
  const firstAttr = scenario.attributes[0];
  const methodWithParams =
    scenario.methods.find((m) => m.params) || scenario.methods[0];

  function showAnotherScenario() {
    setScenarioIndex((i) => (i + 1) % SCENARIOS.length);
  }

  return (
    <div className="app-shell">
      {/* ===== Top navigation ===== */}
      <TopNav username={username} onLogout={handleLogout} />

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
                The class diagram is the blueprint. The objects are the real
                things made from it.
              </p>
            </div>
            <span className="scenario-counter">
              Scenario {scenarioIndex + 1} of {SCENARIOS.length}
            </span>
          </div>

          <div className="scenario-body" aria-live="polite">
            {/* Class diagram (blueprint) */}
            <div className="scenario-class">
              <span className="scenario-tag">Class diagram (blueprint)</span>
              <div className="uml-box">
                <div className="uml-compartment uml-name">
                  <strong>{scenario.className}</strong>
                </div>
                <div className="uml-compartment">
                  {scenario.attributes.map((a) => (
                    <div key={a.name} className="uml-line">
                      <code>{attributeLine(a)}</code>
                    </div>
                  ))}
                </div>
                <div className="uml-compartment">
                  {scenario.methods.map((m) => (
                    <div key={m.name} className="uml-line">
                      <code>{methodLine(m)}</code>
                    </div>
                  ))}
                </div>
              </div>
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
                      <li key={attr.name}>
                        <code>{attr.name}</code> ={" "}
                        <strong>{formatValue(attr, obj.values[i])}</strong>
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
            className="next-button"
            onClick={showAnotherScenario}
          >
            Show another scenario
          </button>
        </section>

        <TopicPager current="classes-objects" />
      </main>
    </div>
  );
}