/*
 * AuthLayout.jsx: the shared layout around the sign-in pages.
 * Purpose: shows the ClassCraft panel beside the login, register and password forms.
 * What it does: draws the draggable class diagram, the Construct/Relate/Model tiles and the
 * legend, then renders the current form through <Outlet />.
 */
import { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";

const NODE_W = 172;
const NODE_H = 112;

const CLASSES = [
  { id: "learner", name: "Learner", attr: "- name : String", method: "+ practice() : void", x: 0, y: 0.08 },
  { id: "diagram", name: "ClassDiagram", attr: "- classes : List", method: "+ validate() : Score", x: 1, y: 0 },
  { id: "relationship", name: "Relationship", attr: "- kind : Type", method: "+ connect() : void", x: 0.5, y: 1 },
];

const LINKS = [
  { from: "learner", to: "diagram", fromLabel: "1", toLabel: "0..*", marker: "none" },
  { from: "diagram", to: "relationship", fromLabel: "1", toLabel: "1..*", marker: "diamond" },
];

const STEPS = [
  { id: "construct", title: "Construct", detail: "+ new() : Class" },
  { id: "relate", title: "Relate", detail: "1 ◆── 0..*" },
  { id: "model", title: "Model", detail: "scenario → diagram" },
];

// Where the line from a box's centre towards (tx, ty) leaves that box.
function edgePoint(cx, cy, tx, ty) {
  const dx = tx - cx;
  const dy = ty - cy;
  if (dx === 0 && dy === 0) return { x: cx, y: cy };
  const scale = Math.min(
    dx === 0 ? Infinity : NODE_W / 2 / Math.abs(dx),
    dy === 0 ? Infinity : NODE_H / 2 / Math.abs(dy)
  );
  return { x: cx + dx * scale, y: cy + dy * scale };
}

function DiagramLink({ link, positions }) {
  const a = positions[link.from];
  const b = positions[link.to];
  const ax = a.left + NODE_W / 2;
  const ay = a.top + NODE_H / 2;
  const bx = b.left + NODE_W / 2;
  const by = b.top + NODE_H / 2;
  const start = edgePoint(ax, ay, bx, by);
  const end = edgePoint(bx, by, ax, ay);
  const length = Math.hypot(end.x - start.x, end.y - start.y);
  if (length < 6) return null;

  const ux = (end.x - start.x) / length;
  const uy = (end.y - start.y) / length;
  const angle = (Math.atan2(uy, ux) * 180) / Math.PI;
  const d = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
  const beam = 34;

  return (
    <g className="cc-hero-link">
      <path className="cc-hero-link-track" d={d} />
      <path
        className="cc-hero-link-beam"
        d={d}
        strokeDasharray={`${beam} ${length}`}
        style={{ "--beam-travel": -(length + beam) }}
      />
      {link.marker === "diamond" && (
        <polygon
          className="cc-hero-link-diamond"
          points="0,0 9,-5 18,0 9,5"
          transform={`translate(${start.x} ${start.y}) rotate(${angle})`}
        />
      )}
      <text className="cc-hero-link-label" x={start.x + ux * 24 - uy * 10} y={start.y + uy * 24 + ux * 10 + 4}>
        {link.fromLabel}
      </text>
      <text className="cc-hero-link-label" x={end.x - ux * 22 - uy * 10} y={end.y - uy * 22 + ux * 10 + 4}>
        {link.toLabel}
      </text>
    </g>
  );
}

// A small class diagram visitors can pull apart. Purely decorative, so it stays
// out of the tab order and away from screen readers.
function PlaygroundDiagram({ focus }) {
  const canvasRef = useRef(null);
  const dragRef = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [dragging, setDragging] = useState(null);
  const [spots, setSpots] = useState(() =>
    Object.fromEntries(CLASSES.map((item) => [item.id, { x: item.x, y: item.y }]))
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const observer = new ResizeObserver(() => {
      setSize({ w: canvas.clientWidth, h: canvas.clientHeight });
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  const freeW = Math.max(size.w - NODE_W, 1);
  const freeH = Math.max(size.h - NODE_H, 1);
  const positions = Object.fromEntries(
    CLASSES.map((item) => [
      item.id,
      { left: spots[item.id].x * freeW, top: spots[item.id].y * freeH },
    ])
  );

  function startDrag(event, id) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      id,
      offsetX: event.clientX - positions[id].left,
      offsetY: event.clientY - positions[id].top,
    };
    setDragging(id);
  }

  function moveDrag(event) {
    const drag = dragRef.current;
    if (!drag) return;
    const left = Math.min(Math.max(event.clientX - drag.offsetX, 0), freeW);
    const top = Math.min(Math.max(event.clientY - drag.offsetY, 0), freeH);
    setSpots((current) => ({ ...current, [drag.id]: { x: left / freeW, y: top / freeH } }));
  }

  function endDrag() {
    dragRef.current = null;
    setDragging(null);
  }

  return (
    <div ref={canvasRef} className="cc-hero-canvas" data-focus={focus ?? undefined} aria-hidden="true">
      {size.w > 0 && (
        <>
          <svg className="cc-hero-lines" width={size.w} height={size.h}>
            {LINKS.map((link) => (
              <DiagramLink key={link.from + link.to} link={link} positions={positions} />
            ))}
          </svg>
          {CLASSES.map((item) => (
            <div
              key={item.id}
              className={`cc-hero-node${dragging === item.id ? " is-dragging" : ""}`}
              style={{ left: positions[item.id].left, top: positions[item.id].top }}
              onPointerDown={(event) => startDrag(event, item.id)}
              onPointerMove={moveDrag}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            >
              <div className="cc-hero-node-name">{item.name}</div>
              <div className="cc-hero-node-row">{item.attr}</div>
              <div className="cc-hero-node-row">{item.method}</div>
            </div>
          ))}
        </>
      )}
      <span className="cc-hero-hint">drag a class to rearrange</span>
    </div>
  );
}

function AuthHero() {
  const [focus, setFocus] = useState(null);

  return (
    <section className="cc-hero">
      <div className="cc-hero-brand">
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
          <rect x="2" y="2" width="26" height="26" stroke="currentColor" strokeWidth="2" />
          <path d="M2 10h26M7 16h10M7 21h14" stroke="currentColor" strokeWidth="2" />
        </svg>
        <span>ClassCraft</span>
      </div>
      <h2 className="cc-hero-title">
        Don&rsquo;t memorize OOP. <span>Model it.</span>
      </h2>
      <p className="cc-hero-copy">
        Build class diagrams from scratch, one relationship at a time. Guided
        practice first, then you are on your own.
      </p>

      <PlaygroundDiagram focus={focus} />

      <ul className="cc-hero-steps" onPointerLeave={() => setFocus(null)} aria-label="How ClassCraft works">
        {STEPS.map((step, index) => (
          <li
            key={step.id}
            className={focus === step.id ? "cc-hero-step is-active" : "cc-hero-step"}
            onPointerEnter={() => setFocus(step.id)}
          >
            <span className="cc-hero-step-number">0{index + 1}</span>
            <strong>{step.title}</strong>
            <span className="cc-hero-step-detail">{step.detail}</span>
          </li>
        ))}
      </ul>
      <p className="cc-hero-legend">+ public &nbsp; - private &nbsp; # protected &nbsp; ~ package</p>
    </section>
  );
}

// Wraps the sign-in pages so each form sits beside the same hero.
export default function AuthLayout() {
  return (
    <div className="cc-auth-stage">
      <AuthHero />
      <Outlet />
    </div>
  );
}
