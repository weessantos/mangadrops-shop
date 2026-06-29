import {
  BookOpen,
  LibraryBig,
  Palette,
  Globe2,
  BadgeCheck,
} from "lucide-react";
import useALCollectionSectionData from "../../../../hooks/my-collection-hooks/acervo-landing/al-collection-section-data.js";
import "../../../../styles/my-collection/acervo-landing/components/al-collection-section.css";

const STATS = [
  {
    id: "volumes",
    icon: BookOpen,
    title: "Volumes cadastrados",
    description:
      "Um catálogo em constante crescimento para você organizar sua coleção.",
    accent: "#5314e7",
  },
  {
    id: "customization",
    icon: Palette,
    title: "Perfil personalizado",
    description: "Escolha avatar, banner e construa uma identidade única.",
    accent: "#ca6a03",
  },
  {
    id: "public",
    icon: Globe2,
    title: "Perfil público",
    description:
      "Compartilhe sua coleção com qualquer pessoa através de um link exclusivo.",
    accent: "#2966ea",
  },
  {
    id: "free",
    icon: BadgeCheck,
    title: "100% gratuito",
    description:
      "Cadastre sua coleção, personalize seu perfil e desbloqueie conquistas sem qualquer custo.",
    accent: "#16a34a",
  },

  // Número de obras (guardando para o futuro)
  //   {
  //     id: "series",
  //     icon: LibraryBig,
  //     title: "Coleções disponíveis",
  //     description: "Dos grandes clássicos aos lançamentos mais recentes.",
  //     accent: "#2966ea",
  //   },
];

export default function ALCollectionSection() {
  const { stats, displayStats, covers, featuredRef } =
    useALCollectionSectionData();

  const statValues = {
    volumes:
      displayStats.totalVolumes > 0
        ? `${displayStats.totalVolumes.toLocaleString("pt-BR")}+`
        : "--",

    series:
      displayStats.totalSeries > 0
        ? `${displayStats.totalSeries.toLocaleString("pt-BR")}+`
        : "--",

    customization: "100%",

    public: "∞",
  };

  return (
    <section className="al-collection-section">
      <div className="al-collection-container">
        <div className="al-collection-quote">
          <span className="al-collection-tag">O UNIVERSO DO MANGÁ DROPS</span>

          <h2 className="al-collection-title">
            Tudo o que sua coleção precisa,
            <br />
            em um único lugar.
          </h2>

          <p className="al-collection-subtitle">
            Um catálogo completo, ferramentas para colecionadores e um perfil
            totalmente personalizado para acompanhar cada volume da sua jornada.
          </p>
        </div>

        <div className="al-collection-grid">
          <article
            ref={featuredRef}
            className="al-collection-card featured"
            style={{ "--accent": STATS[0].accent }}
          >
            <div className="featured-background">
              {Array.from({ length: 6 }).map((_, column) => {
                const columnCovers = covers.filter(
                  (_, index) => index % 6 === column,
                );

                return (
                  <div
                    key={column}
                    className={`featured-column column-${column + 1}`}
                  >
                    {columnCovers.map((cover, index) => (
                      <img
                        key={`${column}-${index}`}
                        src={cover}
                        alt=""
                        className="featured-cover"
                        draggable={false}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
            <div className="featured-overlay" />

            <div className="featured-content">
              <div className="al-collection-icon">
                <BookOpen size={34} strokeWidth={2} />
              </div>

              <span className="al-collection-value">{statValues.volumes}</span>

              <h3>{STATS[0].title}</h3>

              <p>{STATS[0].description}</p>
            </div>
          </article>

          <div className="al-collection-side">
            {STATS.slice(1).map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.id}
                  className="al-collection-card small"
                  style={{ "--accent": item.accent }}
                >
                  <div className="al-collection-icon">
                    <Icon size={26} strokeWidth={2} />
                  </div>

                  <span className="al-collection-value">
                    {statValues[item.id]}
                  </span>

                  <h3>{item.title}</h3>

                  <p>{item.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
