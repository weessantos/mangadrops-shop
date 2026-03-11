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
  gbAffiliate,
} from "./affiliates.js";

import { makeAddedAtByVolume } from "../../utils/volumeDates.js";
import { createSeriesVolumes } from "./series.factory.js";
import { SERIES } from "./series.catalog.js";

// descriptions
import { aotDescriptions } from "./descriptions/aot.js";
import { jjkDescriptions } from "./descriptions/jjk.js";
import { opDescriptions } from "./descriptions/op.js";
import { haikyuDescriptions } from "./descriptions/haikyu.js";
import { kgbDescriptions } from "./descriptions/kgb.js";
import { vinlandDescriptions } from "./descriptions/vinland.js";
import { skmtDescriptions } from "./descriptions/skmt.js";
import { fmaDescriptions } from "./descriptions/fma.js";
import { gbDescriptions } from "./descriptions/gb.js";

// tiktok
import { aotTiktok } from "./tiktok/aot.js";
import { jjkTiktok } from "./tiktok/jjk.js";
import { opTiktok } from "./tiktok/op.js";
import { haikyuTiktok } from "./tiktok/haikyu.js";
import { kgbTiktok } from "./tiktok/kgb.js";
import { vinlandTiktok } from "./tiktok/vinland.js";
import { skmtTiktok } from "./tiktok/skmt.js";
import { fmaTiktok } from "./tiktok/fma.js";
import { gbTiktok } from "./tiktok/gb.js";

const aot = createSeriesVolumes({
  ...SERIES.aot,
  affiliateByVolume: aotAffiliate,
  tiktokByVolume: aotTiktok,
  descriptionByVolume: aotDescriptions,
  defaultCoverPrice: 78.90,
});

const jjk = createSeriesVolumes({
  ...SERIES.jjk,
  affiliateByVolume: jjkAffiliate,
  tiktokByVolume: jjkTiktok,
  descriptionByVolume: jjkDescriptions,
  defaultCoverPrice: 47.90,
});

const op = createSeriesVolumes({
  ...SERIES.op,
  affiliateByVolume: opAffiliate,
  tiktokByVolume: opTiktok,
  descriptionByVolume: opDescriptions,
  defaultCoverPrice: 99.90,
});

const haikyu = createSeriesVolumes({
  ...SERIES.haikyu,
  affiliateByVolume: haikyuAffiliate,
  tiktokByVolume: haikyuTiktok,
  descriptionByVolume: haikyuDescriptions,
  defaultCoverPrice: 63.90,
});

const kgb = createSeriesVolumes({
  ...SERIES.kgb,
  affiliateByVolume: kgbAffiliate,
  tiktokByVolume: kgbTiktok,
  descriptionByVolume: kgbDescriptions,
  defaultCoverPrice: 47.90,
});

const vinland = createSeriesVolumes({
  ...SERIES.vinland,
  affiliateByVolume: vinlandAffiliate,
  tiktokByVolume: vinlandTiktok,
  descriptionByVolume: vinlandDescriptions,
  defaultCoverPrice: 54.90,

});

const skmt = createSeriesVolumes({
  ...SERIES.skmt,
  affiliateByVolume: skmtAffiliate,
  tiktokByVolume: skmtTiktok,
  descriptionByVolume: skmtDescriptions,
  defaultCoverPrice: 47.90,
});

const fma = createSeriesVolumes({
  ...SERIES.fma,
  affiliateByVolume: fmaAffiliate,
  tiktokByVolume: fmaTiktok,
  descriptionByVolume: fmaDescriptions,
  defaultCoverPrice: 43.90,
});

const gb = createSeriesVolumes({
  ...SERIES.gb,
  affiliateByVolume: gbAffiliate,
  tiktokByVolume: gbTiktok,
  descriptionByVolume: gbDescriptions,
  defaultCoverPrice: 69.90,
});

export const products = [...aot, ...jjk, ...op, ...haikyu, ...kgb, ...vinland, ...skmt, ...fma,
                         ...gb];