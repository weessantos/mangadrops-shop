import { useState } from "react";
import { useLockBodyScroll } from "../../hooks/my-collection-hooks/useLockBodyScroll";
import { useLoadingButton } from "../../hooks/useLoadingButton";

import {
  updateAvatar,
  updateBanner,
  updateUsername,
} from "../../hooks/my-collection-hooks/profileUpdates";

import { showError, showSuccess, showWarning } from "../../utils/alertFeedback";

import {
  getUnlockedAvatars,
  getUnlockedBanners,
} from "../../utils/my-collection/collectorRank";

import "../../styles/my-collection/my-profile-modal.css";

const avatars = Array.from(
  { length: 105 },
  (_, index) =>
    `/assets/my-collection/avatars/avatar${String(index + 1).padStart(2, "0")}.png`,
);

const banners = Array.from(
  { length: 50 },
  (_, index) =>
    `/assets/my-collection/banners/banner${String(index + 1).padStart(2, "0")}.webp`,
);

export default function AvatarModal({
  onClose,
  onSaved,
  username,
  avatarUrl,
  bannerUrl,
  collectorRank,
  investmentRank,
}) {
  const unlockedAvatars = getUnlockedAvatars(
    collectorRank.levelValue,
    collectorRank.rank === "ARCANISTA_SUPREMO",
  );

  const unlockedBanners = getUnlockedBanners(
    investmentRank.levelValue,
    collectorRank.rank === "ARCANISTA_SUPREMO",
  );

  const [newUsername, setNewUsername] = useState(username || "");

  const [activeTab, setActiveTab] = useState("avatar");

  const [selectedAvatar, setSelectedAvatar] = useState(avatarUrl);

  const [selectedBanner, setSelectedBanner] = useState(bannerUrl);

  const avatarLoading = useLoadingButton();

  const bannerLoading = useLoadingButton();

  const usernameLoading = useLoadingButton();

  useLockBodyScroll();

  function handleSelectAvatar(avatarUrl) {
    setSelectedAvatar(avatarUrl);
  }

  function handleSelectBanner(bannerUrl) {
    setSelectedBanner(bannerUrl);
  }

  async function handleSaveAvatar() {
    if (selectedAvatar === avatarUrl) {
      showWarning("Você já está usando este avatar.");
      return;
    }

    try {
      avatarLoading.start();

      await updateAvatar(selectedAvatar);

      showSuccess("Avatar atualizado com sucesso!");

      onSaved();
    } catch (error) {
      console.error(error);

      showError("Erro ao atualizar avatar.");
    } finally {
      avatarLoading.stop();
    }
  }

  async function handleSaveBanner() {
    if (selectedBanner === bannerUrl) {
      showWarning("Você já está usando este banner.");
      return;
    }

    try {
      bannerLoading.start();

      await updateBanner(selectedBanner);

      showSuccess("Banner atualizado com sucesso!");

      onSaved();
    } catch (error) {
      console.error(error);

      showError("Erro ao atualizar banner.");
    } finally {
      bannerLoading.stop();
    }
  }

  async function handleChangeUsername() {
    const usernameFormatted = newUsername.trim().toLowerCase();

    if (!usernameFormatted) {
      showWarning("Informe um nome de usuário.");
      return;
    }

    if (usernameFormatted.length < 3) {
      showWarning("O username deve possuir pelo menos 3 caracteres.");
      return;
    }

    if (usernameFormatted.length > 20) {
      showWarning("O username deve possuir no máximo 20 caracteres.");
      return;
    }

    if (!/^[a-z0-9_]+$/.test(usernameFormatted)) {
      showWarning("Use apenas letras minúsculas, números e underline (_).");
      return;
    }

    if (usernameFormatted === username) {
      showWarning("Você já está usando esse username.");
      return;
    }

    try {
      usernameLoading.start();

      await updateUsername(usernameFormatted);

      showSuccess("Username atualizado com sucesso!");

      onSaved();
    } catch (error) {
      console.error(error);

      showError(error?.message || "Erro ao atualizar username.");
    } finally {
      usernameLoading.stop();
    }
  }

  return (
    <div className="avatar-modal-overlay" onClick={onClose}>
      <div
        className="avatar-modal tablet-scale"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="avatar-modal-header">
          <h2>Editar Perfil</h2>

          <button className="avatar-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <p className="avatar-modal-subtitle">
          Colecione volumes, evolua seus ranks e desbloqueie novas
          personalizações.
        </p>

        <div className="profile-tabs">
          <button
            className={activeTab === "avatar" ? "active" : ""}
            onClick={() => setActiveTab("avatar")}
          >
            Avatar
          </button>

          <button
            className={activeTab === "banner" ? "active" : ""}
            onClick={() => setActiveTab("banner")}
          >
            Banner
          </button>

          <button
            className={activeTab === "username" ? "active" : ""}
            onClick={() => setActiveTab("username")}
          >
            Mudar nome
          </button>
        </div>

        <div className="profile-preview">
          <img
            src={selectedBanner}
            alt="Banner Preview"
            className="profile-preview-banner"
          />

          <img
            src={selectedAvatar}
            alt="Avatar Preview"
            className="profile-preview-avatar"
          />

          <div className="profile-preview-name">
            @{newUsername || username || "seu_nome"}
          </div>
        </div>

        {activeTab === "avatar" && (
          <>
            <div className="profile-unlock-info">
              Avatares desbloqueados • {unlockedAvatars}/{avatars.length}
            </div>

            <div className="avatar-content">
              <div className="avatar-grid">
                {avatars.map((avatar, index) => {
                  const unlocked = index < unlockedAvatars;

                  return (
                    <button
                      key={avatar}
                      className={`
                      avatar-option
                      ${selectedAvatar === avatar ? "selected" : ""}
                      ${!unlocked ? "locked" : ""}
                    `}
                      disabled={!unlocked || avatarLoading.loading}
                      onClick={() => unlocked && handleSelectAvatar(avatar)}
                    >
                      <img src={avatar} alt={`Avatar ${index + 1}`} />

                      {!unlocked && <div className="avatar-lock">🔒</div>}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {activeTab === "banner" && (
          <>
            <div className="profile-unlock-info">
              Banners desbloqueados • {unlockedBanners}/{banners.length}
            </div>

            <div className="banner-content">
              <div className="banner-grid">
                {banners.map((banner, index) => {
                  const unlocked = index < unlockedBanners;

                  return (
                    <button
                      key={banner}
                      className={`
                      banner-option
                      ${selectedBanner === banner ? "selected" : ""}
                      ${!unlocked ? "locked" : ""}
                    `}
                      disabled={!unlocked || bannerLoading.loading}
                      onClick={() => unlocked && handleSelectBanner(banner)}
                    >
                      <img src={banner} alt={`Banner ${index + 1}`} />

                      {!unlocked && <div className="avatar-lock">🔒</div>}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {activeTab === "username" && (
          <div className="username-content">
            <h3>Nome de usuário</h3>

            <p className="username-description">
              Username atual: <strong>@{username || "não definido"}</strong>
            </p>

            <p className="username-description">
              Este é o endereço público da sua coleção.
            </p>

            <div className="username-preview">
              mangasdrops.online/u/{newUsername || "seu_nome"}
            </div>

            <div className="usernameRulesBox">
              <p>✓ Apenas letras minúsculas (a-z)</p>
              <p>✓ Números (0-9)</p>
              <p>✓ Underline (_)</p>
              <p>✓ Entre 3 e 20 caracteres</p>
              <p>✕ Espaços e caracteres especiais não são permitidos</p>
            </div>

            <div className="username-form">
              <input
                type="text"
                value={newUsername}
                onChange={(e) =>
                  setNewUsername(
                    e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
                  )
                }
                placeholder="Digite seu username"
                maxLength={20}
              />

              <button
                className="save-username-btn"
                onClick={handleChangeUsername}
                disabled={usernameLoading.loading}
              >
                {usernameLoading.loading ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        )}
      </div>

      {(activeTab === "avatar" || activeTab === "banner") && (
        <div className="floating-save-bar">
          <button
            className="save-profile-btn"
            onClick={
              activeTab === "avatar" ? handleSaveAvatar : handleSaveBanner
            }
            disabled={
              activeTab === "avatar"
                ? avatarLoading.loading
                : bannerLoading.loading
            }
          >
            {activeTab === "avatar"
              ? avatarLoading.loading
                ? "Salvando..."
                : "Salvar Avatar"
              : bannerLoading.loading
                ? "Salvando..."
                : "Salvar Banner"}
          </button>
        </div>
      )}
    </div>
  );
}
