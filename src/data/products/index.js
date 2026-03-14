import { SERIES } from "./series.catalog.js";
import { createSeriesVolumes } from "./series.factory.js";

// ===============================
// affiliates
// ===============================

import {
  aotAffiliate,
  jjkAffiliate,
  opAffiliate,
  haikyuAffiliate,
  kgbAffiliate,
  vinlandAffiliate,
  skmtAffiliate,
  fmaAffiliate,
  gbAffiliate,
  shkAffiliate,
  dddAffiliate,
  vsAffiliate,
  daemAffiliate,
  csmAffiliate,
} from "./affiliates.js";

// ===============================
// descriptions
// ===============================

import { aotDescriptions } from "./descriptions/aot.js";
import { jjkDescriptions } from "./descriptions/jjk.js";
import { opDescriptions } from "./descriptions/op.js";
import { haikyuDescriptions } from "./descriptions/haikyu.js";
import { kgbDescriptions } from "./descriptions/kgb.js";
import { vinlandDescriptions } from "./descriptions/vinland.js";
import { skmtDescriptions } from "./descriptions/skmt.js";
import { fmaDescriptions } from "./descriptions/fma.js";
import { gbDescriptions } from "./descriptions/gb.js";
import { shkDescriptions } from "./descriptions/shk.js";
import { dddDescriptions } from "./descriptions/ddd.js";
import { vsDescriptions } from "./descriptions/vs.js";
import { daemDescriptions } from "./descriptions/daem.js"
import { csmDescriptions } from "./descriptions/csm.js"

// ===============================
// tiktok
// ===============================

import { aotTiktok } from "./tiktok/aot.js";
import { jjkTiktok } from "./tiktok/jjk.js";
import { opTiktok } from "./tiktok/op.js";
import { haikyuTiktok } from "./tiktok/haikyu.js";
import { kgbTiktok } from "./tiktok/kgb.js";
import { vinlandTiktok } from "./tiktok/vinland.js";
import { skmtTiktok } from "./tiktok/skmt.js";
import { fmaTiktok } from "./tiktok/fma.js";
import { gbTiktok } from "./tiktok/gb.js";
import { shkTiktok } from "./tiktok/shk.js";
import { dddTiktok } from "./tiktok/ddd.js";
import { vsTiktok } from "./tiktok/vs.js";
import { daemTiktok } from "./tiktok/daem.js"
import { csmTiktok } from "./tiktok/csm.js"

// ===============================
// registro das séries
// ===============================

const SERIES_DATA = {  

  aot: {
    affiliate: aotAffiliate,
    descriptions: aotDescriptions,
    tiktok: aotTiktok,
    price: 78.9
  },

  jjk: {
    affiliate: jjkAffiliate,
    descriptions: jjkDescriptions,
    tiktok: jjkTiktok,
    price: 47.9
  },

  op: {
    affiliate: opAffiliate,
    descriptions: opDescriptions,
    tiktok: opTiktok,
    price: 99.9
  },

  haikyu: {
    affiliate: haikyuAffiliate,
    descriptions: haikyuDescriptions,
    tiktok: haikyuTiktok,
    price: 63.9
  },

  kgb: {
    affiliate: kgbAffiliate,
    descriptions: kgbDescriptions,
    tiktok: kgbTiktok,
    price: 47.9
  },

  vinland: {
    affiliate: vinlandAffiliate,
    descriptions: vinlandDescriptions,
    tiktok: vinlandTiktok,
    price: 54.9
  },

  skmt: {
    affiliate: skmtAffiliate,
    descriptions: skmtDescriptions,
    tiktok: skmtTiktok,
    price: 47.9
  },

  fma: {
    affiliate: fmaAffiliate,
    descriptions: fmaDescriptions,
    tiktok: fmaTiktok,
    price: 43.9
  },

  gb: {
    affiliate: gbAffiliate,
    descriptions: gbDescriptions,
    tiktok: gbTiktok,
    price: 69.9
  },

  shk: {
    affiliate: shkAffiliate,
    descriptions: shkDescriptions,
    tiktok: shkTiktok,
    price: 87.9
  },

  ddd: {
    affiliate: dddAffiliate,
    descriptions: dddDescriptions,
    tiktok: dddTiktok,
    price: 47.9
  },

  vs: {
    affiliate: vsAffiliate,
    descriptions: vsDescriptions,
    tiktok: vsTiktok,
    price: 44.9
  },

  daem: {
    affiliate: daemAffiliate,
    descriptions: daemDescriptions,
    tiktok: daemTiktok,
    price: 47.9
  },

    csm: {
    affiliate: csmAffiliate,
    descriptions: csmDescriptions,
    tiktok: csmTiktok,
    price: 47.9
  },
};

// ===============================
// gerar produtos automaticamente
// ===============================

export const products = Object.entries(SERIES).flatMap(([prefix, config]) => {

  const data = SERIES_DATA[prefix] || {};

  return createSeriesVolumes({

    ...config,

    affiliateByVolume: data.affiliate || {},
    descriptionByVolume: data.descriptions || {},
    tiktokByVolume: data.tiktok || {},

    defaultCoverPrice: data.price || null

  });

});
