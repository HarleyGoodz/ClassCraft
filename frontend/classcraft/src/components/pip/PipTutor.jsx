
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import PipAvatar from "./PipAvatar";
import { getPipTour } from "../../utils/pipTours";
import { playPipBlip } from "../../utils/soundEffects";
import { supabase } from "../../utils/supabase";
import "../../css/pip_tutor.css";

const SEEN_PREFIX = "classcraft:pip-seen:";
const VOICE_KEY = "classcraft:pip-voice";
const SPOT_PAD = 8;
const ARRIVE_MS = 1000; // keep in step with the .pip-dialog delay in pip_tutor.css

const seenKey = (userId, path) => `${SEEN_PREFIX}${userId}:${path}`;

function storageGet(key) {
  try { return window.localStorage.getItem(key); } catch { return null; }
}
function storageSet(key, value) {
  try { window.localStorage.setItem(key, value); } catch { /* private mode: just don't remember */ }
}

function findTarget(selector) {
  if (!selector) return null;
  try {
    const el = document.querySelector(selector);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return r.width && r.height ? el : null;
  } catch {
    return null;
  }
}

function sameRect(a, b) {
  if (!a || !b) return a === b;
  return a.top === b.top && a.left === b.left && a.width === b.width && a.height === b.height;
}

function OwlIcon() {
  return (
    <svg className="pip-icon" viewBox="0 0 64 64" width="34" height="34" aria-hidden="true">
      {/* Wings sit behind the body; the right one waves when the button is hovered. */}
      <ellipse className="pip-icon-wing pip-icon-wing--left" cx="14" cy="46" rx="5" ry="10" fill="#9C6440" />
      <ellipse className="pip-icon-wing pip-icon-wing--right" cx="50" cy="46" rx="5" ry="10" fill="#9C6440" />
      <g className="pip-icon-hat">
        <path d="M20 22 L31 5 Q35 0 41 3 Q36 5 35 9 L44 22 Z" fill="#6E5CD6" />
        <rect x="10" y="21" width="44" height="4" rx="2" fill="#5B4BB7" />
      </g>
      <circle cx="32" cy="42" r="18" fill="#B97A4F" />
      <ellipse cx="32" cy="48" rx="11" ry="9" fill="#F8E3C4" />
      <circle cx="25" cy="38" r="6" fill="#fff" />
      <circle cx="39" cy="38" r="6" fill="#fff" />
      <circle cx="25.5" cy="38.5" r="3.2" fill="#2B1B14" />
      <circle cx="38.5" cy="38.5" r="3.2" fill="#2B1B14" />
      <path d="M29 44 L35 44 L32 48 Z" fill="#F39A3C" />
    </svg>
  );
}

