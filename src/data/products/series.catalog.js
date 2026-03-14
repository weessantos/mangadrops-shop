// src/data/products/series.catalog.js
const base =
  typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.BASE_URL
    ? import.meta.env.BASE_URL
    : "/";

export const img = (path) => `${base}assets/${path}`;

/**
 * CONFIG TÉCNICA (pra gerar os volumes)
 * - Agora também tem thumb/subtitle, pra UI não precisar de outro arquivo
 */

import { createSeries } from "./series.factory";
import { makeAddedAtByVolume } from "../../utils/volumeDates";

export const SERIES = {

  aot: createSeries("aot", {
    series: "Attack on Titan",
    start: 1,
    end: 17,
    brand: "Panini",
    editionLabel: "2 em 1",
    author: "Hajime Isayama",
    genre: "Shounen/Seinen",
    subtitle: "Titãs, muralhas e caos absoluto.",
    format: "2 em 1",

    addedAtByVolume: {
      14: "2026-02-16",
      15: "2026-02-16",
      16: "2026-02-16",
      17: "2026-02-16",
    },
  }),

  jjk: createSeries("jjk", {
    series: "Jujutsu Kaisen",
    start: 0,
    end: 30,
    brand: "Panini",
    author: "Gege Akutami",
    genre: "Shounen",
    subtitle: "Feitiçaria, maldições e pancadaria.",
    format: "Padrão",

    addedAtByVolume: makeAddedAtByVolume(25, 26),
  }),

  op: createSeries("op", {
    series: "One Piece",
    start: 1,
    end: 37,
    brand: "Panini",
    editionLabel: "3 em 1",
    author: "Eiichiro Oda",
    genre: "Shounen",
    subtitle: "Aventuras em alto mar e batalhas épicas.",
    format: "3 em 1",

    addedAtByVolume: {
      37: "2026-02-25",
    },
  }),

  haikyu: createSeries("haikyu", {
    series: "Haikyu",
    end: 20,
    brand: "JBC",
    editionLabel: "2 em 1",
    author: "Haruichi Furudate",
    genre: "Shounen",
    subtitle: "Vôlei, rivalidade intensa e a corrida para o Nacional.",
    format: "2 em 1",

    addedAtByVolume: makeAddedAtByVolume(1, 20, "2026-02-16"),
  }),

  kgb: createSeries("kgb", {
    series: "Kagurabachi",
    end: 6,
    brand: "Panini",
    author: "Takeru Hokazono",
    genre: "Shounen",
    subtitle: "Espadas lendárias, vingança e batalhas intensas no submundo.",
    format: "Padrão",

    addedAtByVolume: makeAddedAtByVolume(1, 6, "2026-02-20"),
  }),

  vinland: createSeries("vinland", {
    series: "Vinland Saga",
    end: 13,
    brand: "Panini",
    editionLabel: "Deluxe",
    author: "Makoto Yukimura",
    genre: "Seinen",
    subtitle:
      "Vikings, batalhas brutais e a jornada de Thorfinn em busca de um verdadeiro propósito.",
    format: "2 em 1",

    addedAtByVolume: makeAddedAtByVolume(1, 13, "2026-02-20"),
  }),

  skmt: createSeries("skmt", {
    series: "Sakamoto Days",
    end: 20,
    brand: "Panini",
    author: "Yuto Suzuki",
    genre: "Shounen",
    subtitle:
      "Um lendário assassino aposentado tenta viver em paz, mas o passado insiste em bater à porta com muita ação e humor.",
    format: "Padrão",

    addedAtByVolume: makeAddedAtByVolume(15, 20),
  }),

  fma: createSeries("fma", {
    series: "Fullmetal Alchemist",
    end: 27,
    brand: "JBC",
    author: "Hiromu Arakawa",
    genre: "Shounen",
    subtitle:
      "Dois irmãos quebram as leis da alquimia e pagam um preço terrível. Em busca da Pedra Filosofal, enfrentam conspirações, guerras e os limites da própria humanidade.",
    format: "Padrão",

    addedAtByVolume: makeAddedAtByVolume(20, 27),
  }),

  gb: createSeries("gb", {
    series: "Gash Bell",
    end: 9,
    brand: "MPEG",
    editionLabel: "2 em 1",
    author: "Makoto Raiku",
    genre: "Shounen",
    subtitle: "Cem demônios lutam na Terra pelo trono do Mundo Mamodo.",
    format: "2 em 1",

    addedAtByVolume: makeAddedAtByVolume(1, 9),
  }),

  shk: createSeries("shk", {
    series: "Shaman King",
    end: 14,
    brand: "JBC",
    editionLabel: "2 em 1",
    author: "Hiroyuki Takei",
    genre: "Shounen",
    subtitle: "Xamãs lutam em um torneio milenar para decidir o rei dos espíritos.",
    format: "2 em 1",

    addedAtByVolume: makeAddedAtByVolume(1, 14, "2026-03-11"),
  }),

  ddd: createSeries("ddd", {
    series: "Dandadan",
    end: 20,
    brand: "Panini",
    editionLabel: "Padrão",
    author: "Yokinobu Tatsu",
    genre: "Shounen",
    subtitle:
      "Fantasmas, alienígenas e batalhas absurdas em um dos shonens mais caóticos da nova geração.",
    format: "Padrão",

    addedAtByVolume: {},
  }),

}
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