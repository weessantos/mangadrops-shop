import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { products } from "../src/data/products/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRICES_PATH = path.resolve(__dirname, "../src/data/prices.json");
const CONCURRENCY = 4;
const REQUEST_TIMEOUT = 20000;
const BETWEEN_PRODUCTS_DELAY_MS = 250;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parsePriceFromText(text) {
  if (!text) return null;

  const normalized = String(text)
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .replace("R$", "")
    .trim();

  const match = normalized.match(/\d{1,3}(?:\.\d{3})*,\d{2}|\d+(?:,\d{2})?/);
  if (!match) return null;

  const value = match[0].replace(/\./g, "").replace(",", ".");
  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

function readExistingPrices() {
  try {
    if (!fs.existsSync(PRICES_PATH)) return {};
    const raw = fs.readFileSync(PRICES_PATH, "utf-8");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writePrices(prices) {
  fs.writeFileSync(PRICES_PATH, JSON.stringify(prices, null, 2), "utf-8");
}

function getRequestHeaders() {
  return {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
  };
}

async function getMercadoLivrePrice(url) {
  try {
    const response = await axios.get(url, {
      maxRedirects: 5,
      timeout: REQUEST_TIMEOUT,
      headers: getRequestHeaders(),
    });

    const $ = cheerio.load(response.data);

    const selectors = [
      ".ui-pdp-price__second-line .andes-money-amount__fraction",
      ".andes-money-amount__fraction",
      ".price-tag-fraction",
      '[data-testid="price-part"]',
      ".andes-money-amount__amount",
    ];

    for (const selector of selectors) {
      const text = $(selector).first().text().trim();
      const value = parsePriceFromText(text);

      if (value !== null && value > 0) {
        return value;
      }
    }

    return null;
  } catch {
    console.log(`Erro ao buscar preço ML: ${url}`);
    return null;
  }
}

async function getAmazonPrice(url) {
  try {
    const response = await axios.get(url, {
      maxRedirects: 5,
      timeout: REQUEST_TIMEOUT,
      headers: getRequestHeaders(),
    });

    const $ = cheerio.load(response.data);

    const priceContainers = [
      ".priceToPay",
      ".apexPriceToPay",
      ".reinventPricePriceToPayMargin",
      "#corePriceDisplay_desktop_feature_div .priceToPay",
      "#corePriceDisplay_desktop_feature_div .apexPriceToPay",
      "#corePrice_feature_div .priceToPay",
    ];

    for (const containerSelector of priceContainers) {
      const container = $(containerSelector).first();
      if (!container.length) continue;

      const whole = container.find(".a-price-whole").first().text().trim();
      const fraction = container.find(".a-price-fraction").first().text().trim();

      if (whole) {
        const normalizedWhole = whole.replace(/\./g, "").replace(/[^\d]/g, "");
        const normalizedFraction = (fraction || "00").replace(/[^\d]/g, "");
        const composed = `${normalizedWhole}.${normalizedFraction
          .padEnd(2, "0")
          .slice(0, 2)}`;

        const value = Number(composed);
        if (Number.isFinite(value) && value > 0) {
          return value;
        }
      }

      const offscreen = container.find(".a-offscreen").first().text().trim();
      const offscreenValue = parsePriceFromText(offscreen);

      if (offscreenValue !== null && offscreenValue > 0) {
        return offscreenValue;
      }
    }

    const selectors = [
      "#price_inside_buybox",
      "#priceblock_dealprice",
      "#priceblock_saleprice",
      "#priceblock_ourprice",
      ".priceToPay .a-offscreen",
      ".apexPriceToPay .a-offscreen",
      ".reinventPricePriceToPayMargin .a-offscreen",
      "#corePriceDisplay_desktop_feature_div .priceToPay .a-offscreen",
      "#corePrice_feature_div .priceToPay .a-offscreen",
    ];

    for (const selector of selectors) {
      const text = $(selector).first().text().trim();
      const value = parsePriceFromText(text);

      if (value !== null && value > 0) {
        return value;
      }
    }

    const candidates = [];

    $(
      "#corePriceDisplay_desktop_feature_div .a-price, #corePrice_feature_div .a-price, .priceToPay, .apexPriceToPay"
    ).each((_, el) => {
      const text = $(el).text().trim();
      const value = parsePriceFromText(text);

      if (value !== null && value > 0) {
        candidates.push(value);
      }
    });

    if (candidates.length) {
      return Math.min(...candidates);
    }

    return null;
  } catch {
    console.log(`Erro ao buscar preço Amazon: ${url}`);
    return null;
  }
}

async function processProduct(product, existingPrices, prices, counters) {
  const productId = product.id;
  const mlLink = product.affiliate?.mercadoLivre || "";
  const amazonLink = product.affiliate?.amazon || "";

  const previous = existingPrices[productId] || {};

  let mlPrice = previous.mercadoLivre ?? null;
  let amazonPrice = previous.amazon ?? null;

  try {
    const [fetchedMlPrice, fetchedAmazonPrice] = await Promise.all([
      mlLink ? getMercadoLivrePrice(mlLink) : Promise.resolve(null),
      amazonLink ? getAmazonPrice(amazonLink) : Promise.resolve(null),
    ]);

    if (fetchedMlPrice !== null) {
      mlPrice = fetchedMlPrice;
    }

    if (fetchedAmazonPrice !== null) {
      amazonPrice = fetchedAmazonPrice;
    }
  } catch {
    // Mantém fallback do cache anterior
  }

  prices[productId] = {
    mercadoLivre: mlPrice,
    amazon: amazonPrice,
    updatedAt: new Date().toISOString(),
  };

  counters.done += 1;
  writePrices(prices);

  console.log(
    `[${counters.done}/${counters.total}] ${productId} -> ML: ${mlPrice} | Amazon: ${amazonPrice}`
  );

  await sleep(BETWEEN_PRODUCTS_DELAY_MS);
}

async function runPool(items, worker, concurrency) {
  let index = 0;

  async function runner() {
    while (true) {
      const currentIndex = index;
      index += 1;

      if (currentIndex >= items.length) {
        return;
      }

      await worker(items[currentIndex], currentIndex);
    }
  }

  const runners = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => runner()
  );

  await Promise.all(runners);
}

async function updatePrices() {
  const existingPrices = readExistingPrices();
  const prices = { ...existingPrices };

  const counters = {
    done: 0,
    total: products.length,
  };

  console.log(`Iniciando atualização de ${products.length} produtos...`);
  console.log(`Concorrência: ${CONCURRENCY}`);

  await runPool(
    products,
    async (product) => {
      await processProduct(product, existingPrices, prices, counters);
    },
    CONCURRENCY
  );

  writePrices(prices);
  console.log("prices.json atualizado com sucesso.");
}

updatePrices();