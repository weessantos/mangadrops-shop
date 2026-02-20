const base = import.meta.env.BASE_URL;

const img = (path) => `${base}assets/${path}`;

export const seriesCatalog = [
  {
    name: "Attack on Titan",
    totalVolumes: 17,
    thumb: img("aot-series.jpeg"),
    subtitle: "Titãs, muralhas e caos absoluto.",
    author: "Hajime Isayama",
    genre: "Shounen/Seinen",
  },
  {
    name: "Jujutsu Kaisen",
    totalVolumes: 30,
    thumb: img("jjk-series.jpeg"),
    subtitle: "Feitiçaria, maldições e pancadaria.",
    author: "Gege Akutami",
    genre: "Shounen",
  },
  {
    name: "One Piece",
    totalVolumes: 37,
    thumb: img("op-series.jpeg"),
    subtitle: "Aventuras em alto mar e batalhas épicas.",
    genre: "Shounen",
    author: "Eiichiro Oda",
  },
  {
    name: "Haikyu",
    totalVolumes: 20,
    thumb: img("haikyu-series.jpeg"),
    subtitle: "Vôlei, rivalidade intensa e a corrida para o Nacional.",
    genre: "Shounen",
    author: "Haruichi Furudate",
  },
  {
    name: "Kagurabachi",
    totalVolumes: 6,
    thumb: img("kgb-series.jpeg"),
    subtitle: "Espadas lendárias, vingança e batalhas intensas no submundo.",
    genre: "Shounen",
    author: "Takeru Hokazono",
  },
  {
    name: "Vinland Saga",
    totalVolumes: 13,
    thumb: img("vinland-series.jpeg"),
    subtitle: "Vikings, batalhas brutais e a jornada de Thorfinn em busca de um verdadeiro propósito.",
    genre: "Seinen",
    author: "Makoto Yukimura"
  },
  {
    name: "Outros",
    thumb: img("others-series.jpeg"),
    subtitle: "Outras obras e volumes avulsos."
  }
];
