import { aotAffiliate, opAffiliate, jjkAffiliate, haikyuAffiliate } from "./affiliates";

const base = import.meta.env.BASE_URL;

const img = (path) => `${base}assets/${path}`;

function pad2(n) {
  return String(n).padStart(2, "0");
}

function normalizeAffiliate(value) {
  // Novo formato esperado:
  // { mercadoLivre: "", amazon: "" }
  if (value && typeof value === "object") {
    return {
      mercadoLivre: typeof value.mercadoLivre === "string" ? value.mercadoLivre : "",
      amazon: typeof value.amazon === "string" ? value.amazon : "",
    };
  }

  // Formato antigo (string) => assume Mercado Livre
  if (typeof value === "string") {
    return {
      mercadoLivre: value,
      amazon: "",
    };
  }

  // Sem link
  return { mercadoLivre: "", amazon: "" };
}

function createSeriesVolumes({
  series,
  prefix,
  start,
  end,
  tag = "Panini",
  imageExt = "jpeg",
  affiliateByVolume = {},
  tiktokByVolume = {},
  descriptionByVolume = {},
  editionLabel = "",
  author = "",
  genre = "",
}) {
  return Array.from({ length: end - start + 1 }, (_, i) => {
    const volume = start + i;
    const vv = pad2(volume);

    const titleBase = editionLabel
      ? `${series} – ${editionLabel} Vol. ${vv}`
      : `${series} Vol. ${vv}`;

    return {
      id: `${prefix}-${vv}`,
      series,
      volume,
      title: titleBase,
      tag,
      author,
      genre,
      image: img(`${prefix}${vv}.${imageExt}`),

      // ✅ NOVO CAMPO
      affiliate: normalizeAffiliate(affiliateByVolume[volume]),
      tiktokUrl: tiktokByVolume[volume] || "",
      description: descriptionByVolume[volume] || "",
    };
  });
}
/* =========================
   VÍDEO TIKTOK (por volume)
   ========================= */
const aotTiktok = {
  1: "https://www.tiktok.com/@_mangadrops/video/7602421895547473159?is_from_webapp=1&sender_device=pc&web_id=7548248564712572421",
  2: "https://www.tiktok.com/@_mangadrops/video/7602815370935684359?is_from_webapp=1&sender_device=pc&web_id=7548248564712572421",
  3: "https://www.tiktok.com/@_mangadrops/video/7603170569982364936?is_from_webapp=1&sender_device=pc&web_id=7548248564712572421",
  4: "https://www.tiktok.com/@_mangadrops/video/7604160506496093447?is_from_webapp=1&sender_device=pc&web_id=7548248564712572421",
  5: "https://www.tiktok.com/@_mangadrops/video/7604281744908373255?is_from_webapp=1&sender_device=pc&web_id=7548248564712572421",
  6: "https://www.tiktok.com/@_mangadrops/video/7604578925964053768?is_from_webapp=1&sender_device=pc&web_id=7548248564712572421",
  7: "https://www.tiktok.com/@_mangadrops/video/7605029888554290439?is_from_webapp=1&sender_device=pc&web_id=7548248564712572421",
  8 : "https://www.tiktok.com/@_mangadrops/video/7605417056602688786?is_from_webapp=1&sender_device=pc&web_id=7548248564712572421",
  9 : "https://www.tiktok.com/@_mangadrops/video/7605761154476018962?is_from_webapp=1&sender_device=pc&web_id=7548248564712572421",
  10: "https://www.tiktok.com/@_mangadrops/video/7606512439999466770?is_from_webapp=1&sender_device=pc&web_id=7548248564712572421",
  11: "https://www.tiktok.com/@_mangadrops/video/7606836759439101205?is_from_webapp=1&sender_device=pc&web_id=7548248564712572421",
  12: "",
  // ...
};

const jjkTiktok = {
  0: "",
  1: "",
  2: "",
  // ...
};

const opTiktok = {
  1: "",
  2: "",
  // ...
};
const haikyuTiktok = {
  1: "",
  2: "",
  // ...
};
/* =========================
   DESCRIÇÕES DAS OBRAS (POR VOLUMES)
   ========================= */
