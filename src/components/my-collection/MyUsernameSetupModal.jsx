import { useState } from "react";

import { supabaseClient } from "../../lib/supabase";

import { showError, showSuccess } from "../../utils/alertFeedback";

import { useLockBodyScroll } from "../../hooks/my-collection-hooks/useLockBodyScroll";

import "../../styles/my-collection/my-username-modal.css";

export default function MyUsernameSetupModal({ onSaved }) {
  const [username, setUsername] = useState("");

  const [saving, setSaving] = useState(false);

  useLockBodyScroll();

  const handleSave = async () => {
    const normalized = username.trim().toLowerCase();

    if (normalized.length < 3) {
      showError("O username deve ter pelo menos 3 caracteres.");

      return;
    }

    const validUsername = /^[a-z0-9_]+$/.test(normalized);

    if (!validUsername) {
      showError("Use apenas letras, números e _.");

      return;
    }

    try {
      setSaving(true);

      const { data: existing } = await supabaseClient
        .from("user_profiles")
        .select("id")
        .eq("username", normalized)
        .maybeSingle();

      if (existing) {
        showError("Esse username já está em uso.");

        return;
      }

      const {
        data: { user },
      } = await supabaseClient.auth.getUser();

      if (!user) {
        showError("Usuário não encontrado.");

        return;
      }

      const { error } = await supabaseClient
        .from("user_profiles")
        .update({
          username: normalized,
        })
        .eq("id", user.id);

      if (error) {
        throw error;
      }

      showSuccess("Username criado com sucesso!");

      onSaved?.();
    } catch (error) {
      console.error(error);

      showError("Não foi possível salvar o username.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="usernameModalOverlay">
      <div className="usernameModal">
        <div className="usernameModalHeader">
          <h2>Bem-vindo ao Mangá Drops</h2>

          <p>Escolha um username único para ativar seu perfil público.</p>
        </div>

        <div className="usernameInputWrapper">
          <span>@</span>

          <input
            type="text"
            value={username}
            maxLength={20}
            placeholder="seu_username"
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="usernamePreview">
          mangadrops.com/u/
          {username.trim().toLowerCase() || "username"}
        </div>

        <p className="usernameRules">
          Use apenas letras, números e underline (_).
        </p>

        <p className="usernameRules">
          Escolha com sabedoria, pois o nome só poderá ser trocado após 30 dias.
        </p>

        <button
          className="usernameSaveBtn"
          disabled={saving}
          onClick={handleSave}
        >
          {saving ? "Salvando..." : "Continuar"}
        </button>
      </div>
    </div>
  );
}
