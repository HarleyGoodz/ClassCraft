import { Fragment, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../css/class_diagram_construction_css.css";
import "../css/class_diagram_scenarios_css.css";

/*
  Independent Class Diagram Construction – real-life scenarios.

  - The canvas starts EMPTY. The learner adds as many class boxes as they want
    ("+ Add class box"), then builds the diagram by drag and drop:
    class names, attributes, methods, visibility signs, relationships, multiplicity.
  - Boxes sit side by side. Between every two neighbouring boxes there is a
    connector with a relationship drop zone and two multiplicity drop zones.
    Boxes can be reordered (◀ ▶) and the symbol can be flipped (⇄) to choose
    which end it marks (the parent / whole end).
  - Grading does NOT depend on box order. A box is graded as the class the learner
    put in its name slot, and a connector is graded against the two classes it joins.
  - "Check Answer" gives NO explanation. It only outlines what the learner dragged:
    green if correct, red if wrong. Then it offers the next scenario.

  Scenario data:
    classes:   the class names the scenario needs
    relations: [{ p, q, rel, mult }]  p = parent / whole class, q = the other class,
               mult = { className: multiplicity shown at that class's end }
    pieces:    { id, text, owner, vis }
               owner = class the piece belongs to (null = does not belong to any class)
               vis   = correct visibility sign for attributes and methods
*/

const TARGET_PERCENT = 80;
const MAX_BOXES = 6;
const RELATIONSHIPS = ["Association", "Inheritance", "Aggregation", "Composition"];
const DIRECTIONAL = ["Inheritance", "Aggregation", "Composition"];
const MULTIPLICITIES = ["1", "0..1", "0..*", "1..*"];

export const CDC_SCENARIOS = [
  {
    id: 1,
    title: "Online Shopping: Customer, Order and OrderItem",
    pillars: ["Encapsulation"],
    scenario:
      "An online store tracks Customers and their Orders. A Customer can place zero or many Orders, but every Order belongs to exactly one Customer. An Order is made up of one or more OrderItems, and if an Order is cancelled, its OrderItems are deleted too. The Customer's 'password', the Order's 'totalPrice' and the OrderItem's 'quantity' can only be used inside their own classes. Anyone can call the Customer's 'placeOrder()' and the Order's 'addItem()'.",
    classes: ["Customer", "Order", "OrderItem"],
    relations: [
      { p: "Customer", q: "Order", rel: "Association", mult: { Customer: "1", Order: "0..*" } },
      { p: "Order", q: "OrderItem", rel: "Composition", mult: { Order: "1", OrderItem: "1..*" } },
    ],
    pieces: [
      { id: "c1", text: "Customer", owner: "Customer" },
      { id: "c2", text: "Order", owner: "Order" },
      { id: "c3", text: "OrderItem", owner: "OrderItem" },
      { id: "x1", text: "Warehouse", owner: null },
      { id: "a1", text: "password: String", owner: "Customer", vis: "-" },
      { id: "a2", text: "totalPrice: double", owner: "Order", vis: "-" },
      { id: "a3", text: "quantity: int", owner: "OrderItem", vis: "-" },
      { id: "x2", text: "shelfNumber: int", owner: null },
      { id: "m1", text: "placeOrder(): void", owner: "Customer", vis: "+" },
      { id: "m2", text: "addItem(): void", owner: "Order", vis: "+" },
      { id: "x3", text: "restockShelf(): void", owner: null },
    ],
  },
  {
    id: 2,
    title: "Banking: Account, SavingsAccount and CheckingAccount",
    pillars: ["Abstraction", "Inheritance", "Polymorphism", "Encapsulation"],
    scenario:
      "A bank never opens just a plain 'Account'. It only opens a SavingsAccount or a CheckingAccount, which are kinds of Account, so Account is only a general idea (abstract). Every account has a 'balance' that can only be used by the Account and the accounts that come from it. A SavingsAccount also has an 'interestRate' that only the SavingsAccount itself can use. Anyone can call 'deposit()' on an Account. Account, SavingsAccount and CheckingAccount each have their own 'calculateFee()' that anyone can call, because each type charges fees differently.",
    classes: ["Account", "SavingsAccount", "CheckingAccount"],
    relations: [
      { p: "Account", q: "SavingsAccount", rel: "Inheritance", mult: {} },
      { p: "Account", q: "CheckingAccount", rel: "Inheritance", mult: {} },
    ],
    pieces: [
      { id: "c1", text: "«abstract»\nAccount", owner: "Account" },
      { id: "c2", text: "SavingsAccount", owner: "SavingsAccount" },
      { id: "c3", text: "CheckingAccount", owner: "CheckingAccount" },
      { id: "x1", text: "Branch", owner: null },
      { id: "a1", text: "balance: double", owner: "Account", vis: "#" },
      { id: "a2", text: "interestRate: double", owner: "SavingsAccount", vis: "-" },
      { id: "x2", text: "branchCode: String", owner: null },
      { id: "m1", text: "deposit(): void", owner: "Account", vis: "+" },
      { id: "m2", text: "calculateFee(): double", owner: "Account", vis: "+" },
      { id: "m3", text: "calculateFee(): double", owner: "SavingsAccount", vis: "+" },
      { id: "m4", text: "calculateFee(): double", owner: "CheckingAccount", vis: "+" },
      { id: "x3", text: "openBranch(): void", owner: null },
    ],
  },
  {
    id: 3,
    title: "Healthcare: Hospital, Department and Doctor",
    pillars: ["Encapsulation"],
    scenario:
      "A Hospital is divided into one or more Departments, and each Department belongs to exactly one Hospital. If the Hospital closes, its Departments close too. Each Department has zero or more Doctors, and each Doctor works in exactly one Department, but a Doctor is not owned by the Department: if the Department closes, the Doctor still exists and can work elsewhere. The Hospital's 'name', the Department's 'departmentName' and the Doctor's 'licenseNumber' can only be used inside their own classes. Anyone can call 'addDepartment()', 'assignDoctor()' and 'treatPatient()'.",
    classes: ["Hospital", "Department", "Doctor"],
    relations: [
      { p: "Hospital", q: "Department", rel: "Composition", mult: { Hospital: "1", Department: "1..*" } },
      { p: "Department", q: "Doctor", rel: "Aggregation", mult: { Department: "1", Doctor: "0..*" } },
    ],
    pieces: [
      { id: "c1", text: "Hospital", owner: "Hospital" },
      { id: "c2", text: "Department", owner: "Department" },
      { id: "c3", text: "Doctor", owner: "Doctor" },
      { id: "x1", text: "Patient", owner: null },
      { id: "a1", text: "name: String", owner: "Hospital", vis: "-" },
      { id: "a2", text: "departmentName: String", owner: "Department", vis: "-" },
      { id: "a3", text: "licenseNumber: String", owner: "Doctor", vis: "-" },
      { id: "x2", text: "diagnosis: String", owner: null },
      { id: "m1", text: "addDepartment(): void", owner: "Hospital", vis: "+" },
      { id: "m2", text: "assignDoctor(): void", owner: "Department", vis: "+" },
      { id: "m3", text: "treatPatient(): void", owner: "Doctor", vis: "+" },
      { id: "x3", text: "billPatient(): void", owner: null },
    ],
  },
  {
    id: 4,
    title: "University: Student, Course and Instructor",
    pillars: ["Encapsulation"],
    scenario:
      "A university has Students and Courses. A Student can enroll in zero or many Courses, and a Course can have zero or many Students. Each Course is taught by exactly one Instructor, but an Instructor can teach zero or many Courses. Neither one owns the other. The Student's 'studentNumber', the Course's 'courseCode' and the Instructor's 'salary' can only be used inside their own classes. Anyone can call the Student's 'enroll()', the Course's 'getSchedule()' and the Instructor's 'gradeStudent()'.",
    classes: ["Student", "Course", "Instructor"],
    relations: [
      { p: "Student", q: "Course", rel: "Association", mult: { Student: "0..*", Course: "0..*" } },
      { p: "Course", q: "Instructor", rel: "Association", mult: { Course: "0..*", Instructor: "1" } },
    ],
    pieces: [
      { id: "c1", text: "Student", owner: "Student" },
      { id: "c2", text: "Course", owner: "Course" },
      { id: "c3", text: "Instructor", owner: "Instructor" },
      { id: "x1", text: "Classroom", owner: null },
      { id: "a1", text: "studentNumber: int", owner: "Student", vis: "-" },
      { id: "a2", text: "courseCode: String", owner: "Course", vis: "-" },
      { id: "a3", text: "salary: double", owner: "Instructor", vis: "-" },
      { id: "x2", text: "roomNumber: int", owner: null },
      { id: "m1", text: "enroll(): void", owner: "Student", vis: "+" },
      { id: "m2", text: "getSchedule(): String", owner: "Course", vis: "+" },
      { id: "m3", text: "gradeStudent(): void", owner: "Instructor", vis: "+" },
      { id: "x3", text: "cleanRoom(): void", owner: null },
    ],
  },
  {
    id: 5,
    title: "City Library: Library, LibraryItem and Book",
    pillars: ["Abstraction", "Inheritance", "Polymorphism", "Encapsulation"],
    scenario:
      "A city Library keeps zero or more LibraryItems, and each item belongs to exactly one Library. If the Library closes, its items still exist and can move to another Library. A LibraryItem is only a general idea (abstract), because nobody borrows just an 'item'. A Book is a kind of LibraryItem. The LibraryItem's 'title' can only be used by itself and the classes that come from it. The Book's 'isbn' and the Library's 'address' can only be used inside their own classes. Anyone can call the Library's 'addItem()'. LibraryItem and Book each have their own 'getLoanDays()' that anyone can call, because books can be borrowed longer than other items.",
    classes: ["Library", "LibraryItem", "Book"],
    relations: [
      { p: "Library", q: "LibraryItem", rel: "Aggregation", mult: { Library: "1", LibraryItem: "0..*" } },
      { p: "LibraryItem", q: "Book", rel: "Inheritance", mult: {} },
    ],
    pieces: [
      { id: "c1", text: "Library", owner: "Library" },
      { id: "c2", text: "«abstract»\nLibraryItem", owner: "LibraryItem" },
      { id: "c3", text: "Book", owner: "Book" },
      { id: "x1", text: "Librarian", owner: null },
      { id: "a1", text: "address: String", owner: "Library", vis: "-" },
      { id: "a2", text: "title: String", owner: "LibraryItem", vis: "#" },
      { id: "a3", text: "isbn: String", owner: "Book", vis: "-" },
      { id: "x2", text: "salary: double", owner: null },
      { id: "m1", text: "addItem(): void", owner: "Library", vis: "+" },
      { id: "m2", text: "getLoanDays(): int", owner: "LibraryItem", vis: "+" },
      { id: "m3", text: "getLoanDays(): int", owner: "Book", vis: "+" },
      { id: "x3", text: "payFine(): void", owner: null },
    ],
  },
];

// --- HELPERS ---
const kindOf = (text) =>
  text.includes("(") ? "method" : text.includes(":") ? "attribute" : "class";
const SECTION_KIND = { attrs: "attribute", methods: "method" };

const emptyLink = { rel: null, multL: null, multR: null, flipped: false };
const shuffled = (pieces) => [...pieces].sort(() => Math.random() - 0.5);

// The class a box stands for = the class the learner dropped in its name slot (null if none / not a real class)
const classOfBox = (box) =>
  box.name && kindOf(box.name.text) === "class" ? box.name.owner : null;

/*
  UML relationship symbols, drawn instead of words.
  The shape marks the parent / whole end. `flipped` moves it to the right-hand end.
    Association: plain line        Inheritance: hollow triangle
    Aggregation: hollow diamond    Composition: filled diamond
*/
function RelSymbol({ type, flipped = false }) {
  const stroke = "#334155";
  let end = null;
  if (type === "Inheritance") {
    end = <polygon points="2,12 26,3 26,21" fill="#fff" stroke={stroke} strokeWidth="2" strokeLinejoin="round" />;
  } else if (type === "Aggregation") {
    end = <polygon points="2,12 14,3 26,12 14,21" fill="#fff" stroke={stroke} strokeWidth="2" strokeLinejoin="round" />;
  } else if (type === "Composition") {
    end = <polygon points="2,12 14,3 26,12 14,21" fill={stroke} stroke={stroke} strokeWidth="2" strokeLinejoin="round" />;
  }

  return (
    <span className={`cds-sym ${flipped ? "flipped" : ""}`} role="img" aria-label={type}>
      {end && (
        <svg className="cds-sym-end" width="28" height="24" viewBox="0 0 28 24" aria-hidden="true">
          {end}
        </svg>
      )}
      <span className="cds-sym-line" />
    </span>
  );
}

/*
  Grades the board without caring about box order.
  Returns what is right / wrong (for the outlines) and how many required
  elements were modeled correctly (for the final summary).
*/
function grade(scn, boxes, links) {
  // Class names: right if the piece is one of the scenario's real classes
  const names = boxes.map((b) => (b.name ? classOfBox(b) !== null : null));

  // Attributes and methods: right if they belong to the class named in THAT box, with the right sign
  const itemOk = {};
  boxes.forEach((b) => {
    const cls = classOfBox(b);
    ["attrs", "methods"].forEach((section) => {
      const seen = new Set();
      b[section].forEach((item) => {
        const matches =
          cls !== null &&
          scn.pieces.some(
            (q) =>
              q.owner === cls &&
              q.text === item.text &&
              q.vis === item.currentVis &&
              kindOf(q.text) === SECTION_KIND[section]
          );
        itemOk[item.id] = matches && !seen.has(item.text); // a repeat of the same text is extra
        seen.add(item.text);
      });
    });
  });

  // Connectors between neighbouring boxes
  const conn = {}; // key -> { rel, multL, multR } (true / false / null)
  const found = []; // expected relations that the learner modeled between the right two boxes
  for (let i = 0; i < boxes.length - 1; i++) {
    const key = `${boxes[i].uid}-${boxes[i + 1].uid}`;
    const link = links[key] || emptyLink;
    const cl = classOfBox(boxes[i]);
    const cr = classOfBox(boxes[i + 1]);
    const exp =
      cl && cr
        ? scn.relations.find((r) => (r.p === cl && r.q === cr) || (r.p === cr && r.q === cl))
        : null;
    const whole = link.flipped ? cr : cl;

    const relOk = link.rel
      ? !!exp && link.rel === exp.rel && (DIRECTIONAL.includes(exp.rel) ? whole === exp.p : true)
      : null;
    const multLOk = link.multL ? !!exp && link.multL === (exp.mult[cl] ?? null) : null;
    const multROk = link.multR ? !!exp && link.multR === (exp.mult[cr] ?? null) : null;
    conn[key] = { rel: relOk, multL: multLOk, multR: multROk };

    if (exp) found.push({ exp, cl, cr, link, relOk });
  }

  // Required elements
  let total = scn.classes.length;
  let satisfied = scn.classes.filter((c) => boxes.some((b) => classOfBox(b) === c)).length;

  scn.pieces
    .filter((q) => q.owner && kindOf(q.text) !== "class")
    .forEach((q) => {
      total += 1;
      const section = kindOf(q.text) === "attribute" ? "attrs" : "methods";
      const home = boxes.find((b) => classOfBox(b) === q.owner);
      if (home && home[section].some((it) => it.text === q.text && it.currentVis === q.vis && itemOk[it.id])) {
        satisfied += 1;
      }
    });

  scn.relations.forEach((exp) => {
    const multCount = Object.values(exp.mult).filter(Boolean).length;
    total += 1 + multCount;
    const hit = found.find((f) => f.exp === exp);
    if (!hit) return;
    if (hit.relOk) satisfied += 1;
    [exp.p, exp.q].forEach((cls) => {
      const expected = exp.mult[cls];
      if (!expected) return;
      const placed = hit.cl === cls ? hit.link.multL : hit.link.multR;
      if (placed === expected) satisfied += 1;
    });
  });

  return { names, itemOk, conn, satisfied, total };
}

export default function ClassDiagramScenarios() {
  const navigate = useNavigate();

  const [index, setIndex] = useState(0);
  const scenario = CDC_SCENARIOS[index];

  const nextUid = useRef(1);
  const [boxes, setBoxes] = useState([]); // [{ uid, name, attrs, methods }] starts empty
  const [links, setLinks] = useState({}); // "leftUid-rightUid" -> { rel, multL, multR, flipped }
  const [bank, setBank] = useState(() => shuffled(CDC_SCENARIOS[0].pieces));
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState({}); // index -> { satisfied, total }
  const [finished, setFinished] = useState(false);
  const [dragOver, setDragOver] = useState(null);

  const graded = checked ? grade(scenario, boxes, links) : null;
  const originalPiece = (id) => scenario.pieces.find((p) => p.id === id);

  // --- Board control ---
  // The scenario is passed in on purpose: right after setIndex, `scenario` is still the old one.
  const resetBoard = (scn) => {
    setBoxes([]);
    setLinks({});
    setBank(shuffled(scn.pieces));
    setChecked(false);
    setDragOver(null);
  };

  const goToScenario = (i) => {
    setIndex(i);
    resetBoard(CDC_SCENARIOS[i]);
  };

  // --- Boxes ---
  const addBox = () => {
    if (checked || boxes.length >= MAX_BOXES) return;
    setBoxes([...boxes, { uid: nextUid.current++, name: null, attrs: [], methods: [] }]);
  };

  const removeBox = (uid) => {
    if (checked) return;
    const box = boxes.find((b) => b.uid === uid);
    const returned = [box.name, ...box.attrs, ...box.methods]
      .filter(Boolean)
      .map((p) => originalPiece(p.id));
    setBank([...bank, ...returned]);
    setBoxes(boxes.filter((b) => b.uid !== uid));
    setLinks(
      Object.fromEntries(
        Object.entries(links).filter(([key]) => !key.split("-").includes(String(uid)))
      )
    );
  };

  const moveBox = (i, direction) => {
    if (checked) return;
    const j = i + direction;
    if (j < 0 || j >= boxes.length) return;
    const next = [...boxes];
    [next[i], next[j]] = [next[j], next[i]];
    setBoxes(next);
  };

  // --- Drag and drop: class pieces ---
  const dropPiece = (e, uid, section) => {
    e.preventDefault();
    setDragOver(null);
    if (checked) return;
    const id = e.dataTransfer.getData("piece");
    const piece = bank.find((p) => p.id === id);
    if (!piece) return;

    const target = boxes.find((b) => b.uid === uid);
    const previousName = section === "name" ? target.name : null;

    setBoxes(
      boxes.map((b) => {
        if (b.uid !== uid) return b;
        if (section === "name") return { ...b, name: piece };
        return { ...b, [section]: [...b[section], { ...piece, currentVis: "+" }] };
      })
    );
    setBank([...bank.filter((p) => p.id !== id), ...(previousName ? [previousName] : [])]);
  };

  const removePiece = (uid, section, piece) => {
    if (checked) return;
    setBoxes(
      boxes.map((b) => {
        if (b.uid !== uid) return b;
        if (section === "name") return { ...b, name: null };
        return { ...b, [section]: b[section].filter((it) => it.id !== piece.id) };
      })
    );
    setBank([...bank, originalPiece(piece.id)]);
  };

  const toggleVisibility = (uid, section, id) => {
    if (checked) return;
    const order = ["+", "-", "#"];
    setBoxes(
      boxes.map((b) =>
        b.uid !== uid
          ? b
          : {
              ...b,
              [section]: b[section].map((it) =>
                it.id === id
                  ? { ...it, currentVis: order[(order.indexOf(it.currentVis) + 1) % order.length] }
                  : it
              ),
            }
      )
    );
  };

  // --- Drag and drop: relationships and multiplicity (between neighbouring boxes) ---
  const patchLink = (key, patch) =>
    setLinks({ ...links, [key]: { ...(links[key] || emptyLink), ...patch } });

  const dropLink = (e, key, field, dataKey) => {
    e.preventDefault();
    setDragOver(null);
    if (checked) return;
    const value = e.dataTransfer.getData(dataKey);
    if (!value) return;
    patchLink(key, { [field]: value });
  };

  const clearLinkField = (key, field) => {
    if (checked) return;
    patchLink(key, { [field]: null });
  };

  const flipLink = (key) => {
    if (checked) return;
    patchLink(key, { flipped: !(links[key] || emptyLink).flipped });
  };

  const allowDrop = (e, key) => {
    if (checked) return;
    e.preventDefault();
    setDragOver(key);
  };

  // --- Check / next ---
  const handleCheck = () => {
    const g = grade(scenario, boxes, links);
    setResults((prev) => ({ ...prev, [index]: { satisfied: g.satisfied, total: g.total } }));
    setChecked(true);
  };

  const handleNext = () => {
    if (index < CDC_SCENARIOS.length - 1) goToScenario(index + 1);
    else setFinished(true);
  };

  const restartAll = () => {
    setResults({});
    setFinished(false);
    goToScenario(0);
  };

  // --- Rendering helpers ---
  // Wrong boxes get a red outline, correct ones get a green outline.
  // Boxes the learner did not use (null / undefined) get nothing.
  const mark = (flag) => (flag === false ? "cds-wrong" : flag === true ? "cds-right" : "");

  const renderItems = (box, section) =>
    box[section].map((item) => (
      <div key={item.id} className={`cds-item ${mark(graded?.itemOk[item.id])}`}>
        <span className="cds-vis" onClick={() => toggleVisibility(box.uid, section, item.id)}>
          {item.currentVis}
        </span>
        <span className="cds-item-text" onClick={() => removePiece(box.uid, section, item)}>
          {item.text}
        </span>
      </div>
    ));

  // One drop zone for a relationship line or a multiplicity
  const renderZone = (key, field, dataKey, placeholder, extraClass = "") => {
    const link = links[key] || emptyLink;
    const value = link[field];
    const zoneKey = `${key}-${field}`;
    return (
      <div
        className={[
          "cds-zone",
          extraClass,
          value ? "filled" : "",
          dragOver === zoneKey ? "over" : "",
          mark(graded?.conn[key]?.[field]),
        ].filter(Boolean).join(" ")}
        onDragOver={(e) => allowDrop(e, zoneKey)}
        onDragLeave={() => setDragOver(null)}
        onDrop={(e) => dropLink(e, key, field, dataKey)}
        onClick={() => clearLinkField(key, field)}
      >
        {value ? (field === "rel" ? <RelSymbol type={value} flipped={link.flipped} /> : value) : placeholder}
      </div>
    );
  };

  // The connector that sits BETWEEN two neighbouring boxes:
  // multiplicity near the left box, the relationship on the line, multiplicity near the right box
  const renderConnector = (i) => {
    const key = `${boxes[i].uid}-${boxes[i + 1].uid}`;
    const link = links[key] || emptyLink;
    return (
      <div className="cds-connector">
        <div className="cds-conn-mults">
          {renderZone(key, "multL", "multiplicity_type", "Mult", "cds-zone-mult")}
          {renderZone(key, "multR", "multiplicity_type", "Mult", "cds-zone-mult")}
        </div>
        {renderZone(key, "rel", "relationship_type", "Drop line", "cds-zone-rel")}
        {link.rel && !checked && (
          <button type="button" className="cds-flip" onClick={() => flipLink(key)} aria-label="Flip the symbol to the other end">
            ⇄
          </button>
        )}
      </div>
    );
  };

  const renderBox = (box, i) => (
    <div className="cds-class-box" key={`box-${box.uid}`}>
      <span className="cds-box-number">Box {i + 1}</span>
      {!checked && (
        <span className="cds-box-controls">
          <button type="button" onClick={() => moveBox(i, -1)} disabled={i === 0} aria-label="Move box left">◀</button>
          <button type="button" onClick={() => moveBox(i, 1)} disabled={i === boxes.length - 1} aria-label="Move box right">▶</button>
          <button type="button" onClick={() => removeBox(box.uid)} aria-label="Remove box">✕</button>
        </span>
      )}
      <div
        className={[
          "cds-class-header",
          dragOver === `${box.uid}-name` ? "over" : "",
          mark(graded?.names[i]),
        ].filter(Boolean).join(" ")}
        onDragOver={(e) => allowDrop(e, `${box.uid}-name`)}
        onDragLeave={() => setDragOver(null)}
        onDrop={(e) => dropPiece(e, box.uid, "name")}
      >
        {box.name ? (
          <span className="cds-class-name" onClick={() => removePiece(box.uid, "name", box.name)}>
            {box.name.text}
          </span>
        ) : (
          <span className="cds-placeholder">Drop class name</span>
        )}
      </div>
      {["attrs", "methods"].map((section) => (
        <div
          key={section}
          className={`cds-section ${dragOver === `${box.uid}-${section}` ? "over" : ""}`}
          onDragOver={(e) => allowDrop(e, `${box.uid}-${section}`)}
          onDragLeave={() => setDragOver(null)}
          onDrop={(e) => dropPiece(e, box.uid, section)}
        >
          <span className="cds-section-label">
            {section === "attrs" ? "Attributes" : "Methods"}
          </span>
          {renderItems(box, section)}
        </div>
      ))}
    </div>
  );

  const renderDiagram = () => {
    if (boxes.length === 0) {
      return (
        <div className="cds-empty">
          <p>Your diagram is empty.</p>
          <p className="cds-muted">
            Press <strong>+ Add class box</strong> for each class you need, then fill the boxes.
          </p>
        </div>
      );
    }
    return (
      <div className="cds-diagram-row">
        {boxes.map((box, i) => (
          <Fragment key={box.uid}>
            {renderBox(box, i)}
            {i < boxes.length - 1 && renderConnector(i)}
          </Fragment>
        ))}
      </div>
    );
  };

  const percentOf = (r) => Math.round((r.satisfied / r.total) * 100);

  return (
    <div className="dashboard-layout">
      {/* ===== Sidebar ===== */}
      <aside className="sidebar">
        <h2 className="sidebar-brand">ClassCraft</h2>
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")} end>Dashboard</NavLink>
          <NavLink to="/learn-basics" className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}>Learn the Basics</NavLink>
          <NavLink to="/skill-development" className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}>Skill Development</NavLink>
          <NavLink to="/class-diagram-construction" className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}>Class Diagram Construction</NavLink>
        </nav>
      </aside>

      <main className="cds-page">
        {/* ===== Results ===== */}
        {finished ? (
          <section className="cds-results">
            <h1>All scenarios complete</h1>
            <p className="cds-muted">
              Target: at least {TARGET_PERCENT}% of the required diagram elements modeled correctly in each scenario.
            </p>
            <ul className="cds-result-list">
              {CDC_SCENARIOS.map((s, i) => {
                const r = results[i];
                const pct = r ? percentOf(r) : 0;
                return (
                  <li key={s.id}>
                    <span>{s.title}</span>
                    <span className={pct >= TARGET_PERCENT ? "cds-pass" : "cds-fail"}>
                      {pct}% · {pct >= TARGET_PERCENT ? "Target met" : "Keep practicing"}
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="cds-actions">
              <button className="cds-btn cds-btn-primary" onClick={restartAll}>Try again</button>
              <button className="cds-btn" onClick={() => navigate("/class-diagram-construction")}>Back</button>
            </div>
          </section>
        ) : (
          <>
            {/* ===== Header ===== */}
            <div className="cds-top">
              <div className="cds-breadcrumb">
                <span className="cds-breadcrumb-link" onClick={() => navigate("/class-diagram-construction")}>
                  Class Diagram Construction
                </span>
                <span className="cds-breadcrumb-sep">&rsaquo;</span>
                <span>Scenario</span>
              </div>
              <div className="cds-counter">Scenario {index + 1} of {CDC_SCENARIOS.length}</div>
            </div>

            <h1 className="cds-title">{scenario.title}</h1>
            <p className="cds-scenario">
              <strong>Scenario:</strong> {scenario.scenario}
            </p>
            <div className="cds-meta">
              <span>
                <strong>OOP pillars:</strong>{" "}
                {scenario.pillars.map((p) => (
                  <span key={p} className="cds-chip">{p}</span>
                ))}
              </span>
              <span className="cds-muted">
                Signs: <code>+</code> public · <code>-</code> private · <code>#</code> protected. Click a sign to change it.
                Add a box for each class. Drop a relationship line and its multiplicities in the connector between two
                neighbouring boxes. Use ◀ ▶ to reorder boxes and ⇄ to move the symbol to the other end.
              </span>
            </div>

            <div className="cds-workspace">
              {/* ===== Diagram ===== */}
              <div className="cds-diagram-col">
                <div className="cds-toolbar">
                  <button
                    type="button"
                    className="cds-btn cds-btn-primary"
                    onClick={addBox}
                    disabled={checked || boxes.length >= MAX_BOXES}
                  >
                    + Add class box
                  </button>
                  <span className="cds-muted">{boxes.length} / {MAX_BOXES} boxes</span>
                </div>
                <div className="cds-diagram">{renderDiagram()}</div>
              </div>

              {/* ===== Banks ===== */}
              <div className="cds-bank-col">
                <h3 className="cds-subtitle">Pieces</h3>
                <div className="cds-bank" onDragOver={(e) => e.preventDefault()}>
                  {bank.length === 0 ? (
                    <p className="cds-muted">All pieces have been placed.</p>
                  ) : (
                    bank.map((piece) => (
                      <div
                        key={piece.id}
                        className="cds-piece"
                        draggable={!checked}
                        onDragStart={(e) => e.dataTransfer.setData("piece", piece.id)}
                      >
                        {piece.text}
                      </div>
                    ))
                  )}
                </div>

                <h3 className="cds-subtitle">Relationship lines</h3>
                <div className="cds-tools">
                  {RELATIONSHIPS.map((r) => (
                    <div
                      key={r}
                      className="cds-tool"
                      draggable={!checked}
                      onDragStart={(e) => e.dataTransfer.setData("relationship_type", r)}
                    >
                      <RelSymbol type={r} />
                    </div>
                  ))}
                </div>

                <h3 className="cds-subtitle">Multiplicity</h3>
                <div className="cds-tools">
                  {MULTIPLICITIES.map((m) => (
                    <div
                      key={m}
                      className="cds-tool"
                      draggable={!checked}
                      onDragStart={(e) => e.dataTransfer.setData("multiplicity_type", m)}
                    >
                      {m}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ===== Actions ===== */}
            <div className="cds-action-bar">
              {checked ? (
                <>
                  <span className="cds-note">
                    Answer checked. Green boxes are correct. Boxes outlined in red need another look.
                  </span>
                  <button className="cds-btn cds-btn-primary" onClick={handleNext}>
                    {index === CDC_SCENARIOS.length - 1 ? "Finish" : "Next Scenario →"}
                  </button>
                </>
              ) : (
                <>
                  <button className="cds-btn" onClick={() => resetBoard(scenario)}>Reset</button>
                  <button
                    className="cds-btn cds-btn-primary"
                    onClick={handleCheck}
                    disabled={boxes.length === 0}
                  >
                    Check Answer
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}