const aotDescriptions = {
  1: "2 em 1 Vol. 01 (Vols. 1–2): A humanidade vive protegida por muralhas gigantes contra os Titãs. Quando a Muralha Maria é destruída, Eren presencia uma tragédia devastadora e decide se juntar ao exército para eliminar todos os Titãs.",
  
  2: "2 em 1 Vol. 02 (Vols. 3–4): Durante o treinamento militar, laços são formados e segredos começam a surgir. Um ataque inesperado revela habilidades ocultas que mudam completamente o rumo da batalha.",
  
  3: "2 em 1 Vol. 03 (Vols. 5–6): A batalha pela recuperação do Distrito de Trost coloca os recrutas à prova. Estratégias arriscadas e sacrifícios mostram que a sobrevivência exige coragem e liderança.",
  
  4: "2 em 1 Vol. 04 (Vols. 7–8): O Corpo de Exploração parte além das muralhas e enfrenta um inimigo diferente de tudo que já viram. A existência de Titãs inteligentes levanta novas e inquietantes perguntas.",
  
  5: "2 em 1 Vol. 05 (Vols. 9–10): Revelações chocantes abalam a confiança entre os soldados. Confrontos intensos expõem traições e mostram que o verdadeiro inimigo pode estar mais próximo do que se imagina.",
  
  6: "2 em 1 Vol. 06 (Vols. 11–12): A batalha contra o Titã Fêmea chega ao clímax em um confronto brutal. As consequências deixam cicatrizes profundas e redefinem o futuro do Corpo de Exploração.",
  
  7: "2 em 1 Vol. 07 (Vols. 13–14): Novos conflitos colocam antigos aliados frente a frente. Segredos sobre a origem dos Titãs começam a emergir, alterando a percepção sobre o mundo além das muralhas.",
  
  8: "2 em 1 Vol. 08 (Vols. 15–16): Conspirações políticas dentro das muralhas ganham destaque. O destino da humanidade passa a depender de decisões estratégicas e perigosas.",
  
  9: "2 em 1 Vol. 09 (Vols. 17–18): O passado da família real é revelado, trazendo verdades perturbadoras. Eren enfrenta escolhas que podem redefinir completamente o futuro do mundo.",
  
  10: "2 em 1 Vol. 10 (Vols. 19–20): O plano para retomar a Muralha Maria começa. Preparações intensas antecedem uma missão decisiva que exigirá sacrifícios extremos.",
  
  11: "2 em 1 Vol. 11 (Vols. 21–22): A batalha em Shiganshina explode com força total. Confrontos épicos revelam o verdadeiro poder dos Titãs e levam os soldados ao limite.",
  
  12: "2 em 1 Vol. 12 (Vols. 23–24): Verdades escondidas por gerações vêm à tona. O mundo além das muralhas se revela muito maior — e mais cruel — do que imaginavam.",
  
  13: "2 em 1 Vol. 13 (Vols. 25–26): A narrativa se expande para novos territórios e novos conflitos. A guerra assume proporções globais, mudando completamente a perspectiva da história.",
  
  14: "2 em 1 Vol. 14 (Vols. 27–28): Ideologias entram em choque e antigos companheiros se dividem. A linha entre herói e vilão se torna cada vez mais tênue.",
  
  15: "2 em 1 Vol. 15 (Vols. 29–30): Um plano ousado começa a se concretizar. O mundo entra em colapso diante de uma ameaça que pode mudar a história para sempre.",
  
  16: "2 em 1 Vol. 16 (Vols. 31–32): Antigos aliados se unem em uma missão final desesperada. O confronto inevitável se aproxima, colocando o destino da humanidade em risco.",
  
  17: "2 em 1 Vol. 17 (Vols. 33–34): A batalha derradeira define o futuro do mundo. Verdades finais trazem consequências irreversíveis e encerram a jornada iniciada dentro das muralhas."
};

