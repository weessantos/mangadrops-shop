const base = import.meta.env.BASE_URL;
const img = (path) => `${base}assets/${path}`;

import "../styles/collection-hero.css";

export default function CollectionHero({ seriesSlug, title, total, onBack }) {
  return (
    <section
      id="collection-hero"
      className="collectionHero"
      style={{
        backgroundImage: `url(${img(`${seriesSlug}/${seriesSlug}.jpeg`)})`,
      }}
    >
      <div className="heroOverlay">
        <button className="heroBackBtn" onClick={onBack}>
          ← Voltar para obras
        </button>

        <span className="heroTag">COLEÇÃO</span>

        <h1>{title}</h1>

        <p>Explore todos os volumes disponíveis dessa coleção.</p>

        <div className="heroMeta">
          <span>📚 {total} volumes</span>
        </div>
      </div>
    </section>
  );
}

export function CollectionsHero({ total, onBack }) {
  return (
    <section
      id="collection-hero"
      className="collectionHero"
      style={{
        backgroundImage: `url(${img("collections-bg.jpeg")})`,
      }}
    >
      <div className="heroOverlay">
        <button className="heroBackBtn" onClick={onBack}>
          ← Voltar para obras
        </button>

        <span className="heroTag">CATÁLOGO</span>

        <h1>Coleções</h1>

        <p>
          Explore todas as obras disponíveis.
        </p>

        <div className="heroMeta">
          <span>
            📚 {total} {total === 1 ? "obra" : "obras"}
          </span>
        </div>
      </div>
    </section>
  );
}
