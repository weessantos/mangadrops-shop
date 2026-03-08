import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { chromium } from "playwright";

import { products } from "../src/data/products/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRICES_PATH = path.resolve(__dirname, "../src/data/prices.json");
const ML_SESSION_PATH = path.resolve(__dirname, "../ml-session.json");

const CONCURRENCY = 8;
const REQUEST_TIMEOUT = 20000;
const BETWEEN_PRODUCTS_DELAY_MS = 30;
const ML_NAVIGATION_TIMEOUT = 25000;

// Para depurar:
// Linux/macOS: ML_DEBUG=true npm run update-prices
// PowerShell: $env:ML_DEBUG="true"; npm run update-prices
const ML_DEBUG = process.env.ML_DEBUG === "true";

const USE_ML_SESSION = fs.existsSync(ML_SESSION_PATH);

let browserPromise = null;

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

async function getBrowser() {
  if (!browserPromise) {
    browserPromise = chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-blink-features=AutomationControlled",
      ],
    });
  }
  return browserPromise;
}

async function closeBrowser() {
  if (!browserPromise) return;

  try {
    const browser = await browserPromise;
    await browser.close();
  } catch {
    // ignore
  } finally {
    browserPromise = null;
  }
}

async function createMercadoLivreContext(browser) {
  const context = await browser.newContext({
    ...(USE_ML_SESSION ? { storageState: ML_SESSION_PATH } : {}),
    userAgent: getRequestHeaders()["User-Agent"],
    locale: "pt-BR",
    viewport: { width: 1366, height: 900 },
    extraHTTPHeaders: {
      "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
    },
  });

  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", {
      get: () => false,
    });
  });

  await context.route("**/*", async (route) => {
    const type = route.request().resourceType();
    if (["image", "font", "media"].includes(type)) {
      await route.abort().catch(() => {});
      return;
    }
    await route.continue().catch(() => {});
  });

  return context;
}

function isMercadoLivreProductUrl(url) {
  if (!url) return false;

  return (
    /\/p\/MLB\d+/i.test(url) ||
    /produto\.mercadolivre\.com\.br/i.test(url) ||
    /articulo\.mercadolibre\.com/i.test(url)
  );
}

function extractGoUrl(url) {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const go = parsed.searchParams.get("go");
    if (!go) return null;
    return decodeURIComponent(go);
  } catch {
    return null;
  }
}

