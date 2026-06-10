import "../styles/loader.css";
import { useEffect, useState } from "react";

const messages = [
  "Organizando sua coleção...",
  "Preparando sua biblioteca...",
  "Abrindo novos capítulos...",
  "Reunindo grandes histórias...",
  "Atualizando sua estante...",

  "Carregando seus volumes...",
  "Explorando novos universos...",
  "Preparando suas conquistas...",
  "Separando edições especiais...",
  "Tudo pronto para a próxima leitura...",

  "Histórias incríveis estão chegando...",
  "Seu acervo está ganhando vida...",
  "Descobrindo novos mundos...",
  "Conectando colecionadores...",
  "Mais um capítulo começa agora...",

  "Organizando cada detalhe...",
  "Construindo sua jornada...",
  "Preparando algo especial...",
  "A biblioteca está se abrindo...",
  "Quase tudo pronto..."
];

function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

export default function Loader() {
  const [shuffled, setShuffled] = useState(() => shuffleArray(messages));
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => {
        const nextIndex = prev + 1;

        // acabou a lista → embaralha novamente
        if (nextIndex >= shuffled.length) {
          setShuffled(shuffleArray(messages));
          return 0;
        }

        return nextIndex;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [shuffled]);

return (
  <div className="loader-container">
    <div className="loader-content">
      <video className="loader-video" autoPlay loop muted playsInline>
        <source src="/loader.mp4" type="video/mp4" />
      </video>

      <div className="loader-info">
        <p className="loader-text">{shuffled[index]}</p>

        <div className="loader-progress">
          <div className="loader-progress-bar"></div>
        </div>
      </div>
    </div>
  </div>
);
}
