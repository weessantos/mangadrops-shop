/**
 * ==========================================================
 * useCollectionStats
 * ==========================================================
 *
 * RESPONSABILIDADES:
 *
 * - Buscar catálogo.
 * - Buscar coleção do usuário.
 * - Agrupar volumes por coleção.
 * - Calcular progresso.
 * - Calcular status visual.
 * - Expor função reload().
 *
 * NÃO RENDERIZA NADA.
 *
 * Toda responsabilidade visual pertence à:
 *
 * MyCollectionPage
 *
 * ==========================================================
 */

import { useEffect, useState } from "react";
import { supabaseClient } from "../../lib/supabase";
import {
  getCollectorRank,
  getInvestmentRank,
} from "../../utils/my-collection/collectorRank";

import { getCollectorLevel } from "../../utils/my-collection/collectorLevel";

import { registerDailyLogin, getLoyaltyLevel } from "./loyalty.js";

export function useCollectionStats() {
  const [loading, setLoading] = useState(true);

  const [allSeries, setAllSeries] = useState([]);

  const [series, setSeries] = useState([]);

  const [filter, setFilter] = useState("all");

  const [sortBy, setSortBy] = useState("title-asc");

  const [userName, setUserName] = useState("Colecionador");

  const [avatarUrl, setAvatarUrl] = useState("");

  const [bannerUrl, setBannerUrl] = useState("");

  const [loyaltyLevel, setLoyaltyLevel] = useState(0);

  const [loyaltyEnabled, setLoyaltyEnabled] = useState(false);

  const [loyaltyLoginDays, setLoyaltyLoginDays] = useState(0);

  const [totalOwnedVolumes, setTotalOwnedVolumes] = useState(0);

  const [totalSpent, setTotalSpent] = useState(0);

  const [completedCollections, setCompletedCollections] = useState(0);

  const [completedPlusCollections, setCompletedPlusCollections] = useState(0);

  const [collectingCollections, setCollectingCollections] = useState(0);

  const [collectorLevel, setCollectorLevel] = useState(1);

  const [totalMedals, setTotalMedals] = useState(0);

  const [collectorRank, setCollectorRank] = useState(null);

  const [investmentRank, setInvestmentRank] = useState(null);

  const [memberSince, setMemberSince] = useState("");

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    loadCollection();
  }, [reloadKey]);

  useEffect(() => {
    applyFilter();
  }, [filter, sortBy, allSeries]);

  async function loadCollection() {
    setLoading(true);

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    //Contabiliza o login do usuário

    await registerDailyLogin(user.id, user.created_at);

    const { data: loyalty } = await supabaseClient
      .from("user_loyalty")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    const calculatedLoyaltyLevel = getLoyaltyLevel(loyalty);

    setLoyaltyLevel(calculatedLoyaltyLevel);
    setLoyaltyEnabled(loyalty?.loyalty_enabled ?? false);
    setLoyaltyLoginDays(loyalty?.loyalty_login_days ?? 0);

    const { data: profile } = await supabaseClient
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    setUserName(profile?.display_name || user?.email || "Colecionador");

    setAvatarUrl(profile?.avatar_url || "");

    setBannerUrl(profile?.banner_url || "");

    setMemberSince(formatMemberSince(profile?.created_at));

    const isAdmin = user?.email === "wees1597@gmail.com";

    const { data: catalog, error: catalogError } = await supabaseClient
      .from("collection_catalog")
      .select("*");

    if (catalogError) {
      console.error(catalogError);
      setLoading(false);
      return;
    }

    const { data: userCollection, error: collectionError } =
      await supabaseClient
        .from("user_collection")
        .select(
          `
      volume_id,
      status,
      purchase_price
    `,
        )
        .eq("user_id", user.id);

    if (collectionError) {
      console.error(collectionError);
      return;
    }

    const statusMap = new Map(
      userCollection.map((item) => [item.volume_id, item.status]),
    );

    const grouped = Object.values(
      catalog.reduce((acc, item) => {
        const groupId = item.collection_group_id;

        if (!acc[groupId]) {
          acc[groupId] = {
            series_id: groupId,

            title: item.collection_title,
            thumb: item.thumb,

            total_volumes: 0,
            owned: 0,
            wishlist: 0,

            main_total: 0,
            main_owned: 0,

            extra_total: 0,
            extra_owned: 0,
          };
        }

        if (!acc[groupId].thumb && item.thumb) {
          acc[groupId].thumb = item.thumb;
        }

        const isMainSeries = item.series_id === item.collection_group_id;

        acc[groupId].total_volumes++;

        if (isMainSeries) {
          acc[groupId].main_total++;
        } else {
          acc[groupId].extra_total++;
        }

        const status = statusMap.get(item.id);

        if (status === "owned") {
          acc[groupId].owned++;

          if (isMainSeries) {
            acc[groupId].main_owned++;
          } else {
            acc[groupId].extra_owned++;
          }
        }

        if (status === "wishlist") {
          acc[groupId].wishlist++;
        }

        return acc;
      }, {}),
    );

    const collections = grouped
      .sort((a, b) => a.title.localeCompare(b.title))
      .map((serie) => {
        const percentage =
          serie.total_volumes > 0
            ? Math.min(
                100,
                Math.round((serie.owned / serie.total_volumes) * 100),
              )
            : 0;

        const mainPercentage =
          serie.main_total > 0
            ? Math.round((serie.main_owned / serie.main_total) * 100)
            : 0;

        const mainComplete =
          serie.main_total > 0 && serie.main_owned === serie.main_total;

        const completePlus =
          serie.total_volumes > 0 && serie.owned === serie.total_volumes;

        let status = "empty";

        if (completePlus) {
          status = "complete-plus";
        } else if (mainComplete) {
          status = "complete";
        } else if (serie.owned > 0) {
          status = "collecting";
        } else if (serie.wishlist > 0) {
          status = "wishlist";
        }

        return {
          ...serie,

          percentage,
          mainPercentage,

          mainComplete,
          completePlus,

          status,
        };
      });

    setAllSeries(collections);

    // ==========================================
    // VOLUMES
    // ==========================================

    const totalOwnedValue = collections.reduce(
      (sum, serie) => sum + serie.owned,
      0,
    );

    setTotalOwnedVolumes(totalOwnedValue);

    // ==========================================
    // COLEÇÕES
    // ==========================================

    const completedCollectionsValue = collections.filter((collection) =>
      ["complete", "complete-plus"].includes(collection.status),
    ).length;

    const completedPlusCollectionsValue = collections.filter(
      (collection) => collection.status === "complete-plus",
    ).length;

    const collectingCollectionsValue = collections.filter(
      (collection) => collection.status === "collecting",
    ).length;

    setCompletedCollections(completedCollectionsValue);
    setCompletedPlusCollections(completedPlusCollectionsValue);

    setCollectingCollections(collectingCollectionsValue);

    // ==========================================
    // INVESTIMENTO
    // ==========================================

    const totalSpentValue = userCollection.reduce(
      (sum, item) => sum + (Number(item.purchase_price) || 0),
      0,
    );

    setTotalSpent(totalSpentValue);

    // ==========================================
    // RANKS
    // ==========================================

    const collectorRankValue = getCollectorRank(
      totalOwnedValue,
      calculatedLoyaltyLevel,
      isAdmin,
    );

    const investmentRankValue = getInvestmentRank(totalSpentValue);

    setCollectorRank(collectorRankValue);

    setInvestmentRank(investmentRankValue);

    // ==========================================
    // LEVEL
    // ==========================================

    const collectorLevelValue = getCollectorLevel({
      totalOwnedVolumes: totalOwnedValue,

      completedCollections: completedCollectionsValue,

      completedPlusCollections: completedPlusCollectionsValue,

      collectorRank: collectorRankValue,

      investmentRank: investmentRankValue,
    });

    setCollectorLevel(collectorLevelValue);

    // ==========================================
    // MEDALHAS
    // ==========================================

    setTotalMedals(0);

    // ==========================================

    setLoading(false);
  }

  function formatMemberSince(dateString) {
    if (!dateString) return "";

    const date = new Date(dateString);

    const month = date.toLocaleString("pt-BR", {
      month: "long",
    });

    const year = date.getFullYear();

    return `${month.charAt(0).toUpperCase() + month.slice(1)} de ${year}`;
  }

  function applyFilter() {
    let filtered = [...allSeries];

    switch (filter) {
      case "owned":
        filtered = filtered.filter((serie) => serie.owned > 0);
        break;

      case "wishlist":
        filtered = filtered.filter((serie) => serie.wishlist > 0);
        break;

      case "active":
        filtered = filtered.filter(
          (serie) => serie.owned > 0 || serie.wishlist > 0,
        );
        break;

      default:
        break;
    }

    setSeries(applySort(filtered));
  }

  function applySort(data) {
    const sorted = [...data];

    switch (sortBy) {
      case "title-desc":
        return sorted.sort((a, b) => b.title.localeCompare(a.title));

      case "volumes-desc":
        return sorted.sort((a, b) => b.total_volumes - a.total_volumes);

      case "progress-desc":
        return sorted.sort((a, b) => b.percentage - a.percentage);

      default:
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
    }
  }

  function reload() {
    setReloadKey((current) => current + 1);
  }

  return {
    loading,

    series,

    userName,

    avatarUrl,

    bannerUrl,

    loyaltyLevel,
    loyaltyEnabled,
    loyaltyLoginDays,

    totalOwnedVolumes,

    completedCollections,

    collectingCollections,

    collectorLevel,

    totalMedals,

    collectorRank,

    investmentRank,

    totalSpent,

    memberSince,

    filter,
    setFilter,

    sortBy,
    setSortBy,

    reload,
  };
}