export default function PipTutor() {
  const { pathname } = useLocation();
  const tour = getPipTour(pathname);

  // The tour belongs to the page it was opened on, so changing page closes it.
  const [activePath, setActivePath] = useState(null);
  const [stepIdx, setStepIdx] = useState(0);
  // How many characters of which step have been typed so far.
  const [typedState, setTypedState] = useState({ step: null, n: 0 });
  const [rect, setRect] = useState(null);
  const [dockTop, setDockTop] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [arrived, setArrived] = useState(false);
  const avatarWrapRef = useRef(null);
  const exitTimerRef = useRef(null);
  const arriveTimerRef = useRef(null);
  const [voiceOn, setVoiceOn] = useState(() => storageGet(VOICE_KEY) !== "off");
  const [userId, setUserId] = useState(null);

  // Follow the signed-in account (sign-up, login, logout, switching accounts).
  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (alive) setUserId(data.session?.user?.id ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, []);

  const pipRef = useRef(null);
  const dialogRef = useRef(null);
  const typeTimerRef = useRef(null);
  const arriveUntilRef = useRef(0);
  const flyInDirRef = useRef(1);
  const voiceRef = useRef(voiceOn);
  useEffect(() => { voiceRef.current = voiceOn; }, [voiceOn]);

  const active = Boolean(tour) && activePath === pathname;
  const step = active ? tour.steps[stepIdx] : null;
  const isLast = tour ? stepIdx === tour.steps.length - 1 : false;
  const typedN = step && typedState.step === step ? typedState.n : 0;
  const typed = step ? step.text.slice(0, typedN) : "";
  const typing = Boolean(step) && typedN < step.text.length;

  // ---- start / stop ----
  function start() {
    if (!tour) return;
    setStepIdx(0);
    setDockTop(false);
    setLeaving(false);
    setActivePath(pathname);
  }

  function finish() {
    clearTimeout(typeTimerRef.current);
    setActivePath(null);
    setRect(null);
    setLeaving(false);
    if (userId) storageSet(seenKey(userId, pathname), "1");
  }

  // Closing the tour: the dialogue fades and Pip flies off into the "Ask Pip" corner, so
  // learners see where to find Pip again. On the last step Pip celebrates first.
  function leaveToCorner({ celebrate = false } = {}) {
    if (leaving) return;
    clearTimeout(typeTimerRef.current);
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const wrap = avatarWrapRef.current;
    if (reduced || !wrap?.animate) {
      finish();
      announceArrival();
      return;
    }

    setLeaving(true);
    const pip = pipRef.current;
    pip?.talk(false);
    pip?.setMood("happy");
    if (celebrate) pip?.cheer();

    exitTimerRef.current = setTimeout(() => {
      // Fly from where Pip is now to the launcher's spot in the bottom-right corner.
      const r = wrap.getBoundingClientRect();
      const dx = window.innerWidth - 16 - 30 - (r.left + r.width / 2);
      const dy = window.innerHeight - 16 - 30 - (r.top + r.height / 2);
      pip?.look(dx > 0 ? 1 : -1);
      pip?.fly(dy < 0 ? 1 : -1, 1);
      const flight = wrap.animate(
        [
          { transform: "none" },
          { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 90}px) scale(0.7)`, offset: 0.4 },
          { transform: `translate(${dx}px, ${dy}px) scale(0.18)`, opacity: 0.6 },
        ],
        { duration: 1000, easing: "ease-in-out", fill: "forwards" }
      );
      flight.onfinish = () => { finish(); announceArrival(); };
    }, celebrate ? 700 : 150);
  }

  function announceArrival() {
    setArrived(true);
    clearTimeout(arriveTimerRef.current);
    arriveTimerRef.current = setTimeout(() => setArrived(false), 2200);
  }

  useEffect(() => () => {
    clearTimeout(exitTimerRef.current);
    clearTimeout(arriveTimerRef.current);
  }, []);

  // Auto-start the page's tour the first time this account opens it. "Seen" is remembered
  // per account, so a newly registered learner always gets the welcome tour on the
  // Dashboard, even on a browser someone else already used.
  useEffect(() => {
    if (!tour || !userId || storageGet(seenKey(userId, pathname))) return undefined;
    const timer = setTimeout(() => { setStepIdx(0); setDockTop(false); setLeaving(false); setActivePath(pathname); }, 700);
    return () => clearTimeout(timer);
  }, [pathname, tour, userId]);

  // ---- typewriter ----
  useEffect(() => {
    if (!step) return undefined;
    const text = step.text;
    let i = 0;
    let mouth = false;
    pipRef.current?.setMood(step.mood || "normal");

    function next() {
      i++;
      setTypedState({ step, n: i });
      const ch = text[i - 1];
      if (ch && ch !== " " && ch !== ".") {
        mouth = !mouth;
        pipRef.current?.talk(mouth);
        if (voiceRef.current && i % 2) playPipBlip();
      } else {
        pipRef.current?.talk(false);
      }
      if (i >= text.length) {
        pipRef.current?.talk(false);
        return;
      }
      const delay = "!?".includes(ch) ? 200 : ch === "." ? 150 : ch === "," ? 100 : 26;
      typeTimerRef.current = setTimeout(next, delay);
    }
    // While Pip is still flying in, hold the first line until the dialogue box has appeared.
    const wait = Math.max(120, arriveUntilRef.current - performance.now() + 150);
    typeTimerRef.current = setTimeout(next, wait);
    return () => clearTimeout(typeTimerRef.current);
  }, [step]);

  // ---- spotlight: scroll the target into view, then follow it every frame ----
  useLayoutEffect(() => {
    if (!step) return undefined;
    const el = findTarget(step.target);
    if (el) {
      const r = el.getBoundingClientRect();
      const fits = r.top >= 70 && r.bottom <= window.innerHeight - 260;
      if (!fits) el.scrollIntoView({ block: "center", behavior: "smooth" });
    }

    let raf;
    function follow() {
      const target = findTarget(step.target);
      let next = null;
      if (target) {
        const r = target.getBoundingClientRect();
        next = {
          top: Math.round(r.top - SPOT_PAD),
          left: Math.round(r.left - SPOT_PAD),
          width: Math.round(r.width + SPOT_PAD * 2),
          height: Math.round(r.height + SPOT_PAD * 2),
        };
      }
      setRect((prev) => (sameRect(prev, next) ? prev : next));
      raf = requestAnimationFrame(follow);
    }
    follow();
    return () => cancelAnimationFrame(raf);
  }, [step]);

  // Pip looks toward the spotlight.
  useEffect(() => {
    if (!pipRef.current) return;
    if (!rect) { pipRef.current.look(0); return; }
    const pipX = 110;
    const cx = rect.left + rect.width / 2;
    pipRef.current.look((cx - pipX) / (window.innerWidth * 0.5));
  }, [rect]);

  // ---- docking: the dialogue sits at the bottom, or flies to the top when the spotlight is
  // low on the screen. Two thresholds stop it flapping back and forth while the page scrolls.
  // With no spotlight it stays where it is.
  if (rect) {
    const center = rect.top + rect.height / 2;
    const wantTop = dockTop ? center > window.innerHeight * 0.45 : center > window.innerHeight * 0.6;
    if (wantTop !== dockTop) setDockTop(wantTop);
  }

  const panelRef = useRef(null);
  const lastDockRef = useRef(null);
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) { lastDockRef.current = null; return undefined; }

    function place(animate) {
      const gap = 16;
      const y = dockTop ? -(window.innerHeight - panel.offsetHeight - gap * 2) : 0;
      panel.style.transition = animate ? "" : "none";
      panel.style.translate = `0 ${Math.min(0, y)}px`;
    }

    // The first placement when the tour opens is instant; later dock changes are a flight.
    const moved = lastDockRef.current !== null && lastDockRef.current !== dockTop;
    place(moved);
    if (moved) pipRef.current?.fly(dockTop ? 1 : -1, 0.6);
    lastDockRef.current = dockTop;

    let lastH = panel.offsetHeight;
    const observer = new ResizeObserver(() => {
      if (panel.offsetHeight !== lastH) { lastH = panel.offsetHeight; place(false); }
    });
    observer.observe(panel);
    const onResize = () => place(false);
    window.addEventListener("resize", onResize);
    return () => { observer.disconnect(); window.removeEventListener("resize", onResize); };
  }, [dockTop, active]);

  // ---- opening: Pip flies out of the "Ask Pip" corner to the dock (runs after the dock
  // effect above, so the panel is already in its final place). The dialogue box fades in
  // when Pip lands (see .pip-dialog in the CSS) and the first line waits for it.
  useLayoutEffect(() => {
    if (!active) return undefined;
    const wrap = avatarWrapRef.current;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !wrap?.animate) return undefined;

    const r = wrap.getBoundingClientRect();
    const dx = window.innerWidth - 16 - 30 - (r.left + r.width / 2);
    const dy = window.innerHeight - 16 - 30 - (r.top + r.height / 2);
    arriveUntilRef.current = performance.now() + ARRIVE_MS;
    flyInDirRef.current = dy > 0 ? 1 : -1; // flying away from the corner
    pipRef.current?.fly(flyInDirRef.current, ARRIVE_MS / 1000);

    const flight = wrap.animate(
      [
        // Take off from the corner, swoosh up in a high arc...
        { transform: `translate(${dx}px, ${dy}px) scale(0.18)`, opacity: 0.6, easing: "ease-out" },
        { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 160}px) scale(0.7)`, opacity: 1, offset: 0.5, easing: "ease-in" },
        // ...swoop down, overshoot a little, and settle.
        { transform: "translate(0, 8px) scale(1.08)", offset: 0.85, easing: "ease-out" },
        { transform: "translate(0, 0) scale(1)" },
      ],
      { duration: ARRIVE_MS }
    );
    return () => flight.cancel();
  }, [active]);

  // Move focus into the dialogue so keyboard users land in it.
  useEffect(() => {
    if (active) dialogRef.current?.focus({ preventScroll: true });
  }, [active]);

  // ---- navigation ----
  function advance() {
    if (!tour || leaving) return;
    if (typing) {
      // First press finishes the line instantly; the next one moves on.
      clearTimeout(typeTimerRef.current);
      setTypedState({ step, n: step.text.length });
      pipRef.current?.talk(false);
      return;
    }
    if (isLast) { leaveToCorner({ celebrate: true }); return; }
    setStepIdx((i) => i + 1);
  }

  function back() { if (!leaving) setStepIdx((i) => Math.max(0, i - 1)); }

  useEffect(() => {
    if (!active || leaving) return undefined;
    function onKey(e) {
      if (e.key === "Escape") { e.preventDefault(); leaveToCorner(); return; }
      if (e.target instanceof HTMLElement && e.target.tagName === "BUTTON" && (e.key === "Enter" || e.key === " ")) return;
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") { e.preventDefault(); advance(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); back(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function toggleVoice() {
    setVoiceOn((on) => {
      storageSet(VOICE_KEY, on ? "off" : "on");
      return !on;
    });
  }

  if (!tour) return null;

  return (
    <>
      {!active && (
        <button type="button" className={`pip-launcher${arrived ? " pip-launcher--arrived" : ""}`} onClick={start} aria-label={`Ask Pip about ${tour.title}`}>
          <OwlIcon />
          <span className="pip-launcher-label">Ask Pip</span>
        </button>
      )}

      {active && step && (
        <div className={`pip-layer${leaving ? " pip-layer--leaving" : ""}`}>
          <div
            className={`pip-backdrop${rect ? " pip-backdrop--clear" : ""}`}
            onClick={advance}
            aria-hidden="true"
          />
          {rect && (
            <div
              className="pip-spotlight"
              style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
              aria-hidden="true"
            />
          )}

          <section
            ref={panelRef}
            className="pip-panel"
            role="dialog"
            aria-modal="true"
            aria-label={`Pip's guide to ${tour.title}`}
          >
            <div className="pip-avatar-wrap" ref={avatarWrapRef}>
              <PipAvatar className="pip-panel-avatar" onReady={(pip) => {
                pipRef.current = pip;
                pip?.setMood(step.mood || "normal");
                // The 3D model can finish loading mid-flight; flap for the rest of it.
                const left = arriveUntilRef.current - performance.now();
                if (left > 100) pip?.fly(flyInDirRef.current, left / 1000);
              }} />
            </div>

            <div
              className="pip-dialog"
              ref={dialogRef}
              tabIndex={-1}
              onClick={advance}
            >
              <div className="pip-dialog-head">
                <span className="pip-name">PIP</span>
                <span className="pip-count">{stepIdx + 1} / {tour.steps.length}</span>
                <button
                  type="button"
                  className="pip-voice"
                  aria-pressed={voiceOn}
                  onClick={(e) => { e.stopPropagation(); toggleVoice(); }}
                >
                  VOICE: {voiceOn ? "ON" : "OFF"}
                </button>
              </div>

              <p className="pip-line" aria-hidden="true">{typed}<span className="pip-caret" hidden={!typing} /></p>
              <p className="pip-sr" aria-live="polite">{step.text}</p>

              <div className="pip-actions" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="pip-btn pip-btn--ghost" onClick={() => leaveToCorner()}>Skip tour</button>
                <span className="pip-actions-spacer" />
                <button type="button" className="pip-btn" onClick={back} disabled={stepIdx === 0}>◀ Back</button>
                <button type="button" className="pip-btn pip-btn--primary" onClick={advance}>
                  {isLast && !typing ? "Got it! ★" : "Next ▶"}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
