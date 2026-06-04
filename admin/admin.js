// =======================
// 🚀 BOOTSTRAP CMS
// =======================

// 👉 deixa acessível no arquivo inteiro
let supabaseClient;
let seriesList;
let volumesDiv;

if (window.__cms_loaded) {
  console.warn("CMS já carregado, ignorando...");
} else {
  window.__cms_loaded = true;

  console.log("✅ ADMIN JS CARREGADO");

  // =======================
  // 🔐 CONFIG
  // =======================
  const SUPABASE_URL = "https://wcwxjqfsnvpyndmpbngr.supabase.co";
  const SUPABASE_KEY = "sb_publishable_fLT7DCc3olBf97TxmkG8lQ_VLmOr424";

  // =======================
  // 🧠 SAFE INIT SUPABASE
  // =======================
  if (!window.supabase) {
    throw new Error("❌ Supabase não carregou (CDN faltando ou ordem errada)");
  }

  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      persistSession: true,
      storage: window.sessionStorage,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  // =======================
  // 🎯 DOM
  // =======================
  seriesList = document.getElementById("series-list");
  volumesDiv = document.getElementById("volumes");
  const headerDiv = document.getElementById("series-header");

  // =======================
  // EXPORTA GLOBAL (opcional)
  // =======================
  window.cms = {
    supabase: supabaseClient,
    seriesList,
    volumesDiv,
  };
}

// =======================
// 🔐 ADMIN
// =======================
async function protectAdmin() {
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (!session) {
    showLoginScreen();
    return false;
  }

  return true;
}

async function requireAuth() {
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();
  return !!session;
}

// =======================
// 🔐 LOGIN SCREEN
// =======================
function showLoginScreen() {
  document.body.innerHTML = `
    <div id="auth-layer">
      <div class="login-card">
        <h2>🔐 Login Admin</h2>

        <input id="login-email" placeholder="Email">
        <input id="login-pass" type="password" placeholder="Senha">

        <span id="login-error"></span>

        <button id="login-btn" onclick="login()">
          <span id="login-text">Entrar</span>
        </button>
      </div>
    </div>

    <style>
      #auth-layer {
        position: fixed;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #020617, #0f172a);
        z-index: 9999;
        animation: fadeIn 0.4s ease;
      }

      .login-card {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 30px;
        background: #020617;
        border-radius: 14px;
        box-shadow: 0 0 40px rgba(0,0,0,0.6);
        min-width: 320px;
        animation: slideUp 0.4s ease;
      }

      .login-card h2 {
        margin-bottom: 10px;
        color: #e5e7eb;
      }

      .login-card input {
        padding: 10px;
        border-radius: 6px;
        border: 1px solid #1f2937;
        background: #020617;
        color: #e5e7eb;
        outline: none;
      }

      .login-card input:focus {
        border-color: #6366f1;
      }

      #login-error {
        color: #ef4444;
        font-size: 13px;
        min-height: 16px;
      }

      #login-btn {
        padding: 10px;
        background: #6366f1;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: 0.2s;
      }

      #login-btn:hover {
        background: #4f46e5;
      }

      #login-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      @keyframes fadeIn {
        from { opacity: 0 }
        to { opacity: 1 }
      }

      @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0 }
        to { transform: translateY(0); opacity: 1 }
      }
    </style>
  `;
}

async function login() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-pass").value;

  const btn = document.getElementById("login-btn");
  const text = document.getElementById("login-text");
  const errorEl = document.getElementById("login-error");

  errorEl.textContent = "";

  if (!email || !password) {
    errorEl.textContent = "Preencha todos os campos";
    return;
  }

  btn.disabled = true;
  text.textContent = "Entrando...";

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    errorEl.textContent = "Email ou senha inválidos";
    btn.disabled = false;
    text.textContent = "Entrar";
    return;
  }

  text.textContent = "✔ Sucesso!";

  setTimeout(() => {
    location.reload();
  }, 500);
}

// =======================
// 🔐 LOGOUT
// =======================
async function logout() {
  try {
    const { error } = await supabaseClient.auth.signOut();

    if (error) throw error;

    showToast("Logout realizado 👋");

    setTimeout(() => {
      location.reload();
    }, 400);
  } catch (err) {
    console.error("LOGOUT ERROR:", err);
    showToast("Erro ao sair ❌");
  }
}

// =======================
//TOAST
// =======================

function showToast(message) {
  const overlay = document.getElementById("toast-overlay");
  const text = document.getElementById("toast-message");

  if (!overlay) return;

  text.textContent = message;

  overlay.style.display = "flex";

  // força reflow pra animar
  requestAnimationFrame(() => {
    overlay.classList.add("show");
  });

  setTimeout(() => {
    overlay.classList.remove("show");

    setTimeout(() => {
      overlay.style.display = "none";
    }, 250);
  }, 2000);
}

//==============
//LOAD DO TOAST
//==============

function showLoading(text = "Processando...") {
  const overlay = document.getElementById("loading-overlay");
  const label = document.getElementById("loading-text");

  if (!overlay) return;

  label.textContent = text;
  overlay.style.display = "flex";
}

function hideLoading() {
  const overlay = document.getElementById("loading-overlay");
  if (!overlay) return;

  overlay.style.display = "none";
}
// =======================
// NORMALIZAR LINKS AMAZON
// =======================
function normalizeAmazonUrl(url) {
  if (!url) return "";

  try {
    // remove parâmetros e hash
    const clean = url.split("?")[0].split("#")[0];

    // tenta pegar /dp/ASIN
    const dpMatch = clean.match(/\/dp\/([A-Z0-9]{10})/);

    if (dpMatch) {
      return `https://www.amazon.com.br/dp/${dpMatch[1]}`;
    }

    // fallback: tenta achar ASIN em qualquer lugar
    const genericMatch = clean.match(/([A-Z0-9]{10})/);

    if (genericMatch) {
      return `https://www.amazon.com.br/dp/${genericMatch[1]}`;
    }

    return url;
  } catch (err) {
    console.error("Erro ao normalizar Amazon:", err);
    return url;
  }
}

function normalizeAmazon(prefix, number) {
  const input = document.getElementById(`amazon-raw-${prefix}-${number}`);

  const original = input.value;
  const normalized = normalizeAmazonUrl(original);

  input.value = normalized;

  showToast("Amazon normalizado ✨");
}

// =======================
// 💲 BUSCAR PREÇO (API)
// =======================
async function fetchPrice(url, source) {
  try {
    const res = await fetch(
      `http://localhost:3000/api/price?url=${encodeURIComponent(url)}&source=${source}`,
    );

    const data = await res.json();

    return data.price || null;
  } catch (err) {
    console.error("Erro ao buscar preço:", err);
    return null;
  }
}

