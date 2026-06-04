import { useState } from "react";
import { supabaseClient } from "../../lib/supabase";

import "../../styles/my-collection/my-login-page.css";

import {
  showError,
  showSuccess,
  showWarning,
  getAuthErrorMessage,
} from "../../utils/alertFeedback";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");

  async function handleResetPassword() {
    if (!email) {
      showWarning("Digite seu email.");
      return;
    }

    const { error } =
      await supabaseClient.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/auth/redefinir-senha`,
        }
      );

    if (error) {
      showError(getAuthErrorMessage(error));
      return;
    }

    showSuccess(
      "Se o email existir, enviaremos um link de recuperação."
    );
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

        <h1>Recuperar senha</h1>

        <p className="login-subtitle">
          Digite seu email e enviaremos um link para redefinir sua senha.
        </p>

        <div className="login-form">
          <input
            type="email"
            placeholder="Seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            type="button"
            className="login-btn"
            onClick={handleResetPassword}
          >
            Enviar link
          </button>
        </div>

        <button
          type="button"
          className="back-home-btn"
          onClick={() => (window.location.href = "/auth/login")}
        >
          ← Voltar ao login
        </button>

        <p className="login-footer">
          Sua coleção. Sua jornada.
        </p>
      </div>
    </div>
  );
}