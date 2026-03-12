import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import http from "http";
import https from "https";
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
const SAVE_EVERY_N_PRODUCTS = 20;
const ML_WAIT_AFTER_AFFILIATE_MS = 800;
const ML_WAIT_AFTER_PRODUCT_MS = 1000;

// Para depurar:
  //const ML_DEBUG = true;

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

function sanitizeDebugText(text = "") {
  return String(text).replace(/\s+/g, " ").trim();
}

function truncateDebugText(text = "", max = 300) {
  const clean = sanitizeDebugText(text);
  return clean.length > max ? `${clean.slice(0, max)}...` : clean;
}

function debugAmazon(logKey, message, extra = null) {
  if (extra !== null) {
    console.log(`[AMZ DEBUG] ${logKey} -> ${message}`, extra);
  } else {
    console.log(`[AMZ DEBUG] ${logKey} -> ${message}`);
  }
}

const httpAgent = new http.Agent({ keepAlive: true, maxSockets: CONCURRENCY * 2 });
const httpsAgent = new https.Agent({ keepAlive: true, maxSockets: CONCURRENCY * 2 });

const amazonHttp = axios.create({
  maxRedirects: 5,
  timeout: REQUEST_TIMEOUT,
  headers: getRequestHeaders(),
  httpAgent,
  httpsAgent,
});

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

    await page.waitForTimeout(ML_WAIT_AFTER_AFFILIATE_MS);
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

    const textOf = (el) => clean(el?.innerText || el?.textContent || "");

    const isVisible = (el) => {
      if (!el) return false;
      const style = window.getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden") return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };

    const parsePrice = (fractionText, centsText = "00") => {
      const fraction = String(fractionText || "").replace(/[^\d]/g, "");
      const cents =
        String(centsText || "00")
          .replace(/[^\d]/g, "")
          .slice(0, 2) || "00";

      if (!fraction) return null;

      const value = Number(`${fraction}.${cents}`);
      return Number.isFinite(value) ? value : null;
    };

    const isOldPriceBlock = (el) => {
      if (!el) return false;

      const classText = `${el.className || ""} ${el.parentElement?.className || ""}`;
      const text = textOf(el);

      return (
        /original/i.test(classText) ||
        /ui-pdp-price__original/i.test(classText) ||
        /andes-money-amount--previous/i.test(classText) ||
        el.tagName === "S" ||
        (/R\$\s*\d+[.,]\d{2}/i.test(text) &&
          /de\s+R\$|preço anterior|original/i.test(text))
      );
    };

    const isBadPromoContext = (text) =>
      /cashback|cartão de crédito|pedir/i.test(text);

    const isOtherOffersContext = (text) =>
      /outras opções de compra|ver mais opções|mais opções a partir de|quem viu este produto também comprou|você também pode estar interessado/i.test(
        text
      );

    const isInRightColumn = (el) => {
      if (!el) return false;

      if (
        el.closest("aside") ||
        el.closest(".ui-pdp-buybox") ||
        el.closest(".ui-pdp-right-column") ||
        el.closest(".ui-pdp-container__aside")
      ) {
        return true;
      }

      const rect = el.getBoundingClientRect();
      const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;

      if (viewportWidth && rect.left > viewportWidth * 0.62) {
        return true;
      }

      return false;
    };

    const extractPriceFromMoneyBlock = (block) => {
      if (!block || !isVisible(block)) return null;
      if (isInRightColumn(block)) return null;
      if (isOldPriceBlock(block)) return null;

      const blockText = textOf(block);
      const parentText = textOf(block.parentElement);
      const grandParentText = textOf(block.parentElement?.parentElement);

      if (isBadPromoContext(blockText)) return null;
      if (isBadPromoContext(parentText)) return null;
      if (isBadPromoContext(grandParentText)) return null;

      if (isOtherOffersContext(blockText)) return null;
      if (isOtherOffersContext(parentText)) return null;
      if (isOtherOffersContext(grandParentText)) return null;

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

      if (value == null) return null;
      if (value <= 3 || value >= 5000) return null;

      const fractionStyle = fractionEl ? window.getComputedStyle(fractionEl) : null;
      const fractionRect = fractionEl?.getBoundingClientRect?.() || block.getBoundingClientRect();
      const blockRect = block.getBoundingClientRect();

      const fontSize = fractionStyle ? parseFloat(fractionStyle.fontSize || "0") : 0;
      const height = Math.max(fractionRect?.height || 0, blockRect?.height || 0);
      const width = Math.max(fractionRect?.width || 0, blockRect?.width || 0);

      return {
        value,
        fontSize,
        height,
        width,
        text: blockText,
      };
    };

    const pickPriceFromScope = (scope, source) => {
    if (!scope || !isVisible(scope)) return null;
    if (isInRightColumn(scope)) return null;

    const scopeText = textOf(scope);
    if (!scopeText) return null;
    if (isOtherOffersContext(scopeText)) return null;

    const moneyBlocks = Array.from(
      scope.querySelectorAll(".andes-money-amount")
    )
      .filter(isVisible)
      .filter((el) => !isInRightColumn(el));

    const candidates = moneyBlocks
      .map(extractPriceFromMoneyBlock)
      .filter((v) => v != null);

    if (!candidates.length) return null;

    candidates.sort((a, b) => {
      if (b.fontSize !== a.fontSize) return b.fontSize - a.fontSize;
      if (b.height !== a.height) return b.height - a.height;
      if (b.width !== a.width) return b.width - a.width;
      return a.value - b.value;
    });

    const best = candidates[0];

    return {
      price: best.value,
      source,
      sample: scopeText.slice(0, 500),
    };
  };

    const centralPriceSelectors = [
      ".ui-pdp-price",
      ".ui-pdp-price__main-container",
      ".ui-pdp-container__row .ui-pdp-price",
    ];

    const centralScopes = centralPriceSelectors
      .flatMap((selector) => Array.from(document.querySelectorAll(selector)))
      .filter(isVisible)
      .filter((el, index, arr) => arr.indexOf(el) === index)
      .filter((el) => !isInRightColumn(el))
      .filter((el) => {
        const txt = textOf(el);
        if (!txt) return false;
        if (isBadPromoContext(txt)) return false;
        if (isOtherOffersContext(txt)) return false;
        return true;
      })
      .sort((a, b) => {
        const ra = a.getBoundingClientRect();
        const rb = b.getBoundingClientRect();

        if (ra.left !== rb.left) return ra.left - rb.left;
        return ra.top - rb.top;
      });

    for (const scope of centralScopes) {
      const picked = pickPriceFromScope(scope, "main_center_price");
      if (picked) return picked;
    }

    const centralMoneyBlocks = Array.from(
      document.querySelectorAll(
        ".ui-pdp-price .andes-money-amount, .ui-pdp-price__main-container .andes-money-amount"
      )
    )
      .filter(isVisible)
      .filter((el) => !isInRightColumn(el));

    for (const block of centralMoneyBlocks) {
      let node = block;

      for (let i = 0; i < 5 && node; i++) {
        const txt = textOf(node);

        if (
          txt &&
          !isInRightColumn(node) &&
          !isBadPromoContext(txt) &&
          !isOtherOffersContext(txt)
        ) {
          const picked = pickPriceFromScope(node, "main_center_price_ancestor");
          if (picked) return picked;
        }

        node = node.parentElement;
      }
    }

    return {
      price: null,
      source: "none",
      sample: textOf(document.body).slice(0, 500),
    };
  });

  if (ML_DEBUG) {
    console.log(
      `[ML DEBUG] ${productId} -> source=${result.source} price=${result.price ?? "null"}`
    );
  }

  return result.price ?? null;
}