// =======================================
// 💲 SALVAR PREÇO DE UM VOLUME - AMAZON
// =======================================

async function updateAmazonPriceRaw(id, prefix, number) {
  const rawInput = document.getElementById(`amazon-raw-${prefix}-${number}`);
  const url = rawInput.value;

  if (!url) {
    showToast("Link RAW vazio ⚠️");
    return;
  }

  showLoading("Buscando preço Amazon...");

  try {
    const res = await fetch(
      `http://localhost:3000/api/price?url=${encodeURIComponent(url)}&source=amazon&id=${id}`,
    );

    const data = await res.json();

    if (!data.success) {
      hideLoading();
      showToast("Erro: " + (data.error || "Falha ao atualizar"));
      return;
    }

    hideLoading();
    showToast("Preço atualizado 💰");
  } catch (err) {
    console.error(err);
    hideLoading();
    showToast("Erro na requisição ❌");
  }
}

// =============================================
// 💲 SALVAR PREÇO DE UM VOLUME - MERCADO LIVRE
// =============================================

async function updateMLPriceRaw(id, prefix, number) {
  const rawInput = document.getElementById(`ml-raw-${prefix}-${number}`);
  const url = rawInput.value;

  if (!url) {
    showToast("Link ML vazio ⚠️", "error");
    return;
  }

  showLoading("Buscando preço Mercado Livre...");

  try {
    const res = await fetch(
      `http://localhost:3000/api/price?url=${encodeURIComponent(url)}&source=ml&id=${id}`,
    );

    const data = await res.json();

    if (!data.success) {
      hideLoading();
      showToast("Erro ML: " + (data.error || "Falha"), "error");
      return;
    }

    hideLoading();
    showToast("Preço ML atualizado 💰", "success");
  } catch (err) {
    console.error(err);
    hideLoading();
    showToast("Erro na requisição ML ❌", "error");
  }
}
// =======================
// NORMALIZAR LINKS ML
// =======================

function normalizeMercadoLivreUrl(url) {
  if (!url) return "";

  try {
    // remove parâmetros e hash
    const clean = url.split("?")[0].split("#")[0];

    // tenta pegar /p/MLB...
    const pMatch = clean.match(/\/p\/(MLB\d+)/);

    if (pMatch) {
      return `https://www.mercadolivre.com.br/p/${pMatch[1]}`;
    }

    // tenta pegar /up/MLBU...
    const upMatch = clean.match(/\/up\/(MLBU\d+)/);

    if (upMatch) {
      return `https://www.mercadolivre.com.br/up/${upMatch[1]}`;
    }

    // fallback: tenta achar qualquer MLB/MLBU na URL
    const genericMatch = clean.match(/(MLB\d+|MLBU\d+)/);

    if (genericMatch) {
      const code = genericMatch[1];

      if (code.startsWith("MLBU")) {
        return `https://www.mercadolivre.com.br/up/${code}`;
      } else {
        return `https://www.mercadolivre.com.br/p/${code}`;
      }
    }

    return url;
  } catch (err) {
    console.error("Erro ao normalizar ML:", err);
    return url;
  }
}

// =======================
//OPEN LINKS
// =======================

function openLink(inputId) {
  const input = document.getElementById(inputId);

  if (!input || !input.value) {
    showToast("Link vazio ⚠️");
    return;
  }

  let url = input.value.trim();

  // garante http
  if (!url.startsWith("http")) {
    url = "https://" + url;
  }

  window.open(url, "_blank");
}

function normalizeML(prefix, number) {
  const input = document.getElementById(`ml-raw-${prefix}-${number}`);

  const original = input.value;
  const normalized = normalizeMercadoLivreUrl(original);

  input.value = normalized;

  showToast("Link normalizado ✨");
}

// =======================
// CONFIRMAÇÃO POP UP
// =======================
function confirmAction(message) {
  return new Promise((resolve) => {
    const modal = document.getElementById("modal");

    modal.style.display = "flex";
    modal.innerHTML = `
      <div class="modal-content">
        <h3>${message}</h3>
        <div style="display:flex; gap:10px; margin-top:15px;">
          <button onclick="closeModal(); window.__confirm = false">Cancelar</button>
          <button class="danger" onclick="closeModal(); window.__confirm = true">Confirmar</button>
        </div>
      </div>
    `;

    window.__confirm = null;

    const interval = setInterval(() => {
      if (window.__confirm !== null) {
        clearInterval(interval);
        resolve(window.__confirm);
      }
    }, 100);
  });
}
// =======================
// NORMALIZAR EM MASSA
// =======================

function normalizeAllLinks() {
  let total = 0;

  // AMAZON

  document.querySelectorAll("[id^='amazon-raw-']").forEach((input) => {
    const original = input.value;

    const normalized = normalizeAmazonUrl(original);

    if (original !== normalized) {
      input.value = normalized;

      const match = input.id.match(/-(\d+)$/);

      if (match) {
        changedVolumes.add(parseInt(match[1]));
      }

      total++;
    }
  });

  // MERCADO LIVRE

  document.querySelectorAll("[id^='ml-raw-']").forEach((input) => {
    const original = input.value;

    const normalized = normalizeMercadoLivreUrl(original);

    if (original !== normalized) {
      input.value = normalized;

      const match = input.id.match(/-(\d+)$/);

      if (match) {
        changedVolumes.add(parseInt(match[1]));
      }

      total++;
    }
  });

  updatePendingChanges(changedVolumes.size);

  showToast(`${total} links normalizados ✨`);
}
// =======================
// 🔥 UPDATE GLOBAL DE PREÇOS
// =======================

let priceUpdateEventSource = null;

function updateAllPrices() {
  document.getElementById("amazon-logs").innerHTML = "";
  document.getElementById("ml-logs").innerHTML = "";

  document.getElementById("amazon-progress-bar").style.width = "0%";
  document.getElementById("ml-progress-bar").style.width = "0%";

  document.getElementById("amazon-progress-text").textContent = "0 / 0";
  document.getElementById("ml-progress-text").textContent = "0 / 0";
  if (!confirm("🔥 Atualizar TODOS os preços? Isso pode demorar.")) return;

  document.getElementById("progress-modal").style.display = "flex";

  priceUpdateEventSource = new EventSource("/api/update-prices-stream");

  priceUpdateEventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "log") {
      appendLog(data.text);
      updateProgressFromLog(data.text);
    }

    if (data.type === "error") {
      appendLog("❌ " + data.text);
    }

    if (data.type === "done") {
      appendLog("✅ Finalizado!");
      priceUpdateEventSource.close();

      setTimeout(() => {
        document.getElementById("progress-modal").style.display = "none";
      }, 1500);
    }
  };
}

