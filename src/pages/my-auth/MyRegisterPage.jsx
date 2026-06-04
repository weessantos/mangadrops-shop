/**
 * ==========================================================
 * REGISTRO DE USUÁRIO
 * ==========================================================
 *
 * 1. Cria usuário no Auth do Supabase.
 * 2. Cria perfil em user_profiles.
 * 3. Redireciona para login.
 *
 * Auth:
 * - email
 * - senha
 *
 * User Profile:
 * - display_name
 * - avatar
 * - banner
 * - rank
 *
 * ==========================================================
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabaseClient } from "../../lib/supabase";
import {
  showError,
  showSuccess,
  showWarning,
  getAuthErrorMessage,
} from "../../utils/alertFeedback";

import "../../styles/my-collection/my-login-page.css";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  function formatName(value) {
    return value
      .replace(/[^a-zA-ZÀ-ÿ]/g, "")
      .toLowerCase()
      .replace(/^./, (char) => char.toUpperCase());
  }

  async function handleRegister(e) {
    e.preventDefault();

    if (!firstName || !lastName) {
      showWarning("Informe nome e sobrenome.");
      return;
    }

    if (password !== confirmPassword) {
      showWarning("As senhas não coincidem.");
      return;
    }

    const displayName = `${firstName} ${lastName}`;

    const { error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });

    if (error?.message?.includes("rate limit")) {
      showWarning(
        "Muitas tentativas realizadas. Aguarde alguns minutos e tente novamente.",
      );

      return;
    }

    if (error) {
      showError(error.message);
      return;
    }

    showSuccess("Conta criada! Verifique seu email para confirmar o cadastro.");

    navigate("/auth/login");
  }

  return (
    <div className="login-page">
      <div className="login-overlay" />

      <div className="login-card">
        <img src="/assets/logo.png" alt="Mangá Drops" className="login-logo" />

        <h2>Criar Conta</h2>

        <p className="login-subtitle">
          Comece sua jornada de colecionador e acompanhe cada volume da sua
          coleção.
        </p>

        <form onSubmit={handleRegister} className="login-form">
          <input
            type="text"
            placeholder="Nome"
            value={firstName}
            onChange={(e) => setFirstName(formatName(e.target.value))}
            maxLength={20}
          />

          <input
            type="text"
            placeholder="Sobrenome"
            value={lastName}
            onChange={(e) => setLastName(formatName(e.target.value))}
            maxLength={20}
          />

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

          <input
            type="password"
            placeholder="Confirmar senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button type="submit" className="login-btn">
            Criar Conta
          </button>
        </form>

        <div className="login-divider">
          <span>ou</span>
        </div>

        <button
          type="button"
          className="register-btn"
          onClick={() => navigate("/auth/login")}
        >
          Já possuo conta
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
