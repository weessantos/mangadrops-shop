export function getCollectorLevel({
  totalOwnedVolumes,
  completedCollections,
  completedPlusCollections,
  collectorRank,
  investmentRank,
}) {
  const volumeLevel =
    Math.floor(totalOwnedVolumes / 10);

  const collectionLevel =
    completedCollections * 1;

  const collectionPlusLevel =
    completedPlusCollections * 1;

  const collectorRankLevel =
    collectorRank?.levelValue || 0;

  const investmentRankLevel =
    investmentRank?.levelValue || 0;

  const totalLevel =
    1 +
    volumeLevel +
    collectionLevel +
    collectionPlusLevel +
    collectorRankLevel +
    investmentRankLevel;

  // console.log("========== COLLECTOR LEVEL ==========");
  // console.log("Volumes:", totalOwnedVolumes, "=>", volumeLevel);
  // console.log(
  //   "Completas:",
  //   completedCollections,
  //   "=>",
  //   collectionLevel,
  // );
  // console.log(
  //   "Completa+:",
  //   completedPlusCollections,
  //   "=>",
  //   collectionPlusLevel,
  // );
  // console.log(
  //   "Rank Colecionador:",
  //   collectorRank?.title,
  //   "=>",
  //   collectorRankLevel,
  // );
  // console.log(
  //   "Rank Investimento:",
  //   investmentRank?.title,
  //   "=>",
  //   investmentRankLevel,
  // );
  // console.log("TOTAL LEVEL:", totalLevel);
  // console.log("====================================");

  return totalLevel;
}