import { useLockBodyScroll } from "../../hooks/my-collection-hooks/useLockBodyScroll";

import { useEffect, useState } from "react";

import { supabaseClient } from "../../lib/supabase";

import { showSuccess, showError } from "../../utils/alertFeedback";

import "../../styles/my-collection/my-profile-modal.css";

export default function MyEditPublicProfileModal({ onClose, username }) {
  const [user, setUser] = useState(null);

  const [profilePublic, setProfilePublic] = useState(false);

  const [showCollectionValue, setShowCollectionValue] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  async function loadPreferences() {
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) return;

    setUser(user);

    const { data, error } = await supabaseClient
      .from("user_profile_preferences")
      .select(
        `
      profile_public,
      show_collection_value
    `,
      )
      .eq("user_id", user.id)
      .single();

    if (error || !data) return;

    setProfilePublic(data.profile_public);

    setShowCollectionValue(data.show_collection_value);
  }

  const handleTogglePublicProfile = async () => {
    const newValue = !profilePublic;

    setProfilePublic(newValue);

    const { error } = await supabaseClient
      .from("user_profile_preferences")
      .update({
        profile_public: newValue,
      })
      .eq("user_id", user.id);

    if (error) {
      setProfilePublic(!newValue);

      showError("Não foi possível atualizar o perfil público.");

      return;
    }

    showSuccess(
      newValue ? "Perfil público ativado!" : "Perfil público desativado!",
    );
  };

  const handleToggleCollectionValue = async () => {
    const newValue = !showCollectionValue;

    setShowCollectionValue(newValue);

    const { error } = await supabaseClient
      .from("user_profile_preferences")
      .update({
        show_collection_value: newValue,
      })
      .eq("user_id", user.id);

    if (error) {
      setShowCollectionValue(!newValue);

      showError("Não foi possível atualizar a configuração.");

      return;
    }

    showSuccess(
      newValue
        ? "Valor da coleção visível no perfil."
        : "Valor da coleção ocultado do perfil.",
    );
  };

  const handleViewPublicProfile = () => {
    window.open(`/u/${username}`, "_blank");
  };

  useLockBodyScroll();

  return (
    <div className="publicProfileModalOverlay" onClick={onClose}>
      <div className="publicProfileModal" onClick={(e) => e.stopPropagation()}>
        <button
          className="publicProfileModalClose"
          onClick={onClose}
          aria-label="Fechar"
        >
          ✕
        </button>

        <div className="publicProfileModalHeader">
          <h2>Perfil Público</h2>

          <p>
            Controle quais informações ficam visíveis para outros
            colecionadores.
          </p>
        </div>

        <div className="publicProfileSettings">
          <div className="publicProfileSetting">
            <div className="publicProfileSettingInfo">
              <h3>Perfil público</h3>

              <p>Permite que outras pessoas visualizem sua coleção.</p>
            </div>

            <label className="publicProfileSwitch">
              <input
                type="checkbox"
                checked={profilePublic}
                onChange={handleTogglePublicProfile}
              />

              <span className="slider" />
            </label>
          </div>

          <div className="publicProfileSetting">
            <div className="publicProfileSettingInfo">
              <h3>Mostrar valor da coleção</h3>

              <p>Exibe o investimento total realizado no perfil público.</p>
            </div>

            <label className="publicProfileSwitch">
              <input
                type="checkbox"
                checked={showCollectionValue}
                onChange={handleToggleCollectionValue}
              />

              <span className="slider" />
            </label>
          </div>
        </div>
        
        <button
          className={`viewPublicProfileBtn ${!profilePublic ? "disabled" : ""}`}
          onClick={handleViewPublicProfile}
          disabled={!profilePublic}
        >
          Visualizar meu perfil público
        </button>

        <div className="publicProfileTips">
          <h3>✨ Dicas para destacar seu perfil</h3>

          <ul>
            <li>Vá para uma coleção e marque ela como favorita do perfil</li>

            <li>
              Você também pode fazer isso com o volume preferido e o mais raro
            </li>

            <li>Seu avatar e banner selecionados são exibidos no perfil</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
