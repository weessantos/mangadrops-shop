import "../styles/loader.css";
import { useEffect, useState } from "react";

const messages = [
  "A magia começa a surgir...",
  "Novas histórias ganham vida...",
  "Um mundo se abre diante de você...",
  "Pequenos mistérios aparecem...",
  "A jornada está prestes a começar...",

  "Algo especial está se formando...",
  "As páginas começam a brilhar...",
  "Um novo universo se revela...",
  "A imaginação desperta...",
  "Caminhos inesperados aparecem...",

  "A aventura chama por você...",
  "Histórias aguardam seu olhar...",
  "Um toque de magia no ar...",
  "Tudo começa a se encaixar...",
  "Novos destinos se aproximam...",

  "A curiosidade guia o caminho...",
  "O próximo capítulo te espera...",
  "Descobertas estão por vir...",
  "Um instante antes da magia...",
  "Prepare-se para explorar..."
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

        <p className="loader-text">
          {shuffled[index]}
          <span className="dots-video">
            <video autoPlay loop muted playsInline>
              <source src="/dog-loader.mp4" type="video/mp4" />
            </video>
          </span>
        </p>
      </div>
    </div>
  );
}
