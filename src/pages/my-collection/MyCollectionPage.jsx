/**
 * ==========================================================
 * Mangá Drops Acervo
 * ==========================================================
 *
 * RESPONSABILIDADES:
 *
 * - Carregar todas as coleções do catálogo.
 * - Carregar a coleção do usuário.
 * - Agrupar os volumes por coleção.
 * - Calcular progresso.
 * - Calcular status visual da coleção.
 * - Abrir e fechar o modal da coleção.
 *
 * STATUS POSSÍVEIS:
 *
 * empty
 * Nenhum volume marcado.
 *
 * wishlist
 * Possui volumes desejados mas nenhum comprado.
 *
 * collecting
 * Possui pelo menos um volume comprado.
 *
 * complete
 * Todos os volumes da coleção foram comprados.
 *
 * ==========================================================
 */

import { Helmet } from "react-helmet-async";

import { useEffect, useState, useRef } from "react";

import { useSearchParams } from "react-router-dom";

import { useLogout } from "../../hooks/my-collection-hooks/useLogout";

import CollectorRankModal from "../../components/my-collection/MyCollectorRankModal";

import MyCollectionModal from "../../components/my-collection/MyCollectionModal";

import MyCollectionHeader from "../../components/my-collection/MyCollectionHeader";

import MyCollectionFooter from "../../components/my-collection/MyCollectionFooter";

import AvatarModal from "../../components/my-collection/MyProfileModal";

import MyEditPublicProfileModal from "../../components/my-collection/MyEditPublicProfileModal";

import MyUsernameSetupModal from "../../components/my-collection/MyUsernameSetupModal";

import { useCollectionStats } from "../../hooks/my-collection-hooks/useCollectionStats";

import Loader from "../../components/Loader";
import "../../styles/my-collection/my-collection-page.css";

