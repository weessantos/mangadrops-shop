import { useEffect, useRef, useState } from "react";

const base = import.meta.env.BASE_URL;

const img = (path) => `${base}assets/${path}`;


export default function Header({ inputValue, setInputValue, onSearch }) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") onSearch?.(inputValue);
  };

  const scrollToObras = () => {
    document.getElementById("obras")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const openRequestForm = () => {
    window.open("https://forms.gle/Vz1PUw5V9TxSUzqc8", "_blank", "noreferrer");
  };

  const quickSearch = (text) => {
    setInputValue(text);
    onSearch?.(text);
  };

  const obras = [
  "One Piece 🏴‍☠️",
  "Attack on Titan 🧱",
  "Jujutsu Kaisen 🌀",
  "Fullmetal Alchemist ⚗️",
  "My Hero Academia 🦸",
  "Vinland Saga ⚔️",
  "Sakamoto Days 🔫",
  "Bleach 👻",
  "Shaman King 🔮",
  "GashBell ⚡",
  "Naruto 🍥",
  "Dragon Ball 🐉",
  "Haikyu 🏐",
  "Kagurabachi 🗡️"
  ];

  // =========================
  // Chips scroller + arrows
  // =========================
  const chipsRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    const el = chipsRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);
  };

  useEffect(() => {
    updateScrollState();
    window.addEventListener("resize", updateScrollState);
    return () => window.removeEventListener("resize", updateScrollState);
  }, []);

  const scrollChips = (direction) => {
    const el = chipsRef.current;
    if (!el) return;

    const amount = 280;
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });

    setTimeout(updateScrollState, 350);
  };

  return (
    <header className="heroHeader">
      {/* Background */}
      <div
        className="heroBg"
        style={{ backgroundImage: `url(${img("header-bg.jpeg")})` }}
        aria-hidden="true"
      />
      <div className="heroShade" aria-hidden="true" />

      {/* Foreground */}
      <div className="heroContent">
        <div className="heroTop">
          {/* Logo */}
          <button
            className="heroLogoBtn"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            type="button"
            aria-label="Voltar ao topo"
          >
            {/* Troque por uma logo com transparência (PNG alpha ou SVG) */}
            <img className="heroLogo" src={img("logo.png")} alt="MangásDrops" />
          </button>

          {/* Search */}
          <div className="heroSearch">
            <span className="heroSearchIcon" aria-hidden="true">
              🔎
            </span>
            <input
              className="heroSearchInput"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Buscar mangá ou volume..."
            />
            <button
              className="heroSearchBtn"
              onClick={() => onSearch?.(inputValue)}
              type="button"
            >
              Buscar
            </button>
          </div>

          {/* Social */}
          <div className="heroSocial">
            <a
              className="socialBtn"
              href="https://tiktok.com/@_mangadrops"
              target="_blank"
              rel="noreferrer"
              aria-label="TikTok"
              title="TikTok"
            >
              <img
                className="socialIcon"
                src={img("tiktok.svg")}
                alt=""
                aria-hidden="true"
              />
            </a>
            <a
              className="socialBtn"
              href="https://instagram.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              title="Instagram"
            >
              <img
                className="socialIcon"
                src={img("instagram.svg")}
                alt=""
                aria-hidden="true"
              />
            </a>
            <a
              className="socialBtn"
              href="https://youtube.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              title="YouTube"
            >
              <img
                className="socialIcon"
                src={img("youtube.svg")}
                alt=""
                aria-hidden="true"
              />
            </a>
          </div>
        </div>

        {/* Pills row */}
        <div className="heroPills">
          {/* 🔥 Linha principal */}
          <div className="pillRowMain">
            <button className="pill pillPrimary" onClick={scrollToObras} type="button">
              Obras
            </button>

            <button className="pill pillCTA" onClick={openRequestForm} type="button">
              Pedir uma obra
            </button>
          </div>

          {/* 🔹 Linha secundária com setas */}
          <div className="pillRowSecondaryContainer">
            {canScrollLeft && (
              <button
                className="scrollArrow left"
                onClick={() => scrollChips("left")}
                type="button"
                aria-label="Scroll para a esquerda"
              >
                ‹
              </button>
            )}

            <div className="pillRowSecondaryWrap" ref={chipsRef} onScroll={updateScrollState}>
              <div className="pillRowSecondary">
                {obras.map((obra) => (
                  <button
                    key={obra}
                    className="pill pillChip"
                    onClick={() => quickSearch(obra)}
                    type="button"
                  >
                    {obra}
                  </button>
                ))}
              </div>
            </div>

            {canScrollRight && (
              <button
                className="scrollArrow right"
                onClick={() => scrollChips("right")}
                type="button"
                aria-label="Scroll para a direita"
              >
                ›
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
