/*
 * Connector drawing adapted from "Klyv Animated Beam" (21st.dev, klyv-ui).
 *
 * MIT License
 *
 * Copyright (c) 2026 Klyv contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/*
 * DiagramConnectors.jsx: the interactive diagram effects used across the app.
 * Purpose: makes the pages feel like a live class diagram. It only adds visuals.
 * What it does: moves the background grid glow and the card spotlight with the cursor, and
 * draws animated association lines between the cards in a grid.
 */
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";

// Grids whose cards get joined by association lines, like classes on a diagram.
const GRID_SELECTOR = ".summary-grid, .topic-grid, .experience-grid";
const CARD_SELECTOR = ".summary-grid > *, .topic-grid > *, .experience-grid > *";
// Surfaces that catch the light of the cursor.
const SPOTLIGHT_SELECTOR =
  ".summary-card, .topic-button, .experience-card, .cdc-hero-panel, .progress-table-wrapper, .simple-auth-form";
const MIN_GAP = 8;
const BEAM_LENGTH = 26;

function buildLink(from, to, fromBox, toBox) {
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;
  const sameRow = Math.abs(fromBox.top - toBox.top) < 4;
  const gap = sameRow ? toBox.left - fromBox.right : toBox.top - fromBox.bottom;
  if (gap < MIN_GAP) return null;

  const x1 = (sameRow ? fromBox.right : fromBox.left + fromBox.width / 2) + scrollX;
  const y1 = (sameRow ? fromBox.top + fromBox.height / 2 : fromBox.bottom) + scrollY;
  const x2 = (sameRow ? toBox.left : toBox.left + toBox.width / 2) + scrollX;
  const y2 = (sameRow ? toBox.top + toBox.height / 2 : toBox.top) + scrollY;

  return {
    from,
    to,
    sameRow,
    x1,
    y1,
    d: `M ${x1} ${y1} L ${x2} ${y2}`,
    length: Math.round(Math.hypot(x2 - x1, y2 - y1)),
  };
}

// Joins each card to its right-hand neighbour, and each row to the next one.
function measureLinks() {
  const links = [];
  document.querySelectorAll(GRID_SELECTOR).forEach((grid) => {
    const cards = [...grid.children];
    const boxes = cards.map((card) => card.getBoundingClientRect());
    let rowStart = 0;
    cards.forEach((card, index) => {
      if (index === 0) return;
      const sameRow = Math.abs(boxes[index].top - boxes[index - 1].top) < 4;
      const link = sameRow
        ? buildLink(cards[index - 1], card, boxes[index - 1], boxes[index])
        : buildLink(cards[rowStart], card, boxes[rowStart], boxes[index]);
      if (link) links.push(link);
      if (!sameRow) rowStart = index;
    });
  });
  return links;
}

function diamondAt({ x1, y1, sameRow }) {
  const long = 7;
  const short = 4;
  return sameRow
    ? `${x1},${y1} ${x1 + long},${y1 - short} ${x1 + long * 2},${y1} ${x1 + long},${y1 + short}`
    : `${x1},${y1} ${x1 + short},${y1 + long} ${x1},${y1 + long * 2} ${x1 - short},${y1 + long}`;
}

export default function DiagramConnectors() {
  const location = useLocation();
  const [links, setLinks] = useState([]);
  const [activeCard, setActiveCard] = useState(null);
  const signature = useRef("");

  // Keep the lines attached to the real cards through any layout change.
  useEffect(() => {
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = measureLinks();
        const nextSignature = next.map((link) => link.d).join("|");
        if (nextSignature === signature.current) return;
        signature.current = nextSignature;
        setLinks(next);
      });
    };

    schedule();
    const root = document.getElementById("root");
    const mutations = new MutationObserver(schedule);
    mutations.observe(root, { childList: true, subtree: true });
    const resizes = new ResizeObserver(schedule);
    resizes.observe(root);
    window.addEventListener("resize", schedule);
    document.fonts?.ready.then(schedule);

    return () => {
      cancelAnimationFrame(frame);
      mutations.disconnect();
      resizes.disconnect();
      window.removeEventListener("resize", schedule);
    };
  }, [location.pathname]);

  // One delegated listener drives the grid glow, card spotlights and active lines.
  useEffect(() => {
    let frame = 0;
    let latest = null;
    const paint = () => {
      frame = 0;
      if (!latest) return;
      const { clientX, clientY, target } = latest;
      document.documentElement.style.setProperty("--cc-cursor-x", `${clientX}px`);
      document.documentElement.style.setProperty("--cc-cursor-y", `${clientY}px`);
      const surface = target.closest?.(SPOTLIGHT_SELECTOR);
      if (surface) {
        const box = surface.getBoundingClientRect();
        surface.style.setProperty("--cc-mx", `${clientX - box.left}px`);
        surface.style.setProperty("--cc-my", `${clientY - box.top}px`);
      }
    };
    const onPointerMove = (event) => {
      latest = event;
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const pickCard = (event) => setActiveCard(event.target.closest?.(CARD_SELECTOR) ?? null);

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerover", pickCard);
    document.addEventListener("focusin", pickCard);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerover", pickCard);
      document.removeEventListener("focusin", pickCard);
    };
  }, []);

  return (
    <>
      <div className="cc-grid-glow" aria-hidden="true" />
      {links.length > 0 && createPortal(
        <svg className="cc-connectors" aria-hidden="true" width="1" height="1">
          {links.map((link) => {
            const active = activeCard === link.from || activeCard === link.to;
            const lap = link.length + BEAM_LENGTH;
            return (
              <g key={link.d} className={active ? "cc-link is-active" : "cc-link"}>
                <path className="cc-link-track" d={link.d} />
                {active && (
                  <path
                    className="cc-link-beam"
                    d={link.d}
                    strokeDasharray={`${BEAM_LENGTH} ${link.length}`}
                    style={{ "--beam-travel": -lap }}
                  />
                )}
                <polygon className="cc-link-diamond" points={diamondAt(link)} />
              </g>
            );
          })}
        </svg>,
        document.body
      )}
    </>
  );
}