const jjkDescriptions = {
  0: "Vol. 00: Yuta Okkotsu é assombrado pelo espírito extremamente poderoso de sua amiga de infância, Rika. Ao ingressar na Escola Técnica de Jujutsu sob orientação de Satoru Gojo, ele aprende a controlar essa força devastadora enquanto descobre seu verdadeiro potencial como feiticeiro.",

  1: "Vol. 01: Yuji Itadori acaba envolvido no mundo das maldições após engolir um objeto amaldiçoado. Agora hospedando o poderoso Sukuna, ele inicia sua jornada na Escola Técnica de Jujutsu sob a supervisão de Satoru Gojo.",
  
  2: "Vol. 02: Yuji começa seu treinamento como feiticeiro enquanto enfrenta maldições perigosas ao lado de Megumi e Nobara. A ameaça cresce conforme inimigos organizados entram em cena.",
  
  3: "Vol. 03: O confronto contra maldições de alto nível revela o verdadeiro perigo do mundo jujutsu. Yuji encara batalhas que colocam seus limites físicos e mentais à prova.",
  
  4: "Vol. 04: A missão em um centro de detenção toma um rumo inesperado. Consequências graves abalam o grupo e reforçam a brutalidade da realidade enfrentada pelos feiticeiros.",
  
  5: "Vol. 05: Surge o evento de intercâmbio entre escolas de Jujutsu. Rivalidades se intensificam e novos personagens demonstram habilidades impressionantes.",
  
  6: "Vol. 06: O intercâmbio é interrompido por uma invasão inesperada. Maldições poderosas colocam estudantes e professores em perigo real.",
  
  7: "Vol. 07: Satoru Gojo mostra por que é considerado o feiticeiro mais forte. Um confronto devastador expõe o abismo de poder entre humanos e maldições especiais.",
  
  8: "Vol. 08: A organização das maldições começa a revelar seus planos. O equilíbrio entre os feiticeiros e o mundo amaldiçoado fica cada vez mais instável.",
  
  9: "Vol. 09: O Incidente de Shibuya começa a se desenrolar. Armadilhas estratégicas colocam até mesmo os mais fortes em situações desesperadoras.",
  
  10: "Vol. 10: O caos em Shibuya se intensifica. Confrontos brutais deixam cicatrizes profundas nos personagens.",
  
  11: "Vol. 11: A batalha continua em meio à destruição da cidade. Sacrifícios dolorosos mudam o rumo da guerra contra as maldições.",
  
  12: "Vol. 12: Consequências do Incidente de Shibuya abalam toda a estrutura da sociedade jujutsu. Novas ameaças surgem no cenário.",
  
  13: "Vol. 13: Yuji enfrenta o peso de suas ações enquanto o mundo jujutsu entra em colapso. A tensão emocional cresce drasticamente.",
  
  14: "Vol. 14: Novos jogadores entram em cena. Estratégias complexas começam a moldar o futuro da guerra.",
  
  15: "Vol. 15: Confrontos intensos revelam técnicas amaldiçoadas devastadoras. O nível das batalhas atinge um novo patamar.",
  
  16: "Vol. 16: A hierarquia do mundo jujutsu começa a ruir. Decisões políticas influenciam diretamente o destino dos protagonistas.",
  
  17: "Vol. 17: O Jogo do Abate tem início. Regras mortais forçam participantes a lutar pela sobrevivência.",
  
  18: "Vol. 18: Novos feiticeiros e habilidades surpreendentes surgem no Jogo do Abate. Estratégia se torna tão importante quanto força.",
  
  19: "Vol. 19: Batalhas individuais revelam histórias pessoais e motivações profundas. O conflito se torna cada vez mais imprevisível.",
  
  20: "Vol. 20: O equilíbrio entre aliados e inimigos se desfaz. Confrontos decisivos alteram drasticamente o tabuleiro.",
  
  21: "Vol. 21: A tensão atinge níveis críticos. Planos ocultos começam a se revelar.",
  
  22: "Vol. 22: Antigos mistérios vêm à tona enquanto a luta pelo controle do Jogo do Abate se intensifica.",
  
  23: "Vol. 23: Alianças improváveis se formam em meio ao caos. O futuro do mundo jujutsu depende de decisões arriscadas.",
  
  24: "Vol. 24: Batalhas estratégicas redefinem o equilíbrio de poder. Cada movimento pode ser o último.",
  
  25: "Vol. 25: Confrontos emocionais colocam antigos companheiros em lados opostos. O destino se aproxima do clímax.",
  
  26: "Vol. 26: O plano final começa a tomar forma. Revelações impactantes mudam o entendimento sobre o verdadeiro objetivo do conflito.",
  
  27: "Vol. 27: A guerra se aproxima de seu ponto crítico. Sacrifícios se tornam inevitáveis.",
  
  28: "Vol. 28: A intensidade das batalhas atinge o ápice. Técnicas lendárias são finalmente reveladas.",
  
  29: "Vol. 29: O confronto decisivo se aproxima. Personagens enfrentam seus próprios limites.",
  
  30: "Vol. 30: A batalha final redefine o destino do mundo jujutsu. Consequências permanentes encerram um ciclo de maldições e escolhas difíceis."
};

