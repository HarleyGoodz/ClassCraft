import { useEffect, useRef, useState } from "react";

const DRAG_THRESHOLD = 6;

export function usePointerDragDrop() {
  const dragRef = useRef(null);
  const dropHandlerRef = useRef(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const handlePointerMove = (event) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;

      const moved =
        Math.abs(event.clientX - drag.startX) >= DRAG_THRESHOLD ||
        Math.abs(event.clientY - drag.startY) >= DRAG_THRESHOLD;
      if (moved && !drag.started) {
        drag.started = true;
        setPreview({ label: drag.label, x: event.clientX, y: event.clientY });
      } else if (drag.started) {
        setPreview({ label: drag.label, x: event.clientX, y: event.clientY });
      }
    };

    const finishDrag = (event) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;

      if (drag.started) {
        const target = document
          .elementFromPoint(event.clientX, event.clientY)
          ?.closest("[data-drop-target]")
          ?.getAttribute("data-drop-target");
        if (target) dropHandlerRef.current?.(drag.payload, target);
      }

      dragRef.current = null;
      setPreview(null);
    };

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", finishDrag);
    document.addEventListener("pointercancel", finishDrag);
    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", finishDrag);
      document.removeEventListener("pointercancel", finishDrag);
    };
  }, []);

  const startDrag = (event, payload, label, onDrop) => {
    if (event.button !== 0) return;
    dropHandlerRef.current = onDrop;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      payload,
      label,
      started: false,
    };
  };

  const previewElement = preview ? (
    <div
      className="pointer-drag-preview"
      aria-hidden="true"
      style={{ left: preview.x + 12, top: preview.y + 12 }}
    >
      {preview.label}
    </div>
  ) : null;

  return { startDrag, previewElement };
}