// =======================
// 🛑 CANCELAMENTO DA BUSCA
// =======================
async function cancelPriceUpdate() {
  const ok = confirm("🛑 Cancelar atualização de preços?");

  if (!ok) return;

  try {
    await fetch("/api/cancel-update", {
      method: "POST",
    });

    appendLog("🛑 Cancelamento solicitado...");

    if (priceUpdateEventSource) {
      priceUpdateEventSource.close();
    }

    showToast("Cancelamento solicitado 🛑");

    setTimeout(() => {
      document.getElementById("progress-modal").style.display = "none";
    }, 500);
  } catch (err) {
    console.error(err);

    showToast("Erro ao cancelar ❌");
  }
}

async function pollProgress() {
  const bar = document.getElementById("progress-bar");
  const text = document.getElementById("progress-text");
  const logs = document.getElementById("progress-logs");

  const interval = setInterval(async () => {
    const res = await fetch("http://localhost:3000/api/update-progress");
    const data = await res.json();

    if (!data.running) {
      clearInterval(interval);
      showToast("Atualização finalizada 🚀");
      return;
    }

    const percent = data.total
      ? Math.round((data.current / data.total) * 100)
      : 0;

    bar.style.width = percent + "%";
    text.textContent = `${data.current} / ${data.total}`;

    logs.innerHTML = data.logs
      .map((l) => `<div class="log-line">${l}</div>`)
      .join("");

    logs.scrollTop = logs.scrollHeight;
  }, 1000);
}

// ====================================
// APEND DO LOG E CONTADOR DE PROGRESSO
// ====================================
function appendLog(text) {
  let target;
  let color = "#22c55e";

  // AMAZON
  if (text.includes("[Amazon]") || text.includes("Amazon")) {
    target = document.getElementById("amazon-logs");
    color = "#60a5fa";
  }

  // ML
  else if (
    text.includes("[ML]") ||
    text.includes("[Mercado Livre]") ||
    text.includes("Mercado Livre")
  ) {
    target = document.getElementById("ml-logs");
    color = "#facc15";
  }

  // fallback
  else {
    target = document.getElementById("amazon-logs");
  }

  if (text.includes("❌")) {
    color = "#ef4444";
  }

  if (text.includes("🔥")) {
    color = "#f97316";
  }

  const line = document.createElement("div");

  line.style.color = color;
  line.style.marginBottom = "4px";
  line.textContent = text;

  target.appendChild(line);

  target.scrollTop = target.scrollHeight;
}

let total = 0;
let current = 0;

function updateProgressFromLog(text) {
  const amazonStart = text.match(/Iniciando Amazon:\s*(\d+)/);

  if (amazonStart) {
    const total = parseInt(amazonStart[1]);

    document.getElementById("amazon-progress-text").textContent =
      `0 / ${total}`;

    return;
  }

  const mlStart = text.match(/Iniciando Mercado Livre:\s*(\d+)/);

  if (mlStart) {
    const total = parseInt(mlStart[1]);

    document.getElementById("ml-progress-text").textContent = `0 / ${total}`;

    return;
  }

  const match = text.match(/\[(\d+)\/(\d+)\]/);

  if (!match) return;

  const current = parseInt(match[1]);
  const total = parseInt(match[2]);

  const percent = (current / total) * 100;

  // AMAZON
  if (text.includes("Amazon")) {
    document.getElementById("amazon-progress-bar").style.width = percent + "%";

    document.getElementById("amazon-progress-text").textContent =
      `${current} / ${total}`;
  }

  // MERCADO LIVRE
  if (text.includes("Mercado Livre")) {
    document.getElementById("ml-progress-bar").style.width = percent + "%";

    document.getElementById("ml-progress-text").textContent =
      `${current} / ${total}`;
  }
}

// =======================
// 🔥 CARREGAR SÉRIES
// =======================
async function loadSeries() {
  const { data, error } = await supabaseClient
    .from("series")
    .select("*")
    .order("title");

  if (error) return console.error(error);

  seriesList.innerHTML = "";

  // pais = séries sem pai
  const parents = data.filter((s) => !s.parent_series_id);

  parents.forEach((parent) => {
    const wrapper = document.createElement("div");

    const parentDiv = document.createElement("div");
    parentDiv.className = "series-item series-parent";

    parentDiv.innerHTML = `
      <span class="arrow">+</span>

      <span class="series-title">
        ${parent.title}
      </span>
    `;

    const arrow = parentDiv.querySelector(".arrow");

    const title = parentDiv.querySelector(".series-title");

    // seta -> apenas abre/fecha filhos
    arrow.onclick = (e) => {
      e.stopPropagation();

      const open = childrenContainer.style.display === "block";

      childrenContainer.style.display = open ? "none" : "block";

      arrow.textContent = open ? "+" : "−";
    };

    // nome -> abre somente a série
    title.onclick = (e) => {
      e.stopPropagation();

      document
        .querySelectorAll(".series-item")
        .forEach((el) => el.classList.remove("active"));

      parentDiv.classList.add("active");

      loadVolumes(parent.prefix);
    };

    const childrenContainer = document.createElement("div");
    childrenContainer.className = "children";
    childrenContainer.style.display = "none";

    // filhos desse pai
    const children = data.filter((s) => s.parent_series_id === parent.id);

    const icons = {
      databook: "📚",
      novel: "📝",
      spin_off: "📖",
      artbook: "🎨",
    };

    children.forEach((child) => {
      const childDiv = document.createElement("div");

      childDiv.className = "series-item series-child";

      childDiv.innerHTML = `
        <span class="child-icon">
          ${icons[child.content_type] || "📘"}
        </span>

        <span>
          ${child.title}
        </span>
      `;

      childDiv.onclick = (e) => {
        e.stopPropagation();

        document
          .querySelectorAll(".series-item")
          .forEach((el) => el.classList.remove("active"));

        childDiv.classList.add("active");

        loadVolumes(child.prefix);
      };

      childrenContainer.appendChild(childDiv);
    });

    parentDiv.onclick = () => {
      if (children.length === 0) {
        document
          .querySelectorAll(".series-item")
          .forEach((el) => el.classList.remove("active"));

        parentDiv.classList.add("active");

        loadVolumes(parent.prefix);

        return;
      }

      const open = childrenContainer.style.display === "block";

      childrenContainer.style.display = open ? "none" : "block";

      parentDiv.querySelector(".arrow").textContent = open ? "+" : "−";
    };

    wrapper.appendChild(parentDiv);
    wrapper.appendChild(childrenContainer);

    seriesList.appendChild(wrapper);
  });
}

// =======================
// CAMINHO DAS IMAGENS
// =======================

