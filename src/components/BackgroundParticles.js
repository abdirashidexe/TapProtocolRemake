"use client";

import { useMemo } from "react";
import styles from "./BackgroundParticles.module.css";

const FLOAT_EMOJIS = ["✨", "⭐", "💫", "🪙", "💜", "💖", "🔮", "⚡"];
const FLOAT_SHAPES = ["dot", "dot", "dot", "ring", "star"];

function createParticles(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    kind: Math.random() > 0.45 ? "emoji" : "shape",
    glyph: FLOAT_EMOJIS[i % FLOAT_EMOJIS.length],
    shape: FLOAT_SHAPES[i % FLOAT_SHAPES.length],
    left: Math.random() * 100,
    size: 0.6 + Math.random() * 1.4,
    duration: 12 + Math.random() * 18,
    delay: Math.random() * -20,
    drift: -30 + Math.random() * 60,
    hue: Math.floor(Math.random() * 360),
  }));
}

export default function BackgroundParticles() {
  const particles = useMemo(() => createParticles(32), []);

  return (
    <div className={styles.field} aria-hidden="true">
      {particles.map((p) =>
        p.kind === "emoji" ? (
          <span
            key={p.id}
            className={styles.emojiParticle}
            style={{
              left: `${p.left}%`,
              fontSize: `${p.size}rem`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              "--drift": `${p.drift}px`,
            }}
          >
            {p.glyph}
          </span>
        ) : (
          <span
            key={p.id}
            className={`${styles.shapeParticle} ${styles[p.shape]}`}
            style={{
              left: `${p.left}%`,
              width: `${p.size * 10}px`,
              height: `${p.size * 10}px`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              "--drift": `${p.drift}px`,
              "--hue": p.hue,
            }}
          />
        ),
      )}
    </div>
  );
}
