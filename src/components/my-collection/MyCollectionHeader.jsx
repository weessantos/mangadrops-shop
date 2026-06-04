import { useNavigate } from "react-router-dom";
import { Home, BookOpen, Trophy, LogOut } from "lucide-react";

import "../../styles/my-collection/my-collection-header.css";


export default function MyCollectionHeader({ onLogout, onOpenAchievements }) {
  const navigate = useNavigate();

  return (
    <header className="collectionHeader">
      <div className="collectionHeaderBar">
        <button className="collectionLogoBtn" onClick={() => navigate("/")}>
          <img
            src="/assets/logo.png"
            alt="Mangás Drops"
            className="collectionLogo"
          />
        </button>

        {/* Desktop / Tablet */}
        <nav className="collectionNav">
          <button className="collectionNavBtn" onClick={() => navigate("/")}>
            Mangás Drops
          </button>

          <button className="collectionCollectionBtn" type="button">
            Minha Coleção
          </button>
        </nav>

        <div className="collectionActions">
          <button className="compactNavBtn" onClick={onOpenAchievements}>
            Conquistas
          </button>

          <button className="compactNavBtn" onClick={onLogout}>
            Sair
          </button>
        </div>

        {/* Mobile */}
        <div className="mobileHeaderNav">
          <div className="mobileHeaderMain">
            <button
              className="mobileHeaderBtn"
              onClick={() => navigate("/")}
              title="Mangás Drops"
            >
              <Home size={18} />
            </button>

            <button className="mobileHeaderBtn active" title="Minha Coleção">
              <BookOpen size={18} />
            </button>

            <button
              className="mobileHeaderBtn"
              onClick={onOpenAchievements}
              title="Conquistas"
            >
              <Trophy size={18} />
            </button>
          </div>

          <button
            className="mobileHeaderBtn logoutBtn"
            onClick={onLogout}
            title="Sair"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
