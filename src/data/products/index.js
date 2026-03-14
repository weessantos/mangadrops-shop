// src/data/products/index.js

import { SERIES } from "./series.catalog.js";
import { createSeriesVolumes } from "./series.factory.js";


// ===============================
// Import automático dos arquivos
// ===============================

const affiliateModules = import.meta.glob("./affiliates/*.js", { eager: true });
const descriptionModules = import.meta.glob("./descriptions/*.js", { eager: true });
const tiktokModules = import.meta.glob("./tiktok/*.js", { eager: true });


// ===============================
// Converter modules em mapas
// ===============================

const affiliateMap = {};
const descriptionMap = {};
const tiktokMap = {};

for (const path in affiliateModules) {
  const mod = affiliateModules[path];
  const key = Object.keys(mod)[0];
  const prefix = key.replace("Affiliate", "");
  affiliateMap[prefix] = mod[key];
}

for (const path in descriptionModules) {
  const mod = descriptionModules[path];
  const key = Object.keys(mod)[0];
  const prefix = key.replace("Descriptions", "");
  descriptionMap[prefix] = mod[key];
}

for (const path in tiktokModules) {
  const mod = tiktokModules[path];
  const key = Object.keys(mod)[0];
  const prefix = key.replace("Tiktok", "");
  tiktokMap[prefix] = mod[key];
}


// ===============================
// Preços padrão
// ===============================

const defaultPrices = {
  aot: 78.9,
  jjk: 47.9,
  op: 99.9,
  haikyu: 63.9,
  kgb: 47.9,
  vinland: 54.9,
  skmt: 47.9,
  fma: 43.9,
  gb: 69.9,
  shk: 87.9,
  ddd: 47.9,
  vs: 44.9,
};


// ===============================
// Gerar produtos automaticamente
// ===============================

export const products = Object.entries(SERIES).flatMap(([prefix, config]) => {

  return createSeriesVolumes({
    ...config,

    affiliateByVolume: affiliateMap[prefix] || {},
    descriptionByVolume: descriptionMap[prefix] || {},
    tiktokByVolume: tiktokMap[prefix] || {},

    defaultCoverPrice: defaultPrices[prefix] || null,
  });

});