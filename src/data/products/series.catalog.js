// src/data/products/series.catalog.js
const base =
  typeof import.meta !== "undefined" &&
  import.meta.env &&
  import.meta.env.BASE_URL
    ? import.meta.env.BASE_URL
    : "/";

export const img = (path) => `${base}assets/${path}`;

// ✅ util (se você usa)
import {
  makeAddedAtByVolume } from "../../utils/volumeDates.js";

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
  gbAffiliate,
  shkAffiliate,
  dddAffiliate,
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
import { gbDescriptions } from "./descriptions/gb.js";

// ✅ tiktok
import { aotTiktok } from "./tiktok/aot.js";
import { jjkTiktok } from "./tiktok/jjk.js";
import { opTiktok } from "./tiktok/op.js";
import { haikyuTiktok } from "./tiktok/haikyu.js";
import { kgbTiktok } from "./tiktok/kgb.js";
import { vinlandTiktok } from "./tiktok/vinland.js";
import { skmtTiktok } from "./tiktok/skmt.js";
import { fmaTiktok } from "./tiktok/fma.js";
import { gbTiktok } from "./tiktok/gb.js";
import { shkDescriptions } from "./descriptions/shk.js";
import { shkTiktok } from "./tiktok/shk.js";
import { dddDescriptions } from "./descriptions/ddd.js";
import { dddTiktok } from "./tiktok/ddd.js";


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
    imageExt: "webp",
    editionLabel: "2 em 1",
    author: "Hajime Isayama",
    genre: "Shounen/Seinen",
    subtitle: "Titãs, muralhas e caos absoluto.",
    thumb: img("aot-series.webp"),
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
    imageExt: "webp",
    author: "Gege Akutami",
    genre: "Shounen",
    subtitle: "Feitiçaria, maldições e pancadaria.",
    thumb: img("jjk-series.webp"),
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
    imageExt: "webp",
    editionLabel: "3 em 1",
    author: "Eiichiro Oda",
    genre: "Shounen",
    subtitle: "Aventuras em alto mar e batalhas épicas.",
    thumb: img("op-series.webp"),
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
    brand: "JBC",
    imageExt: "webp",
    editionLabel: "2 em 1",
    author: "Haruichi Furudate",
    genre: "Shounen",
    subtitle: "Vôlei, rivalidade intensa e a corrida para o Nacional.",
    thumb: img("haikyu-series.webp"),
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
    imageExt: "webp",
    author: "Takeru Hokazono",
    genre: "Shounen",
    subtitle: "Espadas lendárias, vingança e batalhas intensas no submundo.",
    thumb: img("kgb-series.webp"),
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
    imageExt: "webp",
    editionLabel: "Deluxe",
    author: "Makoto Yukimura",
    genre: "Seinen",
    subtitle:
      "Vikings, batalhas brutais e a jornada de Thorfinn em busca de um verdadeiro propósito.",
    thumb: img("vinland-series.webp"),
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
    imageExt: "webp",
    author: "Yuto Suzuki",
    genre: "Shounen",
    subtitle:
      "Um lendário assassino aposentado tenta viver em paz, mas o passado insiste em bater à porta com muita ação e humor.",
    thumb: img("skmt-series.webp"),
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
    imageExt: "webp",
    author: "Hiromu Arakawa",
    genre: "Shounen",
    subtitle:
        "Dois irmãos quebram as leis da alquimia e pagam um preço terrível. Em busca da Pedra Filosofal, enfrentam conspirações, guerras e os limites da própria humanidade.",
    thumb: img("fma-series.webp"),
    format: "Padrão",

    affiliateByVolume: fmaAffiliate,
    tiktokByVolume: fmaTiktok,
    descriptionByVolume: fmaDescriptions,

    addedAtByVolume: makeAddedAtByVolume(20, 27),
  },

  gb: {
    series: "Gash Bell",
    prefix: "gb",
    start: 1,
    end: 9,
    brand: "MPEG",
    imageExt: "webp",
    editionLabel: "2 em 1",
    author: "Makoto Raiku",
    genre: "Shounen",
    subtitle: "Cem demônios lutam na Terra pelo trono do Mundo Mamodo.",
    thumb: img("gb-series.webp"),
    format: "2 em 1",

    affiliateByVolume: gbAffiliate,
    tiktokByVolume: gbTiktok,
    descriptionByVolume: gbDescriptions,

    addedAtByVolume: makeAddedAtByVolume(1, 9),
  },

  shk: {
    series: "Shaman King",
    prefix: "shk",
    start: 1,
    end: 14,
    brand: "JBC",
    imageExt: "webp",
    editionLabel: "2 em 1",
    author: "Hiroyuki Takei",
    genre: "Shounen",
    subtitle: "Xamãs lutam em um torneio milenar para decidir o rei dos espíritos.",
    thumb: img("shk-series.webp"),
    format: "2 em 1",

    affiliateByVolume: shkAffiliate,
    tiktokByVolume: shkTiktok,
    descriptionByVolume: shkDescriptions,

    addedAtByVolume: {
      1: "2026-03-11",
      2: "2026-03-11",
      3: "2026-03-11",
      4: "2026-03-11",
      5: "2026-03-11",
      6: "2026-03-11",
      7: "2026-03-11",
      8: "2026-03-11",
      9: "2026-03-11",
      10: "2026-03-11",
      11: "2026-03-11",
      12: "2026-03-11",
      13: "2026-03-11",
      14: "2026-03-11",
    },
  },

  ddd: {
    series: "Dandadan",
    prefix: "ddd",
    start: 1,
    end: 20,
    brand: "Panini",
    imageExt: "webp",
    editionLabel: "Padrão",
    author: "Yokinobu Tatsu",
    genre: "Shounen",
    subtitle: "\"Fantasmas, alienígenas e batalhas absurdas em um dos shonens mais caóticos da nova geração.\"",
    thumb: img("ddd-series.webp"),
    format: "Padrão",

    affiliateByVolume: dddAffiliate,
    tiktokByVolume: dddTiktok,
    descriptionByVolume: dddDescriptions,

    addedAtByVolume: {},
  },};

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
    thumb: img("others-series.webp"),
    subtitle: "Outras obras e volumes avulsos.",
  },
];