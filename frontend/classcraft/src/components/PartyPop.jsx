/*
 * PartyPop.jsx: the celebration shown when a student's answer is correct.
 * Purpose: rewards a correct "Check answers" with confetti, a popper sound and a message.
 * What it does: while `active` is true, confetti shoots from both bottom corners, a "pop" and
 * a chime play, and a message appears in the middle of the screen. It calls onDone when the
 * celebration is over (about 3 seconds), so the page can set `active` back to false.
 * If the student has "reduce motion" turned on, the confetti is skipped but the message and
 * sound still play.
 *
 * Usage: <PartyPop active={celebrate} onDone={() => setCelebrate(false)} />
 */
import { useEffect, useRef } from "react";
import { launchConfetti } from "../utils/confetti";
import { playPartyPop } from "../utils/practiceSounds";
import "../css/party_pop_css.css";

export default function PartyPop({ active, message = "You got it right!", onDone }) {
  const canvasRef = useRef(null);
  const onDoneRef = useRef(onDone);
  useEffect(() => { onDoneRef.current = onDone; }, [onDone]);

  useEffect(() => {
    if (!active) return undefined;
    playPartyPop();

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const stopConfetti = !reduced && canvasRef.current ? launchConfetti(canvasRef.current) : null;
    const timer = setTimeout(() => onDoneRef.current?.(), 3200);

    return () => {
      clearTimeout(timer);
      stopConfetti?.();
    };
  }, [active]);

  if (!active) return null;

  return (
    <div className="party-pop" role="status" aria-live="polite">
      <canvas ref={canvasRef} className="party-pop-canvas" aria-hidden="true" />
      <p className="party-pop-message">{message}</p>
    </div>
  );
}