// =======================================================
// FLUXO PRINCIPAL DO MERCADO LIVRE
// =======================================================

async function getMercadoLivrePrice(url, productId, sharedPage = null) {
  const ownBrowser = sharedPage ? null : await getBrowser();
  const ownContext = sharedPage ? null : await createMercadoLivreContext(ownBrowser);
  const page = sharedPage || (await ownContext.newPage());

  try {
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
    await page.waitForTimeout(ML_WAIT_AFTER_PRODUCT_MS);

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
    if (!sharedPage) {
      await page.close().catch(() => {});
      await ownContext.close().catch(() => {});
    }
  }
}
// =======================================================
// AMAZON
// =======================================================

async function getAmazonPrice(url) {
  try {
    const response = await amazonHttp.get(url);
    const $ = cheerio.load(response.data);

    const rootSelectors = [
      "#corePriceDisplay_desktop_feature_div",
      "#corePrice_feature_div",
      "#apex_desktop",
      "#corePrice_desktop",
    ];

    const directPriceSelectors = [
      ".priceToPay .a-offscreen",
      ".apexPriceToPay .a-offscreen",
      ".reinventPricePriceToPayMargin .a-offscreen",
      "#priceblock_dealprice",
      "#priceblock_saleprice",
      "#priceblock_ourprice",
      "#price_inside_buybox",
    ];

    for (const rootSelector of rootSelectors) {
      const root = $(rootSelector).first();
      if (!root.length) continue;

      for (const selector of directPriceSelectors) {
        const text = root.find(selector).first().text().trim();
        const value = parsePriceFromText(text);
        if (value !== null && value > 0) {
          return value;
        }
      }

      const whole = root.find(".a-price-whole").first().text().trim();
      const fraction = root.find(".a-price-fraction").first().text().trim();

      if (whole) {
        const normalizedWhole = whole.replace(/\./g, "").replace(/[^\d]/g, "");
        const normalizedFraction = (fraction || "00").replace(/[^\d]/g, "");
        const composed = `${normalizedWhole}.${normalizedFraction.padEnd(2, "0").slice(0, 2)}`;

        const value = Number(composed);
        if (Number.isFinite(value) && value > 0) {
          return value;
        }
      }
    }

    const legacySelectors = [
      "#priceblock_dealprice",
      "#priceblock_saleprice",
      "#priceblock_ourprice",
      "#price_inside_buybox",
    ];

    for (const selector of legacySelectors) {
      const text = $(selector).first().text().trim();
      const value = parsePriceFromText(text);
      if (value !== null && value > 0) {
        return value;
      }
    }

    return null;
  } catch {
    console.log(`Erro ao buscar preço Amazon: ${url}`);
    return null;
  }
}

