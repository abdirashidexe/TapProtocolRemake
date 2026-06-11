"use client";

import styles from "./VfxLayer.module.css";

export default function VfxLayer({ effects }) {
  return (
    <div className={styles.layer} aria-hidden="true">
      {effects.map((effect) => {
        if (effect.type === "particle") {
          return (
            <span
              key={effect.id}
              className={styles.particle}
              style={{
                left: `${effect.x}%`,
                top: `${effect.y}%`,
                "--dx": `${effect.dx}px`,
                "--dy": `${effect.dy}px`,
                "--delay": `${effect.delay}ms`,
                "--hue": effect.hue,
              }}
            />
          );
        }

        return (
          <span
            key={effect.id}
            className={styles[effect.type]}
            style={{
              left: `${effect.x}%`,
              top: `${effect.y}%`,
              "--delay": `${effect.delay ?? 0}ms`,
            }}
          >
            {effect.text}
          </span>
        );
      })}
    </div>
  );
}
