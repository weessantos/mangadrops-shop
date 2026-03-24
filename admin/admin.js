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
    SUPABASE_KEY
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


  // =======================
  // 🔐 LOGIN SCREEN
  // =======================
function showLoginScreen() {
  document.body.innerHTML = `
    <div style="
      position:fixed;
      top:0;
      left:0;
      width:100vw;
      height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      background:#020617;
      z-index:9999;
    ">
      <div style="
        display:flex;
        flex-direction:column;
        gap:12px;
        padding:30px;
        background:#0f172a;
        border-radius:12px;
        box-shadow:0 0 40px rgba(0,0,0,0.5);
        min-width:320px;
      ">
        <h2 style="margin-bottom:10px;">🔐 Login Admin</h2>

        <input id="login-email" placeholder="Email" style="padding:10px;">
        <input id="login-pass" type="password" placeholder="Senha" style="padding:10px;">

        <button onclick="login()" style="
          padding:10px;
          background:#6366f1;
          color:white;
          border:none;
          border-radius:6px;
        ">
          Entrar
        </button>
      </div>
    </div>
  `
}

async function login() {
  const email = document.getElementById("login-email").value
  const password = document.getElementById("login-pass").value

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    alert("Erro ao logar ❌")
    return
  }

  location.reload()
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
        <textarea id="desc-${v.id}">${v.description || ""}</textarea>
      </div>

      <div class="field">
        <label>Amazon</label>
        <input id="amazon-${v.id}" value="${v.amazon || ""}">
      </div>

      <div class="field">
        <label>Mercado Livre</label>
        <input id="ml-${v.id}" value="${v.mercado_livre || ""}">
      </div>

      <div class="field">
        <label>TikTok</label>
        <input id="tiktok-${v.id}" value="${v.tiktok || ""}">
      </div>

      <div class="field">
        <label>Adicionado em</label>
        <input type="date" id="date-${v.id}" value="${v.added_at || ""}">
      </div>
      <button onclick="saveVolume(${v.id})">💾 Salvar</button>
      <button id="delete-${v.id}" onclick="deleteVolume(${v.id}, '${prefix}')">
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
async function saveVolume(id) {
  const description = document.getElementById(`desc-${id}`).value
  const amazon = document.getElementById(`amazon-${id}`).value
  const mercado_livre = document.getElementById(`ml-${id}`).value
  const tiktok = document.getElementById(`tiktok-${id}`).value
  const added_at = document.getElementById(`date-${id}`).value

  const { error } = await supabaseClient
    .from("volumes")
    .update({
      description,
      amazon,
      mercado_livre,
      tiktok,
      added_at
    })
    .eq("id", id)

  if (error) {
    console.error(error)
    showToast("Erro ao salvar ❌ (provavelmente não logado)")
    return
  }

  showToast("Salvo com sucesso 🚀")
}

// =======================
// 🗑 DELETAR SÉRIE (PRO)
// =======================
async function deleteSeries(prefix) {

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
async function deleteVolume(id, prefix) {

  const ok = await confirmAction("Deletar esse volume?")
  if (!ok) return

  const btn = document.getElementById(`delete-${id}`)
  if (btn) {
    btn.disabled = true
    btn.textContent = "Deletando..."
  }

  try {

    const { error } = await supabaseClient
      .from("volumes")
      .delete()
      .eq("id", id)

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

  } finally {
    if (btn) {
      btn.disabled = false
      btn.textContent = "🗑"
    }
  }
}
// iniciar
(async () => {
  const ok = await protectAdmin()

  if (!ok) return

  loadSeries()
})()