// src/data/products/index.js
import {
  aotAffiliate,
  opAffiliate,
  jjkAffiliate,
  haikyuAffiliate,
  kgbAffiliate,
  vinlandAffiliate,
  skmtAffiliate,
  fmaAffiliate,
} from "./affiliates.js";

import { makeAddedAtByVolume } from "../../utils/volumeDates";
import { createSeriesVolumes } from "./series.factory";
import { SERIES } from "./series.catalog";

// descriptions
import { aotDescriptions } from "./descriptions/aot";
import { jjkDescriptions } from "./descriptions/jjk";
import { opDescriptions } from "./descriptions/op";
import { haikyuDescriptions } from "./descriptions/haikyu";
import { kgbDescriptions } from "./descriptions/kgb";
import { vinlandDescriptions } from "./descriptions/vinland";
import { skmtDescriptions } from "./descriptions/skmt";
import { fmaDescriptions } from "./descriptions/fma.js";

// tiktok
import { aotTiktok } from "./tiktok/aot";
import { jjkTiktok } from "./tiktok/jjk";
import { opTiktok } from "./tiktok/op";
import { haikyuTiktok } from "./tiktok/haikyu";
import { kgbTiktok } from "./tiktok/kgb";
import { vinlandTiktok } from "./tiktok/vinland";
import { skmtTiktok } from "./tiktok/skmt";
import { fmaTiktok } from "./tiktok/fma.js";

const aot = createSeriesVolumes({
  ...SERIES.aot,
  affiliateByVolume: aotAffiliate,
  tiktokByVolume: aotTiktok,
  descriptionByVolume: aotDescriptions,
});

const jjk = createSeriesVolumes({
  ...SERIES.jjk,
  affiliateByVolume: jjkAffiliate,
  tiktokByVolume: jjkTiktok,
  descriptionByVolume: jjkDescriptions,
});

const op = createSeriesVolumes({
  ...SERIES.op,
  affiliateByVolume: opAffiliate,
  tiktokByVolume: opTiktok,
  descriptionByVolume: opDescriptions,
});

const haikyu = createSeriesVolumes({
  ...SERIES.haikyu,
  affiliateByVolume: haikyuAffiliate,
  tiktokByVolume: haikyuTiktok,
  descriptionByVolume: haikyuDescriptions,
});

const kgb = createSeriesVolumes({
  ...SERIES.kgb,
  affiliateByVolume: kgbAffiliate,
  tiktokByVolume: kgbTiktok,
  descriptionByVolume: kgbDescriptions,
});

const vinland = createSeriesVolumes({
  ...SERIES.vinland,
  affiliateByVolume: vinlandAffiliate,
  tiktokByVolume: vinlandTiktok,
  descriptionByVolume: vinlandDescriptions,
});

const skmt = createSeriesVolumes({
  ...SERIES.skmt,
  affiliateByVolume: skmtAffiliate,
  tiktokByVolume: skmtTiktok,
  descriptionByVolume: skmtDescriptions,
});

const fma = createSeriesVolumes({
  ...SERIES.fma,
  affiliateByVolume: fmaAffiliate,
  tiktokByVolume: fmaTiktok,
  descriptionByVolume: fmaDescriptions,
});

export const products = [...aot, ...jjk, ...op, ...haikyu, ...kgb, ...vinland, ...skmt, ...fma];