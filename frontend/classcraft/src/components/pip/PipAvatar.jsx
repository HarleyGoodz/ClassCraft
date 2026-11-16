/*
 * PipAvatar.jsx: a canvas with 3D Pip in it.
 * Purpose: wraps pipModel.js so React components can show and animate Pip.
 * What it does: loads Three.js only when Pip first appears (so it isn't in the main bundle),
 * builds the scene, and hands the controller to the parent through onReady.
 */
import { useEffect, useRef } from "react";

export default function PipAvatar({ onReady, className = "" }) {
  const canvasRef = useRef(null);
  const onReadyRef = useRef(onReady);
  useEffect(() => { onReadyRef.current = onReady; }, [onReady]);

  useEffect(() => {
    let pip = null;
    let cancelled = false;
    const canvas = canvasRef.current;

    import("./pipModel.js").then(({ createPipScene }) => {
      if (cancelled || !canvas) return;
      try {
        pip = createPipScene(canvas);
        onReadyRef.current?.(pip);
      } catch (error) {
        // No WebGL: the dialogue still works, Pip just isn't drawn.
        console.warn("Pip could not be drawn:", error);
      }
    });

    const observer = new ResizeObserver(() => pip?.resize());
    observer.observe(canvas);

    return () => {
      cancelled = true;
      observer.disconnect();
      onReadyRef.current?.(null);
      pip?.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className={`pip-avatar ${className}`} aria-hidden="true" />;
}
