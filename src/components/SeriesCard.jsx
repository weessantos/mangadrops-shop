import { useEffect, useRef, useState } from "react";

function formatMissingList(missing) {
  return missing.join(", ");
}

export default function SeriesCard({
  name,
  thumb,
  rangeLabel,
  haveLabel,
  statusLabel,
  missing = [],
  missingCount = 0,
  active,
  onOpen,
}) {
  const [showMissing, setShowMissing] = useState(false);
  const popRef = useRef(null);

  const lower = String(statusLabel || "").toLowerCase();
  const statusClass =
    lower.includes("completo") ? "badgePill good" :
    lower.includes("sem estoque") ? "badgePill warn" :
    "badgePill";

  const hasMissing = missingCount > 0;

  // Fecha popover ao clicar fora
  useEffect(() => {
    if (!showMissing) return;

    const onDown = (e) => {
      if (popRef.current && !popRef.current.contains(e.target)) {
        setShowMissing(false);
      }
    };

    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [showMissing]);

  // Se fechar o card (ou trocar de card), fecha o popover
  useEffect(() => {
    if (!active) setShowMissing(false);
  }, [active]);

  return (
    <article
      className={`seriesCard ${active ? "isActive" : ""}`}
      onClick={() => onOpen(name)}
      role="button"
      tabIndex={0}
      aria-label={`${active ? "Fechar" : "Abrir"} ${name}`}
    >
      <img className="seriesThumb" src={thumb} alt={name} loading="lazy" />

      <div className="seriesTopBadges">
        <span className="badgePill">Coleção</span>

        {/* ✅ botão curto no card */}
        <button
          type="button"
          className={statusClass}
          onClick={(e) => {
            e.stopPropagation();
            if (!hasMissing) return; // se "Completo ✅", não abre popover
            setShowMissing((v) => !v);
          }}
          title={hasMissing ? "Ver volumes sem estoque" : "Completo"}
        >
          {statusLabel}
        </button>
      </div>

      {/* ✅ Popover flutuante */}
      {showMissing && hasMissing ? (
        <div
          ref={popRef}
          className="missingPopover"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-label="Volumes sem estoque"
        >
          <div className="missingHeader">
            <span>Volumes sem estoque</span>
            <button
              type="button"
              className="missingClose"
              onClick={() => setShowMissing(false)}
              aria-label="Fechar"
            >
              ✕
            </button>
          </div>

          <div className="missingBody">
            <div className="missingCount">{missingCount} volume(s)</div>
            <div className="missingList">{formatMissingList(missing)}</div>
          </div>
        </div>
      ) : null}

      <div className="seriesOverlay">
        <div className="seriesTitleRow">
          <h3 className="seriesName">{name}</h3>
          <span className={`seriesChevron ${active ? "open" : ""}`} aria-hidden="true">
            ▾
          </span>
        </div>

        <div className="seriesMeta">
          <span className="seriesChip good">{rangeLabel}</span>
          <span className="seriesChip">{haveLabel}</span>
          {active ? <span className="seriesChip selected">Selecionado</span> : null}
        </div>
      </div>
    </article>
  );
}
