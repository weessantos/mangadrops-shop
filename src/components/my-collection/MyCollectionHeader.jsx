import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, BookOpen, Trophy, LogOut } from "lucide-react";

import MyConfirmationModal from "./MyConfirmationModal";
import "../../styles/my-collection/my-collection-header.css";

export default function MyCollectionHeader({
  onLogout,
  currentPage = "collection",
}) {
  const navigate = useNavigate();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <>
      <header className="collectionHeader">
        <div className="collectionHeaderBar">
          <button className="collectionLogoBtn" onClick={() => navigate("/")}>
            <img
              src="/assets/logo.png"
              alt="Mangá Drops"
              className="collectionLogo"
            />
          </button>

          {/* Desktop / Tablet */}
          <nav className="collectionNav">
            <button className="collectionNavBtn" onClick={() => navigate("/")}>
              Mangá Drops
            </button>

            <button
              className={`collectionCollectionBtn ${
                currentPage === "collection" ? "active" : ""
              }`}
              type="button"
              onClick={() => navigate("/minha-colecao")}
            >
              Mangá Drops Acervo
            </button>
          </nav>

          <div className="collectionActions">
            <button
              className={`compactNavBtn ${
                currentPage === "achievements" ? "active" : ""
              }`}
              onClick={() => navigate("/minhas-conquistas")}
            >
              Conquistas
            </button>

            <button
              className="compactNavBtn"
              onClick={() => setShowLogoutConfirm(true)}
            >
              Sair
            </button>
          </div>

          {/* Mobile */}
          <div className="mobileHeaderNav">
            <div className="mobileHeaderMain">
              <button
                className="mobileHeaderBtn"
                onClick={() => navigate("/")}
                title="Mangá Drops"
              >
                <Home size={18} />
              </button>

              <button
                className={`mobileHeaderBtn ${
                  currentPage === "collection" ? "active" : ""
                }`}
                onClick={() => navigate("/minha-colecao")}
                title="Mangá Drops Acervo"
              >
                <BookOpen size={18} />
              </button>

              <button
                className={`mobileHeaderBtn ${
                  currentPage === "achievements" ? "active" : ""
                }`}
                onClick={() => navigate("/minhas-conquistas")}
                title="Conquistas"
              >
                <Trophy size={18} />
              </button>
            </div>

            <button
              className="mobileHeaderBtn logoutBtn"
              onClick={() => setShowLogoutConfirm(true)}
              title="Sair"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>
      <MyConfirmationModal
        open={showLogoutConfirm}
        title="Deseja sair?"
        message="Você será desconectado da sua conta."
        confirmText="Sair"
        onConfirm={onLogout}
        onClose={() => setShowLogoutConfirm(false)}
      />
    </>
  );
}