async function processProduct(product, existingPrices, prices, counters, stats, workerState) {
  const productId = product.id;
  const mlLink = product.affiliate?.mercadoLivre || "";
  const amazonLink = product.affiliate?.amazon || "";

  const previous = existingPrices[productId] || {};

  let mlPrice = null;
  let amazonPrice = previous.amazon ?? null;

  try {
    const [fetchedMlPrice, fetchedAmazonPrice] = await Promise.all([
      mlLink ? getMercadoLivrePrice(mlLink, productId, workerState?.mlPage || null) : Promise.resolve(null),
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

  if (counters.done % SAVE_EVERY_N_PRODUCTS === 0 || counters.done === counters.total) {
    writePrices(prices);
  }

  const mlHasLink = !!mlLink;
  const amazonHasLink = !!amazonLink;

  let mlStatus;
  if (mlPrice !== null) {
    mlStatus = `✔ ${mlPrice}`;
    stats.ml.price += 1;
  } else if (mlHasLink) {
    mlStatus = `⚠ null (link)`;
    stats.ml.linkNoPrice += 1;
  } else {
    mlStatus = `✖ null`;
    stats.ml.noLink += 1;
  }

  let amazonStatus;
  if (amazonPrice !== null) {
    amazonStatus = `✔ ${amazonPrice}`;
    stats.amazon.price += 1;
  } else if (amazonHasLink) {
    amazonStatus = `⚠ null (link)`;
    stats.amazon.linkNoPrice += 1;
  } else {
    amazonStatus = `✖ null`;
    stats.amazon.noLink += 1;
  }

  console.log(
    `[${counters.done}/${counters.total}] ${productId} -> ML: ${mlStatus} | Amazon: ${amazonStatus}`
  );

  if (BETWEEN_PRODUCTS_DELAY_MS > 0) {
    await sleep(BETWEEN_PRODUCTS_DELAY_MS);
  }
}

async function createWorkerState(workerId) {
  const browser = await getBrowser();
  const mlContext = await createMercadoLivreContext(browser);
  const mlPage = await mlContext.newPage();

  if (ML_DEBUG) {
    console.log(`[ML DEBUG] worker ${workerId} -> contexto reutilizável criado`);
  }

  return {
    workerId,
    mlContext,
    mlPage,
  };
}

async function destroyWorkerState(workerState) {
  if (!workerState) return;

  await workerState.mlPage?.close().catch(() => {});
  await workerState.mlContext?.close().catch(() => {});
}

async function runPool(items, worker, concurrency, setupWorker = null, teardownWorker = null) {
  let index = 0;

  async function runner(workerId) {
    const workerState = setupWorker ? await setupWorker(workerId) : undefined;

    try {
      while (true) {
        const currentIndex = index;
        index += 1;

        if (currentIndex >= items.length) {
          return;
        }

        await worker(items[currentIndex], currentIndex, workerState);
      }
    } finally {
      if (teardownWorker) {
        await teardownWorker(workerState, workerId);
      }
    }
  }

  const runners = Array.from(
    { length: Math.min(concurrency, items.length) },
    (_, i) => runner(i + 1)
  );

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

  const stats = {
    ml: { price: 0, linkNoPrice: 0, noLink: 0 },
    amazon: { price: 0, linkNoPrice: 0, noLink: 0 },
  };

  console.log(`Iniciando atualização de ${activeProducts.length} produtos...`);
  console.log(`Concorrência: ${CONCURRENCY}`);
  console.log(`Sessão ML: ${USE_ML_SESSION ? "ml-session.json carregado" : "não encontrada"}`);

  try {
    await runPool(
      activeProducts,
      async (product, _index, workerState) => {
        await processProduct(product, existingPrices, prices, counters, stats, workerState);
      },
      CONCURRENCY,
      createWorkerState,
      destroyWorkerState
    );

  writePrices(prices);

  console.log("──────────── RESULTADO ────────────");

  console.log("Mercado Livre");
  console.log(`✔ preços encontrados: ${stats.ml.price}`);
  console.log(`⚠ links sem preço: ${stats.ml.linkNoPrice}`);
  console.log(`✖ sem link: ${stats.ml.noLink}`);

  console.log("");

  console.log("Amazon");
  console.log(`✔ preços encontrados: ${stats.amazon.price}`);
  console.log(`⚠ links sem preço: ${stats.amazon.linkNoPrice}`);
  console.log(`✖ sem link: ${stats.amazon.noLink}`);

  console.log("───────────────────────────────────");
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