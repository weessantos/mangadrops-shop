// src/data/products/series.catalog.js

const base = import.meta.env.BASE_URL;
const img = (path) => `${base}assets/${path}`;

// ✅ util (se você usa)
import { makeAddedAtByVolume } from "../../utils/volumeDates.js";

// ✅ affiliates (fica no src/data/affiliates.js)
import {
  aotAffiliate,
  jjkAffiliate,
  opAffiliate,
  haikyuAffiliate,
  kgbAffiliate,
  vinlandAffiliate,
  skmtAffiliate,
  fmaAffiliate,
} from "./affiliates.js";

// ✅ descriptions
import { aotDescriptions } from "./descriptions/aot.js";
import { jjkDescriptions } from "./descriptions/jjk.js";
import { opDescriptions } from "./descriptions/op.js";
import { haikyuDescriptions } from "./descriptions/haikyu.js";
import { kgbDescriptions } from "./descriptions/kgb.js";
import { vinlandDescriptions } from "./descriptions/vinland.js";
import { skmtDescriptions } from "./descriptions/skmt.js";
import { fmaDescriptions } from "./descriptions/fma.js";

// ✅ tiktok
import { aotTiktok } from "./tiktok/aot.js";
import { jjkTiktok } from "./tiktok/jjk.js";
import { opTiktok } from "./tiktok/op.js";
import { haikyuTiktok } from "./tiktok/haikyu.js";
import { kgbTiktok } from "./tiktok/kgb.js";
import { vinlandTiktok } from "./tiktok/vinland.js";
import { skmtTiktok } from "./tiktok/skmt.js";
import { fmaTiktok } from "./tiktok/fma.js";


/**
 * CONFIG TÉCNICA (pra gerar os volumes)
 * - Pode continuar contendo affiliate/tiktok/description/addedAtByVolume
 * - Agora também tem thumb/subtitle, pra UI não precisar de outro arquivo
 */
