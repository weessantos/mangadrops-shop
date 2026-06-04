import { useState } from "react";
import { supabaseClient } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";

import "../../styles/my-collection/my-login-page.css";
import {
  showError,
  showSuccess,
  showWarning,
  getAuthErrorMessage,
} from "../../utils/alertFeedback";

export default function LoginPage() {
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();

    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      showError(getAuthErrorMessage(error));
      return;
    }

    window.location.href = "/minha-colecao";
  }

  async function handleForgotPassword() {
    if (!email) {
      showWarning("Digite seu email primeiro.");
      return;
    }

    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/redefinir-senha`,
    });

    if (error) {
      showError(getAuthErrorMessage(error));
      return;
    }

    showSuccess("Enviamos um link de recuperação para seu email.");
  }

  return (
    <div className="login-page">
      <div className="login-overlay" />

      <div className="login-card">
        <img src="/assets/logo.png" alt="Mangá Drops" className="login-logo" />

        <h1>Bem-vindo</h1>

        <p className="login-subtitle">
          Organize sua coleção, acompanhe seus volumes e evolua seu rank de
          colecionador.
        </p>

        <form onSubmit={handleLogin} className="login-form">
          <input
            type="email"
            placeholder="Seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="forgot-password-btn"
            onClick={() => navigate("/auth/esqueci-senha")}
          >
            Esqueci minha senha
          </button>

          <button type="submit" className="login-btn">
            Entrar
          </button>
        </form>

        <div className="login-divider">
          <span>ou</span>
        </div>

        <button
          type="button"
          className="register-btn"
          onClick={() => (window.location.href = "/auth/registrar")}
        >
          Criar Conta
        </button>

        <button
          type="button"
          className="back-home-btn"
          onClick={() => (window.location.href = "/")}
        >
          ← Voltar para o site
        </button>

        <p className="login-footer">Sua coleção. Sua jornada.</p>
      </div>
    </div>
  );
}
