import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";

import "../styles/not-found-page.css";

export default function NotFoundPage() {
  return (
    <main className="not-found-page">
      <div className="not-found-glow" />

      <div className="not-found-content">
        <span className="not-found-tag">ERRO 404</span>

        <div className="not-found-icon">
          <BookOpen size={54} strokeWidth={1.8} />
        </div>

        <h1>
          Ops!
          <br />
          Essa página saiu da coleção.
        </h1>

        <p>
          A página que você procura não existe, foi movida ou o endereço
          digitado está incorreto.
        </p>

        <div className="not-found-actions">
          <a className="primary"
            href="https://www.mangasdrops.online/minha-colecao"
            target="_blank"
            rel="noopener noreferrer"
          >
            Acervo Mangá Drops
          </a>

          <a className="primary"
            href="https://www.mangasdrops.online"
            target="_blank"
            rel="noopener noreferrer"
          >
            Comprar Mangás
          </a>
        </div>

        <span className="not-found-code">404 • Mangá Drops</span>
      </div>
    </main>
  );
}
