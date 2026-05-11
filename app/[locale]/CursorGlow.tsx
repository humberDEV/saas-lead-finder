"use client";

import { useEffect, useRef } from "react";

export default function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;
    let rafId: number;

    const onMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const loop = () => {
      // Smooth lerp — feels like the glow "floats" behind the cursor
      currentX += (targetX - currentX) * 0.07;
      currentY += (targetY - currentY) * 0.07;

      if (ref.current) {
        ref.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      }

      rafId = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    rafId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-20 will-change-transform hidden md:block"
      style={{
        width: 640,
        height: 640,
        marginLeft: -320,
        marginTop: -320,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(99,102,241,0.07) 0%, rgba(99,102,241,0.025) 35%, transparent 65%)",
      }}
    />
  );
}