function volumeImg({ prefix, parentPrefix = null, number }) {
  const safeCurrent = String(prefix || "")
    .trim()
    .toLowerCase();

  const safeParent = String(parentPrefix || "")
    .trim()
    .toLowerCase();

  const num = String(number).padStart(2, "0");

  const path = safeParent ? `${safeParent}/${safeCurrent}` : safeCurrent;

  return `${window.location.origin}/assets/${path}/${safeCurrent}${num}.webp`;
}

// =======================
// 🎴 RENDER CARD VOLUME
// =======================

function renderVolumeCard({ volume, series, prefix }) {
  const div = document.createElement("div");

  div.className = "card";

  div.id = `vol-${volume.number}`;

  const imgSrc = volumeImg({
    prefix: volume.prefix,
    parentPrefix: series.parent?.prefix,
    number: volume.number,
  });

  console.log("========== IMG DEBUG ==========");
  console.log("Volume:", volume.title);
  console.log("Prefix volume:", volume.prefix);
  console.log("Parent:", series.parent);
  console.log("URL gerada:", imgSrc);
  console.log("===============================");

  div.innerHTML = `
    <div class="card-header">
      <div class="title-with-thumb">

        <img 
          src="${imgSrc}" 
          class="volume-thumb"
          onerror="this.style.display='none'"
        >

        <h3>${volume.title}</h3>

      </div>
    </div>

    <div class="field">

      <label>Descrição</label>

      <textarea id="desc-${prefix}-${volume.number}">${volume.description || ""}</textarea>

    </div>

    <div class="links-grid">

      <!-- AMAZON AFILIADO -->
      <div class="field">

        <label class="label-affiliate">
          💰 Amazon Afiliado
        </label>

        <div class="input-row">

          <input
            id="amazon-${prefix}-${volume.number}"
            value="${volume.amazon || ""}"
          >

        </div>

      </div>

      <!-- AMAZON RAW -->
      <div class="field">

        <label class="label-raw">
          🔗 Amazon Raw
        </label>

        <div class="input-row">

          <input 
            id="amazon-raw-${prefix}-${volume.number}" 
            value="${volume.amazon_raw || ""}"
          >

          <button
            class="icon-btn"
            onclick="normalizeAmazon('${prefix}', ${volume.number})"
          >
            ✨
          </button>

          <button
            class="icon-btn"
            onclick="openLink('amazon-raw-${prefix}-${volume.number}')"
          >
            🔎
          </button>

          <button
            class="icon-btn"
            onclick="updateAmazonPriceRaw(${volume.id}, '${prefix}', ${volume.number})"
          >
            💲
          </button>

        </div>

      </div>

      <!-- MERCADO LIVRE AFILIADO -->
      <div class="field">

        <label class="label-affiliate">
          💰 Mercado Livre Afiliado
        </label>

        <div class="input-row">

          <input 
            id="ml-${prefix}-${volume.number}" 
            value="${volume.mercado_livre || ""}"
          >

        </div>

      </div>

      <!-- MERCADO LIVRE RAW -->
      <div class="field">

        <label class="label-raw">
          🔗 Mercado Livre Raw
        </label>

        <div class="input-row">

          <input 
            id="ml-raw-${prefix}-${volume.number}" 
            value="${volume.mercado_livre_raw || ""}"
          >

          <button
            class="icon-btn"
            onclick="normalizeML('${prefix}', ${volume.number})"
          >
            ✨
          </button>

          <button
            class="icon-btn"
            onclick="openLink('ml-raw-${prefix}-${volume.number}')"
          >
            🔎
          </button>

          <button
            class="icon-btn"
            onclick="updateMLPriceRaw(${volume.id}, '${prefix}', ${volume.number})"
          >
            💲
          </button>

        </div>

      </div>

    </div>
    <div class="field">

      <label class="label-tiktok">
        🎥 TikTok
      </label>

      <input
        id="tiktok-${prefix}-${volume.number}"
        value="${volume.tiktok || ""}"
      >

    </div>

    <div class="field">

      <label>
        Adicionado em
      </label>

      <input
        type="datetime-local"
        step="1"
        id="date-${prefix}-${volume.number}"
        value="${volume.added_at ? new Date(volume.added_at).toISOString().slice(0, 19) : ""}"
      />

    </div>

    <div class="card-footer">

      <div class="card-actions">

        <button
          class="btn btn-danger"
          onclick="deleteVolume('${prefix}', ${volume.number})"
        >
          🗑 Excluir
        </button>

        <button
          class="btn btn-primary save-btn"
          onclick="saveVolume('${prefix}', ${volume.number})"
        >
          💾 Salvar
        </button>

      </div>

    </div>
  `;

  const originalData = {
    description: volume.description || "",
    amazon: volume.amazon || "",
    amazonRaw: volume.amazon_raw || "",
    ml: volume.mercado_livre || "",
    mlRaw: volume.mercado_livre_raw || "",
    tiktok: volume.tiktok || "",
    date: volume.added_at
      ? new Date(volume.added_at).toISOString().slice(0, 19)
      : "",
  };

  const checkChanges = () => {
    const currentData = {
      description:
        div.querySelector(`#desc-${prefix}-${volume.number}`)?.value || "",

      amazon:
        div.querySelector(`#amazon-${prefix}-${volume.number}`)?.value || "",

      amazonRaw:
        div.querySelector(`#amazon-raw-${prefix}-${volume.number}`)?.value ||
        "",

      ml: div.querySelector(`#ml-${prefix}-${volume.number}`)?.value || "",

      mlRaw:
        div.querySelector(`#ml-raw-${prefix}-${volume.number}`)?.value || "",

      tiktok:
        div.querySelector(`#tiktok-${prefix}-${volume.number}`)?.value || "",

      date: div.querySelector(`#date-${prefix}-${volume.number}`)?.value || "",
    };

    const changed =
      JSON.stringify(currentData) !== JSON.stringify(originalData);

    if (changed) {
      changedVolumes.add(volume.number);
    } else {
      changedVolumes.delete(volume.number);
    }

    updatePendingChanges(changedVolumes.size);
  };

  div
    .querySelector(`#desc-${prefix}-${volume.number}`)
    ?.addEventListener("input", checkChanges);

  div
    .querySelector(`#amazon-${prefix}-${volume.number}`)
    ?.addEventListener("input", checkChanges);

  div
    .querySelector(`#amazon-raw-${prefix}-${volume.number}`)
    ?.addEventListener("input", checkChanges);

  div
    .querySelector(`#ml-${prefix}-${volume.number}`)
    ?.addEventListener("input", checkChanges);

  div
    .querySelector(`#ml-raw-${prefix}-${volume.number}`)
    ?.addEventListener("input", checkChanges);

  div
    .querySelector(`#tiktok-${prefix}-${volume.number}`)
    ?.addEventListener("input", checkChanges);

  div
    .querySelector(`#date-${prefix}-${volume.number}`)
    ?.addEventListener("change", checkChanges);

  return div;
}

