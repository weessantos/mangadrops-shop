import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "../styles/header.css";

const base = import.meta.env.BASE_URL;
const img = (path) => `${base}assets/${path}`;

// remove emojis/símbolos pra busca ficar consistente
const toQueryText = (s) =>
  String(s || "")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();

export default function Header({ inputValue, setInputValue, onSearch }) {
  // =========================
  // Mobile detection
  // =========================
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(!!mq.matches);
    update();

    if (mq.addEventListener) mq.addEventListener("change", update);
    else mq.addListener(update);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", update);
      else mq.removeListener(update);
    };
  }, []);

  // =========================
  // Menu lateral (mobile)
  // =========================
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const toggleMenu = () => setMenuOpen((v) => !v);

  // ESC fecha menu
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => e.key === "Escape" && closeMenu();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  // trava scroll quando menu abre (sensação de overlay real)
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev || "auto";
    };
  }, [menuOpen]);

  // evita ficar aberto ao voltar pro desktop
  useEffect(() => {
    if (!isMobile) setMenuOpen(false);
  }, [isMobile]);

  // =========================
  // Actions
  // =========================
  const handleKeyDown = (e) => {
    if (e.key === "Enter") onSearch?.(inputValue);
  };

  const scrollToObras = () => {
    (
      document.getElementById("railTitle") ||
      document.getElementById("obras") ||
      document.getElementById("colecoes")
    )?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToNews = () => {
    (
      document.getElementById("obras") ||
      document.getElementById("lancamentos") ||
      document.getElementById("news")
    )?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openRequestForm = () => {
    window.open("https://forms.gle/Vz1PUw5V9TxSUzqc8", "_blank", "noreferrer");
  };

  const quickSearch = (text) => {
    const q = toQueryText(text);
    setInputValue(q);
    onSearch?.(q);
  };

  const obras = useMemo(
    () => [
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
      "Kagurabachi 🗡️",
    ],
    []
  );

  // =========================
  // Chips scroller + arrows (desktop)
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

  // =========================
  // Side menu (PORTAL) — sempre acima do site
  // =========================
  const sideMenuPortal =
    isMobile && menuOpen
      ? createPortal(
          <div className="sideMenuOverlay" onClick={closeMenu} role="presentation">
            <aside
              className="sideMenu"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
            >
              <div className="sideMenuTop">
                <div className="sideMenuTitle">Menu</div>
                <button
                  className="sideMenuClose"
                  onClick={closeMenu}
                  type="button"
                  aria-label="Fechar menu"
                  title="Fechar"
                >
                  ✕
                </button>
              </div>

              <div className="sideMenuSection">
                <div className="sideMenuSectionTitle">Atalhos</div>
                <button
                  className="sideMenuBtn"
                  onClick={() => {
                    closeMenu();
                    scrollToObras();
                  }}
                  type="button"
                >
                  Coleções
                </button>
                <button
                  className="sideMenuBtn"
                  onClick={() => {
                    closeMenu();
                    scrollToNews();
                  }}
                  type="button"
                >
                  Lançamentos
                </button>
                <button
                  className="sideMenuBtn"
                  onClick={() => {
                    closeMenu();
                    openRequestForm();
                  }}
                  type="button"
                >
                  Pedir uma obra
                </button>
              </div>

              <div className="sideMenuDivider" />

              <div className="sideMenuSection">
                <div className="sideMenuSectionTitle">Obras</div>
                <div className="sideMenuList">
                  {obras.map((obra) => (
                    <button
                      key={obra}
                      className="sideMenuBtn"
                      onClick={() => {
                        closeMenu();
                        quickSearch(obra);
                      }}
                      type="button"
                    >
                      {obra}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sideMenuDivider" />

              <div className="sideMenuSection">
                <div className="sideMenuSectionTitle">Redes</div>
                <div className="sideMenuSocial">
                  <a
                    className="sideMenuSocialBtn"
                    href="https://tiktok.com/@_mangadrops"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="TikTok"
                  >
                    <img className="socialIcon" src={img("tiktok.svg")} alt="" aria-hidden="true" />
                    TikTok
                  </a>
                  <a
                    className="sideMenuSocialBtn"
                    href="https://instagram.com/"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram"
                  >
                    <img className="socialIcon" src={img("instagram.svg")} alt="" aria-hidden="true" />
                    Instagram
                  </a>
                  <a
                    className="sideMenuSocialBtn"
                    href="https://youtube.com/"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="YouTube"
                  >
                    <img className="socialIcon" src={img("youtube.svg")} alt="" aria-hidden="true" />
                    YouTube
                  </a>
                </div>
              </div>
            </aside>
          </div>,
          document.body
        )
      : null;

  // =========================
  // Render
  // =========================
  return (
    <>
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
          {isMobile ? (
            /* ✅ Mobile: arrumado (logo integrada + ícone menor + botão compacto) */
            <div className="mobileTopBar">
              <button
                className="mobileMenuBtn"
                onClick={toggleMenu}
                type="button"
                aria-label="Abrir menu"
                title="Menu"
              >
                ☰
              </button>

              {/* 🔎 Search (logo dentro = não fica avulsa) */}
              <div className="mobileSearch" role="search" aria-label="Buscar no Mangá Drops">
                <button
                  className="mobileLogoMiniBtn"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  type="button"
                  aria-label="Voltar ao topo"
                  title="Voltar ao topo"
                >
                  <img className="mobileSearchLogo" src={img("logo.png")} alt="" aria-hidden="true" />
                </button>


                <input
                  className="mobileSearchInput"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Buscar mangá..."
                  inputMode="search"
                  autoComplete="off"
                />

                <button
                  className="mobileSearchBtn"
                  onClick={() => onSearch?.(inputValue)}
                  type="button"
                  aria-label="Buscar"
                  title="Buscar"
                >
                  Buscar
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="heroTop">
                {/* Logo */}
                <button
                  className="heroLogoBtn"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  type="button"
                  aria-label="Voltar ao topo"
                >
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
                  <button className="heroSearchBtn" onClick={() => onSearch?.(inputValue)} type="button">
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
                    <img className="socialIcon" src={img("tiktok.svg")} alt="" aria-hidden="true" />
                  </a>
                  <a
                    className="socialBtn"
                    href="https://instagram.com/"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram"
                    title="Instagram"
                  >
                    <img className="socialIcon" src={img("instagram.svg")} alt="" aria-hidden="true" />
                  </a>
                  <a
                    className="socialBtn"
                    href="https://youtube.com/"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="YouTube"
                    title="YouTube"
                  >
                    <img className="socialIcon" src={img("youtube.svg")} alt="" aria-hidden="true" />
                  </a>
                </div>
              </div>

              {/* Pills row */}
              <div className="heroPills">
                <div className="pillRowMain">
                  <button className="pill pillPrimary" onClick={scrollToObras} type="button">
                    Coleções
                  </button>
                  <button className="pill pillPrimary" onClick={scrollToNews} type="button">
                    Lançamentos
                  </button>

                  <button className="pill pillCTA" onClick={openRequestForm} type="button">
                    Pedir uma obra
                  </button>
                </div>

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
            </>
          )}
        </div>
      </header>

      {/* Portal fora do hero/header: sempre por cima de tudo */}
      {sideMenuPortal}
    </>
  );
}