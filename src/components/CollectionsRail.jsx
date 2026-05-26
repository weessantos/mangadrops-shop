import { useNavigate } from "react-router-dom";

import SectionHeader from "./SectionHeader";
import CollectionHero, { CollectionsHero } from "./CollectionHero.jsx";
import SeriesCard from "./SeriesCard";

export default function CollectionsRail({
  isAllCollectionsPage = false,

  seriesList = [],
  seriesToRender = [],

  seriesPage = 1,
  totalSeriesPages = 1,
  seriesPageDots = [],
  seriesPageSize = 20,

  activeSeries = "",

  showCollectionsPagination = false,

  collectionsSectionRef,

  openSeries,
  clearSeries,
  changeSeriesPage,
}) {
  const navigate = useNavigate();

  return (
    <section
      className="collectionsSection"
      id={isAllCollectionsPage ? "collectionsFullPage" : "collectionsRail"}
      ref={collectionsSectionRef}
    >
      {!isAllCollectionsPage && (
        <SectionHeader
          title="Coleções 📚"
          subtitle="Explore por obra e veja os volumes disponíveis."
        />
      )}

      <>
        {isAllCollectionsPage && (
          <CollectionsHero total={seriesList.length} onBack={clearSeries} />
        )}
        {!isAllCollectionsPage && (
          <div className="collectionsTopbar">
            <div className="collectionsTopbarLeft">
              <span className="collectionsEyebrow">Catálogo</span>

              <div className="collectionsMeta">
                Página <strong>{seriesPage}</strong> de{" "}
                <strong>{totalSeriesPages}</strong>
              </div>
            </div>

            <div className="collectionsTopbarRight">
              <button
                className="railToggleBtn"
                onClick={() =>
                  navigate("/colecoes", {
                    state: {
                      scrollTo: "collection-hero",
                    },
                  })
                }
              >
                Mostrar mais →
              </button>

              <div className="collectionsPager">
                <button
                  type="button"
                  className="collectionsNavBtn"
                  onClick={() => changeSeriesPage(seriesPage - 1)}
                  disabled={seriesPage === 1}
                  aria-label="Anterior"
                >
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M15 6L9 12L15 18"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                <button
                  type="button"
                  className="collectionsNavBtn"
                  onClick={() => changeSeriesPage(seriesPage + 1)}
                  disabled={seriesPage === totalSeriesPages}
                  aria-label="Próximo"
                >
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 6L15 12L9 18"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="seriesRail">
          {seriesToRender.map((s) => (
            <div className="railItem" key={s.name}>
              <SeriesCard
                name={s.name}
                thumb={s.thumb}
                subtitle={s.subtitle}
                rangeLabel={s.rangeLabel}
                haveLabel={s.haveLabel}
                statusLabel={s.statusLabel}
                missing={s.missing}
                missingCount={s.missingCount}
                active={activeSeries === s.name}
                onOpen={openSeries}
              />
            </div>
          ))}
        </div>
        {showCollectionsPagination && (
          <div className="collectionsBottomBar">
            <div className="collectionsDots">
              {seriesPageDots.map((dotPage) => (
                <button
                  key={dotPage}
                  className={`collectionsDot ${
                    dotPage === seriesPage ? "isActive" : ""
                  }`}
                  onClick={() => changeSeriesPage(dotPage)}
                />
              ))}
            </div>

            <div className="collectionsCounter">
              Exibindo <strong>{(seriesPage - 1) * seriesPageSize + 1}</strong>–
              <strong>
                {Math.min(seriesPage * seriesPageSize, seriesList.length)}
              </strong>{" "}
              de <strong>{seriesList.length}</strong> obras
            </div>
          </div>
        )}
      </>
    </section>
  );
}
