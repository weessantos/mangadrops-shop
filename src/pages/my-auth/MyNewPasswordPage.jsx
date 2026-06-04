import { useState } from "react";
import { supabaseClient } from "../../lib/supabase";

import "../../styles/my-collection/my-login-page.css";

import {
  showError,
  showSuccess,
  getAuthErrorMessage,
} from "../../utils/alertFeedback";

export default function NewPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleSavePassword(e) {
    e.preventDefault();

    if (!password || !confirmPassword) {
      showError("Preencha todos os campos.");
      return;
    }

    if (password.length < 6) {
      showError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      showError("As senhas não coincidem.");
      return;
    }

    const { error } = await supabaseClient.auth.updateUser({
      password,
    });

    if (error) {
      showError(getAuthErrorMessage(error));
      return;
    }

    showSuccess("Senha alterada com sucesso!");

    setTimeout(() => {
      window.location.href = "/auth/login";
    }, 1500);
  }

  return (
    <div className="login-page">
      <div className="login-overlay" />

      <div className="login-card">
        <img
          src="/assets/logo.png"
          alt="Mangá Drops"
          className="login-logo"
        />

        <h1>Nova senha</h1>

        <p className="login-subtitle">
          Escolha uma nova senha para sua conta.
        </p>

        <form onSubmit={handleSavePassword} className="login-form">
          <input
            type="password"
            placeholder="Nova senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="Confirmar senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button type="submit" className="login-btn">
            Salvar senha
          </button>
        </form>

        <p className="login-footer">
          Sua coleção. Sua jornada.
        </p>
      </div>
    </div>
  );
}