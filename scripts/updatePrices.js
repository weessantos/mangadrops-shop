import { getAmazonPrice } from "../services/amazonService.js";
import { getMLPrice } from "../services/mercadoLivreService.js";

import {
  sleepRandom,
  getPriceWithRetry,
  logProduct,
} from "../src/utils/scraper.js";

import "dotenv/config";
import { chromium } from "playwright";
import pool from "../src/db/database.js";

const RUN_AMAZON = true;
const RUN_ML = true;

// ==============================
// PROCESSADOR DE DADOS
// ==============================

async function processBatch({ rows, getPrice, field, column, name }) {
  console.log(`\n🚀 Iniciando ${name}: ${rows.length} produtos`);

  const browser = await chromium.launch({ headless: true });

  const updates = [];
  const history = [];

  let context = await browser.newContext({
    storageState: "./ml-session.json", // 🔥 ESSENCIAL
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1366, height: 768 },
    locale: "pt-BR",
  });
  let index = 0;

  console.log("🔥 Aquecendo sessão...");
  await new Promise((r) => setTimeout(r, 10000));

  // 🔥 Warmup só para Amazon
  if (name === "Amazon") {
    console.log("🔥 Warmup Amazon...");

    const warmupPage = await context.newPage();

    await warmupPage.goto("https://www.amazon.com.br");
    await warmupPage.waitForTimeout(5000);

    await warmupPage.goto("https://www.amazon.com.br/s?k=manga");
    await warmupPage.waitForTimeout(5000);

    await warmupPage.close();
  }

  for (const row of rows) {
    index++;

    // 🐢 WARMUP (primeiros 5 mais lentos)
    if (index <= 5 && name === "Amazon") {
      console.log("🐢 Modo humano (warmup)");
      await new Promise((r) => setTimeout(r, 10000 + Math.random() * 5000));
    }

    // 🔁 reset de contexto a cada 15 produtos
    if (index % 15 === 0) {
      await context.close();

      context = await browser.newContext({
        storageState: "./ml-session.json",
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        viewport: { width: 1366, height: 768 },
        locale: "pt-BR",
      });

      console.log("🔁 Contexto reiniciado");
      console.log("⚠️ Todas páginas anteriores foram invalidadas");
    }

    const start = Date.now();

    try {
      const url = row[field];
      if (!url) continue;

      let result = null;
      let price = null;

      const MAX_RETRIES = 3;

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        let page;

        try {
          page = await context.newPage();

          result = await getPriceWithRetry(getPrice, page, url, 2);
          price = result?.price ?? null;

          // ✅ sucesso
          if (price) {
            break;
          }

          // 🔥 Anti-block Amazon
          if (!price && name === "Amazon") {
            let html = "";

            try {
              html = await page.content();
            } catch {
              console.log("⚠️ Página morreu antes do HTML");
            }

            if (
              html &&
              (html.includes("opfcaptcha") ||
                html.includes("continuar comprando"))
            ) {
              console.log(`🤖 Bloqueio detectado (tentativa ${attempt})`);

              await new Promise((r) =>
                setTimeout(r, 2000 + Math.random() * 3000),
              );

              continue; // 🔁 tenta novamente
            }
          }

          // ❌ não tem preço mas não é bloqueio → para
          break;
        } catch (err) {
          console.log(`⚠️ Erro tentativa ${attempt}:`, err.message);

          // 🔁 erro de página/contexto → tenta de novo
          if (err.message.includes("Target page")) {
            continue;
          }

          // ❌ erro desconhecido → para
          break;
        } finally {
          if (page) {
            try {
              await page.close();
            } catch {}
          }
        }
      }

      const dbTitle = row.title;

      // 🔥 DEBUG: salva HTML se falhar (última tentativa)
      if (!price) {
        try {
          const debugPage = await context.newPage();
          await debugPage.goto(url, { waitUntil: "domcontentloaded" });

          const html = await debugPage.content();

          const fs = await import("fs");

          if (!fs.existsSync("./errors")) {
            fs.mkdirSync("./errors");
          }

          const fileName = `./errors/error-${row.id}.html`;

          fs.writeFileSync(fileName, html);

          console.log(`💾 HTML salvo em: ${fileName}`);

          await debugPage.close();
        } catch {
          console.log("⚠️ Não conseguiu salvar HTML");
        }
      }

      // 🔍 pega preço atual
      const current = await pool.query(
        `SELECT ${column} FROM volumes WHERE id = $1`,
        [row.id],
      );

      const currentPrice = current.rows[0]?.[column];

      // ✅ calcula mudança
      const changed = Number(currentPrice) !== Number(price);

      const duration = Date.now() - start;

      // 🔥 LOG
      logProduct(
        index,
        rows.length,
        name,
        `[ID:${row.id}] ${dbTitle}`,
        price,
        changed,
        duration,
      );

      // 🧠 salva
      if (changed) {
        updates.push({
          id: row.id,
          price,
        });

        history.push({
          volume_id: row.id,
          source: name.toLowerCase().replace(" ", "_"),
          price,
        });
      }
    } catch (err) {
      console.log("❌ Erro geral:", err.message);
    }

    await sleepRandom();

    if (index % 20 === 0) {
      console.log("🧠 Pausa anti-block...");
      await new Promise((r) => setTimeout(r, 20000));
    }
  }

  // ==============================
  // 🔥 CONFIG CHUNK
  // ==============================
  const CHUNK_SIZE = 100;

  // ==============================
  // 🔥 BATCH UPDATE
  // ==============================
  if (updates.length > 0) {
    console.log(`\n💾 Atualizando ${updates.length} registros...`);

    for (let i = 0; i < updates.length; i += CHUNK_SIZE) {
      const chunk = updates.slice(i, i + CHUNK_SIZE);

      const values = [];
      const params = [];

      chunk.forEach((item, index) => {
        const idx = index * 2;
        values.push(`($${idx + 1}::int, $${idx + 2}::numeric)`);
        params.push(item.id, item.price);
      });

      await pool.query(
        `
        UPDATE volumes v
        SET 
          ${column} = u.price,
          price_updated_at = NOW()
        FROM (
          VALUES ${values.join(",")}
        ) AS u(id, price)
        WHERE v.id = u.id::int
      `,
        params,
      );
    }

    console.log("✅ Batch update concluído");
  } else {
    console.log("⏩ Nenhum update necessário");
  }

  // ==============================
  // 🔥 BATCH HISTORY
  // ==============================
  if (history.length > 0) {
    console.log(`📊 Salvando ${history.length} históricos...`);

    for (let i = 0; i < history.length; i += CHUNK_SIZE) {
      const chunk = history.slice(i, i + CHUNK_SIZE);

      const values = [];
      const params = [];

      chunk.forEach((item, index) => {
        const idx = index * 3;
        values.push(`($${idx + 1}, $${idx + 2}, $${idx + 3})`);
        params.push(item.volume_id, item.source, item.price);
      });

      await pool.query(
        `
        INSERT INTO price_history (volume_id, source, price)
        VALUES ${values.join(",")}
      `,
        params,
      );
    }

    console.log("✅ Histórico salvo");
  }

  await browser.close();

  console.log(`✅ Finalizado ${name}`);
}

// ==============================
// MAIN
// ==============================

export async function runUpdatePrices() {
  console.log("🚀 Iniciando scraper escalável...");

  // ============================
  // AMAZON
  // ============================
  if (RUN_AMAZON) {
    const amazonRes = await pool.query(`
    SELECT id, title, amazon_raw
    FROM volumes
    WHERE COALESCE(amazon_raw, '') != ''
    ORDER BY title ASC
  `);

    await processBatch({
      rows: amazonRes.rows,
      getPrice: getAmazonPrice,
      field: "amazon_raw",
      column: "amazon_price",
      name: "Amazon",
    });
  }

  // ============================
  // MERCADO LIVRE
  // ============================
  if (RUN_ML) {
    const mlRes = await pool.query(`
    SELECT id, title, mercado_livre_raw
    FROM volumes
    WHERE COALESCE(mercado_livre_raw, '') != ''
    ORDER BY title ASC
  `);

    await processBatch({
      rows: mlRes.rows,
      getPrice: getMLPrice,
      field: "mercado_livre_raw",
      column: "mercado_livre_price",
      name: "Mercado Livre",
    });
  }

  console.log("🎉 Tudo finalizado com sucesso!");
}

if (process.argv.includes("--run")) {
  runUpdatePrices();
}
