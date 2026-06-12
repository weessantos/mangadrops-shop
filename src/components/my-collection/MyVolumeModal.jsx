import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabaseClient } from "../../lib/supabase";

import "../../styles/my-collection/my-volume-modal.css";

import { useLockBodyScroll } from "../../hooks/my-collection-hooks/useLockBodyScroll";
import { showError, showSuccess, showWarning } from "../../utils/alertFeedback";

import { STORE_OPTIONS } from "../../utils/my-collection/stores";
import { img } from "../../utils/images";

import { Eye, ChevronLeft, ChevronRight } from "lucide-react";

export default function MyVolumeModal({
  volume,
  volumes,
  onSelectVolume,
  onClose,
  onSaved,
}) {
  // ==========================================
  // ESTADO DO VOLUME DO USUÁRIO
  // ==========================================

  const [status, setStatus] = useState("missing");

  const [price, setPrice] = useState("");

  const [store, setStore] = useState("");

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const [favoriteVolumeId, setFavoriteVolumeId] = useState(null);
  const [rareVolumeId, setRareVolumeId] = useState(null);

  const currentIndex = volumes.findIndex((v) => v.id === volume.id);

  const navigate = useNavigate();

  useLockBodyScroll();

  // ==========================================
  // MONTAGEM DE SLUG PARA NAVEGAÇÃO
  // ==========================================

  const volumeUrl = `/${volume.collection_title
    .toLowerCase()
    .replaceAll(" ", "-")}/${volume.code}`;

  function getVolumeUrl() {
    const slug = volume.collection_title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replaceAll(" ", "-");

    const code = volume.code.replace(/([a-z]+)(\d+)/i, "$1-$2");

    return `/${slug}/${code}`;
  }

  // ==========================================
  // CARREGA DADOS DO USUÁRIO
  // ==========================================

  useEffect(() => {
    loadUserData();
  }, [volume.id]);

  async function loadUserData() {
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    const { data: preferences } = await supabaseClient
      .from("user_profile_preferences")
      .select("favorite_volume_id, rarest_volume_id")
      .eq("user_id", user.id)
      .maybeSingle();

    setFavoriteVolumeId(preferences?.favorite_volume_id || null);
    setRareVolumeId(preferences?.rarest_volume_id || null);

    const { data, error } = await supabaseClient
      .from("user_collection")
      .select("*")
      .eq("user_id", user.id)
      .eq("volume_id", volume.id)
      .maybeSingle();

    if (error) {
      console.error(error);
      return;
    }

    // Usuário nunca cadastrou este volume
    if (!data) {
      setStatus("missing");
      setPrice("");
      setStore("");
      setDate(new Date().toISOString().split("T")[0]);
      return;
    }

    // Status
    setStatus(data.status || "missing");

    // Compra
    setPrice(data.purchase_price || "");

    // Banco salva "Amazon"
    // Select usa "amazon"
    setStore(
      data.purchase_store
        ? data.purchase_store.toLowerCase().replaceAll(" ", "_")
        : "",
    );

    setDate(data.purchase_date || new Date().toISOString().split("T")[0]);
  }

  const isFavoriteVolume = Number(favoriteVolumeId) === Number(volume.id);

  const isRareVolume = Number(rareVolumeId) === Number(volume.id);

  // ==========================================
  // NAVEGAÇÃO ENTRE VOLUMES
  // ==========================================
  function handlePrevious() {
    const previousIndex =
      currentIndex === 0 ? volumes.length - 1 : currentIndex - 1;

    onSelectVolume(volumes[previousIndex]);
  }

  function handleNext() {
    const nextIndex =
      currentIndex === volumes.length - 1 ? 0 : currentIndex + 1;

    onSelectVolume(volumes[nextIndex]);
  }

  // ==========================================
  // SALVAR FAVORITO
  // ==========================================
  async function handleFavoriteVolume() {
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    const { error } = await supabaseClient
      .from("user_profile_preferences")
      .upsert({
        user_id: user.id,
        favorite_volume_id: volume.id,
      });

    if (error) {
      console.error(error);
      showError("Erro ao salvar volume favorito.");
      return;
    }

    setFavoriteVolumeId(volume.id);

    showSuccess("Volume favorito atualizado!");
  }

  // ==========================================
  // SALVAR RARIDADE
  // ==========================================
  async function handleRareVolume() {
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    const { error } = await supabaseClient
      .from("user_profile_preferences")
      .upsert({
        user_id: user.id,
        rarest_volume_id: volume.id,
      });

    if (error) {
      console.error(error);
      showError("Erro ao salvar volume raro.");
      return;
    }

    setRareVolumeId(volume.id);

    showSuccess("Volume mais raro atualizado!");
  }

  // ==========================================
  // SALVAR COMPRA
  // ==========================================

  async function handleSave() {
    if (status === "owned" && (!price || Number(price) <= 0)) {
      console.log("Toast disparou");
      showError("Informe o valor pago pelo volume.");
      return;
    }

    if (status === "owned" && !store) {
      showError("Selecione a loja onde comprou o volume.");
      return;
    }

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    console.log("Status ao salvar:", status);

    // Não possuo = remove da coleção
    if (status === "missing") {
      const { data, error } = await supabaseClient
        .from("user_collection")
        .delete()
        .eq("user_id", user.id)
        .eq("volume_id", volume.id)
        .select();

      if (error) {
        console.error(error);
        showWarning("Erro ao remover volume.");
        return;
      }

      onSaved(volume.id, "missing");
      onClose();
      return;
    }

    // Wishlist ou Comprado
    const { error } = await supabaseClient.from("user_collection").upsert(
      {
        user_id: user.id,
        volume_id: volume.id,

        status,

        purchase_price: status === "owned" ? Number(price || 0) : null,

        purchase_store: status === "owned" ? store || null : null,

        purchase_date: status === "owned" ? date || null : null,
      },
      {
        onConflict: "user_id,volume_id",
      },
    );

    if (error) {
      console.error(error);

      showWarning("Erro ao salvar volume.");
      return;
    }

    onSaved(volume.id, status);
    onClose();
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="my-volume-modal-overlay" onClick={onClose}>
      <div
        className={`my-volume-modal tablet-scale-strong ${
          status === "owned"
            ? "owned"
            : status === "wishlist"
              ? "wishlist"
              : "missing"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="my-volume-modal-header">
          <h2>{volume.title}</h2>

          <div className="my_volume-modal-header-left">
            <button
              type="button"
              className="view-volume-btn"
              onClick={() => {
                window.open(getVolumeUrl(), "_blank", "noopener,noreferrer");
              }}
            >
              <Eye /> Ver volume
            </button>

            <button className="my-volume-modal-close" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        <button
          type="button"
          className="volume-nav-btn volume-nav-prev"
          onClick={handlePrevious}
        >
          <ChevronLeft />
        </button>

        <button
          type="button"
          className="volume-nav-btn volume-nav-next"
          onClick={handleNext}
        >
          <ChevronRight />
        </button>

        <div className="my-volume-modal-body">
          <div className="my-volume-cover-wrapper">
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

            <div className={`volume-status-banner ${status}`}>
              {status === "owned" && "✓ Comprado"}
              {status === "wishlist" && "★ Desejo comprar"}
              {status === "missing" && "○ Não possuo"}
            </div>
          </div>

          <div className="my-volume-form">
            {/* STATUS */}
            <div className="field">
              <label>Status</label>

              <div className="status-options">
                <button
                  type="button"
                  onClick={() => setStatus("missing")}
                  className={
                    status === "missing"
                      ? "status-btn active-missing"
                      : "status-btn"
                  }
                >
                  Não possuo
                </button>

                <button
                  type="button"
                  onClick={() => setStatus("wishlist")}
                  className={
                    status === "wishlist"
                      ? "status-btn active-wishlist"
                      : "status-btn"
                  }
                >
                  Desejo comprar
                </button>

                <button
                  type="button"
                  onClick={() => setStatus("owned")}
                  className={
                    status === "owned"
                      ? "status-btn active-owned"
                      : "status-btn"
                  }
                >
                  Comprado
                </button>
              </div>
            </div>

            {/* CAMPOS DE COMPRA */}
            {status === "owned" && (
              <>
                <div className="field">
                  <label>Valor pago</label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>

                <div className="field">
                  <label>Loja</label>

                  <select
                    value={store}
                    onChange={(e) => setStore(e.target.value)}
                  >
                    <option value="">Selecione</option>

                    {STORE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label>Data da compra</label>

                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="saveActions">
              {status === "owned" && (
                <>
                  <button
                    className={`favoriteVolumeButton ${
                      isFavoriteVolume ? "active" : ""
                    }`}
                    onClick={handleFavoriteVolume}
                  >
                    {isFavoriteVolume ? "⭐ Favorito" : "☆ Favoritar"}
                  </button>

                  <button
                    className={`rareVolumeButton ${
                      isRareVolume ? "active" : ""
                    }`}
                    onClick={handleRareVolume}
                  >
                    {isRareVolume ? "💎 Mais Raro" : "◇ Raridade"}
                  </button>
                </>
              )}

              <button className="save-button" onClick={handleSave}>
                Salvar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
