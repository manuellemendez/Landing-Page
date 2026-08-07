import { useEffect, useRef, useState } from "react";

const characterMessages = [
  "Good to meet you. I keep the details calibrated.",
  "Built from geometry, light, and a little patience.",
  "Manuel handles the product. I handle the perimeter.",
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export default function HeroCharacter() {
  const characterRef = useRef(null);
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const resetTimeoutRef = useRef(null);
  const messageIndexRef = useRef(0);
  const pendingWaveRef = useRef(false);
  const [message, setMessage] = useState("Hi, I’m M-01. I keep watch around here.");
  const [renderState, setRenderState] = useState("loading");

  useEffect(() => {
    const character = characterRef.current;
    const canvas = canvasRef.current;
    const hero = character?.closest(".hero");
    if (!character || !canvas || !hero) return undefined;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let isCancelled = false;

    const showContextMessage = (event) => {
      const target = event.target.closest?.("[data-companion-message]");
      if (target) setMessage(target.dataset.companionMessage);
    };

    const clearContextMessage = (event) => {
      const target = event.target.closest?.("[data-companion-message]");
      const nextTarget = event.relatedTarget?.closest?.("[data-companion-message]");
      if (target && target !== nextTarget) setMessage("Standing by. The details look good.");
    };

    const handlePointerMove = (event) => {
      if (motionQuery.matches || !finePointer.matches) return;
      const bounds = character.getBoundingClientRect();
      const x = clamp(
        (event.clientX - (bounds.left + bounds.width / 2)) / (window.innerWidth * 0.32),
        -1,
        1,
      );
      const y = clamp(
        (event.clientY - (bounds.top + bounds.height * 0.38)) / (window.innerHeight * 0.38),
        -1,
        1,
      );
      sceneRef.current?.setLook(x, y);
    };

    const resetLook = () => sceneRef.current?.setLook(0, 0);

    hero.addEventListener("pointermove", handlePointerMove);
    hero.addEventListener("pointerleave", resetLook);
    hero.addEventListener("pointerover", showContextMessage);
    hero.addEventListener("pointerout", clearContextMessage);
    hero.addEventListener("focusin", showContextMessage);
    hero.addEventListener("focusout", clearContextMessage);

    import("./HeroCharacterScene.js")
      .then(({ mountCompanionScene }) => {
        if (isCancelled) return;
        sceneRef.current = mountCompanionScene({ canvas, container: character, motionQuery });
        setRenderState("ready");
        if (pendingWaveRef.current) {
          sceneRef.current.wave();
          pendingWaveRef.current = false;
        }
      })
      .catch(() => {
        if (!isCancelled) setRenderState("fallback");
      });

    return () => {
      isCancelled = true;
      sceneRef.current?.dispose();
      sceneRef.current = null;
      hero.removeEventListener("pointermove", handlePointerMove);
      hero.removeEventListener("pointerleave", resetLook);
      hero.removeEventListener("pointerover", showContextMessage);
      hero.removeEventListener("pointerout", clearContextMessage);
      hero.removeEventListener("focusin", showContextMessage);
      hero.removeEventListener("focusout", clearContextMessage);
    };
  }, []);

  useEffect(
    () => () => {
      if (resetTimeoutRef.current) window.clearTimeout(resetTimeoutRef.current);
    },
    [],
  );

  const greetVisitor = () => {
    const nextMessage = characterMessages[messageIndexRef.current];
    messageIndexRef.current = (messageIndexRef.current + 1) % characterMessages.length;
    setMessage(nextMessage);

    if (sceneRef.current) sceneRef.current.wave();
    else pendingWaveRef.current = true;

    if (resetTimeoutRef.current) window.clearTimeout(resetTimeoutRef.current);
    resetTimeoutRef.current = window.setTimeout(() => {
      setMessage("Standing by. The details look good.");
    }, 2800);
  };

  return (
    <figure className="hero-character-wrap reveal">
      <div className="character-callout" aria-hidden="true">
        <span className="character-callout-label">Field unit / M-01</span>
        <span className="character-callout-message">{message}</span>
      </div>

      <button
        className="hero-character"
        type="button"
        data-render-state={renderState}
        onClick={greetVisitor}
        onPointerEnter={() => setMessage("Visual lock confirmed. Say hello.")}
        onPointerLeave={() => setMessage("Standing by. The details look good.")}
        onFocus={() => setMessage("Press enter and I’ll report in.")}
        onBlur={() => setMessage("Standing by. The details look good.")}
        aria-label="Interactive 3D portfolio companion. Activate to make M-01 wave."
        ref={characterRef}
      >
        <canvas className="character-canvas" ref={canvasRef} aria-hidden="true" />
        <span className="character-fallback" aria-hidden="true">
          <span className="character-fallback-eye" />
          <span className="character-fallback-eye" />
        </span>
        <span className="character-input" aria-hidden="true">
          <span className="character-input-pointer">Tracking / active</span>
          <span className="character-input-touch">Touch / active</span>
        </span>
        <span className="character-model-label" aria-hidden="true">Three.js / M-01</span>
        <span className="character-instruction" aria-hidden="true">Tap to interact ↗</span>
      </button>

      <figcaption className="availability-card">
        <span className="availability-dot" aria-hidden="true" />
        <span className="availability-copy">
          <span className="availability-copy-long">Available for the right team</span>
          <span className="availability-copy-short">Available</span>
        </span>
      </figcaption>
    </figure>
  );
}
