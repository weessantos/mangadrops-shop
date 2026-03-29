// =======================
// 🚀 BOOTSTRAP CMS
// =======================

// 👉 deixa acessível no arquivo inteiro
let supabaseClient
let seriesList
let volumesDiv

if (window.__cms_loaded) {
  console.warn("CMS já carregado, ignorando...")
} else {
  window.__cms_loaded = true

  console.log("✅ ADMIN JS CARREGADO")

  // =======================
  // 🔐 CONFIG
  // =======================
  const SUPABASE_URL = "https://wcwxjqfsnvpyndmpbngr.supabase.co"
  const SUPABASE_KEY = "sb_publishable_fLT7DCc3olBf97TxmkG8lQ_VLmOr424"

  // =======================
  // 🧠 SAFE INIT SUPABASE
  // =======================
  if (!window.supabase) {
    throw new Error("❌ Supabase não carregou (CDN faltando ou ordem errada)")
  }

  supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY,
    {
      auth: {
        persistSession: true,
        storage: window.sessionStorage,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  )
  

  // =======================
  // 🎯 DOM
  // =======================
  seriesList = document.getElementById("series-list")
  volumesDiv = document.getElementById("volumes")

  // =======================
  // EXPORTA GLOBAL (opcional)
  // =======================
  window.cms = {
    supabase: supabaseClient,
    seriesList,
    volumesDiv
  }
}

  // =======================
  // 🔐 ADMIN
  // =======================
async function protectAdmin() {
  document.body.style.display = "flex"
  const { data: { session } } = await supabaseClient.auth.getSession()

  if (!session) {
    showLoginScreen()
    return false
  }

  return true
}

async function requireAuth() {
  const { data: { session } } = await supabaseClient.auth.getSession()
  return !!session
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
  `
}

async function login() {
  const email = document.getElementById("login-email").value
  const password = document.getElementById("login-pass").value

  const btn = document.getElementById("login-btn")
  const text = document.getElementById("login-text")
  const errorEl = document.getElementById("login-error")

  errorEl.textContent = ""

  if (!email || !password) {
    errorEl.textContent = "Preencha todos os campos"
    return
  }

  btn.disabled = true
  text.textContent = "Entrando..."

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    errorEl.textContent = "Email ou senha inválidos"
    btn.disabled = false
    text.textContent = "Entrar"
    return
  }

  text.textContent = "✔ Sucesso!"

  setTimeout(() => {
    location.reload()
  }, 500)
}

  // =======================
  // 🔐 LOGOUT
  // =======================
async function logout() {
  try {
    const { error } = await supabaseClient.auth.signOut()

    if (error) throw error

    showToast("Logout realizado 👋")

    setTimeout(() => {
      location.reload()
    }, 400)

  } catch (err) {
    console.error("LOGOUT ERROR:", err)
    showToast("Erro ao sair ❌")
  }
}

  // =======================
  //TOAST
  // =======================

function showToast(message) {
  const toast = document.getElementById("toast")

  toast.textContent = message
  toast.classList.add("show")

  setTimeout(() => {
    toast.classList.remove("show")
  }, 2500)
}

  // =======================
  // CONFIRMAÇÃO POP UP
  // =======================
function confirmAction(message) {
  return new Promise((resolve) => {
    const modal = document.getElementById("modal")

    modal.style.display = "flex"
    modal.innerHTML = `
      <div class="modal-content">
        <h3>${message}</h3>
        <div style="display:flex; gap:10px; margin-top:15px;">
          <button onclick="closeModal(); window.__confirm = false">Cancelar</button>
          <button class="danger" onclick="closeModal(); window.__confirm = true">Confirmar</button>
        </div>
      </div>
    `

    window.__confirm = null

    const interval = setInterval(() => {
      if (window.__confirm !== null) {
        clearInterval(interval)
        resolve(window.__confirm)
      }
    }, 100)
  })
}

// =======================
// 🔥 CARREGAR SÉRIES
// =======================
async function loadSeries() {
  const { data, error } = await supabaseClient
    .from("series")
    .select("*")
    .order("title")

  if (error) return console.error(error)

  seriesList.innerHTML = ""

  data.forEach(s => {
    const div = document.createElement("div")
    div.className = "series-item"
    div.textContent = s.title
    div.onclick = () => loadVolumes(s.prefix)

    seriesList.appendChild(div)
  })
}

// =======================
// 🔥 CARREGAR VOLUMES
// =======================
async function loadVolumes(prefix) {
  volumesDiv.innerHTML = "Carregando..."

  const { data: series } = await supabaseClient
    .from("series")
    .select("*")
    .eq("prefix", prefix)
    .single()

  const { data: volumes } = await supabaseClient
    .from("volumes")
    .select("*")
    .eq("prefix", prefix)
    .order("number")

  volumesDiv.innerHTML = `
    <h1>${series.title}</h1>
    <button onclick="openCreateVolume('${prefix}')">+ Novo Volume</button>
  `
  volumesDiv.innerHTML = `
    <h1>${series.title}</h1>

    <button onclick="openCreateVolume('${prefix}')">
      + Novo Volume
    </button>

    <button onclick="generateMissingVolumes('${prefix}')">
      ⚡ Gerar volumes faltantes
    </button>

    <button onclick="editSeries('${prefix}')">
      ✏️ Editar Série
    </button>

    <button class="danger" onclick="deleteSeries('${prefix}')">
      🗑 Deletar Série
    </button>
  `  

  volumes.forEach(v => {
    const div = document.createElement("div")
    div.className = "card"

    div.innerHTML = `
      <h3>${v.title}</h3>
      <div class="field">
        <label>Descrição</label>
        <textarea id="desc-${prefix}-${v.number}">${v.description || ""}</textarea>
      </div>

      <div class="field">
        <label>Amazon</label>
        <input id="amazon-${prefix}-${v.number}" value="${v.amazon || ""}">
      </div>

      <div class="field">
        <label>Mercado Livre</label>
        <input id="ml-${prefix}-${v.number}" value="${v.mercado_livre || ""}">
      </div>

      <div class="field">
        <label>TikTok</label>
        <input id="tiktok-${prefix}-${v.number}" value="${v.tiktok || ""}">
      </div>

      <div class="field">
        <label>Adicionado em</label>
        <input type="date" id="date-${prefix}-${v.number}" value="${v.added_at || ""}">
      </div>
      <button onclick="saveVolume('${prefix}', ${v.number})">💾 Salvar</button>
      <button onclick="deleteVolume('${prefix}', ${v.number})">
        🗑
      </button>
    `

    volumesDiv.appendChild(div)
  })
}


// =======================
// 🎯 MODAL - SÉRIE
// =======================
function openSeriesModal() {
  const modal = document.getElementById("modal")

  modal.style.display = "flex"

  modal.innerHTML = `
    <div class="modal-content">
      <h2>Nova Série</h2>

      <input id="m-title" placeholder="Nome da série">
      <input id="m-prefix" placeholder="Prefix (ex: csm)">
      <input id="m-subtitle" placeholder="Subtítulo">
      <input id="m-author" placeholder="Autor">
      <input id="m-genre" placeholder="Gênero">
      <input id="m-brand" placeholder="Editora">
      <input id="m-format" placeholder="Formato">
      <input id="m-edition" placeholder="Edition Label">
      <input id="m-price" type="number" placeholder="Preço de capa">
      <input id="m-total" type="number" placeholder="Total de volumes">
      <input id="m-thumb" placeholder="/assets/thumb.webp">

      <div style="display:flex; gap:10px; margin-top:10px;">
        <button onclick="closeModal()">Cancelar</button>
        <button id="save-btn" onclick="createSeries()">Salvar</button>
      </div>
    </div>
  `
}

function closeModal() {
  document.getElementById("modal").style.display = "none"
}

// =======================
// ➕ CRIAR SÉRIE + GERAR VOLUMES
// =======================
async function createSeries() {

  if (!(await requireAuth())) {
    showToast("Sessão expirada 🔐")
    return
  }

  const btn = document.getElementById("save-btn")
  btn.disabled = true
  btn.textContent = "Salvando..."

  const title = document.getElementById("m-title").value
  const prefix = document.getElementById("m-prefix").value
  const subtitle = document.getElementById("m-subtitle").value
  const author = document.getElementById("m-author").value
  const genre = document.getElementById("m-genre").value
  const brand = document.getElementById("m-brand").value
  const format = document.getElementById("m-format").value
  const edition_label = document.getElementById("m-edition").value
  const cover_price = Number(document.getElementById("m-price").value || 0)
  const total_volumes = Number(document.getElementById("m-total").value || 0)
  const thumb = document.getElementById("m-thumb").value

 if (!title || !prefix) {
  showToast("Título e prefix são obrigatórios ⚠️")
  return
}

btn.disabled = true
btn.textContent = "Salvando..."

  try {

    // 🔍 valida prefix duplicado
    const { data: existing, error: checkError } = await supabaseClient
      .from("series")
      .select("prefix")
      .eq("prefix", prefix)
      .maybeSingle()

    if (checkError) {
      throw checkError
    }

    if (existing) {
      showToast("Esse prefix já existe ⚠️")

      btn.disabled = false
      btn.textContent = "Salvar"
      return
    }

    // 🔥 insert
    const { data: series, error } = await supabaseClient
      .from("series")
      .insert([{
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
        thumb
      }])
      .select()
      .single()

    if (error) {
      throw error
    }

    // 🔥 gerar volumes automaticamente
    if (total_volumes > 0) {
      const result = await generateMissingVolumes(prefix)

      if (result.error) {
        showToast("Série criada, mas erro ao gerar volumes ⚠️")
      } else if (result.created > 0) {
        showToast(`${result.created} volumes criados 🚀`)
      }
    }

    showToast("Série criada com sucesso 🚀")

    closeModal()
    loadSeries()

  } catch (err) {

    console.error("CREATE SERIES ERROR:", err)

    // 🔥 mensagens mais inteligentes
    if (err.message?.includes("row-level security")) {
      showToast("Você precisa estar logado 🔐")
    } else {
      showToast("Erro ao criar série ❌")
    }

  } finally {
    btn.disabled = false
    btn.textContent = "Salvar"
  }
}

// =======================
// ➕ CRIAR VOLUMES EM LOTE
// =======================

async function generateVolumes(series) {
  const volumes = []

  for (let i = 1; i <= series.total_volumes; i++) {
    const num = String(i).padStart(2, "0")

    volumes.push({
      prefix: series.prefix,
      series_id: series.id,
      number: i,
      title: `${series.title} Vol. ${num}`,
      description: "",
      amazon: "",
      mercado_livre: "",
      tiktok: "",
      added_at: new Date().toISOString().split("T")[0]
    })
  }

  const { error } = await supabaseClient
    .from("volumes")
    .insert(volumes)

  if (error) {
    console.error(error)
    showToast("Erro ao gerar volumes")
  } else {
    showToast("Volumes gerados automaticamente 🚀")
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
      .single()

    if (seriesError) throw seriesError

    const total = series.total_volumes || 0

    if (!total) {
      return { error: "NO_TOTAL" }
    }

    // 🔍 pega volumes existentes
    const { data: existingVolumes, error: volError } = await supabaseClient
      .from("volumes")
      .select("number")
      .eq("prefix", prefix)

    if (volError) throw volError

    const existingNumbers = new Set(
      existingVolumes.map(v => v.number)
    )

    const volumesToCreate = []

    for (let i = 1; i <= total; i++) {
      if (!existingNumbers.has(i)) {
        const num = String(i).padStart(2, "0")

        volumesToCreate.push({
          prefix: prefix,
          series_id: series.id,
          number: i,
          title: `${series.title} Vol. ${num}`,
          description: "",
          amazon: "",
          mercado_livre: "",
          tiktok: "",
          added_at: new Date().toISOString().split("T")[0]
        })
      }
    }

    if (volumesToCreate.length === 0) {
      return { error: null, created: 0 }
    }

    const { error: insertError } = await supabaseClient
      .from("volumes")
      .insert(volumesToCreate)

    if (insertError) throw insertError

    loadVolumes(prefix)

    return { error: null, created: volumesToCreate.length }

  } catch (err) {
    console.error("GENERATE ERROR:", err)

    return { error: err }
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
    .single()

  if (error) return console.error(error)

  const modal = document.getElementById("modal")

  modal.style.display = "flex"

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
      <input id="e-thumb" value="${data.thumb || ""}" placeholder="Thumb">

      <div style="display:flex; gap:10px; margin-top:10px;">
        <button onclick="closeModal()">Cancelar</button>
        <button onclick="updateSeries('${prefix}', ${data.total_volumes || 0})">
          Salvar
        </button>
      </div>
    </div>
  `
}

// =======================
// FUNÇÃO DE UPDATE
// =======================
async function updateSeries(prefix, oldTotal) {

  if (!(await requireAuth())) {
    showToast("Sessão expirada 🔐")
    return
  }

  const title = document.getElementById("e-title").value
  const subtitle = document.getElementById("e-subtitle").value
  const author = document.getElementById("e-author").value
  const genre = document.getElementById("e-genre").value
  const brand = document.getElementById("e-brand").value
  const format = document.getElementById("e-format").value
  const edition_label = document.getElementById("e-edition").value
  const cover_price = Number(document.getElementById("e-price").value || 0)
  const total_volumes = Number(document.getElementById("e-total").value || 0)
  const thumb = document.getElementById("e-thumb").value

  const btn = document.getElementById("save-btn")
  btn.disabled = true
  btn.textContent = "Salvando..."

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
        thumb
      })
      .eq("prefix", prefix)

    if (error) {
      throw error
    }

    // 🔥 se aumentou, gera volumes automaticamente
    if (total_volumes > oldTotal) {
      const { error: volError } = await generateMissingVolumes(prefix)

      if (volError) {
        console.error(volError)
        showToast("Atualizado, mas erro ao gerar volumes ⚠️")
      }
    }

    showToast("Série atualizada com sucesso ✏️")

    closeModal()
    loadSeries()

  } catch (err) {

    console.error("UPDATE ERROR:", err)

    if (err.message?.includes("row-level security")) {
      showToast("Você precisa estar logado 🔐")
    } else {
      showToast("Erro ao atualizar ❌")
    }

  } finally {
    btn.disabled = false
    btn.textContent = "Salvar"
  }
}

