"use client";

import { useEffect, useRef } from "react";

const CANVAS_SIZE = 180;

export default function MonsterCanvas({ emoji, isBoss, className }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_SIZE * dpr;
    canvas.height = CANVAS_SIZE * dpr;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.font = `${Math.floor(CANVAS_SIZE * 0.72)}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(emoji, CANVAS_SIZE / 2, CANVAS_SIZE / 2);
  }, [emoji]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      data-boss={isBoss ? "true" : "false"}
      aria-hidden="true"
    />
  );
}