async function resolveMercadoLivreProductUrl(page, url) {
  let currentUrl = page.url();

  if (!currentUrl || currentUrl === "about:blank") {
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: ML_NAVIGATION_TIMEOUT,
    });

    await page.waitForTimeout(800);
    currentUrl = page.url();
  }

  const goUrl = extractGoUrl(currentUrl);
  if (goUrl) {
    await page.goto(goUrl, {
      waitUntil: "domcontentloaded",
      timeout: ML_NAVIGATION_TIMEOUT,
    });
    await page.waitForTimeout(800);
    currentUrl = page.url();
  }

  if (isMercadoLivreProductUrl(currentUrl)) {
    return currentUrl;
  }

  const findHrefInDom = async () => {
    return page.evaluate(() => {
      const normalizeHref = (href) => {
        if (!href) return null;
        try {
          return new URL(href, window.location.href).href;
        } catch {
          return null;
        }
      };

      const isProductHref = (href) => {
        if (!href) return false;
        return (
          /\/p\/MLB\d+/i.test(href) ||
          href.includes("produto.mercadolivre.com.br") ||
          href.includes("articulo.mercadolibre.com")
        );
      };

      const anchors = Array.from(document.querySelectorAll("a[href]"));

      for (const anchor of anchors) {
        const href = normalizeHref(anchor.getAttribute("href") || "");
        if (isProductHref(href)) return href;
      }

      for (const anchor of anchors) {
        const text = (anchor.textContent || "").trim().toLowerCase();
        if (text.includes("ir para produto") || text.includes("ver produto")) {
          return normalizeHref(anchor.getAttribute("href") || "");
        }
      }

      const ogUrl = document.querySelector('meta[property="og:url"]')?.getAttribute("content");
      if (isProductHref(ogUrl)) return normalizeHref(ogUrl);

      const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute("href");
      if (isProductHref(canonical)) return normalizeHref(canonical);

      return null;
    });
  };

  let productHref = await findHrefInDom();

  if (!productHref) {
    const button = page.getByRole("link", { name: /ir para produto|ver produto/i }).first();
    if ((await button.count().catch(() => 0)) > 0) {
      await button.click({ timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(800);
      currentUrl = page.url();

      const clickedGoUrl = extractGoUrl(currentUrl);
      if (clickedGoUrl) {
        await page.goto(clickedGoUrl, {
          waitUntil: "domcontentloaded",
          timeout: ML_NAVIGATION_TIMEOUT,
        });
        await page.waitForTimeout(800);
        currentUrl = page.url();
      }

      if (isMercadoLivreProductUrl(currentUrl)) {
        return currentUrl;
      }

      productHref = await findHrefInDom();
    }
  }

  if (!productHref) {
    return currentUrl;
  }

  await page.goto(productHref, {
    waitUntil: "domcontentloaded",
    timeout: ML_NAVIGATION_TIMEOUT,
  });

  await page.waitForTimeout(800);
  currentUrl = page.url();

  const nestedGoUrl = extractGoUrl(currentUrl);
  if (nestedGoUrl) {
    await page.goto(nestedGoUrl, {
      waitUntil: "domcontentloaded",
      timeout: ML_NAVIGATION_TIMEOUT,
    });
    await page.waitForTimeout(800);
    currentUrl = page.url();
  }

  return currentUrl;
}

// =======================================================
// PREÇO DO MERCADO LIVRE NA PÁGINA FINAL DO PRODUTO
// =======================================================

async function extractMercadoLivreProductPagePrice(page, productId) {
  const result = await page.evaluate(() => {
    const clean = (text) =>
      String(text || "")
        .replace(/\u00a0/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const parsePrice = (fractionText, centsText = "00") => {
      const fraction = String(fractionText || "").replace(/[^\d]/g, "");
      const cents = String(centsText || "00").replace(/[^\d]/g, "").slice(0, 2) || "00";

      if (!fraction) return null;

      const value = Number(`${fraction}.${cents}`);
      return Number.isFinite(value) ? value : null;
    };

    const isVisible = (el) => {
      if (!el) return false;
      const style = window.getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden") return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };

    const hasInstallmentContext = (text) => /sem juros|parcelado|parcela/i.test(text);

    // 1) Containers principais da PDP
    const priceContainers = Array.from(
      document.querySelectorAll(
        [
          ".ui-pdp-price__main-container",
          ".ui-pdp-price__second-line",
          ".ui-pdp-price",
          ".andes-money-amount",
        ].join(", ")
      )
    ).filter(isVisible);

    for (const container of priceContainers) {
      const text = clean(container.innerText || container.textContent || "");
      if (!text) continue;
      if (hasInstallmentContext(text)) continue;

      const fractionEl =
        container.querySelector(".andes-money-amount__fraction") ||
        container.querySelector("[class*='money-amount__fraction']");

      const centsEl =
        container.querySelector(".andes-money-amount__cents") ||
        container.querySelector("[class*='money-amount__cents']");

      const value = parsePrice(
        fractionEl?.textContent || "",
        centsEl?.textContent || "00"
      );

      if (value != null && value > 10 && value < 1000) {
        return {
          price: value,
          source: "structured_container",
          sample: text,
        };
      }
    }

    // 2) Todos os blocos monetários visíveis, ignorando contexto parcelado
    const moneyBlocks = Array.from(document.querySelectorAll(".andes-money-amount")).filter(isVisible);

    for (const block of moneyBlocks) {
      const text = clean(block.innerText || block.textContent || "");
      const parentText = clean(block.parentElement?.innerText || "");
      const grandParentText = clean(block.parentElement?.parentElement?.innerText || "");

      if (hasInstallmentContext(text)) continue;
      if (hasInstallmentContext(parentText)) continue;
      if (hasInstallmentContext(grandParentText)) continue;

      const fractionEl =
        block.querySelector(".andes-money-amount__fraction") ||
        block.querySelector("[class*='money-amount__fraction']");

      const centsEl =
        block.querySelector(".andes-money-amount__cents") ||
        block.querySelector("[class*='money-amount__cents']");

      const value = parsePrice(
        fractionEl?.textContent || "",
        centsEl?.textContent || "00"
      );

      if (value != null && value > 10 && value < 1000) {
        return {
          price: value,
          source: "money_block",
          sample: text || parentText,
        };
      }
    }

    // 3) Fallback textual mais controlado
    const bodyText = clean(document.body?.innerText || "");
    const lines = bodyText
      .split("\n")
      .map((line) => clean(line))
      .filter(Boolean);

    for (const line of lines) {
      if (!line.includes("R$")) continue;
      if (hasInstallmentContext(line)) continue;

      const match = line.match(/R\$\s*([\d.]+,\d{2})/i);
      if (!match) continue;

      const raw = match[1].replace(/\./g, "").replace(",", ".");
      const value = Number(raw);

      if (Number.isFinite(value) && value > 10 && value < 1000) {
        return {
          price: value,
          source: "line_fallback",
          sample: line,
        };
      }
    }

    return {
      price: null,
      source: "none",
      sample: bodyText.slice(0, 1200),
    };
  });

  if (ML_DEBUG) {
    console.log(`[ML DEBUG] ${productId} -> source produto: ${result.source}`);
    console.log(`[ML DEBUG] ${productId} -> sample produto: ${result.sample}`);
  }

  return result.price ?? null;
}

// =======================================================
// FLUXO PRINCIPAL DO MERCADO LIVRE
// =======================================================

async function getMercadoLivrePrice(url, productId) {
  const browser = await getBrowser();
  const context = await createMercadoLivreContext(browser);
  const page = await context.newPage();

  try {
    if (ML_DEBUG) {
      console.log(`[ML DEBUG] ${productId} -> abrindo afiliado: ${url}`);
    }

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: ML_NAVIGATION_TIMEOUT,
    });

    await page.waitForTimeout(800);

    const productUrl = await resolveMercadoLivreProductUrl(page, url);

    if (ML_DEBUG) {
      console.log(`[ML DEBUG] ${productId} -> product URL resolvida: ${productUrl}`);
    }

    if (!productUrl) {
      return null;
    }

    if (page.url() !== productUrl) {
      await page.goto(productUrl, {
        waitUntil: "domcontentloaded",
        timeout: ML_NAVIGATION_TIMEOUT,
      });
    }

    await page.waitForLoadState("domcontentloaded").catch(() => {});
    await page.waitForTimeout(1000);

    const price = await extractMercadoLivreProductPagePrice(page, productId);

    if (ML_DEBUG) {
      console.log(`[ML DEBUG] ${productId} -> preço final página produto: ${price}`);
    }

    return price ?? null;
  } catch (error) {
    if (ML_DEBUG) {
      console.log(`[ML DEBUG] ${productId} -> erro ML: ${error.message}`);
    }
    return null;
  } finally {
    await page.close().catch(() => {});
    await context.close().catch(() => {});
  }
}

// =======================================================
// AMAZON
// =======================================================

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
        const composed = `${normalizedWhole}.${normalizedFraction.padEnd(2, "0").slice(0, 2)}`;

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

  // ML sempre reflete o resultado atual
  let mlPrice = null;

  // Amazon pode reaproveitar valor anterior se falhar temporariamente
  let amazonPrice = previous.amazon ?? null;

  try {
    const [fetchedMlPrice, fetchedAmazonPrice] = await Promise.all([
      mlLink ? getMercadoLivrePrice(mlLink, productId) : Promise.resolve(null),
      amazonLink ? getAmazonPrice(amazonLink) : Promise.resolve(null),
    ]);

    mlPrice = fetchedMlPrice;

    if (fetchedAmazonPrice !== null) {
      amazonPrice = fetchedAmazonPrice;
    }
  } catch {
    // mantém amazon anterior; ML fica null se falhar
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

  const runners = Array.from({ length: Math.min(concurrency, items.length) }, () => runner());
  await Promise.all(runners);
}

async function updatePrices() {
  const existingPrices = readExistingPrices();
  const prices = { ...existingPrices };

  // DEBUG OPCIONAL:
  // descomente para rodar só uma série
  // const activeProducts = products.filter((product) => product.id.startsWith("aot-"));

  const activeProducts = products;

  // DEBUG OPCIONAL:
  // descomente para limpar preços antigos de uma série antes do teste
  /*
  for (const key of Object.keys(prices)) {
    if (key.startsWith("aot-")) {
      prices[key] = {
        mercadoLivre: null,
        amazon: null,
        updatedAt: new Date().toISOString(),
      };
    }
  }
  */

  const counters = {
    done: 0,
    total: activeProducts.length,
  };

  console.log(`Iniciando atualização de ${activeProducts.length} produtos...`);
  console.log(`Concorrência: ${CONCURRENCY}`);
  console.log(`Sessão ML: ${USE_ML_SESSION ? "ml-session.json carregado" : "não encontrada"}`);

  try {
    await runPool(
      activeProducts,
      async (product) => {
        await processProduct(product, existingPrices, prices, counters);
      },
      CONCURRENCY
    );

    writePrices(prices);
    console.log("prices.json atualizado com sucesso.");
  } finally {
    await closeBrowser();
  }
}

updatePrices().catch(async (error) => {
  console.error("Erro geral na atualização de preços:", error);
  await closeBrowser();
  process.exitCode = 1;
});