// =======================
// ➕ CRIAR VOLUME
// =======================
async function openCreateVolume(prefix) {

    if (!(await requireAuth())) {
      showToast("Sessão expirada 🔐")
      return
    }

  const { data: volumes } = await supabaseClient
    .from("volumes")
    .select("number")
    .eq("prefix", prefix)
    .order("number", { ascending: false })
    .limit(1)

  const next = volumes.length ? volumes[0].number + 1 : 1
  const num = String(next).padStart(2, "0")

  const { data: series } = await supabaseClient
    .from("series")
    .select("title")
    .eq("prefix", prefix)
    .single()

  const title = `${series.title} Vol. ${num}`

  await supabaseClient.from("volumes").insert([
    {
      prefix: prefix,
      title,
      number: next,
      added_at: new Date().toISOString().split("T")[0]
    }
  ])

  loadVolumes(prefix)
}

// =======================
// 💾 SALVAR
// =======================
async function saveVolume(prefix, number) {

  if (!(await requireAuth())) {
    showToast("Sessão expirada 🔐")
    return
  }

  const description = document.getElementById(`desc-${prefix}-${number}`).value
  const amazon = document.getElementById(`amazon-${prefix}-${number}`).value
  const mercado_livre = document.getElementById(`ml-${prefix}-${number}`).value
  const tiktok = document.getElementById(`tiktok-${prefix}-${number}`).value
  const added_at = document.getElementById(`date-${prefix}-${number}`).value

  // 🔥 monta objeto dinamicamente (corrige bug da data)
  const updateData = {
    description,
    amazon,
    mercado_livre,
    tiktok
  }

  // só adiciona a data se existir
  if (added_at) {
    updateData.added_at = added_at
  } else {
    updateData.added_at = null // opcional (mais robusto)
  }

  const { error } = await supabaseClient
    .from("volumes")
    .update(updateData)
    .eq("prefix", prefix)
    .eq("number", number)

  if (error) {
    console.error(error)
    showToast("Erro ao salvar ❌")
    return
  }

  showToast("Salvo com sucesso 🚀")
}

