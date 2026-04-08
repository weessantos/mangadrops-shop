import 'dotenv/config';
import { chromium } from "playwright";
import pool from "../src/db/database.js";

// ⚙️ CONFIG
const DELAY_MIN = 2500;
const DELAY_MAX = 3500;

// ⏱️ delay random
function sleepRandom() {
  const ms = DELAY_MIN + Math.random() * (DELAY_MAX - DELAY_MIN);
  return new Promise(r => setTimeout(r, ms));
}
// ==============================
//  RETRY 
// ==============================

async function getPriceWithRetry(getPrice, page, url, maxRetries = 2) {
  let attempt = 0;

  while (attempt <= maxRetries) {
    const price = await getPrice(page, url);

    if (price !== null) {
      return price;
    }

    attempt++;

    if (attempt <= maxRetries) {
      console.log(`🔁 Retry ${attempt} para ${url}`);

      // backoff leve
      const delay = 2000 + attempt * 2000;
      await new Promise(r => setTimeout(r, delay));
    }
  }

  return null;
}

// ==============================
// LOG LIMPO
// ==============================

function logProduct(index, total, name, title, price, changed, durationMs) {
  const counter = `[${index}/${total}]`.padStart(8, " ");
  const source = `[${name.padEnd(14, " ")}]`;
  const time = `${(durationMs / 1000).toFixed(1)}s`;

  const cleanTitle = title
    .replace(/\|.*$/, "")
    .trim()
    .slice(0, 45)
    .padEnd(45, " ");

  const priceText =
    price === null
      ? "❌"
      : `R$ ${price.toFixed(2)}`;

  const status = changed ? "💾" : "⏩";

  console.log(`${counter} ${source} ${cleanTitle} | ${priceText} | ${status} | ${time}`);
}

// ==============================
// AMAZON
// ==============================

async function getAmazonPrice(page, url) {

  await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });

  // ⏳ pequeno delay (Amazon precisa)
  await new Promise(r =>
    setTimeout(r, 2500 + Math.random() * 1500)
  );

  // 👇 scroll leve ajuda renderizar preço
  await page.mouse.wheel(0, 400);

  const title = await page.title();

  const price = await page.evaluate(() => {
    // 🎯 seletor PRINCIPAL (o que você descobriu)
    const container = document.querySelector(".price-update-row-ww");

    if (container) {
      const el = container.querySelector(".a-offscreen");

      if (el && el.innerText) {
        const value = parseFloat(
          el.innerText
            .replace("R$", "")
            .replace(/\s/g, "")
            .replace(/\./g, "")
            .replace(",", ".")
        );

        if (!isNaN(value)) return value;
      }
    }

    // 🛟 fallback (caso layout mude)
    const fallback = document.querySelector(
      "#corePriceDisplay_desktop_feature_div .a-offscreen"
    );

    if (fallback && fallback.innerText) {
      const value = parseFloat(
        fallback.innerText
          .replace("R$", "")
          .replace(/\s/g, "")
          .replace(/\./g, "")
          .replace(",", ".")
      );

      if (!isNaN(value)) return value;
    }

    return null;
  });

  return { price, title };
}

// ==============================
// MERCADO LIVRE
// ==============================

async function getMLPrice(page, url) {
  try {

    await page.goto(url, {
      waitUntil: "networkidle",
      timeout: 0,
    });

    // ⏳ delay humano
    await new Promise(r =>
      setTimeout(r, 2500 + Math.random() * 1500)
    );

    // 👇 scroll leve
    await page.mouse.wheel(0, 300);

    const title = await page.title();

    const price = await page.evaluate(() => {
      // 🎯 pega TODOS os blocos corretos
      const containers = document.querySelectorAll(
        ".ui-pdp-price__second-line"
      );

      if (!containers.length) return null;

      // 👉 pega o PRIMEIRO (regra que você descobriu)
      const first = containers[0];

      const fraction = first.querySelector(".andes-money-amount__fraction");
      const cents = first.querySelector(".andes-money-amount__cents");

      if (!fraction) return null;

      const value = fraction.innerText.replace(/\./g, "");
      const decimal = cents ? cents.innerText : "00";

      const finalPrice = parseFloat(`${value}.${decimal}`);

      return isNaN(finalPrice) ? null : finalPrice;
    });

    return { price, title };

  } catch (err) {
    console.log("❌ Erro ML:", err.message);
    return null;
  }
}
// ==============================
// PROCESSADOR DE DADOS
// ==============================

async function processBatch({
  rows,
  getPrice,
  field,
  column,
  name,  
}) {
  console.log(`\n🚀 Iniciando ${name}: ${rows.length} produtos`);

  const browser = await chromium.launch({ headless: true });

  const updates = [];
  const history = [];

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1366, height: 768 },
    locale: "pt-BR",
  });

  let index = 0;

for (const row of rows) {
  index++;

  const start = Date.now();

  try {
    const url = row[field];
    if (!url) continue;

    const tempPage = await context.newPage();

    let result = null;

    try {
      result = await getPriceWithRetry(getPrice, tempPage, url, 0);
    } finally {
      await tempPage.close();
    }

    const price = result?.price ?? null;
    const title = result?.title ?? "Sem título";

    // 🔍 pega preço atual
    const current = await pool.query(
      `SELECT ${column} FROM volumes WHERE id = $1`,
      [row.id]
    );

    const currentPrice = current.rows[0]?.[column];

    // ✅ calcula mudança (AGORA correto)
    const changed = Number(currentPrice) !== Number(price);

    // ⏱️ calcula a duração
    const duration = Date.now() - start;

    // 🔥 LOG (centralizado)
    logProduct(index, rows.length, name, title, price, changed, duration);

    // 🧠 se mudou → guarda
    if (changed) {
      updates.push({
        id: row.id,
        price
      });

      history.push({
        volume_id: row.id,
        source: name.toLowerCase().replace(" ", "_"),
        price
      });
    }

  } catch (err) {
    console.log("❌ Erro:", err.message);
  }

  await sleepRandom();
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
        values.push(`($${idx + 1}, $${idx + 2})`);
        params.push(item.id, item.price);
      });

      await pool.query(`
        UPDATE volumes v
        SET 
          ${column} = u.price,
          price_updated_at = NOW()
        FROM (
          VALUES ${values.join(",")}
        ) AS u(id, price)
        WHERE v.id = u.id
      `, params);
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

      await pool.query(`
        INSERT INTO price_history (volume_id, source, price)
        VALUES ${values.join(",")}
      `, params);
    }

    console.log("✅ Histórico salvo");
  }

  await browser.close();

  console.log(`✅ Finalizado ${name}`);
}

// ==============================
// MAIN
// ==============================

(async () => {
  console.log("🚀 Iniciando scraper escalável...");

  // ============================
  // AMAZON
  // ============================
  const amazonRes = await pool.query(`
    SELECT id, amazon_raw
    FROM volumes
    WHERE COALESCE(amazon_raw, '') != ''
  `);

    await processBatch({
    rows: amazonRes.rows,
    getPrice: getAmazonPrice,
    field: "amazon_raw",
    column: "amazon_price",
    name: "Amazon",
    });

  // ============================
  // MERCADO LIVRE
  // ============================
  const mlRes = await pool.query(`
    SELECT id, mercado_livre_raw
    FROM volumes
    WHERE COALESCE(mercado_livre_raw, '') != ''
  `);

    await processBatch({
    rows: mlRes.rows,
    getPrice: getMLPrice,
    field: "mercado_livre_raw",
    column: "mercado_livre_price",
    name: "Mercado Livre",
    });

  console.log("🎉 Tudo finalizado com sucesso!");
})();