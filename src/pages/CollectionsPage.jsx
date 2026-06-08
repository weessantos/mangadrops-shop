import { Helmet } from "react-helmet-async";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import CollectionsRail from "../components/CollectionsRail";

import { useSeriesList } from "../hooks/useSeriesList";

export default function CollectionsPage({
  products = [],
  seriesCatalog = [],

  activeSeries = "",

  collectionsSectionRef,

  openSeries,
  clearSeries,
  changeSeriesPage,
}) {
  const navigate = useNavigate();

  // 🔥 COLLECTIONS

  const { seriesList } = useSeriesList(products, seriesCatalog);

  // 🔥 SCROLL TOP

  const topRef = useRef(null);

  useEffect(() => {
    if (!topRef.current) return;

    const yOffset = -80;

    const y =
      topRef.current.getBoundingClientRect().top + window.scrollY + yOffset;

    window.scrollTo({
      top: y,
      behavior: "smooth",
    });
  }, []);

  return (
    <>
      <Helmet>
        <title>Coleções de Mangás | Mangá Drops</title>

        <meta
          name="description"
          content="Explore coleções completas de mangás organizadas por série, editora e categoria."
        />
      </Helmet>
      <CollectionsRail
        isAllCollectionsPage
        seriesList={seriesList}
        seriesToRender={seriesList}
        activeSeries={activeSeries}
        collectionsSectionRef={collectionsSectionRef}
        openSeries={openSeries}
        clearSeries={clearSeries}
        changeSeriesPage={changeSeriesPage}
      />
    </>
  );
}
