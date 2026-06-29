import { useEffect, useMemo, useRef, useState } from "react";

export default function useALHeroEngine(slides) {
  // ===================================
  // REFS
  // ===================================

  const heroRef = useRef(null);

  const stageRef = useRef(null);

  const glowRef = useRef(null);

  const lightRef = useRef(null);

  const cardElementsRef = useRef([]);

  const cardEntitiesRef = useRef([]);

  // ===================================
  // REACT
  // ===================================

  const [activeSlide, setActiveSlide] = useState(0);

  const [textEntering, setTextEntering] = useState(true);

  // ===================================
  // ENGINE
  // ===================================

  const engine = useRef({
    frame: null,

    mouse: {
      x: 0,
      y: 0,
    },

    target: {
      x: 0,
      y: 0,
    },

    velocity: {
      x: 0,
      y: 0,
    },

    floating: 0,

    currentIndex: 0,

    targetIndex: 0,

    transition: 1,
  });

  // ===================================
  // REGISTER CARD
  // ===================================

  function registerCard(el, index) {
    cardElementsRef.current[index] = el;
  }

  // ===================================
  // CURRENT
  // ===================================

  const [displaySlide, setDisplaySlide] = useState(slides[0]);

  const currentSlide = displaySlide;

  useEffect(() => {
    cardEntitiesRef.current = slides.map((_, index) => ({
      index,

      currentSlot: index,

      targetSlot: index,

      progress: 1,

      arrived: true,

      render: null,
    }));
  }, [slides]);

  // ===================================
  // LAYOUT ROTATION
  // ===================================

  function rotateLayout(direction = 1) {
    const total = SLOT_ORDER.length;

    cardEntitiesRef.current.forEach((entity) => {
      let next = entity.currentSlot - direction;

      if (next >= total) next = 0;

      if (next < 0) next = total - 1;

      entity.targetSlot = next;

      entity.progress = 0;

      entity.arrived = false;
    });

    const nextFront = cardEntitiesRef.current.find((entity) => {
      let next = entity.currentSlot + direction;

      if (next >= total) next = 0;

      if (next < 0) next = total - 1;

      return next === 0;
    });

    if (nextFront) {
      setTextEntering(false);

      setActiveSlide(nextFront.index);
    }
  }

  // ===================================
  // SLOT POSITIONS
  // ===================================

  const SLOT_ORDER = ["front", "right", "farRight", "back", "farLeft", "left"];

  const SLOT_MAP = {
    front: {
      x: 0,
      y: 0,
      z: 260,

      rotateY: 0,

      scale: 1.12,

      blur: 0,

      opacity: 1,

      zIndex: 100,
    },

    right: {
      x: 520,
      y: -30,
      z: -180,

      rotateY: -32,

      scale: 0.88,

      blur: 1.5,

      opacity: 1,

      zIndex: 80,
    },

    left: {
      x: -520,
      y: -30,
      z: -180,

      rotateY: 32,

      scale: 0.88,

      blur: 1.5,

      opacity: 1,

      zIndex: 80,
    },

    farRight: {
      x: 860,
      y: -90,
      z: -700,

      rotateY: -55,

      scale: 0.7,

      blur: 3,

      opacity: 0.45,

      zIndex: 60,
    },

    farLeft: {
      x: -860,
      y: -90,
      z: -700,

      rotateY: 55,

      scale: 0.7,

      blur: 3,

      opacity: 0.45,

      zIndex: 60,
    },

    back: {
      x: 0,

      y: -140,

      z: -1100,

      rotateY: 180,

      scale: 0.55,

      blur: 4,

      opacity: 0,

      zIndex: 0,
    },
  };

  // ===================================
  // RENDER ENTITIES
  // ===================================

  function renderSlots() {
    cardEntitiesRef.current.forEach((entity) => {
      const card = cardElementsRef.current[entity.index];

      if (!card) return;

      const current = SLOT_MAP[SLOT_ORDER[entity.currentSlot]];

      const target = SLOT_MAP[SLOT_ORDER[entity.targetSlot]];

      if (!current || !target) return;

      // Inicializa estado visual
      if (!entity.render) {
        entity.render = {
          x: current.x,
          y: current.y,
          z: current.z,

          rotateY: current.rotateY,

          scale: current.scale,

          blur: current.blur,

          opacity: current.opacity,
        };
      }

      const r = entity.render;

      entity.progress += (1 - entity.progress) * 0.09;

      const p = entity.progress;

      const speed = 0.18 * p;

      r.x += (target.x - r.x) * speed;

      r.y += (target.y - r.y) * speed;

      r.z += (target.z - r.z) * speed;

      r.rotateY += (target.rotateY - r.rotateY) * speed;

      r.scale += (target.scale - r.scale) * speed;

      r.blur += (target.blur - r.blur) * 0.9;

      r.opacity += (target.opacity - r.opacity) * speed;

      const isFront = Math.abs(r.x) < 40;

      const e = engine.current;

      const mouseX = isFront ? e.mouse.x * 48 : 0;
      const mouseY = isFront ? e.mouse.y * 32 : 0;

      card.style.transform = `
        translate(-50%, -50%)
        translate3d(
            ${r.x + mouseX}px,
            ${r.y + mouseY}px,
            ${r.z}px
        )
        rotateX(${-mouseY * 0.12}deg)
        rotateY(${r.rotateY + mouseX * 0.28}deg)
        scale(${r.scale})
     `;

      card.style.filter = `
        blur(${r.blur * 2.8}px)
        brightness(${1 - r.blur * 0.1})
      `;

      card.style.opacity = r.opacity;

      card.style.zIndex = target.zIndex;

      const dx = Math.abs(target.x - r.x);

      const dz = Math.abs(target.z - r.z);

      if (
        !entity.arrived &&
        entity.currentSlot !== entity.targetSlot &&
        dx < 80
      ) {
        entity.arrived = true;

        if (entity.targetSlot === 0) {
          setDisplaySlide(slides[entity.index]);

          setActiveSlide(entity.index);

          requestAnimationFrame(() => {
            setTextEntering(true);
          });
        }
      }

      if (entity.progress > 0.995) {
        entity.currentSlot = entity.targetSlot;

        entity.progress = 1;
      }
    });
  }

  // ===================================
  // PHYSICS
  // ===================================

  function physics() {
    const e = engine.current;

    e.mouse.x += (e.target.x - e.mouse.x) * 0.08;
    e.mouse.y += (e.target.y - e.mouse.y) * 0.08;

    e.velocity.x *= 0.92;
    e.velocity.y *= 0.92;

    e.velocity.x += (e.target.x - e.mouse.x) * 0.03;
    e.velocity.y += (e.target.y - e.mouse.y) * 0.03;

    e.floating += 0.015;
  }

  // ===================================
  // RENDER STAGE
  // ===================================

  function renderStage() {
    const e = engine.current;

    if (!stageRef.current) return;

    const floatY = Math.sin(e.floating) * 6;

    stageRef.current.style.transform = `
    translate3d(
      0px,
      ${floatY}px,
      0
    )
  `;
  }

  // ===================================
  // RENDER GLOW
  // ===================================

  function renderGlow() {
    const e = engine.current;

    if (!glowRef.current) return;

    const velocity = Math.abs(e.velocity.x) + Math.abs(e.velocity.y);

    glowRef.current.style.transform = `
      translate(
          calc(-50% + ${e.mouse.x * 30}px),
          calc(-50% + ${e.mouse.y * 22}px)
      )
      scale(${1 + velocity * 0.4})
  `;

    glowRef.current.style.background = `
    radial-gradient(
        circle,
        ${currentSlide.accent}AA,
        ${currentSlide.accent}66 28%,
        ${currentSlide.accent}22 55%,
        transparent 78%
    )
    `;

    glowRef.current.style.filter = `
        blur(${220 + velocity * 90}px)
    `;
  }

  useEffect(() => {
    const hero = heroRef.current;

    if (!hero) return;

    function handlePointerMove(e) {
      const rect = hero.getBoundingClientRect();

      engine.current.target.x =
        ((e.clientX - rect.left) / rect.width - 0.5) * 2;

      engine.current.target.y =
        ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    }

    function handlePointerLeave() {
      engine.current.target.x = 0;
      engine.current.target.y = 0;
    }

    hero.addEventListener("pointermove", handlePointerMove);
    hero.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      hero.removeEventListener("pointermove", handlePointerMove);
      hero.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  // ===================================
  // TIMER
  // ===================================

  useEffect(() => {
    const timer = setInterval(() => {
      rotateLayout(1);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  // ===================================
  // LOOP
  // ===================================

  useEffect(() => {
    function tick() {
      physics();

      renderStage();

      renderGlow();

      renderSlots();

      engine.current.frame = requestAnimationFrame(tick);
    }

    engine.current.frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(engine.current.frame);
    };
  }, []);

  // ===================================
  // RETURN
  // ===================================

  return {
    heroRef,
    stageRef,
    glowRef,
    lightRef,

    registerCard,

    engine,

    physics,
    renderStage,
    renderGlow,
    renderSlots,

    activeSlide,
    currentSlide,
    textEntering,
    setActiveSlide,
  };
}