export default function MyCollectionPage() {
  const [usernameModalOpen, setUsernameModalOpen] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const [publicProfileModalOpen, setPublicProfileModalOpen] = useState(false);

  const [rankModalOpen, setRankModalOpen] = useState(false);

  const collectionId = searchParams.get("collection");

  const [visibleCount, setVisibleCount] = useState(20);

  const loadMoreRef = useRef(null);

  const {
    loading,
    series,
    userName,
    username,
    avatarUrl,
    bannerUrl,
    totalOwnedVolumes,
    totalSpent,
    completedCollections,
    collectingCollections,
    collectorLevel,
    loyaltyLevel,
    loyaltyEnabled,
    loyaltyLoginDays,
    totalAchievements,
    collectorRank,
    investmentRank,
    memberSince,
    filter,
    setFilter,
    sortBy,
    setSortBy,
    reload,
  } = useCollectionStats();

  const visibleSeries = series.slice(0, visibleCount);

  const handleLogout = useLogout();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 20, series.length));
        }
      },
      {
        rootMargin: "300px",
      },
    );

    const current = loadMoreRef.current;

    if (current) {
      observer.observe(current);
    }

    return () => {
      if (current) {
        observer.unobserve(current);
      }
    };
  }, [series.length]);

  useEffect(() => {
    setVisibleCount(20);

    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, [filter, sortBy]);

  useEffect(() => {
    if (!loading && !username) {
      setUsernameModalOpen(true);
    }
  }, [loading, username]);

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <Helmet>
        <title>Mangá Drops Acervo | Organize sua coleção de mangás</title>

        <meta
          name="description"
          content="Controle volumes, acompanhe séries completas, wishlist, conquistas e estatísticas da sua coleção de mangás."
        />
      </Helmet>{" "}
      {/* Header */}
      <MyCollectionHeader onLogout={handleLogout} currentPage="collection" />
      <div className="collection-page">
        {/* ======================================
      PERFIL DO COLECIONADOR
      ====================================== */}
        <section className="collection-profile">
          <div className="collection-banner">
            {bannerUrl && <img src={bannerUrl} alt="Banner" />}
          </div>

          <div className="hero-content">
            <div className="avatar-container">
              {avatarUrl && (
                <img
                  src={avatarUrl}
                  alt={userName}
                  className="profile-avatar"
                  onClick={() => setRankModalOpen(true)}
                />
              )}

              <button
                className="avatar-edit-btn"
                onClick={() => setProfileModalOpen(true)}
                title="Editar perfil"
              >
                <img
                  src="/assets/my-collection/icons/editar-perfil.png"
                  alt="Editar perfil"
                />
              </button>
            </div>

            <div className="collection-profile-info">
              <div className="profile-level-tag">Nível {collectorLevel}</div>

              <div className="profile-header">
                <h1>{userName}</h1>
              </div>

              <div
                className="collector-badge-showcase"
                title={collectorRank?.title || ""}
              >
                {collectorRank && (
                  <>
                    <img
                      onClick={() => setRankModalOpen(true)}
                      src={collectorRank.badge}
                      alt={collectorRank.title}
                      className="collector-main-badge"
                    />
                    <span className="collector-rank-title">
                      {collectorRank.title}
                    </span>
                  </>
                )}
              </div>
              <div className="MDAProfile-stats">
                <div className="profile-summary">
                  <div className="summary-item">
                    <strong>{totalOwnedVolumes}</strong>
                    <span>Volumes</span>
                  </div>

                  <div className="summary-item">
                    <strong>{completedCollections}</strong>
                    <span>Completas</span>
                  </div>

                  <div className="summary-item">
                    <strong>{totalAchievements}</strong>
                    <span>Conquistas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* ======================================
    HEADER
====================================== */}
        <div className="collection-header">
          <div className="collection-header-info">
            <span className="collection-header-label">MANGÁ DROPS ACERVO</span>

            <h2>Minha coleção</h2>
          </div>

          <button
            className="public-profile-badge"
            onClick={() => setPublicProfileModalOpen(true)}
          >
            🌐 Perfil Público
          </button>
        </div>

        {/* ======================================
    FILTROS
====================================== */}
        <div className="collection-toolbar tablet-scale">
          {/* Desktop */}
          <div className="collection-filters desktopFilters">
            <button
              title="Exibe todas as obras do catálogo."
              className={filter === "all" ? "active" : ""}
              onClick={() => setFilter("all")}
            >
              📚 Todas
            </button>

            <button
              title="Obras com pelo menos um volume comprado."
              className={filter === "owned" ? "active" : ""}
              onClick={() => setFilter("owned")}
            >
              📦 Compradas
            </button>

            <button
              title="Obras com a série principal concluída."
              className={filter === "complete" ? "active" : ""}
              onClick={() => setFilter("complete")}
            >
              🏆 Completas
            </button>

            <button
              title="Obras 100% concluídas, incluindo todos os extras."
              className={filter === "complete-plus" ? "active" : ""}
              onClick={() => setFilter("complete-plus")}
            >
              💎 Completas+
            </button>

            <button
              title="Volumes que você deseja adquirir."
              className={filter === "wishlist" ? "active" : ""}
              onClick={() => setFilter("wishlist")}
            >
              ⭐ Wishlist
            </button>

            <button
              title="Obras que ainda não possuem volumes comprados nem desejados."
              className={filter === "missing" ? "active" : ""}
              onClick={() => setFilter("missing")}
            >
              ❌ Não possuo
            </button>
          </div>
          {/* Mobile */}
          <div className="mobileFilterSelect">
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">📚 Todas</option>
              <option value="owned">📦 Compradas</option>
              <option value="complete">🏆 Completas</option>
              <option value="complete-plus">💎 Completas+</option>
              <option value="wishlist">⭐ Wishlist</option>
              <option value="missing">❌ Não possuo</option>
            </select>
          </div>

          <div className="collection-sort">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="title-asc">A-Z</option>

              <option value="title-desc">Z-A</option>

              <option value="volumes-desc">Maior obra</option>

              <option value="progress-desc">Mais completas</option>
            </select>
          </div>
        </div>
        {/* ======================================
      GRID DE COLEÇÕES
      ====================================== */}
        <div className="collection-grid tablet-scale-strong ">
          {visibleSeries.map((serie) => (
            <div
              key={serie.series_id}
              className="series-card"
              onClick={() =>
                setSearchParams({
                  collection: serie.series_id,
                })
              }
            >
              <img
                src={serie.thumb}
                alt={serie.title}
                className="series-thumb"
                loading="lazy"
              />
              <div className="series-content">
                <h2>{serie.title}</h2>

                {serie.status === "complete-plus" && (
                  <div className="collection-status complete-plus">
                    ★ Completa+
                  </div>
                )}

                {serie.status === "complete" && (
                  <div className="collection-status complete">✓ Completa</div>
                )}

                {serie.status === "collecting" && (
                  <div className="collection-status collecting">Comprando</div>
                )}

                {serie.status === "wishlist" && (
                  <div className="collection-status wishlist">Wishlist</div>
                )}

                {serie.status === "missing" && (
                  <div className="collection-status missing">Não Possuo</div>
                )}
                <div className="series-progress-group">
                  <div className="series-progress-header">
                    <span>📚 Principal</span>

                    <span>
                      {serie.main_owned} / {serie.main_total}
                    </span>
                  </div>

                  <div className="progress-bar">
                    <div
                      className={`progress-fill ${serie.status}`}
                      style={{
                        width: `${serie.mainPercentage}%`,
                      }}
                    />
                  </div>
                </div>

                {serie.extra_total > 0 && (
                  <div className="series-progress-group extras">
                    <div className="series-progress-header">
                      <span>⭐ Extras</span>

                      <span>
                        {serie.extra_owned} / {serie.extra_total}
                      </span>
                    </div>

                    <div className="progress-bar extra-progress-bar">
                      <div
                        className="progress-fill extra-progress-fill"
                        style={{
                          width: `${
                            serie.extra_total > 0
                              ? Math.round(
                                  (serie.extra_owned / serie.extra_total) * 100,
                                )
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        {visibleCount < series.length && <div ref={loadMoreRef} />}
      </div>
      <MyCollectionFooter />
      {collectionId && (
        <MyCollectionModal
          collectionId={collectionId}
          onClose={() => {
            setSearchParams({});
            reload();
          }}
        />
      )}
      {profileModalOpen && (
        <AvatarModal
          onClose={() => setProfileModalOpen(false)}
          onSaved={() => {
            reload();
            setProfileModalOpen(false);
          }}
          collectorRank={collectorRank}
          investmentRank={investmentRank}
        />
      )}
      {rankModalOpen && (
        <CollectorRankModal
          userName={userName}
          avatarUrl={avatarUrl}
          collectorLevel={collectorLevel}
          loyaltyLevel={loyaltyLevel}
          loyaltyEnabled={loyaltyEnabled}
          loyaltyLoginDays={loyaltyLoginDays}
          memberSince={memberSince}
          totalVolumes={totalOwnedVolumes}
          completedCollections={completedCollections}
          collectingCollections={collectingCollections}
          totalAchievements={totalAchievements}
          collectorRank={collectorRank}
          investmentRank={investmentRank}
          totalSpent={totalSpent}
          onClose={() => setRankModalOpen(false)}
          onEditProfile={() => setProfileModalOpen(true)}
        />
      )}
      {publicProfileModalOpen && (
        <MyEditPublicProfileModal
          onClose={() => setPublicProfileModalOpen(false)}
          username={username}
        />
      )}
      {usernameModalOpen && (
        <MyUsernameSetupModal
          onSaved={() => {
            reload();
            setUsernameModalOpen(false);
          }}
        />
      )}
    </>
  );
}