// =======================
// 🗑 DELETAR SÉRIE (PRO)
// =======================
async function deleteSeries(prefix) {

  if (!(await requireAuth())) {
    showToast("Sessão expirada 🔐")
    return
  }

  const ok = await confirmAction("Tem certeza que deseja deletar essa série?")
  if (!ok) return

  const btn = document.getElementById("delete-btn")
  if (btn) {
    btn.disabled = true
    btn.textContent = "Deletando..."
  }

  try {

    const { error: volError } = await supabaseClient
      .from("volumes")
      .delete()
      .eq("prefix", prefix)

    if (volError) throw volError

    const { error: seriesError } = await supabaseClient
      .from("series")
      .delete()
      .eq("prefix", prefix)

    if (seriesError) throw seriesError

    showToast("Série deletada com sucesso 🗑")

    volumesDiv.innerHTML = "Selecione uma série"
    loadSeries()

  } catch (err) {

    console.error("DELETE ERROR:", err)

    if (err.message?.includes("row-level security")) {
      showToast("Você precisa estar logado 🔐")
    } else {
      showToast("Erro ao deletar série ❌")
    }

  } finally {
    if (btn) {
      btn.disabled = false
      btn.textContent = "Deletar Série"
    }
  }
}

// =======================
// 🗑 DELETAR VOLUME (PRO)
// =======================
async function deleteVolume(prefix, number) {

  if (!(await requireAuth())) {
    showToast("Sessão expirada 🔐")
    return
  }

  const ok = await confirmAction("Deletar esse volume?")
  if (!ok) return

  try {

    const { error } = await supabaseClient
      .from("volumes")
      .delete()
      .eq("prefix", prefix)
      .eq("number", number)

    if (error) throw error

    showToast("Volume deletado 🗑")

    loadVolumes(prefix)

  } catch (err) {

    console.error("DELETE VOLUME ERROR:", err)

    if (err.message?.includes("row-level security")) {
      showToast("Você precisa estar logado 🔐")
    } else {
      showToast("Erro ao deletar volume ❌")
    }
  }
}

// iniciar
(async () => {
  const ok = await protectAdmin()

  if (!ok) return

  loadSeries()
})()