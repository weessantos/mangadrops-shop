import { useState } from "react";

import {
  FaTiktok,
  FaInstagram,
  FaBookOpen,
  FaChevronDown,
} from "react-icons/fa";

import "../styles/brand-stats.css";

export default function BrandStats() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section
      className={`brandStatsHero ${isExpanded ? "isExpanded" : ""}`}
      aria-label="Redes sociais do Mangá Drops"
    >
      <div className="brandStatsContent">
        {/* HEADER */}
        <div className="brandStatsHeader">
          <div className="brandStatsHeaderTop">
            <div>
              <h2 id="brandStatsTitle" className="sectionTitle">
                Acompanhe o Mangá Drops
              </h2>

              <p id="brandStatsSubtitle" className="sectionSubtitle">
                +130 mil visualizações nas redes sociais.
              </p>
            </div>

            <button
              className="brandStatsToggle"
              onClick={() => setIsExpanded((prev) => !prev)}
              aria-expanded={isExpanded}
            >
              {isExpanded ? "Fechar" : "Ver redes"}

              <FaChevronDown
                className={`toggleIcon ${isExpanded ? "isOpen" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* GRID */}
        <div className={`brandStatsGrid ${isExpanded ? "isVisible" : ""}`}>
          {/* TIKTOK */}
          <a
            href="https://www.tiktok.com/@_mangadrops"
            className="socialCard socialTikTok"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="socialGlow" />

            <div className="socialIconBg">
              <FaTiktok />
            </div>

            <div className="socialBadge">Principal rede</div>

            <div className="socialHeading">
              <FaTiktok className="socialIcon" />

              <span className="socialName">TikTok</span>
            </div>

            <div className="socialTop">
              <span className="socialMetric">+100 mil views</span>
            </div>

            <p className="socialDescription">
              Reviews rápidas, novidades e os melhores achados.
            </p>
          </a>

          {/* INSTAGRAM */}
          <a
            href="https://www.instagram.com/_mangadrops"
            className="socialCard socialInstagram"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="socialGlow" />

            <div className="socialIconBg">
              <FaInstagram />
            </div>

            <div className="socialBadge">Crescendo</div>

            <div className="socialHeading">
              <FaInstagram className="socialIcon" />

              <span className="socialName">Instagram</span>
            </div>

            <div className="socialTop">
              <span className="socialMetric">Atualizações semanais</span>
            </div>

            <p className="socialDescription">
              Bastidores, coleções e atualizações frequentes.
            </p>
          </a>

          {/* COMMUNITY */}
          <div className="socialCard socialCommunity">
            <div className="socialGlow" />

            <div className="socialIconBg">
              <FaBookOpen />
            </div>

            <div className="socialBadge">Atualizado</div>

            <div className="socialHeading">
              <FaBookOpen className="socialIcon" />

              <span className="socialName">Mangá Drops</span>
            </div>

            <div className="socialTop">
              <span className="socialMetric">+250 volumes organizados</span>
            </div>

            <p className="socialDescription">
              Catálogo organizado com novidades e reposições semanais.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