// =======================
// 🔥 CARREGAR VOLUMES
// =======================
let changedVolumes = new Set();
let currentPrefix = null;

const volumeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const volumeNumber = entry.target.id.replace("vol-", "");

      document
        .querySelectorAll(".volume-nav-item")
        .forEach((el) => el.classList.remove("active"));

      document
        .querySelector(`.volume-nav-item[data-vol="${volumeNumber}"]`)
        ?.classList.add("active");
    });
  },
  {
    threshold: 0.5,
  },
);

function updatePendingChanges(count) {
  const el = document.getElementById("pending-changes");

  if (el) {
    el.textContent = count;
  }
}

//Nav lateral para navegar entre os volumes
function renderVolumeNavigator(volumes) {
  const nav = document.getElementById("volume-nav");

  nav.innerHTML = "";

  for (const v of volumes) {
    const btn = document.createElement("button");

    btn.className = "volume-nav-item";

    btn.dataset.vol = v.number;

    btn.textContent = String(v.number).padStart(2, "0");

    btn.onclick = () => {
      document.getElementById(`vol-${v.number}`)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    };

    nav.appendChild(btn);
  }
}

async function loadVolumes(prefix) {
  currentPrefix = prefix;
  volumesDiv.innerHTML = "Carregando...";

  // =======================
  // BUSCA SÉRIE
  // =======================

  const { data: series } = await supabaseClient
    .from("series")
    .select(
      `
      *,
      parent:parent_series_id(prefix)
    `,
    )
    .eq("prefix", prefix)
    .single();

  // =======================
  // BUSCA VOLUMES
  // =======================

  const { data: volumes } = await supabaseClient
    .from("volumes")
    .select("*")
    .eq("prefix", prefix)
    .order("number");

  document.getElementById("total-volumes").textContent = volumes.length;

  // =======================
  // ATUALIZA HEADER FIXO
  // =======================

  document.getElementById("series-title").textContent = series.title;

  // =======================
  // CONFIGURA BOTÕES FIXOS
  // =======================

  document.getElementById("btn-new-volume").onclick = () =>
    openCreateVolume(prefix);

  document.getElementById("btn-generate").onclick = () =>
    generateMissingVolumes(prefix);

  document.getElementById("btn-edit-series").onclick = () => editSeries(prefix);

  document.getElementById("btn-related").onclick = () =>
    openRelatedSeriesModal(prefix);

  document.getElementById("btn-save-all").onclick = () => saveAllVolumes();

  document.getElementById("btn-bulk-desc").onclick = () =>
    openBulkDescriptionsModal(prefix);

  document.getElementById("btn-normalize-links").onclick = () =>
    normalizeAllLinks();

  document.getElementById("btn-delete-series").onclick = () =>
    deleteSeries(prefix);

  // =======================
  // LIMPA CONTAINER
  // =======================

  volumesDiv.innerHTML = "";

  // =======================
  // RENDERIZA CARDS
  // =======================

  updatePendingChanges(0);

  changedVolumes.clear();

  for (const v of volumes) {
    const card = renderVolumeCard({
      volume: v,
      series,
      prefix,
    });

    volumesDiv.appendChild(card);

    volumeObserver.observe(card);
  }

  renderVolumeNavigator(volumes);
}

// =======================
// 🎯 MODAL - SÉRIE
// =======================
function openSeriesModal() {
  const modal = document.getElementById("modal");

  modal.style.display = "flex";

  modal.innerHTML = `
    <div class="modal-content">

      <h2>➕ Nova Série</h2>

      <input id="m-title" placeholder="Nome da série">

      <input
        id="m-prefix"
        placeholder="Prefix (ex: op, mha, csm)"
      >

      <input id="m-subtitle" placeholder="Subtítulo">

      <input id="m-author" placeholder="Autor">

      <input
        id="m-genre"
        list="genre-list"
        placeholder="Gênero"
      >

      <datalist id="genre-list">
        <option value="Shounen">
        <option value="Seinen">
        <option value="Shounen/Seinen">
      </datalist>

      <input
        id="m-brand"
        list="brand-list"
        placeholder="Editora"
      >

      <datalist id="brand-list">
        <option value="Panini">
        <option value="JBC">
        <option value="NewPOP">
        <option value="MPEG">
        <option value="Pipoca & Nanquim">
      </datalist>


      <input
        id="m-format"
        list="format-list"
        placeholder="Formato"
      >

      <datalist id="format-list">
        <option value="Padrão">
        <option value="2 em 1">
        <option value="3 em 1">
      </datalist>

      <input
        id="m-edition"
        list="edition-list"
        placeholder="Edition Label"
      >

      <datalist id="edition-list">
        <option value="Padrão">
        <option value="2 em 1">
        <option value="3 em 1">
        <option value="Remix">
        <option value="Deluxe">
        <option value="Edição Definitiva">
      </datalist>

      <input
        id="m-price"
        type="number"
        step="0.01"
        placeholder="Preço de capa"
      >

      <input
        id="m-total"
        type="number"
        placeholder="Total de volumes"
      >

      <div class="modal-actions">
        <button
          class="btn btn-secondary"
          onclick="closeModal()"
        >
          Cancelar
        </button>

        <button
          id="save-btn"
          class="btn btn-primary save-btn"
          onclick="createSeries()"
        >
          Salvar
</button>
      </div>

    </div>
  `;
}

function closeModal() {
  const modal = document.getElementById("modal");

  modal.style.display = "none";
  modal.innerHTML = "";
}