export const SERIES = {
  aot: {
    series: "Attack on Titan",
    prefix: "aot",
    start: 1,
    end: 17, // ✅ no seu series.js era 17
    brand: "Panini",
    imageExt: "jpeg",
    editionLabel: "2 em 1",
    author: "Hajime Isayama",
    genre: "Shounen/Seinen",
    subtitle: "Titãs, muralhas e caos absoluto.",
    thumb: img("aot-series.jpeg"),
    format: "2 em 1",

    affiliateByVolume: aotAffiliate,
    tiktokByVolume: aotTiktok,
    descriptionByVolume: aotDescriptions,

    addedAtByVolume: {
      14: "2026-02-16",
      15: "2026-02-16",
      16: "2026-02-16",
      17: "2026-02-16",
    },
  },

  jjk: {
    series: "Jujutsu Kaisen",
    prefix: "jjk",
    start: 0,
    end: 30,
    brand: "Panini",
    imageExt: "jpeg",
    author: "Gege Akutami",
    genre: "Shounen",
    subtitle: "Feitiçaria, maldições e pancadaria.",
    thumb: img("jjk-series.jpeg"),
    format: "Padrão",

    affiliateByVolume: jjkAffiliate,
    tiktokByVolume: jjkTiktok,
    descriptionByVolume: jjkDescriptions,

    addedAtByVolume: makeAddedAtByVolume(25, 26),
  },

  op: {
    series: "One Piece",
    prefix: "op",
    start: 1,
    end: 37,
    brand: "Panini",
    imageExt: "jpeg",
    editionLabel: "3 em 1",
    author: "Eiichiro Oda",
    genre: "Shounen",
    subtitle: "Aventuras em alto mar e batalhas épicas.",
    thumb: img("op-series.jpeg"),
    format: "3 em 1",

    affiliateByVolume: opAffiliate,
    tiktokByVolume: opTiktok,
    descriptionByVolume: opDescriptions,

    addedAtByVolume: {
      37: "2026-02-25",
    },
  },

  haikyu: {
    series: "Haikyu",
    prefix: "haikyu",
    start: 1,
    end: 20,
    brand: "Panini",
    imageExt: "jpeg",
    editionLabel: "2 em 1",
    author: "Haruichi Furudate",
    genre: "Shounen",
    subtitle: "Vôlei, rivalidade intensa e a corrida para o Nacional.",
    thumb: img("haikyu-series.jpeg"),
    format: "2 em 1",

    affiliateByVolume: haikyuAffiliate,
    tiktokByVolume: haikyuTiktok,
    descriptionByVolume: haikyuDescriptions,

    addedAtByVolume: {
      1: "2026-02-16",
      2: "2026-02-16",
      3: "2026-02-16",
      4: "2026-02-16",
      5: "2026-02-16",
      6: "2026-02-16",
      7: "2026-02-16",
      8: "2026-02-16",
      9: "2026-02-16",
      10: "2026-02-16",
      11: "2026-02-16",
      12: "2026-02-16",
      13: "2026-02-16",
      14: "2026-02-16",
      15: "2026-02-16",
      16: "2026-02-16",
      17: "2026-02-16",
      18: "2026-02-16",
      19: "2026-02-16",
      20: "2026-02-16",
    },
  },

  kgb: {
    series: "Kagurabachi",
    prefix: "kgb",
    start: 1,
    end: 6,
    brand: "Panini",
    imageExt: "jpeg",
    author: "Takeru Hokazono",
    genre: "Shounen",
    subtitle: "Espadas lendárias, vingança e batalhas intensas no submundo.",
    thumb: img("kgb-series.jpeg"),
    format: "Padrão",

    affiliateByVolume: kgbAffiliate,
    tiktokByVolume: kgbTiktok,
    descriptionByVolume: kgbDescriptions,

    addedAtByVolume: {
      1: "2026-02-20",
      2: "2026-02-20",
      3: "2026-02-20",
      4: "2026-02-20",
      5: "2026-02-20",
      6: "2026-02-20",
    },
  },

  vinland: {
    series: "Vinland Saga",
    prefix: "vinland",
    start: 1,
    end: 13,
    brand: "Panini",
    imageExt: "jpeg",
    editionLabel: "Deluxe",
    author: "Makoto Yukimura",
    genre: "Seinen",
    subtitle:
      "Vikings, batalhas brutais e a jornada de Thorfinn em busca de um verdadeiro propósito.",
    thumb: img("vinland-series.jpeg"),
    format: "2 em 1",

    affiliateByVolume: vinlandAffiliate,
    tiktokByVolume: vinlandTiktok,
    descriptionByVolume: vinlandDescriptions,

    addedAtByVolume: {
      1: "2026-02-20",
      2: "2026-02-20",
      3: "2026-02-20",
      4: "2026-02-20",
      5: "2026-02-20",
      6: "2026-02-20",
      7: "2026-02-20",
      8: "2026-02-20",
      9: "2026-02-20",
      10: "2026-02-20",
      11: "2026-02-20",
      12: "2026-02-20",
      13: "2026-02-20",
    },
  },

  skmt: {
    series: "Sakamoto Days",
    prefix: "skmt",
    start: 1,
    end: 20,
    brand: "Panini",
    imageExt: "jpeg",
    author: "Yuto Suzuki",
    genre: "Shounen",
    subtitle:
      "Um lendário assassino aposentado tenta viver em paz, mas o passado insiste em bater à porta com muita ação e humor.",
    thumb: img("skmt-series.jpeg"),
    format: "Padrão",

    affiliateByVolume: skmtAffiliate,
    tiktokByVolume: skmtTiktok,
    descriptionByVolume: skmtDescriptions,

    addedAtByVolume: makeAddedAtByVolume(15, 20),
  },

  fma: {
    series: "Fullmetal Alchemist",
    prefix: "fma",
    start: 1,
    end: 27,
    brand: "JBC",
    imageExt: "jpeg",
    author: "Hiromu Arakawa",
    genre: "Shounen",
    subtitle:
        "Dois irmãos quebram as leis da alquimia e pagam um preço terrível. Em busca da Pedra Filosofal, enfrentam conspirações, guerras e os limites da própria humanidade.",
    thumb: img("fma-series.jpeg"),
    format: "Padrão",

    affiliateByVolume: fmaAffiliate,
    tiktokByVolume: fmaTiktok,
    descriptionByVolume: fmaDescriptions,

    addedAtByVolume: makeAddedAtByVolume(20, 27),
  },
};

/**
 * ✅ CATÁLOGO PARA UI (substitui o series.js antigo)
 * Formato idêntico ao que você usava:
 * { name, totalVolumes, thumb, subtitle, author, genre }
 */
export const seriesCatalog = [
  ...Object.values(SERIES).map((s) => ({
    name: s.series,
    totalVolumes: s.end - s.start + 1,
    thumb: s.thumb,
    subtitle: s.subtitle,
    author: s.author,
    genre: s.genre,
  })),

  // mantém "Outros" no final igual seu series.js
  {
    name: "Outros",
    thumb: img("others-series.jpeg"),
    subtitle: "Outras obras e volumes avulsos.",
  },
];