export const opDescriptions = {

  1: "3 em 1 Vol. 01 (Vols. 1–3): Monkey D. Luffy inicia sua jornada para se tornar o Rei dos Piratas. O arco Romance Dawn apresenta Zoro e marca o nascimento dos Chapéus de Palha no East Blue.",

  2: "3 em 1 Vol. 02 (Vols. 4–6): Luffy enfrenta Buggy e o Capitão Kuro enquanto a tripulação começa a crescer. Novos aliados entram em cena e os perigos do East Blue se intensificam.",

  3: "3 em 1 Vol. 03 (Vols. 7–9): O confronto contra Don Krieg no Baratie coloca Sanji no caminho da tripulação. A Grand Line se aproxima e os sonhos começam a ganhar forma.",

  4: "3 em 1 Vol. 04 (Vols. 10–12): O arco de Arlong Park revela o passado de Nami e fortalece os laços dos Chapéus de Palha em uma batalha decisiva pela liberdade.",

  5: "3 em 1 Vol. 05 (Vols. 13–15): Após Arlong Park, a tripulação finalmente entra na Grand Line, encarando novos mares e inimigos muito mais perigosos.",

  6: "3 em 1 Vol. 06 (Vols. 16–18): Whiskey Peak e Little Garden apresentam a Baroque Works e ampliam o escopo da aventura rumo a Alabasta.",

  7: "3 em 1 Vol. 07 (Vols. 19–21): A saga de Drum introduz Tony Tony Chopper e aprofunda o lado emocional da tripulação antes do confronto final em Alabasta.",

  8: "3 em 1 Vol. 08 (Vols. 22–24): O arco de Alabasta atinge seu clímax com o confronto contra Crocodile e a luta pelo destino de um reino inteiro.",

  9: "3 em 1 Vol. 09 (Vols. 25–27): As consequências de Alabasta ecoam pelo mundo enquanto mistérios sobre o Governo Mundial começam a surgir.",

  10: "3 em 1 Vol. 10 (Vols. 28–30): A jornada leva os Chapéus de Palha aos céus em Skypiea, onde lendas antigas e novos inimigos aguardam.",

  11: "3 em 1 Vol. 11 (Vols. 31–33): O confronto contra Enel revela segredos do Século Perdido e coloca o sonho de liberdade em jogo nas ilhas do céu.",

  12: "3 em 1 Vol. 12 (Vols. 34–36): A conclusão de Skypiea abre caminho para Water 7, onde tensões internas começam a ameaçar a tripulação.",

  13: "3 em 1 Vol. 13 (Vols. 37–39): Water 7 marca revelações impactantes envolvendo Robin e coloca os Chapéus de Palha contra o Governo Mundial.",

  14: "3 em 1 Vol. 14 (Vols. 40–42): Enies Lobby inicia uma guerra aberta para resgatar uma companheira, desafiando diretamente a autoridade mundial.",

  15: "3 em 1 Vol. 15 (Vols. 43–45): O clímax de Enies Lobby traz batalhas intensas e momentos inesquecíveis que redefinem a força da tripulação.",

  16: "3 em 1 Vol. 16 (Vols. 46–48): Após a guerra, a tripulação segue para Thriller Bark, onde novas ameaças surgem nas sombras.",

  17: "3 em 1 Vol. 17 (Vols. 49–51): Thriller Bark apresenta inimigos poderosos e revelações importantes sobre o passado e o futuro da jornada.",

  18: "3 em 1 Vol. 18 (Vols. 52–54): No Arquipélago Sabaody, o encontro com os Tenryuubitos muda drasticamente o rumo da história.",

  19: "3 em 1 Vol. 19 (Vols. 55–57): O mundo mergulha na tensão que antecede a Guerra de Marineford, colocando alianças e ideais à prova.",

  20: "3 em 1 Vol. 20 (Vols. 58–60): A Guerra dos Melhores explode em Marineford, trazendo perdas devastadoras e mudando o equilíbrio do mundo.",

  21: "3 em 1 Vol. 21 (Vols. 61–63): Após o timeskip, Luffy e sua tripulação retornam mais fortes para iniciar a jornada no Novo Mundo.",

  22: "3 em 1 Vol. 22 (Vols. 64–66): Na Ilha dos Homens-Peixe, novas alianças e ameaças consolidam a presença dos Chapéus de Palha no Novo Mundo.",

  23: "3 em 1 Vol. 23 (Vols. 67–69): Punk Hazard apresenta alianças inesperadas e o início do plano contra um dos Yonkou.",

  24: "3 em 1 Vol. 24 (Vols. 70–72): Dressrosa começa com intrigas políticas e batalhas que envolvem todo o submundo.",

  25: "3 em 1 Vol. 25 (Vols. 73–75): O confronto contra Doflamingo atinge seu auge em uma das batalhas mais intensas da série.",

  26: "3 em 1 Vol. 26 (Vols. 76–78): As consequências de Dressrosa expandem a influência dos Chapéus de Palha pelo mundo.",

  27: "3 em 1 Vol. 27 (Vols. 79–81): Zou revela segredos fundamentais sobre os Road Poneglyphs e o verdadeiro caminho até Laugh Tale.",

  28: "3 em 1 Vol. 28 (Vols. 82–84): Whole Cake Island coloca Sanji no centro da narrativa em meio a conflitos familiares e alianças perigosas.",

  29: "3 em 1 Vol. 29 (Vols. 85–87): A fuga do território de Big Mom exige estratégia e sacrifícios que fortalecem ainda mais a tripulação.",

  30: "3 em 1 Vol. 30 (Vols. 88–90): A jornada avança para Wano, onde samurais e piratas se unem contra uma ameaça colossal.",

  31: "3 em 1 Vol. 31 (Vols. 91–93): O arco de Wano começa com conspirações e preparativos para a guerra contra Kaido.",

  32: "3 em 1 Vol. 32 (Vols. 94–96): A batalha se aproxima enquanto alianças estratégicas se formam nas sombras de Wano.",

  33: "3 em 1 Vol. 33 (Vols. 97–99): A guerra em Onigashima explode em confrontos decisivos entre os piores inimigos do Novo Mundo.",

  34: "3 em 1 Vol. 34 (Vols. 100–102): O clímax contra Kaido redefine o futuro dos mares e eleva Luffy a um novo patamar.",

  35: "3 em 1 Vol. 35 (Vols. 103–105): As consequências da guerra em Wano alteram o equilíbrio global e abrem caminho para uma nova era.",

  36: "3 em 1 Vol. 36 (Vols. 106–108): O arco de Egghead inicia revelações científicas e políticas que abalam os pilares do Governo Mundial.",

  37: "3 em 1 Vol. 37 (Vols. 109–111): Em Egghead, confrontos e revelações aproximam a história de sua fase final, ampliando os mistérios do mundo."
};