// =======================
// ➕ CRIAR SÉRIE + GERAR VOLUMES
// =======================
async function createSeries() {
  if (!(await requireAuth())) {
    showToast("Sessão expirada 🔐");
    return;
  }

  const btn = document.getElementById("save-btn");
  btn.disabled = true;
  btn.textContent = "Salvando...";

  const title = document.getElementById("m-title").value;
  const prefix = document.getElementById("m-prefix").value;
  const subtitle = document.getElementById("m-subtitle").value;
  const author = document.getElementById("m-author").value;
  const genre = document.getElementById("m-genre").value;
  const brand = document.getElementById("m-brand").value;
  const format = document.getElementById("m-format").value;
  const edition_label = document.getElementById("m-edition").value;
  const cover_price = Number(document.getElementById("m-price").value || 0);
  const total_volumes = Number(document.getElementById("m-total").value || 0);
  const thumb = `/assets/${prefix}/${prefix}-series.webp`;

  if (!title || !prefix) {
    showToast("Título e prefix são obrigatórios ⚠️");

    btn.disabled = false;
    btn.textContent = "Salvar";

    return;
  }

  btn.disabled = true;
  btn.textContent = "Salvando...";

  try {
    // 🔍 valida prefix duplicado
    const { data: existing, error: checkError } = await supabaseClient
      .from("series")
      .select("prefix")
      .eq("prefix", prefix)
      .maybeSingle();

    if (checkError) {
      throw checkError;
    }

    if (existing) {
      showToast("Esse prefix já existe ⚠️");

      btn.disabled = false;
      btn.textContent = "Salvar";
      return;
    }

    // 🔥 insert
    const { data: series, error } = await supabaseClient
      .from("series")
      .insert([
        {
          title,
          prefix,
          subtitle,
          author,
          genre,
          brand,
          format,
          edition_label,
          cover_price,
          total_volumes,
          thumb,
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    // 🔥 gerar volumes automaticamente
    if (total_volumes > 0) {
      const result = await generateMissingVolumes(prefix);

      if (result.error) {
        showToast("Série criada, mas erro ao gerar volumes ⚠️");
      } else if (result.created > 0) {
        showToast(`${result.created} volumes criados 🚀`);
      }
    }

    showToast("Série criada com sucesso 🚀");

    closeModal();
    loadSeries();
  } catch (err) {
    console.error("CREATE SERIES ERROR:", err);

    // 🔥 mensagens mais inteligentes
    if (err.message?.includes("row-level security")) {
      showToast("Você precisa estar logado 🔐");
    } else {
      showToast("Erro ao criar série ❌");
    }
  } finally {
    btn.disabled = false;
    btn.textContent = "Salvar";
  }
}

// =======================
// ➕ CRIAR VOLUMES EM LOTE
// =======================

async function generateVolumes(series) {
  const volumes = [];

  for (let i = 1; i <= series.total_volumes; i++) {
    const num = String(i).padStart(2, "0");

    volumes.push({
      prefix: series.prefix,
      series_id: series.id,
      number: i,
      title: `${series.title} Vol. ${num}`,
      description: "",
      amazon: "",
      mercado_livre: "",
      tiktok: "",
      added_at: new Date(added_at).toLocaleString("pt-BR"),
    });
  }

  const { error } = await supabaseClient.from("volumes").insert(volumes);

  if (error) {
    console.error(error);
    showToast("Erro ao gerar volumes");
  } else {
    showToast("Volumes gerados automaticamente 🚀");
  }
}

// =======================
// 🔥 GERAR VOLUMES FALTANTES (PRO)
// =======================
async function generateMissingVolumes(prefix) {
  try {
    // 🔍 pega série
    const { data: series, error: seriesError } = await supabaseClient
      .from("series")
      .select("*")
      .eq("prefix", prefix)
      .single();

    if (seriesError) throw seriesError;

    const total = series.total_volumes || 0;

    if (!total) {
      return { error: "NO_TOTAL" };
    }

    // 🔍 pega volumes existentes
    const { data: existingVolumes, error: volError } = await supabaseClient
      .from("volumes")
      .select("number")
      .eq("prefix", prefix);

    if (volError) throw volError;

    const existingNumbers = new Set(existingVolumes.map((v) => v.number));

    const volumesToCreate = [];

    for (let i = 1; i <= total; i++) {
      if (!existingNumbers.has(i)) {
        const num = String(i).padStart(2, "0");

        volumesToCreate.push({
          prefix: prefix,
          series_id: series.id,
          number: i,
          title: `${series.title} Vol. ${num}`,
          description: "",
          amazon: "",
          mercado_livre: "",
          tiktok: "",
          added_at: new Date().toISOString().split("T")[0],
        });
      }
    }

    if (volumesToCreate.length === 0) {
      return { error: null, created: 0 };
    }

    const { error: insertError } = await supabaseClient
      .from("volumes")
      .insert(volumesToCreate);

    if (insertError) throw insertError;

    loadVolumes(prefix);

    return { error: null, created: volumesToCreate.length };
  } catch (err) {
    console.error("GENERATE ERROR:", err);

    return { error: err };
  }
}

// =======================
// ✏️ EDITAR SÉRIE (MODAL)
// =======================
async function editSeries(prefix) {
  const { data, error } = await supabaseClient
    .from("series")
    .select("*")
    .eq("prefix", prefix)
    .single();

  if (error) return console.error(error);

  const modal = document.getElementById("modal");

  modal.style.display = "flex";

  modal.innerHTML = `
    <div class="modal-content">
      <h2>Editar Série</h2>

      <input id="e-title" value="${data.title}" placeholder="Nome">
      <input id="e-subtitle" value="${data.subtitle || ""}" placeholder="Subtítulo">
      <input id="e-author" value="${data.author || ""}" placeholder="Autor">
      <input id="e-genre" value="${data.genre || ""}" placeholder="Gênero">
      <input id="e-brand" value="${data.brand || ""}" placeholder="Editora">
      <input id="e-format" value="${data.format || ""}" placeholder="Formato">
      <input id="e-edition" value="${data.edition_label || ""}" placeholder="Edition Label">
      <input id="e-price" type="number" value="${data.cover_price || 0}" placeholder="Preço">
      <input id="e-total" type="number" value="${data.total_volumes || 0}" placeholder="Total Volumes">

      <div style="display:flex; gap:10px; margin-top:10px;">
        <button onclick="closeModal()">Cancelar</button>
      <button
        id="save-btn"
        onclick="updateSeries('${prefix}', ${data.total_volumes || 0})"
      >
        Salvar
      </button>
      </div>
    </div>
  `;
}

// =======================
// ABRIR MODAL DE EXTRAS
// =======================
async function openRelatedSeriesModal(prefix) {
  const { data: parent } = await supabaseClient
    .from("series")
    .select("*")
    .eq("prefix", prefix)
    .single();

  const modal = document.getElementById("modal");

  modal.style.display = "flex";

  modal.innerHTML = `
    <div class="modal-content">

      <h2>📚 Relacionado de ${parent.title}</h2>

      <input
        id="r-title"
        placeholder="Título"
      >

      <input
        id="r-prefix"
        placeholder="Prefix (ex: dd-novel)"
      >

      <input
        id="r-type"
        list="related-type-list"
        placeholder="Tipo"
      >

      <datalist id="related-type-list">
        <option value="novel">
        <option value="spin_off">
        <option value="databook">
        <option value="artbook">
      </datalist>

      <input
        id="r-format"
        list="related-format-list"
        placeholder="Formato"
      >

      <datalist id="related-format-list">
        <option value="Padrão">
        <option value="2 em 1">
        <option value="3 em 1">
      </datalist>

      <input
        id="r-edition"
        list="related-edition-list"
        placeholder="Edition Label"
      >

      <datalist id="related-edition-list">
        <option value="Novel">
        <option value="Spin-off">
        <option value="Databook">
        <option value="Artbook">
      </datalist>

      <input
        id="r-total"
        type="number"
        placeholder="Total de volumes"
      >

      <input
        id="r-cover-price"
        type="number"
        step="0.01"
        placeholder="Preço de capa"
      >

      <div class="modal-actions">

        <button
          class="btn btn-secondary"
          onclick="closeModal()"
        >
          Cancelar
        </button>

        <button
          class="btn btn-primary save-btn"
          onclick="createRelatedSeries(${parent.id})"
        >
          Salvar
        </button>

      </div>

    </div>
  `;
}

// =======================
// ✏️ EDITAR RELACIONADO
// =======================
async function editRelatedSeries(id) {
  const { data, error } = await supabaseClient
    .from("series")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    return;
  }

  const modal = document.getElementById("modal");

  modal.style.display = "flex";

  modal.innerHTML = `
    <div class="modal-content">

      <h2>📚 Editar Relacionado</h2>

      <input
        id="r-title"
        value="${data.title || ""}"
        placeholder="Título"
      >

      <input
        id="r-prefix"
        value="${data.prefix || ""}"
        placeholder="Prefix"
      >

      <input
        id="r-type"
        list="related-type-list"
        value="${data.content_type || ""}"
        placeholder="Tipo"
      >

      <datalist id="related-type-list">
        <option value="novel">
        <option value="spin_off">
        <option value="databook">
        <option value="artbook">
      </datalist>

      <input
        id="r-format"
        list="related-format-list"
        value="${data.format || ""}"
        placeholder="Formato"
      >

      <datalist id="related-format-list">
        <option value="Padrão">
        <option value="2 em 1">
        <option value="3 em 1">
      </datalist>

      <input
        id="r-edition"
        list="related-edition-list"
        value="${data.edition_label || ""}"
        placeholder="Edition Label"
      >

      <datalist id="related-edition-list">
        <option value="Padrão">
        <option value="Remix">
        <option value="Deluxe">
        <option value="Edição Definitiva">
      </datalist>

      <input
        id="r-price"
        type="number"
        step="0.01"
        value="${data.cover_price || 0}"
        placeholder="Preço de capa"
      >

      <input
        id="r-total"
        type="number"
        value="${data.total_volumes || 0}"
        placeholder="Total de volumes"
      >

      <div class="modal-actions">

        <button
          class="btn btn-secondary"
          onclick="closeModal()"
        >
          Cancelar
        </button>

        <button
          id="save-btn"
          class="btn btn-primary"
          onclick="updateRelatedSeries(${data.id})"
        >
          Salvar
        </button>

      </div>

    </div>
  `;
}

// =======================
// ADICIONAR RELACIONADO
// =======================

async function createRelatedSeries(parentId) {
  const { data: parent } = await supabaseClient
    .from("series")
    .select("*")
    .eq("id", parentId)
    .single();

  const payload = {
    title: document.getElementById("r-title").value,
    prefix: document.getElementById("r-prefix").value,

    subtitle: parent.subtitle,
    author: parent.author,
    genre: parent.genre,
    brand: parent.brand,

    format: document.getElementById("r-format").value,
    edition_label: document.getElementById("r-edition").value,

    total_volumes: Number(document.getElementById("r-total").value),

    cover_price: Number(document.getElementById("r-cover-price").value) || null,

    content_type: document.getElementById("r-type").value,

    parent_series_id: parentId,
  };

  await supabaseClient.from("series").insert([payload]);

  closeModal();

  showToast("Relacionado criado 🚀");
}

// =======================
// 💾 UPDATE DE SÉRIE
// =======================
async function updateSeries(prefix, oldTotal) {
  if (!(await requireAuth())) {
    showToast("Sessão expirada 🔐");
    return;
  }

  const title = document.getElementById("e-title").value;
  const subtitle = document.getElementById("e-subtitle").value;
  const author = document.getElementById("e-author").value;
  const genre = document.getElementById("e-genre").value;
  const brand = document.getElementById("e-brand").value;
  const format = document.getElementById("e-format").value;
  const edition_label = document.getElementById("e-edition").value;
  const cover_price = Number(document.getElementById("e-price").value || 0);
  const total_volumes = Number(document.getElementById("e-total").value || 0);

  const btn = document.getElementById("save-btn");
  console.log("BTN:", btn);
  btn.disabled = true;
  btn.textContent = "Salvando...";

  try {
    const { error } = await supabaseClient
      .from("series")
      .update({
        title,
        subtitle,
        author,
        genre,
        brand,
        format,
        edition_label,
        cover_price,
        total_volumes,
      })
      .eq("prefix", prefix);

    if (error) {
      throw error;
    }

    // 🔥 se aumentou, gera volumes automaticamente
    if (total_volumes > oldTotal) {
      const { error: volError } = await generateMissingVolumes(prefix);

      if (volError) {
        console.error(volError);
        showToast("Atualizado, mas erro ao gerar volumes ⚠️");
      }
    }

    showToast("Série atualizada com sucesso ✏️");

    closeModal();
    loadSeries();
  } catch (err) {
    console.error("UPDATE ERROR:", err);

    if (err.message?.includes("row-level security")) {
      showToast("Você precisa estar logado 🔐");
    } else {
      showToast("Erro ao atualizar ❌");
    }
  } finally {
    btn.disabled = false;
    btn.textContent = "Salvar";
  }
}

// =======================
// 💾 UPDATE RELACIONADO
// =======================
async function updateRelatedSeries(id) {
  const title = document.getElementById("r-title").value;
  const prefix = document.getElementById("r-prefix").value;
  const content_type = document.getElementById("r-type").value;
  const format = document.getElementById("r-format").value;
  const edition_label = document.getElementById("r-edition").value;
  const cover_price = Number(document.getElementById("r-price").value || 0);
  const total_volumes = Number(document.getElementById("r-total").value || 0);

  const btn = document.getElementById("save-btn");

  btn.disabled = true;
  btn.textContent = "Salvando...";

  try {
    const { error } = await supabaseClient
      .from("series")
      .update({
        title,
        prefix,
        content_type,
        format,
        edition_label,
        cover_price,
        total_volumes,
      })
      .eq("id", id);

    if (error) throw error;

    showToast("Relacionado atualizado ✨");

    closeModal();
    loadSeries();
  } catch (err) {
    console.error(err);
    showToast("Erro ao atualizar ❌");
  } finally {
    btn.disabled = false;
    btn.textContent = "Salvar";
  }
}

// =======================
// ➕ CRIAR VOLUME
// =======================
async function openCreateVolume(prefix) {
  if (!(await requireAuth())) {
    showToast("Sessão expirada 🔐");
    return;
  }

  const { data: volumes } = await supabaseClient
    .from("volumes")
    .select("number")
    .eq("prefix", prefix)
    .order("number", { ascending: false })
    .limit(1);

  const next = volumes.length ? volumes[0].number + 1 : 1;
  const num = String(next).padStart(2, "0");

  const { data: series } = await supabaseClient
    .from("series")
    .select("title")
    .eq("prefix", prefix)
    .single();

  const title = `${series.title} Vol. ${num}`;

  await supabaseClient.from("volumes").insert([
    {
      prefix: prefix,
      title,
      number: next,
      added_at: new Date().toISOString().split("T")[0],
    },
  ]);

  loadVolumes(prefix);
}

// =======================
// 💾 DESCRIÇÃO EM MASSA
// =======================

function openBulkDescriptionsModal(prefix) {
  const modal = document.getElementById("modal");

  modal.style.display = "flex";

  modal.innerHTML = `
    <div class="modal-content">
      <h2>✨ Preencher descrições em massa</h2>

      <textarea
        id="bulk-descriptions"
        placeholder="Cole todas as descrições aqui..."
        style="
          width:100%;
          height:300px;
          background:#020617;
          color:white;
          padding:12px;
          border-radius:8px;
          border:1px solid #334155;
          resize:vertical;
        "
      ></textarea>

      <div style="display:flex; gap:10px; margin-top:15px;">
        <button onclick="closeModal()">
          Cancelar
        </button>

        <button onclick="applyBulkDescriptions('${prefix}')">
          Aplicar
        </button>
      </div>
    </div>
  `;
}

function applyBulkDescriptions(prefix) {
  const textarea = document.getElementById("bulk-descriptions");

  if (!textarea.value.trim()) {
    showToast("Cole as descrições ⚠️");
    return;
  }

  const lines = textarea.value
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  let applied = 0;

  lines.forEach((line) => {
    // pega "Vol. 01"
    const match = line.match(/Vol\.?\s*(\d+)/i);

    if (!match) return;

    const volume = parseInt(match[1], 10);

    const target = document.getElementById(`desc-${prefix}-${volume}`);

    if (!target) return;

    target.value = line;

    target.dispatchEvent(new Event("input", { bubbles: true }));

    applied++;
  });

  closeModal();

  showToast(`✨ ${applied} descrições aplicadas`);
}

// =======================
// 💾 SALVAR TUDO
// =======================
async function saveAllVolumes() {
  if (changedVolumes.size === 0) {
    showToast("Nenhuma alteração pendente 👍");
    return;
  }

  showToast(`Salvando ${changedVolumes.size} volumes... ⏳`);

  const promises = [];

  for (const volumeNumber of changedVolumes) {
    promises.push(saveVolume(currentPrefix, volumeNumber));
  }

  await Promise.all(promises);

  showToast("Tudo salvo 🚀");
}

// =======================
// 💾 SALVAR
// =======================
async function saveVolume(prefix, number) {
  if (!(await requireAuth())) {
    showToast("Sessão expirada 🔐");
    return;
  }

  const dateInput = document.getElementById(`date-${prefix}-${number}`);
  const now = new Date();

  const formatted =
    now.getFullYear() +
    "-" +
    String(now.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(now.getDate()).padStart(2, "0") +
    "T" +
    String(now.getHours()).padStart(2, "0") +
    ":" +
    String(now.getMinutes()).padStart(2, "0") +
    ":" +
    String(now.getSeconds()).padStart(2, "0");

  dateInput.value = formatted;
  const description = document.getElementById(`desc-${prefix}-${number}`).value;
  const amazon = document.getElementById(`amazon-${prefix}-${number}`).value;
  const mercado_livre = document.getElementById(`ml-${prefix}-${number}`).value;
  const amazon_raw = document.getElementById(
    `amazon-raw-${prefix}-${number}`,
  ).value;
  const mercado_livre_raw = document.getElementById(
    `ml-raw-${prefix}-${number}`,
  ).value;
  const tiktok = document.getElementById(`tiktok-${prefix}-${number}`).value;
  const added_at = new Date().toISOString();

  // 🔥 monta objeto dinamicamente (corrige bug da data)
  const updateData = {
    description,
    amazon,
    amazon_raw,
    mercado_livre,
    mercado_livre_raw,
    tiktok,
  };

  // só adiciona a data se existir
  if (added_at) {
    updateData.added_at = added_at;
  } else {
    updateData.added_at = null; // opcional (mais robusto)
  }

  const { error } = await supabaseClient
    .from("volumes")
    .update(updateData)
    .eq("prefix", prefix)
    .eq("number", number);

  if (error) {
    console.error(error);
    showToast("Erro ao salvar ❌");
    return;
  }

  showToast("Salvo com sucesso 🚀");
}

// =======================
// 🗑 DELETAR SÉRIE (PRO)
// =======================
async function deleteSeries(prefix) {
  if (!(await requireAuth())) {
    showToast("Sessão expirada 🔐");
    return;
  }

  const ok = await confirmAction("Tem certeza que deseja deletar essa série?");
  if (!ok) return;

  const btn = document.getElementById("delete-btn");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Deletando...";
  }

  try {
    const { error: volError } = await supabaseClient
      .from("volumes")
      .delete()
      .eq("prefix", prefix);

    if (volError) throw volError;

    const { error: seriesError } = await supabaseClient
      .from("series")
      .delete()
      .eq("prefix", prefix);

    if (seriesError) throw seriesError;

    showToast("Série deletada com sucesso 🗑");

    volumesDiv.innerHTML = "Selecione uma série";
    loadSeries();
  } catch (err) {
    console.error("DELETE ERROR:", err);

    if (err.message?.includes("row-level security")) {
      showToast("Você precisa estar logado 🔐");
    } else {
      showToast("Erro ao deletar série ❌");
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Deletar Série";
    }
  }
}

// =======================
// 🗑 DELETAR VOLUME (PRO)
// =======================
async function deleteVolume(prefix, number) {
  if (!(await requireAuth())) {
    showToast("Sessão expirada 🔐");
    return;
  }

  const ok = await confirmAction("Deletar esse volume?");
  if (!ok) return;

  try {
    const { error } = await supabaseClient
      .from("volumes")
      .delete()
      .eq("prefix", prefix)
      .eq("number", number);

    if (error) throw error;

    showToast("Volume deletado 🗑");

    loadVolumes(prefix);
  } catch (err) {
    console.error("DELETE VOLUME ERROR:", err);

    if (err.message?.includes("row-level security")) {
      showToast("Você precisa estar logado 🔐");
    } else {
      showToast("Erro ao deletar volume ❌");
    }
  }
}

// iniciar
(async () => {
  const ok = await protectAdmin();

  if (!ok) return;

  loadSeries();
})();
