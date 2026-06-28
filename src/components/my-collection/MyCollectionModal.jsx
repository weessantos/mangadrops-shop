import { useEffect, useRef, useState } from "react";
import { supabaseClient } from "../../lib/supabase";

import "../../styles/my-collection/my-collection-modal.css";

import { useLockBodyScroll } from "../../hooks/my-collection-hooks/useLockBodyScroll";
import { STORE_OPTIONS } from "../../utils/my-collection/stores";
import { showError, showSuccess, showWarning } from "../../utils/alertFeedback";
import { img } from "../../utils/images";
import MyVolumeModal from "./MyVolumeModal";
import MyCollectionEditionModal from "./MyCollectionEditionModal";

export default function MyCollectionModal({
  collectionId,
  onClose,
  onLoaded,
  onChanged,
}) {
  const [volumes, setVolumes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedVolume, setSelectedVolume] = useState(null);
  const [showInvestment, setShowInvestment] = useState(false);

  const [showBulkModal, setShowBulkModal] = useState(false);

  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkStore, setBulkStore] = useState("");
  const [bulkDate, setBulkDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [applyMode, setApplyMode] = useState("all");

  const [startVolume, setStartVolume] = useState(1);
  const [endVolume, setEndVolume] = useState(1);

  const [favoriteWorkId, setFavoriteWorkId] = useState(null);
  const [savingFavorite, setSavingFavorite] = useState(false);

  const [hasChanges, setHasChanges] = useState(false);

  const [showEditionDetails, setShowEditionDetails] = useState(false);

  const [showEditionModal, setShowEditionModal] = useState(false);

  const [seriesMetadata, setSeriesMetadata] = useState(null);

  const popoverRef = useRef(null);
  const buttonRef = useRef(null);

  const [popoverStyle, setPopoverStyle] = useState({});

  useEffect(() => {
    if (!showEditionDetails) return;

    function handleClickOutside(e) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setShowEditionDetails(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEditionDetails]);

  useEffect(() => {
    if (!showEditionDetails) return;

    requestAnimationFrame(positionPopover);

    window.addEventListener("resize", positionPopover);
    window.addEventListener("scroll", positionPopover, true);

    return () => {
      window.removeEventListener("resize", positionPopover);
      window.removeEventListener("scroll", positionPopover, true);
    };
  }, [showEditionDetails]);

  useLockBodyScroll();

  useEffect(() => {
    loadCollection();
  }, [collectionId]);

  async function loadCollection() {
    setHasChanges(false);
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    const { data: preferences } = await supabaseClient
      .from("user_profile_preferences")
      .select("favorite_work_id")
      .eq("user_id", user.id)
      .maybeSingle();

    setFavoriteWorkId(preferences?.favorite_work_id || null);

    const { data, error } = await supabaseClient
      .from("collection_catalog")
      .select("*")
      .eq("collection_group_id", collectionId)
      .order("series_title")
      .order("number");

    if (error) {
      console.error(error);
      return;
    }

    const { data: userCollection, error: collectionError } =
      await supabaseClient
        .from("user_collection")
        .select("volume_id, status, purchase_price")
        .eq("user_id", user.id);

    if (collectionError) {
      console.error(collectionError);
      setLoading(false);
      return;
    }

    const collectionMap = new Map(
      userCollection.map((item) => [item.volume_id, item]),
    );

    const volumesWithStatus = data.map((volume) => {
      const userData = collectionMap.get(volume.id);

      return {
        ...volume,

        status: userData?.status || "missing",
        owned: userData?.status === "owned",

        purchase_price: userData?.purchase_price || 0,
      };
    });

    const mainSeries =
      volumesWithStatus.find((v) => v.parent_series_id === null) ||
      volumesWithStatus[0];

    const { data: metadata, error: metadataError } = await supabaseClient
      .from("user_series_metadata")
      .select("*")
      .eq("user_id", user.id)
      .eq("series_id", mainSeries.series_id)
      .maybeSingle();

    setSeriesMetadata(metadata);

    setVolumes(volumesWithStatus);
    setLoading(false);
    onLoaded?.();
  }

  function notifyChange() {
    if (hasChanges) return;

    setHasChanges(true);
    onChanged?.();
  }

  if (loading) {
    return null;
  }

  function positionPopover() {
    if (!buttonRef.current || !popoverRef.current) return;

    // No mobile o CSS já centraliza o "modal"
    if (window.innerWidth <= 920) return;

    const button = buttonRef.current.getBoundingClientRect();

    setPopoverStyle({
      position: "fixed",
      left: button.right + 30,
      top: button.top - 20,
    });

    requestAnimationFrame(() => {
      if (!popoverRef.current) return;

      const popover = popoverRef.current.getBoundingClientRect();

      const arrowTop = button.top + button.height / 2 - popover.top;

      popoverRef.current.style.setProperty("--arrow-top", `${arrowTop}px`);
    });
  }

  function getLanguageFlag(language) {
    switch (language) {
      case "Inglês":
        return "/assets/my-collection/flags/us.png";

      case "Japonês":
        return "/assets/my-collection/flags/jp.png";

      case "Francês":
        return "/assets/my-collection/flags/fr.png";

      case "Espanhol":
        return "/assets/my-collection/flags/es.png";

      case "Italiano":
        return "/assets/my-collection/flags/it.png";

      case "Alemão":
        return "/assets/my-collection/flags/de.png";

      default:
        return "/assets/my-collection/flags/br.png";
    }
  }

  const totalVolumes = volumes.length;

  const ownedVolumes = volumes.filter((volume) => volume.owned).length;

  const totalInvested = volumes.reduce(
    (total, volume) => total + Number(volume.purchase_price || 0),
    0,
  );

  const percentage =
    totalVolumes > 0 ? Math.round((ownedVolumes / totalVolumes) * 100) : 0;

  const mainSeries =
    volumes.find((v) => v.parent_series_id === null) || volumes[0];

  const { edition_publisher, edition_language, edition_notes } =
    seriesMetadata ?? {};

  const publisher = edition_publisher || mainSeries.brand;

  const language = edition_language || "Português";

  const notes = edition_notes || "";

  const hasCustomEdition = !!seriesMetadata;

  const mainVolumes = volumes.filter(
    (v) => v.series_id === mainSeries.series_id,
  );

  const selectedVolumes =
    applyMode === "all"
      ? mainVolumes
      : mainVolumes.filter(
          (volume) =>
            volume.number >= startVolume && volume.number <= endVolume,
        );

  const averagePrice =
    selectedVolumes.length > 0
      ? Number(bulkPrice || 0) / selectedVolumes.length
      : 0;

  const groupedVolumes = Object.values(
    volumes.reduce((acc, item) => {
      if (!acc[item.series_id]) {
        acc[item.series_id] = {
          seriesTitle: item.series_title,
          isExtra: !!item.parent_series_id,
          volumes: [],
        };
      }

      acc[item.series_id].volumes.push(item);

      return acc;
    }, {}),
  );

  const isFavoriteWork = Number(favoriteWorkId) === Number(collectionId);

  function formatCurrency(value) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function updateVolumeStatus(volumeId, newStatus) {
    notifyChange();

    setVolumes((current) =>
      current.map((volume) =>
        volume.id === volumeId
          ? {
              ...volume,
              owned: newStatus === "owned",
              status: newStatus,
            }
          : volume,
      ),
    );
  }

  async function handleBulkPurchase() {
    if (!bulkPrice || Number(bulkPrice) <= 0) {
      showError("Informe o valor pago pela coleção.");
      return;
    }

    if (!bulkStore) {
      showError("Selecione a loja onde comprou a coleção.");
      return;
    }

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    const rows = selectedVolumes.map((volume) => ({
      user_id: user.id,
      volume_id: volume.id,

      status: "owned",

      purchase_price: Number(averagePrice.toFixed(2)),
      purchase_store: bulkStore || null,
      purchase_date: bulkDate || null,
    }));

    const { error } = await supabaseClient
      .from("user_collection")
      .upsert(rows, {
        onConflict: "user_id,volume_id",
      });

    if (error) {
      console.error(error);
      showWarning("Erro ao salvar coleção.");
      return;
    }

    setVolumes((current) =>
      current.map((volume) =>
        selectedVolumes.some((selected) => selected.id === volume.id)
          ? {
              ...volume,
              owned: true,
              status: "owned",
            }
          : volume,
      ),
    );

    setShowBulkModal(false);

    notifyChange();

    showSuccess(
      `${selectedVolumes.length} volumes adicionados à coleção com sucesso!`,
    );
  }

  async function handleFavoriteCollection() {
    try {
      setSavingFavorite(true);

      const {
        data: { user },
      } = await supabaseClient.auth.getUser();

      const { error } = await supabaseClient
        .from("user_profile_preferences")
        .upsert({
          user_id: user.id,
          favorite_work_id: collectionId,
        });

      if (error) {
        throw error;
      }

      setFavoriteWorkId(collectionId);

      showSuccess("Obra favorita atualizada!");
    } catch (error) {
      console.error(error);

      showError("Não foi possível salvar sua obra favorita.");
    } finally {
      setSavingFavorite(false);
    }
  }

  return (
    <>
      <div className="my-collection-modal-overlay" onClick={onClose}>
        <div
          className="my-collection-modal"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="my-collection-modal-header tablet-scale-strong ">
            <h2 className="my-collection-modal-title">📚 Coleção</h2>

            <button className="my-collection-modal-close" onClick={onClose}>
              ✕
            </button>
          </div>

          <div className="my-collection-content tablet-scale-strong">
            <aside className="my-collection-sidebar tablet-scale-strong">
              <div className="collection-sidebar-top">
                <img
                  src={mainSeries.thumb}
                  alt={mainSeries.collection_title}
                  className="my-collection-main-cover"
                />

                <div className="my-collection-info">
                  <h2>{mainSeries.collection_title}</h2>

                  {mainSeries.subtitle && (
                    <p className="collection-subtitle">{mainSeries.subtitle}</p>
                  )}

                  <div className="collection-badges">
                    <span>🏢 {publisher}</span>

                    {mainSeries.genre && <span>🎭 {mainSeries.genre}</span>}

                    {mainSeries.author && (
                      <span className="author-badge">
                        ✍️ {mainSeries.author}
                      </span>
                    )}
                    <span>
                      <img
                        src={getLanguageFlag(language)}
                        alt={language}
                        className="language-flag"
                      />
                      {language}
                    </span>

                    <span>
                      <button
                        ref={buttonRef}
                        className="collection-badge-button"
                        onClick={() => setShowEditionDetails((prev) => !prev)}
                      >
                        📝 Observações
                      </button>
                    </span>
                  </div>
                </div>
              </div>

              <div className="collection-sidebar-actions">
                <div className="collection-investment">
                  <span className="investment-label">💰 Investimento</span>

                  <div className="investment-value">
                    <span>
                      {showInvestment
                        ? formatCurrency(totalInvested)
                        : "••••••••"}
                    </span>

                    <button
                      className="investment-toggle"
                      onClick={() => setShowInvestment(!showInvestment)}
                    >
                      {showInvestment ? "Ocultar" : "Mostrar"}
                    </button>
                  </div>
                </div>

                <button
                  className="bulk-purchase-btn"
                  onClick={() => setShowBulkModal(true)}
                >
                  Preencher vários volumes
                </button>
              </div>

              <div className="mobile-progress">
                <div className="footer-progress-header">
                  <span>
                    {ownedVolumes} / {totalVolumes} volumes
                  </span>

                  <strong>{percentage}%</strong>
                </div>

                <div className="footer-progress-bar">
                  <div
                    className="footer-progress-fill"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>
              </div>
            </aside>

            <section className="my-collection-volumes">
              {groupedVolumes.map((group) => (
                <div
                  key={group.seriesTitle}
                  className="collection-series-group"
                >
                  <div className="seriesTitleRow">
                    <h3>{group.seriesTitle}</h3>

                    <button
                      className={`mobileFavoriteCollectionButton ${
                        isFavoriteWork ? "active" : ""
                      }`}
                      onClick={handleFavoriteCollection}
                    >
                      {isFavoriteWork ? "⭐ Favorita" : "☆ Favoritar"}
                    </button>
                  </div>

                  <div
                    className={`${
                      group.isExtra
                        ? "collection-extras-grid"
                        : "collection-volumes-grid"
                    }`}
                  >
                    {group.volumes.map((volume) => (
                      <div
                        key={volume.id}
                        className={`collection-volume-card status-${volume.status || "none"}`}
                        onClick={() => setSelectedVolume(volume)}
                      >
                        {volume.status === "owned" && (
                          <div className="volume-owned-badge">✓</div>
                        )}

                        {volume.status === "wishlist" && (
                          <div className="volume-wishlist-badge">★</div>
                        )}

                        <img
                          src={img({
                            prefix: volume.prefix,
                            parentPrefix: volume.parent_prefix,
                            file: `${volume.code}.webp`,
                          })}
                          alt={volume.title}
                          className="collection-volume-cover"
                          loading="lazy"
                        />

                        <div
                          className={`collection-volume-label ${
                            volume.status === "owned"
                              ? "owned"
                              : volume.status === "wishlist"
                                ? "wishlist"
                                : ""
                          }`}
                        >
                          {String(volume.number).padStart(2, "0")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </section>

            {showEditionDetails && (
              <div
                ref={popoverRef}
                className="collection-edition-popover"
                style={popoverStyle}
              >
                <div className="collection-edition-popover-header">
                  <h4>📝 Observações</h4>

                  <button
                    className="popover-close"
                    onClick={() => setShowEditionDetails(false)}
                  >
                    ✕
                  </button>
                </div>

                {notes ? (
                  <div className="edition-item">
                    <p>{notes}</p>
                  </div>
                ) : (
                  <p className="edition-empty">
                    Nenhuma observação adicionada para esta coleção.
                  </p>
                )}

                <button
                  className="edit-edition-btn"
                  onClick={() => setShowEditionModal(true)}
                >
                  {hasCustomEdition
                    ? "✏️ Editar informações"
                    : "➕ Adicionar informações"}
                </button>
              </div>
            )}
          </div>

          <div className="my-collection-modal-footer tablet-scale-strong ">
            <div className="footer-stat">
              <strong>{totalVolumes}</strong>
              <span> Volumes na coleção</span>
            </div>

            <div className="footer-stat">
              <strong>{groupedVolumes.length}</strong>
              <span> Obras relacionadas</span>
            </div>
            <div className="footerActions">
              <div className="footer-progress">
                <div className="footer-progress-header">
                  <span>
                    {ownedVolumes} / {totalVolumes} volumes
                  </span>

                  <strong>{percentage}%</strong>
                </div>

                <div className="footer-progress-bar">
                  <div
                    className="footer-progress-fill"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>
              </div>

              <button
                className={`favoriteCollectionButton ${
                  isFavoriteWork ? "active" : ""
                }`}
                onClick={handleFavoriteCollection}
              >
                {isFavoriteWork ? "⭐ Favorita" : "☆ Favoritar"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showBulkModal && (
        <div
          className="bulk-modal-overlay"
          onClick={() => setShowBulkModal(false)}
        >
          <div className="bulk-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="bulk-modal-title">Coleção Comprada</h2>

            <div className="bulk-form-row">
              <div className="bulk-field">
                <label>Valor pago pela coleção</label>

                <input
                  type="number"
                  value={bulkPrice}
                  onChange={(e) => setBulkPrice(e.target.value)}
                  placeholder="Ex: 150,00"
                />
              </div>

              <div className="bulk-field">
                <label>Loja</label>

                <select
                  value={bulkStore}
                  onChange={(e) => setBulkStore(e.target.value)}
                >
                  <option value="">Selecione</option>

                  {STORE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bulk-field bulk-date">
                <label>Data</label>

                <input
                  type="date"
                  value={bulkDate}
                  onChange={(e) => setBulkDate(e.target.value)}
                />
              </div>
            </div>

            <div className="bulk-radio-group">
              <label>
                <input
                  type="radio"
                  checked={applyMode === "all"}
                  onChange={() => setApplyMode("all")}
                />
                Todos os volumes principais
              </label>

              <label>
                <input
                  type="radio"
                  checked={applyMode === "range"}
                  onChange={() => setApplyMode("range")}
                />
                Intervalo
              </label>
            </div>

            {applyMode === "range" && (
              <div className="bulk-range">
                <div className="bulk-field">
                  <label>De</label>

                  <input
                    type="number"
                    value={startVolume}
                    onChange={(e) => setStartVolume(Number(e.target.value))}
                  />
                </div>

                <div className="bulk-field">
                  <label>Até</label>

                  <input
                    type="number"
                    value={endVolume}
                    onChange={(e) => setEndVolume(Number(e.target.value))}
                  />
                </div>
              </div>
            )}

            <div className="bulk-summary">
              <p>
                <strong>{selectedVolumes.length}</strong> volumes serão
                preenchidos
              </p>

              <p>
                Valor médio:
                <strong> R$ {averagePrice.toFixed(2)}</strong>
              </p>
            </div>

            <div className="bulk-actions">
              <button
                className="bulk-cancel-btn"
                onClick={() => setShowBulkModal(false)}
              >
                Cancelar
              </button>

              <button className="bulk-save-btn" onClick={handleBulkPurchase}>
                Salvar Coleção
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedVolume && (
        <MyVolumeModal
          volume={selectedVolume}
          volumes={volumes}
          onSelectVolume={setSelectedVolume}
          onClose={() => setSelectedVolume(null)}
          onSaved={updateVolumeStatus}
        />
      )}
      {showEditionModal && (
        <MyCollectionEditionModal
          open={showEditionModal}
          onClose={() => setShowEditionModal(false)}
          seriesId={mainSeries.series_id}
          metadata={seriesMetadata}
          onSaved={(metadata) => {
            setSeriesMetadata(metadata);
            notifyChange();
          }}
        />
      )}
    </>
  );
}
