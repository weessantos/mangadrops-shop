import { useEffect, useState } from "react";
import { supabaseClient } from "../../lib/supabase";
import {
  getCollectorRank,
  getInvestmentRank,
} from "../../utils/my-collection/collectorRank";

import {
  calculateVolumeAchievements,
  calculateCollectionAchievements,
  calculateExtraAchievements,
  calculateLevelAchievements,
  calculateLoyaltyAchievements,
} from "../../utils/my-collection/achievementCalculator";

import { getCollectorLevel } from "../../utils/my-collection/collectorLevel";
import { getLoyaltyLevel } from "./loyalty";

export function usePublicProfile(routeUsername) {
  // ESTADOS
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [userName, setUserName] = useState("Colecionador");
  const [username, setUsername] = useState("");

  const [avatarUrl, setAvatarUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");

  const [memberSince, setMemberSince] = useState("");

  const [loyaltyLevel, setLoyaltyLevel] = useState(0);

  const [totalOwnedVolumes, setTotalOwnedVolumes] = useState(0);
  const [totalExtras, setTotalExtras] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);

  const [distinctWorks, setDistinctWorks] = useState(0);

  const [completedCollections, setCompletedCollections] = useState(0);

  const [collectorLevel, setCollectorLevel] = useState(1);

  const [totalAchievements, setTotalAchievements] = useState(0);

  const [collectorRank, setCollectorRank] = useState(null);
  const [investmentRank, setInvestmentRank] = useState(null);

  const [series, setSeries] = useState([]);

  const [favoriteWork, setFavoriteWork] = useState(null);

  const [favoriteVolume, setFavoriteVolume] = useState(null);

  const [rarestVolume, setRarestVolume] = useState(null);

  const [showCollectionValue, setShowCollectionValue] = useState(false);

  const [profilePublic, setProfilePublic] = useState(false);

  //LOAD
  useEffect(() => {
    if (routeUsername) {
      loadProfile();
    }
  }, [routeUsername]);

  async function loadProfile() {
    if (!routeUsername) return;
    try {
      setLoading(true);

      //PRIMEIRA BUSCA
      const { data: profile } = await supabaseClient
        .from("public_profile_view")
        .select("*")
        .eq("username", routeUsername)
        .maybeSingle();

      if (!profile) {
        setNotFound(true);
        setSeries([]);
        setUserName("Colecionador");

        return;
      }

      setNotFound(false);

      const userId = profile.user_id;

      setShowCollectionValue(profile?.show_collection_value || false);

      setProfilePublic(profile?.profile_public || false);

      //PERFIL
      setUserName(profile.display_name || "Colecionador");

      setUsername(profile.username || "");

      setAvatarUrl(profile.avatar_url || "");

      setBannerUrl(profile.banner_url || "");

      setMemberSince(formatMemberSince(profile.created_at));

      const calculatedLoyaltyLevel = profile.loyalty_level || 0;

      setLoyaltyLevel(calculatedLoyaltyLevel);

      //CATÁLOGO
      const { data: catalog } = await supabaseClient
        .from("collection_catalog")
        .select("*");

      //HIGHLIGHTS - OBRA FAVORITA
      const favoriteWorkData = catalog.find(
        (item) =>
          Number(item.collection_group_id) ===
          Number(profile?.favorite_work_id),
      );

      if (favoriteWorkData) {
        setFavoriteWork({
          id: favoriteWorkData.collection_group_id,

          title: favoriteWorkData.collection_title,

          thumb: favoriteWorkData.thumb,
        });
      }

      //HIGHLIGHTS - VOLUME FAVORITO
      const favoriteVolumeData = catalog.find(
        (item) => Number(item.id) === Number(profile?.favorite_volume_id),
      );

      if (favoriteVolumeData) {
        setFavoriteVolume({
          id: favoriteVolumeData.id,

          title: favoriteVolumeData.title,

          thumb: favoriteVolumeData.thumb.replace(
            /[^/]+$/,
            `${favoriteVolumeData.code}.webp`,
          ),
        });
      }

      //HIGHLIGHTS - VOLUME MAIS RARO
      const rarestVolumeData = catalog.find(
        (item) => Number(item.id) === Number(profile?.rarest_volume_id),
      );

      if (rarestVolumeData) {
        setRarestVolume({
          id: rarestVolumeData.id,

          title: rarestVolumeData.title,

          thumb: rarestVolumeData.thumb.replace(
            /[^/]+$/,
            `${rarestVolumeData.code}.webp`,
          ),
        });
      }

      //COLEÇÃO
      const { data: userCollection } = await supabaseClient
        .from("user_collection")
        .select(
          `
            volume_id,
            status,
            purchase_price
        `,
        )
        .eq("user_id", userId);

      const statusMap = new Map(
        (userCollection || []).map((item) => [item.volume_id, item.status]),
      );

      const grouped = Object.values(
        (catalog || []).reduce((acc, item) => {
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

          let status = "missing";

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

      const publicSeries = collections.filter((serie) => serie.owned > 0);

      // console.table(
      //   publicSeries.map((serie) => ({
      //     id: serie.series_id,
      //     obra: serie.title,
      //     principal: `${serie.main_owned}/${serie.main_total}`,
      //     extras: `${serie.extra_owned}/${serie.extra_total}`,
      //     percentual: `${serie.mainPercentage}%`,
      //     status: serie.status,
      //   })),
      // );

      setSeries(publicSeries);

      //OBRAS
      const ownedSeriesCount = profile.distinct_works;

      setDistinctWorks(ownedSeriesCount);

      //VOLUMES
      const totalOwnedValue = profile.total_owned_volumes || 0;

      const totalExtrasValue = profile.total_extras || 0;

      setTotalOwnedVolumes(totalOwnedValue);

      setTotalExtras(totalExtrasValue);

      //COLEÇÕES
      const completedCollectionsValue = profile.completed_collections || 0;

      setCompletedCollections(completedCollectionsValue);

      //INVESTIMENTO
      const totalSpentValue = Number(profile.total_spent || 0);

      setTotalSpent(totalSpentValue);

      //RANKS
      const collectorRankValue = getCollectorRank(
        totalOwnedValue,
        calculatedLoyaltyLevel,
        profile.is_admin,
      );

      setCollectorRank(collectorRankValue);

      //INVESTIMENTO
      const investmentRankValue = getInvestmentRank(
        totalSpentValue,
        calculatedLoyaltyLevel,
        profile.is_admin,
      );

      setInvestmentRank(investmentRankValue);

      //LEVEL
      const collectorLevelValue = getCollectorLevel({
        totalOwnedVolumes: totalOwnedValue,

        completedCollections: completedCollectionsValue,

        completedPlusCollections: collections.filter(
          (collection) => collection.status === "complete-plus",
        ).length,

        collectorRank: collectorRankValue,

        investmentRank: investmentRankValue,
      });

      setCollectorLevel(collectorLevelValue);

      //CONQUISTAS
      const volumeAchievements = calculateVolumeAchievements(totalOwnedValue);

      const collectionAchievements = calculateCollectionAchievements(
        completedCollectionsValue,
      );

      const extraAchievements = calculateExtraAchievements(totalExtrasValue);

      const levelAchievements = calculateLevelAchievements(collectorLevelValue);

      const loyaltyAchievements = calculateLoyaltyAchievements(
        calculatedLoyaltyLevel,
        profile?.created_at,
      );

      setTotalAchievements(
        volumeAchievements.unlockedCount +
          collectionAchievements.unlockedCount +
          extraAchievements.unlockedCount +
          levelAchievements.unlockedCount +
          loyaltyAchievements.unlockedCount,
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
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

  return {
    loading,
    notFound,

    series,

    userName,
    username,

    avatarUrl,
    bannerUrl,

    memberSince,

    loyaltyLevel,

    distinctWorks,

    totalOwnedVolumes,
    totalExtras,

    completedCollections,

    collectorLevel,

    totalAchievements,

    collectorRank,
    investmentRank,

    totalSpent,

    favoriteWork,
    favoriteVolume,
    rarestVolume,

    profilePublic,
    showCollectionValue,
  };
}
