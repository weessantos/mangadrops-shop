import "../styles/brand-stats.css";

export default function BrandStats() {
  return (
    <div className="brandStatsWrap">
      <section className="brandStats" aria-label="Estatísticas do Mangá Drops">
        <div className="brandStat">
          <span className="statNumber">+50k</span>
          <span className="statLabel">visualizações</span>
        </div>

        <div className="brandDivider" />

        <div className="brandStat">
          <span className="statNumber">+250</span>
          <span className="statLabel">volumes organizados</span>
        </div>

        <div className="brandDivider" />

        <div className="brandStat">
          <span className="statNumber">Atualizado</span>
          <span className="statLabel">semanalmente</span>
        </div>
      </section>
    </div>
  );
}