export const haikyuDescriptions = {
  1: "2 em 1 Vol. 1 (Vols. 1–2): Hinata entra no Karasuno decidido a provar seu valor, formando uma dupla improvável com Kageyama.",
  2: "2 em 1 Vol. 2 (Vols. 3–4): O time começa a treinar seriamente e enfrenta seus primeiros grandes desafios.",
  3: "2 em 1 Vol. 3 (Vols. 5–6): Novas estratégias surgem enquanto o Karasuno tenta se reerguer no cenário competitivo.",
  4: "2 em 1 Vol. 4 (Vols. 7–8): Partidas intensas colocam à prova a coordenação e confiança da equipe.",
  5: "2 em 1 Vol. 5 (Vols. 9–10): O espírito de superação do Karasuno começa a chamar atenção dos rivais.",
  6: "2 em 1 Vol. 6 (Vols. 11–12): Confrontos decisivos revelam o verdadeiro potencial da equipe.",
  7: "2 em 1 Vol. 7 (Vols. 13–14): A pressão dos campeonatos regionais eleva o nível das partidas.",
  8: "2 em 1 Vol. 8 (Vols. 15–16): Rivalidades antigas reacendem em jogos eletrizantes.",
  9: "2 em 1 Vol. 9 (Vols. 17–18): Hinata e Kageyama evoluem e fortalecem sua parceria dentro de quadra.",
  10: "2 em 1 Vol. 10 (Vols. 19–20): O sonho do Nacional fica cada vez mais real para o Karasuno.",
  11: "2 em 1 Vol. 11 (Vols. 21–22): A equipe enfrenta adversários imprevisíveis com estilos únicos.",
  12: "2 em 1 Vol. 12 (Vols. 23–24): Treinos intensos e partidas decisivas moldam o futuro do time.",
  13: "2 em 1 Vol. 13 (Vols. 25–26): O nível técnico sobe e cada ponto passa a ser crucial.",
  14: "2 em 1 Vol. 14 (Vols. 27–28): A resistência física e mental dos jogadores é colocada à prova.",
  15: "2 em 1 Vol. 15 (Vols. 29–30): Confrontos dramáticos mantêm o público sem fôlego.",
  16: "2 em 1 Vol. 16 (Vols. 31–32): O Karasuno encara partidas que podem definir seu destino.",
  17: "2 em 1 Vol. 17 (Vols. 33–34): Rivalidades atingem o ápice em confrontos memoráveis.",
  18: "2 em 1 Vol. 18 (Vols. 35–36): Estratégia e trabalho em equipe fazem a diferença nos momentos decisivos.",
  19: "2 em 1 Vol. 19 (Vols. 37–38): A busca pelo topo nacional exige o máximo de cada jogador.",
  20: "2 em 1 Vol. 20 (Vols. 39–40): O Karasuno mostra até onde pode chegar quando joga como um verdadeiro time."
};


