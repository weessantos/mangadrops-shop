const base = import.meta.env.BASE_URL;
const img = (path) => `${base}assets/${path}`;

import "../styles/collection-hero.css";

//Hero da página de coleção específica.
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
        
        <h1>{title}</h1>

        <p>Explore todos os volumes disponíveis dessa coleção.</p>

        <div className="heroMeta">
          <span>📚 {total} volumes</span>
        </div>
      </div>
    </section>
  );
}

//Hero da página de coleções no geral.
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

        <h1>Coleções</h1>

        <p>Explore todas as obras disponíveis.</p>

        <div className="heroMeta">
          <span>
            📚 {total} {total === 1 ? "obra" : "obras"}
          </span>
        </div>
      </div>
    </section>
  );
}

//Hero das páginas do site - Lançamentos - Promoções - Saldão

export function PageHero({ title, subtitle, total, tag, background, onBack }) {
  return (
    <section
      id="collection-hero"
      className="collectionHero"
      style={{
        backgroundImage: `url(${img(background)})`,
      }}
    >
      <div className="heroOverlay">
        <button className="heroBackBtn" onClick={onBack}>
          ← Voltar para {title}
        </button>

        <span className="heroTag">{tag}</span>

        <h1>{title}</h1>

        <p>{subtitle}</p>

        <div className="heroMeta">
          <span>📚 {total} itens</span>
        </div>
      </div>
    </section>
  );
}
