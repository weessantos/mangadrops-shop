import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { track } from "../utils/analytics.js";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/header.css";

const base = import.meta.env.BASE_URL;
const img = (path) => `${base}assets/${path}`;

const toQueryText = (s) =>
  String(s || "")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();

export default function Header({
  inputValue,
  setInputValue,
  onSearch,
  scrollToNav,
  activeSection = "colecoes",
  isHeaderCompact = false,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const openFilters = () => {
    navigate(`/filtros${location.search}`);
  };

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

  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const toggleMenu = () => {
    setMenuOpen((v) => {
      const next = !v;
      track("menu_toggle", {
        placement: "header_mobile",
        state: next ? "open" : "close",
      });
      return next;
    });
  };

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => e.key === "Escape" && closeMenu();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevBodyOverflow || "";
      document.documentElement.style.overflow = prevHtmlOverflow || "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!isMobile) setMenuOpen(false);
  }, [isMobile]);

  const fireSearch = (placement) => {
    const q = String(inputValue || "").trim();
    track("search", { search_term: q, placement });
    onSearch?.(q);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      fireSearch(isMobile ? "header_mobile_enter" : "header_desktop_enter");
    }
  };

  const openRequestForm = () => {
    track("click_request", {
      placement: isMobile ? "header_mobile" : "header_desktop",
    });
    window.open("https://forms.gle/Vz1PUw5V9TxSUzqc8", "_blank", "noreferrer");
  };

  const quickSearch = (text) => {
    const q = toQueryText(text);
    track("click_chip", {
      chip: q,
      placement: isMobile ? "side_menu" : "header_chips",
    });
    setInputValue(q);
    onSearch?.(q);
  };

  const navIsActive = (section) => activeSection === section;

  const navButtonStyle = (section) =>
    navIsActive(section)
      ? {
          background: "linear-gradient(135deg, #ff7a18, #ff4d4d)",
          color: "#fff",
          boxShadow: "0 10px 24px rgba(0, 0, 0, 0.16)",
          transform: "translateY(-1px)",
          borderColor: "rgba(255, 255, 255, 0.22)",
        }
      : undefined;

  const navTargets = {
    colecoes: ["railTitle", "obras"],
    lancamentos: ["lancamentos"],
    promocoes: ["promotions"],
    saldao: ["deals"],
  };

  const jumpToSection = (target) => {
    if (isMobile) {
      setTimeout(() => {
        scrollToNav?.({
          target,
          placement: "header_mobile",
          ids: navTargets[target] || [target],
        });
      }, 120);
    } else {
      scrollToNav?.({
        target,
        placement: "header_desktop",
        ids: navTargets[target] || [target],
      });
    }
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
    track("scroll_chips", { direction, placement: "header_chips" });
    el.scrollBy({
      left: direction === "left" ? -280 : 280,
      behavior: "smooth",
    });
    setTimeout(updateScrollState, 350);
  };

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
                  className={`sideMenuBtn ${navIsActive("lancamentos") ? "isActive" : ""}`}
                  style={navButtonStyle("lancamentos")}
                  aria-current={navIsActive("lancamentos") ? "page" : undefined}
                  onClick={() => {
                    closeMenu();
                    jumpToSection("lancamentos");
                  }}
                  type="button"
                >
                  Lançamentos
                </button>
                <button
                  className={`sideMenuBtn ${navIsActive("promocoes") ? "isActive" : ""}`}
                  style={navButtonStyle("promocoes")}
                  aria-current={navIsActive("promocoes") ? "page" : undefined}
                  onClick={() => {
                    closeMenu();
                    jumpToSection("promocoes");
                  }}
                  type="button"
                >
                  Promoções
                </button>
                <button
                  className={`sideMenuBtn ${navIsActive("saldao") ? "isActive" : ""}`}
                  style={navButtonStyle("saldao")}
                  aria-current={navIsActive("saldao") ? "page" : undefined}
                  onClick={() => {
                    closeMenu();
                    jumpToSection("saldao");
                  }}
                  type="button"
                >
                  Saldão
                </button>
                <button
                  className={`sideMenuBtn ${navIsActive("colecoes") ? "isActive" : ""}`}
                  style={navButtonStyle("colecoes")}
                  aria-current={navIsActive("colecoes") ? "page" : undefined}
                  onClick={() => {
                    closeMenu();
                    jumpToSection("colecoes");
                  }}
                  type="button"
                >
                  Coleções
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

                <button
                  className="sideMenuBtn sideMenuBtnPrimary"
                  onClick={() => {
                    closeMenu();
                    openFilters();
                  }}
                  type="button"
                >
                  Filtros
                </button>
              </div>

              <div className="sideMenuDivider" />

              <div className="sideMenuSection sideMenuSectionGrow">
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
                    onClick={() => track("click_social", { network: "tiktok", placement: "side_menu" })}
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
                    onClick={() => track("click_social", { network: "instagram", placement: "side_menu" })}
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
                    onClick={() => track("click_social", { network: "youtube", placement: "side_menu" })}
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

  return (
    <>
      <header className={`heroHeader ${isHeaderCompact && !isMobile ? "isCompact" : ""}`}>
        <div
          className="heroBg"
          style={{ backgroundImage: `url(${img("header-bg.webp")})` }}
          aria-hidden="true"
        />
        <div className="heroShade" aria-hidden="true" />

        <div className={`heroContent ${isHeaderCompact && !isMobile ? "isCompact" : ""}`}>
          {isMobile ? (
            <div className="mobileTopBar">
              <button
                className="mobileMenuBtn"
                onClick={toggleMenu}
                type="button"
                aria-label="Abrir menu"
              >
                ☰
              </button>

              <div className="mobileSearch">
                <button
                  className="mobileLogoMiniBtn"
                  onClick={() => {
                    track("click_logo", { placement: "header_mobile" });
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  type="button"
                  aria-label="Voltar ao topo"
                  title="Voltar ao topo"
                >
                  <img className="mobileSearchLogo" src={img("logo.png")} alt="MangásDrops" />
                </button>

                <span className="mobileSearchIcon" aria-hidden="true">
                  🔎
                </span>

                <input
                  className="mobileSearchInput"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Buscar mangá..."
                />

                <button
                  className="mobileSearchBtn"
                  onClick={() => fireSearch("header_mobile_btn")}
                  type="button"
                >
                  Buscar
                </button>
              </div>
            </div>
          ) : isHeaderCompact ? (
            <div className="compactHeaderBar">
              <button
                className="compactLogoBtn"
                onClick={() => {
                  track("click_logo", { placement: "header_desktop_compact" });
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                type="button"
                aria-label="Voltar ao topo"
              >
                <img className="compactLogo" src={img("logo.png")} alt="MangásDrops" />
              </button>

              <nav className="compactNav" aria-label="Seções principais">
                <button
                  className={`compactNavBtn ${navIsActive("lancamentos") ? "isActive" : ""}`}
                  style={navButtonStyle("lancamentos")}
                  aria-current={navIsActive("lancamentos") ? "page" : undefined}
                  onClick={() => jumpToSection("lancamentos")}
                  type="button"
                >
                  Lançamentos
                </button>
                <button
                  className={`compactNavBtn ${navIsActive("promocoes") ? "isActive" : ""}`}
                  style={navButtonStyle("promocoes")}
                  aria-current={navIsActive("promocoes") ? "page" : undefined}
                  onClick={() => jumpToSection("promocoes")}
                  type="button"
                >
                  Promoções
                </button>
                <button
                  className={`compactNavBtn ${navIsActive("saldao") ? "isActive" : ""}`}
                  style={navButtonStyle("saldao")}
                  aria-current={navIsActive("saldao") ? "page" : undefined}
                  onClick={() => jumpToSection("saldao")}
                  type="button"
                >
                  Saldão
                </button>
                <button
                  className={`compactNavBtn ${navIsActive("colecoes") ? "isActive" : ""}`}
                  style={navButtonStyle("colecoes")}
                  aria-current={navIsActive("colecoes") ? "page" : undefined}
                  onClick={() => jumpToSection("colecoes")}
                  type="button"
                >
                  Coleções
                </button>
              </nav>

              <div className="compactHeaderActions">
                <button className="compactActionBtn" type="button" onClick={openFilters}>
                  Filtros
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="heroTop">
                <button
                  className="heroLogoBtn"
                  onClick={() => {
                    track("click_logo", { placement: "header_desktop" });
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  type="button"
                  aria-label="Voltar ao topo"
                >
                  <img className="heroLogo" src={img("logo.png")} alt="MangásDrops" />
                </button>

                <div className="heroSearch">
                  <span className="heroSearchIcon" aria-hidden="true">🔎</span>
                  <input
                    className="heroSearchInput"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Buscar mangá ou volume..."
                  />
                  <button
                    className="heroSearchBtn"
                    onClick={() => fireSearch("header_desktop_btn")}
                    type="button"
                  >
                    Buscar
                  </button>
                </div>

                <div className="heroSocial">
                  <a
                    className="socialBtn"
                    href="https://tiktok.com/@_mangadrops"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="TikTok"
                    title="TikTok"
                    onClick={() => track("click_social", { network: "tiktok", placement: "header_desktop" })}
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
                    onClick={() => track("click_social", { network: "instagram", placement: "header_desktop" })}
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
                    onClick={() => track("click_social", { network: "youtube", placement: "header_desktop" })}
                  >
                    <img className="socialIcon" src={img("youtube.svg")} alt="" aria-hidden="true" />
                  </a>
                </div>
              </div>

              <div className="heroPills">
                <div className="pillRowMain">
                  <button
                    className={`pill pillPrimary ${navIsActive("lancamentos") ? "isActive" : ""}`}
                    style={navButtonStyle("lancamentos")}
                    aria-current={navIsActive("lancamentos") ? "page" : undefined}
                    onClick={() => jumpToSection("lancamentos")}
                    type="button"
                  >
                    Lançamentos
                  </button>
                  <button
                    className={`pill pillPrimary ${navIsActive("promocoes") ? "isActive" : ""}`}
                    style={navButtonStyle("promocoes")}
                    aria-current={navIsActive("promocoes") ? "page" : undefined}
                    onClick={() => jumpToSection("promocoes")}
                    type="button"
                  >
                    Promoções
                  </button>
                  <button
                    className={`pill pillPrimary ${navIsActive("saldao") ? "isActive" : ""}`}
                    style={navButtonStyle("saldao")}
                    aria-current={navIsActive("saldao") ? "page" : undefined}
                    onClick={() => jumpToSection("saldao")}
                    type="button"
                  >
                    Saldão
                  </button>
                  <button
                    className={`pill pillPrimary ${navIsActive("colecoes") ? "isActive" : ""}`}
                    style={navButtonStyle("colecoes")}
                    aria-current={navIsActive("colecoes") ? "page" : undefined}
                    onClick={() => jumpToSection("colecoes")}
                    type="button"
                  >
                    Coleções
                  </button>

                  <button className="pill pillCTA" onClick={openRequestForm} type="button">
                    Pedir uma obra
                  </button>

                  <button className="pill pillCTA" type="button" onClick={openFilters}>
                    Filtros
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

      {sideMenuPortal}
    </>
  );
}