/* =========================
   PREÇOS POR VOLUME
   ========================= */

/* =========================
   OBRAS GERADAS
   ========================= */

const aot = createSeriesVolumes({
  series: "Attack on Titan",
  prefix: "aot",
  start: 1,
  end: 17,
  tag: "Panini",
  imageExt: "jpeg",
  affiliateByVolume: aotAffiliate,
  tiktokByVolume: aotTiktok,
  descriptionByVolume: aotDescriptions,
  editionLabel: "2 em 1",
  author: "Hajime Isayama",
  genre: "Shounen/Seinen",
});


const jjk = createSeriesVolumes({
  series: "Jujutsu Kaisen",
  prefix: "jjk",
  start: 0,
  end: 30,
  tag: "Panini",
  imageExt: "jpeg",
  affiliateByVolume: jjkAffiliate,
  tiktokByVolume: jjkTiktok,
  descriptionByVolume: jjkDescriptions,
  author: "Gege Akutami",
  genre: "Shounen",
});

const op = createSeriesVolumes({
  series: "One Piece",
  prefix: "op",
  start: 1,
  end: 37,
  tag: "Panini",
  imageExt: "jpeg",
  affiliateByVolume: opAffiliate,
  tiktokByVolume: opTiktok,
  descriptionByVolume: opDescriptions,
  editionLabel: "3 em 1",
  author: "Eiichiro Oda",
  genre: "Shounen",
});

const haikyu = createSeriesVolumes({
  series: "Haikyu",
  prefix: "haikyu",
  start: 1,
  end: 20,
  tag: "Panini",
  imageExt: "jpeg",
  affiliateByVolume: haikyuAffiliate,
  tiktokByVolume: haikyuTiktok,
  descriptionByVolume: haikyuDescriptions,
  editionLabel: "2 em 1",
  author: "Haruichi Furudate",
  genre: "Shounen",
});

/* =========================
   EXPORT FINAL
   ========================= */

export const products = [
  ...aot,
  ...jjk,
  ...op,
  ...haikyu,
];
