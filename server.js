// ==============================
// 🚀 SERVIDOR PRINCIPAL DA API
// ==============================
//
// Responsabilidades:
// - servir rotas do CMS
// - iniciar scraper Playwright
// - streaming de logs em tempo real (SSE)
// - atualização individual de preços
// - cancelamento do scraper
//

import { chromium } from "playwright";

import { getAmazonPrice } from "./services/amazonService.js";
import { getMLPrice } from "./services/mercadoLivreService.js";

import { getPriceWithRetry } from "./src/utils/scraper.js";
import { cancelUpdatePrices } from "./scripts/updatePrices.js";

import "dotenv/config";

import express from "express";
import cors from "cors";

import pool from "./src/db/database.js";

import seriesRoutes from "./src/api/series.routes.js";
import volumesRoutes from "./src/api/volumes.routes.js";

import { spawn } from "child_process";

import path from "path";
import { fileURLToPath } from "url";

const app = express();

// ==============================
// 🧠 BROWSER GLOBAL
// ==============================
//
// Utilizado para:
// - atualização individual
// - evitar abrir Chromium por request
//

let browser;
let context;

// ==============================
// 🔥 PROCESSO GLOBAL DO SCRAPER
// ==============================
//
// Guarda referência do processo:
//
// node scripts/updatePrices.js --run
//
// Necessário para:
// - cancelar scraper
// - controlar SSE
// - evitar múltiplas execuções
//

let updateProcess = null;

// ==============================
// 🚀 INICIALIZA PLAYWRIGHT
// ==============================
//
// Browser persistente utilizado
// pelas rotas de preço individual.
//

async function initBrowser() {
  browser = await chromium.launch({
    headless: true,
  });

  context = await browser.newContext({
    storageState: "./ml-session.json",

    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",

    viewport: {
      width: 1366,
      height: 768,
    },

    locale: "pt-BR",
  });

  console.log("🧠 Browser do scraper iniciado");
}

// ==============================
// ⚙️ MIDDLEWARES
// ==============================

app.use(cors());
app.use(express.json());

// ==============================
// 📚 ROTAS DA API
// ==============================

app.use("/api/series", seriesRoutes);
app.use("/api/volumes", volumesRoutes);

// ==============================
// 📡 STREAM DE LOGS DO SCRAPER
// ==============================
//
// SSE (Server Sent Events)
//
// Responsável por:
// - iniciar scraper
// - transmitir logs em tempo real
// - transmitir erros
// - avisar finalização
//

app.get("/api/update-prices-stream", (req, res) => {
  // headers SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // evita múltiplos scrapers simultâneos
  if (updateProcess) {
    res.write(
      `data: ${JSON.stringify({
        type: "error",
        text: "⚠️ Já existe um update rodando",
      })}\n\n`,
    );

    return;
  }

  // inicia scraper em processo separado
  updateProcess = spawn("node", ["scripts/updatePrices.js", "--run"]);

  // logs normais
  updateProcess.stdout.on("data", (data) => {
    const text = data.toString();

    res.write(
      `data: ${JSON.stringify({
        type: "log",
        text,
      })}\n\n`,
    );
  });

  // logs de erro
  updateProcess.stderr.on("data", (data) => {
    const text = data.toString();

    res.write(
      `data: ${JSON.stringify({
        type: "error",
        text,
      })}\n\n`,
    );
  });

  // finalização
  updateProcess.on("close", () => {
    updateProcess = null;

    res.write(
      `data: ${JSON.stringify({
        type: "done",
      })}\n\n`,
    );

    res.end();
  });

  // cliente fechou conexão
  req.on("close", () => {
    console.log("🔌 Cliente SSE desconectado");
  });
});

// ==============================
// 🛑 CANCELAR UPDATE
// ==============================

app.post("/api/cancel-update", (req, res) => {
  try {
    // avisa o scraper
    cancelUpdatePrices();

    // encerra processo do scraper
    if (updateProcess) {
      updateProcess.kill();

      updateProcess = null;
    }

    console.log("🛑 Update cancelado");

    return res.json({
      success: true,
    });
  } catch (err) {
    console.error("❌ Erro ao cancelar:", err);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// ==============================
// 💰 ATUALIZAÇÃO INDIVIDUAL
// ==============================
//
// Utilizado pelos botões 💲 do CMS.
//

app.get("/api/price", async (req, res) => {
  const { url, source, id } = req.query;

  if (!url || !source || !id) {
    return res.status(400).json({
      error: "Parâmetros obrigatórios",
    });
  }

  let page;

  try {
    page = await context.newPage();

    let result;

    // AMAZON
    if (source === "amazon") {
      result = await getPriceWithRetry(getAmazonPrice, page, url, 2);
    }

    // MERCADO LIVRE
    else if (source === "ml") {
      result = await getPriceWithRetry(getMLPrice, page, url, 2);
    }

    const price = result?.price ?? null;

    await page.close();

    // preço não encontrado
    if (!price) {
      console.log("❌ PREÇO NÃO ENCONTRADO:", {
        url,
        source,
        result,
      });

      return res.json({
        success: false,
        error: "PRICE_NOT_FOUND",
      });
    }

    // salva no banco
    await pool.query(
      `
      UPDATE volumes
      SET 
        ${source === "amazon" ? "amazon_price" : "mercado_livre_price"} = $1,
        price_updated_at = NOW()
      WHERE id = $2
      `,
      [price, id],
    );

    return res.json({
      success: true,
    });
  } catch (err) {
    console.error("❌ ERRO SCRAPER:", err);

    // garante fechamento da página
    if (page) {
      try {
        await page.close();
      } catch {}
    }

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// ==============================
// 🖼 ASSETS ESTÁTICOS
// ==============================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/assets", express.static(path.join(__dirname, "public/assets")));

// ==============================
// 🚀 START SERVER
// ==============================

const PORT = process.env.PORT || 3000;

(async () => {
  await initBrowser();

  app.listen(PORT, () => {
    console.log(`🚀 API rodando em http://localhost:${PORT}`);
  });
})();
