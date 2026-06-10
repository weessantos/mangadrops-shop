import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Share2 } from "lucide-react";

import { supabaseClient } from "../../lib/supabase";

import {
  showError,
  showSuccess,
  getAuthErrorMessage,
} from "../../utils/alertFeedback";

import "../../styles/my-collection/my-collection-public-header.css";

export default function MyCollectionPublicHeader() {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();

      setIsLoggedIn(!!user);
    }

    checkAuth();
  }, []);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);

      showSuccess("Perfil copiado para a área de transferência!");
    } catch {
      showError("Não foi possível copiar o link.");
    }
  };

  return (
    <header className="publicHeader">
      <div className="publicHeaderBar">
        <button className="publicLogoBtn" onClick={() => navigate("/")}>
          <img
            src="/assets/logo.png"
            alt="Mangá Drops"
            className="publicLogo"
          />
        </button>

        <div className="publicHeaderActions">
          {isLoggedIn ? (
            <button
              className="publicActionBtn"
              onClick={() => navigate("/minha-colecao")}
            >
              Meu Acervo
            </button>
          ) : (
            <button
              className="publicActionBtn"
              onClick={() => navigate("/auth/login")}
            >
              Entrar
            </button>
          )}
          <button className="publicShareBtn" onClick={handleShare}>
            <Share2 size={14} />
            <span>Compartilhar</span>
          </button>
        </div>
      </div>
    </header>
  );
}
