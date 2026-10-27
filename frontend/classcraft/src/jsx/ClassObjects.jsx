import { NavLink } from "react-router-dom";
import "../css/class_objects.css";
import "../css/lesson_path_header.css";

export default function ClassObjects() {
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

      </main>
    </div>
  );
}