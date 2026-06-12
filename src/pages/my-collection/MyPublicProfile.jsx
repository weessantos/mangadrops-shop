import { useParams } from "react-router-dom";
import { usePublicProfile } from "../../hooks/my-collection-hooks/usePublicProfile";
import { Helmet } from "react-helmet-async";
import MyCollectionPublicHeader from "../../components/my-collection/MyCollectionPublicHeader";
import Loader from "../../components/Loader";

import "../../styles/my-collection/my-collection-public-profile.css";

export default function MyPublicProfile() {
  const { username: routeUsername } = useParams();

  const {
    loading,
    notFound,

    userName,
    username,

    avatarUrl,
    bannerUrl,

    memberSince,

    loyaltyLevel,

    distinctWorks,
    totalOwnedVolumes,
    completedCollections,
    totalExtras,

    totalAchievements,

    collectorLevel,

    collectorRank,
    investmentRank,

    totalSpent,

    series,

    favoriteWork,
    favoriteVolume,
    rarestVolume,

    profilePublic,
    showCollectionValue,
  } = usePublicProfile(routeUsername);

  const hasHighlights = favoriteWork || favoriteVolume || rarestVolume;

  const pageTitle = `${userName} (@${username}) | Mangá Drops Acervo`;

  if (loading) {
    return <Loader />;
  }

  if (notFound || !profilePublic) {
    return (
      <main className="publicProfile">
        <div
          style={{
            minHeight: "60vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <h1>Perfil não encontrado</h1>

          <p>
            O usuário <strong>@{routeUsername}</strong> não existe ou não possui
            perfil público.
          </p>
        </div>
      </main>
    );
  }


  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>

        <meta
          name="description"
          content={`${totalOwnedVolumes} volumes • ${distinctWorks} obras • Nível ${collectorLevel} no Mangá Drops Acervo`}
        />

        <meta property="og:title" content={`${userName} (@${username})`} />

        <meta
          property="og:description"
          content={`${totalOwnedVolumes} volumes • ${distinctWorks} obras • Rank ${collectorRank?.title}`}
        />

        <meta property="og:type" content="profile" />

        <meta
          property="og:url"
          content={`https://mangadrops.online/u/${username}`}
        />

        {avatarUrl && <meta property="og:image" content={avatarUrl} />}

        <meta name="twitter:card" content="summary_large_image" />

        {avatarUrl && <meta name="twitter:image" content={avatarUrl} />}
      </Helmet>
      <main className="publicProfile">
        <MyCollectionPublicHeader />
        <div className="publicProfileBanner">
          {bannerUrl && <img src={bannerUrl} alt="" />}
        </div>
        <div className="publicProfileHeader">
          <div className="publicProfileCard tablet-scale">
            <div className="profileIdentity">
              <div className="profileAvatar">
                {avatarUrl && <img src={avatarUrl} alt="" />}
              </div>

              <div className="profileInfo">
                <div className="profileNameRow">
                  <h1>{userName}</h1>

                  <div className="profileBadges">
                    <span className="profileLevel">Nível {collectorLevel}</span>
                  </div>
                </div>

                <p className="profileUsername">@{username}</p>

                <p className="profileMemberSince">
                  📅 Colecionador desde {memberSince}
                </p>
              </div>
              <div className="profileRanks">
                <div className="rankCard">
                  <div className="rankLabel">Rank Colecionador</div>
                  <div className="rankContent">
                    <img
                      className={`rankBadge collector ${collectorRank?.title
                        ?.normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                      src={collectorRank?.badge}
                      alt={collectorRank?.title}
                    />

                    <div className="rankText">
                      <div className="rankTitle">{collectorRank?.title}</div>
                    </div>
                  </div>
                </div>

                <div className="rankCard">
                  <div className="rankLabel">Rank Investimento</div>

                  <div className="rankContent">
                    <img
                      className={`rankBadge investment ${investmentRank?.title
                        ?.normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                      src={investmentRank?.badge}
                      alt={investmentRank?.title}
                    />

                    <div className="rankText">
                      <div className="rankTitle">{investmentRank?.title}</div>

                      {showCollectionValue && (
                        <div className="rankSubtext">
                          R$ {totalSpent.toLocaleString("pt-BR")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="profileStats">
              <div className="statCard">
                <span className="statValue">{totalOwnedVolumes}</span>

                <span className="statLabel">Volumes</span>
              </div>

              <div className="statCard">
                <span className="statValue">{totalExtras}</span>

                <span className="statLabel">Extras</span>
              </div>

              <div className="statCard">
                <span className="statValue">{distinctWorks}</span>

                <span className="statLabel">Obras</span>
              </div>

              <div className="statCard">
                <span className="statValue">{completedCollections}</span>

                <span className="statLabel">Completas</span>
              </div>

              <div className="statCard">
                <span className="statValue"> {loyaltyLevel}</span>

                <span className="statLabel">Fidelidade</span>
              </div>

              <div className="statCard">
                <span className="statValue">{totalAchievements}</span>

                <span className="statLabel">Conquistas</span>
              </div>
            </div>
            {hasHighlights && (
              <div className="profileHighlights">
                {favoriteWork && (
                  <div className="highlightWrapper">
                    <div className="highlightHeader">
                      <span className="highlightLabel">⭐ Obra Favorita</span>
                      <h3>{favoriteWork.title}</h3>
                    </div>

                    <div className="highlightCard favoriteWorkCard">
                      <img src={favoriteWork.thumb} alt={favoriteWork.title} />
                    </div>
                  </div>
                )}

                {favoriteVolume && (
                  <div className="highlightWrapper">
                    <div className="highlightHeader">
                      <span className="highlightLabel">📖 Volume Favorito</span>
                      <h3>{favoriteVolume.title}</h3>
                    </div>

                    <div className="highlightCard favoriteVolumeCard">
                      <img
                        src={favoriteVolume.thumb}
                        alt={favoriteVolume.title}
                      />
                    </div>
                  </div>
                )}

                {rarestVolume && (
                  <div className="highlightWrapper">
                    <div className="highlightHeader">
                      <span className="highlightLabel">
                        💎 Volume mais raro
                      </span>
                      <h3>{rarestVolume.title}</h3>
                    </div>

                    <div className="highlightCard rareVolumeCard">
                      <img src={rarestVolume.thumb} alt={rarestVolume.title} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <section className="public-series-section tablet-scale">
          <div className="public-series-header">
            <h2>Coleções ({series.length})</h2>
          </div>

          <div className="public-series-grid">
            {series.map((serie) => (
              <article key={serie.series_id} className="public-series-card">
                <div className="public-series-cover-wrapper">
                  <img
                    src={serie.thumb}
                    alt={serie.title}
                    className="public-series-cover"
                    loading="lazy"
                  />
                </div>

                <div className="public-series-content">
                  <h3 className="public-series-title">{serie.title}</h3>

                  <div className="public-series-main">
                    📚 Volumes: {serie.main_owned} / {serie.main_total}
                  </div>

                  {serie.extra_total > 0 && (
                    <div className="public-series-extras">
                      ⭐ Extras: {serie.extra_owned} / {serie.extra_total}
                    </div>
                  )}

                  <div className="public-series-progress">
                    <div
                      className={`public-series-progress-fill ${serie.status}`}
                      style={{
                        width: `${serie.mainPercentage}%`,
                      }}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
