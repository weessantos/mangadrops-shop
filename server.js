import { chromium } from "playwright";

import { getAmazonPrice } from "./services/amazonService.js";
import { getMLPrice } from "./services/mercadoLivreService.js";
import { getPriceWithRetry } from "./src/utils/scraper.js";
import { runUpdatePrices } from "./scripts/updatePrices.js";

import "dotenv/config";
import pool from "./src/db/database.js";
import express from "express";
import cors from "cors";

import seriesRoutes from "./src/api/series.routes.js";
import volumesRoutes from "./src/api/volumes.routes.js";
import { spawn } from "child_process";

const app = express();

let isRunning = false;
let progress = {
  running: false,
  current: 0,
  total: 0,
  logs: []
};

let browser;
let context;

async function initBrowser() {
  browser = await chromium.launch({ headless: true });

  context = await browser.newContext({
    storageState: "./ml-session.json",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    viewport: { width: 1366, height: 768 },
    locale: "pt-BR",
  });

  console.log("🧠 Browser do scraper iniciado");
}

app.use(cors());
app.use(express.json());

// rotas
app.use("/api/series", seriesRoutes);
app.use("/api/volumes", volumesRoutes);


//rota para console log em tempo real
app.get("/api/update-prices-stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const process = spawn("node", ["scripts/updatePrices.js", "--run"]);

  process.stdout.on("data", (data) => {
    const text = data.toString();

    res.write(`data: ${JSON.stringify({ type: "log", text })}\n\n`);
  });

  process.stderr.on("data", (data) => {
    const text = data.toString();

    res.write(`data: ${JSON.stringify({ type: "error", text })}\n\n`);
  });

  process.on("close", () => {
    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
    res.end();
  });
});

// rota para atualizar preço individualmente
app.get("/api/price", async (req, res) => {
  const { url, source, id } = req.query;

  if (!url || !source || !id) {
    return res.status(400).json({ error: "Parâmetros obrigatórios" });
  }

  let page;

  try {
    page = await context.newPage();

    let result;

    if (source === "amazon") {
      result = await getPriceWithRetry(getAmazonPrice, page, url, 2);
    } else if (source === "ml") {
      result = await getPriceWithRetry(getMLPrice, page, url, 2);
    }

    const price = result?.price ?? null;

    await page.close();

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

    // 🔥 SALVA NO BANCO
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

    return res.json({ success: true });
  } catch (err) {
    console.error("ERRO SCRAPER:", err);

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

//rota de status
app.post("/api/update-prices", async (req, res) => {
  if (isRunning) {
    return res.status(400).json({
      success: false,
      error: "⚠️ Já existe um update rodando"
    });
  }

  isRunning = true;

  // 🔥 RESET DO PROGRESSO
  progress.running = true;
  progress.current = 0;
  progress.total = 0;
  progress.logs = [];

  try {
    console.log("🚀 Iniciando update geral...");

    await runUpdatePrices(progress); // 🔥 AQUI

    console.log("✅ Finalizado");

    res.json({ success: true });

  } catch (err) {
    console.error("❌ ERRO UPDATE:", err);

    res.status(500).json({
      success: false,
      error: err.message
    });

  } finally {
    isRunning = false;
    progress.running = false; // 🔥 IMPORTANTE
  }
});

// rota para atualizar preços em lote
app.post("/api/update-prices", async (req, res) => {
  if (isRunning) {
    return res.status(400).json({
      success: false,
      error: "⚠️ Já existe um update rodando"
    });
  }

  isRunning = true;

  try {
    console.log("🚀 Iniciando update geral...");

    await runUpdatePrices(progress);

    console.log("✅ Finalizado");

    res.json({ success: true });

  } catch (err) {
    console.error("❌ ERRO UPDATE:", err);

    res.status(500).json({
      success: false,
      error: err.message
    });

  } finally {
    isRunning = false; // 🔥 SEMPRE libera no final
  }
});

//imagens
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/assets", express.static(path.join(__dirname, "public/assets")));

const PORT = process.env.PORT || 3000;

(async () => {
  await initBrowser();

  app.listen(PORT, () => {
    console.log(`🚀 API rodando em http://localhost:${PORT}`);
  });
})();
