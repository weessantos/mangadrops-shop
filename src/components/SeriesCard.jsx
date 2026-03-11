import { useEffect, useRef, useState } from "react";
import "../styles/series-card.css";

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
  const statusClass = lower.includes("completo")
    ? "badgePill good"
    : lower.includes("sem estoque")
    ? "badgePill warn"
    : "badgePill";

  const hasMissing = missingCount > 0;

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

  useEffect(() => {
    if (!active) setShowMissing(false);
  }, [active]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen(name);
    }
  };

  return (
    <article
      className={`seriesCard ${active ? "isActive" : ""}`}
      onClick={() => onOpen(name)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${active ? "Fechar" : "Abrir"} ${name}`}
    >
      <img
        className="seriesThumb"
        src={thumb}
        alt={name}
        loading="lazy"
        decoding="async"
        draggable="false"
      />

      <div className="seriesTopBadges">
        <span className="badgePill">Coleção</span>

        <button
          type="button"
          className={statusClass}
          onClick={(e) => {
            e.stopPropagation();
            if (!hasMissing) return;
            setShowMissing((v) => !v);
          }}
          title={hasMissing ? "Ver volumes sem estoque" : "Completo"}
        >
          {statusLabel}
        </button>
      </div>

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
          <span
            className={`seriesChevron ${active ? "open" : ""}`}
            aria-hidden="true"
          >
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